import { useState, useMemo } from "react";
import Icon from "@/components/ui/icon";
import {
  useAppData,
  WorkFilter,
  WorkFilterRule,
  WorkFilterParam,
  WORK_FILTER_PARAMS,
  WORK_FILTER_PARAM_LABELS,
} from "@/pages/Index";

// Получить все уникальные значения параметра из базы авто
function collectValues(carDatabase: ReturnType<typeof useAppData>["carDatabase"], param: WorkFilterParam): string[] {
  const set = new Set<string>();
  carDatabase.forEach((brand) =>
    brand.models.forEach((model) =>
      model.generations.forEach((gen) =>
        gen.modifications.forEach((mod) => {
          const val = (mod as Record<string, unknown>)[param];
          if (val && typeof val === "string" && val.trim() && val !== "—") set.add(val.trim());
        })
      )
    )
  );
  return Array.from(set).sort();
}

function emptyFilter(worksDatabase: ReturnType<typeof useAppData>["worksDatabase"]): WorkFilter {
  void worksDatabase;
  return {
    id: `wf-${Date.now()}`,
    workName: "",
    rules: WORK_FILTER_PARAMS.map((param) => ({ param, allowedValues: [] })),
  };
}

const PARAM_ICONS: Record<WorkFilterParam, string> = {
  engineType: "Fuel",
  transmission: "Settings2",
  frontBrakes: "CircleDot",
  rearBrakes: "CircleDot",
  driveType: "GitFork",
  frontSuspension: "Waves",
  rearSuspension: "Waves",
  turboType: "Wind",
};

export default function TabWorkFilters() {
  const { worksDatabase, workFilters, setWorkFilters, carDatabase } = useAppData();

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<WorkFilter | null>(null);
  const [form, setForm] = useState<WorkFilter>(() => emptyFilter(worksDatabase));
  const [search, setSearch] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [workSearch, setWorkSearch] = useState("");
  const [paramSearch, setParamSearch] = useState<Partial<Record<WorkFilterParam, string>>>({});

  const workNames = useMemo(() => worksDatabase.map((w) => w.name), [worksDatabase]);

  // Значения каждого параметра из реальной базы
  const paramValues = useMemo(() => {
    const result = {} as Record<WorkFilterParam, string[]>;
    WORK_FILTER_PARAMS.forEach((p) => {
      result[p] = collectValues(carDatabase, p);
    });
    return result;
  }, [carDatabase]);

  const filteredWorks = useMemo(() => {
    const q = workSearch.toLowerCase();
    return q ? workNames.filter((n) => n.toLowerCase().includes(q)) : workNames;
  }, [workNames, workSearch]);

  const filteredFilters = useMemo(() => {
    const q = search.toLowerCase();
    return q ? workFilters.filter((f) => f.workName.toLowerCase().includes(q)) : workFilters;
  }, [workFilters, search]);

  const openCreate = () => {
    setForm(emptyFilter(worksDatabase));
    setEditing(null);
    setWorkSearch("");
    setParamSearch({});
    setShowForm(true);
  };

  const openEdit = (f: WorkFilter) => {
    // Убедимся что все параметры присутствуют (на случай добавления новых)
    const rules = WORK_FILTER_PARAMS.map((param) => {
      const existing = f.rules.find((r) => r.param === param);
      return existing ?? { param, allowedValues: [] };
    });
    setForm({ ...f, rules });
    setEditing(f);
    setWorkSearch("");
    setParamSearch({});
    setShowForm(true);
  };

  const cancelForm = () => {
    setShowForm(false);
    setEditing(null);
  };

  const handleSave = () => {
    if (!form.workName) return;
    // Убираем пустые правила (allowedValues = []) — они не ограничивают
    const updated = editing
      ? workFilters.map((f) => (f.id === editing.id ? form : f))
      : [...workFilters, form];
    setWorkFilters(updated);
    setShowForm(false);
    setEditing(null);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleDelete = (id: string) => {
    if (deleteConfirm !== id) { setDeleteConfirm(id); return; }
    setWorkFilters(workFilters.filter((f) => f.id !== id));
    setDeleteConfirm(null);
    if (editing?.id === id) setShowForm(false);
  };

  const toggleValue = (param: WorkFilterParam, value: string) => {
    setForm((prev) => ({
      ...prev,
      rules: prev.rules.map((r) =>
        r.param === param
          ? {
              ...r,
              allowedValues: r.allowedValues.includes(value)
                ? r.allowedValues.filter((v) => v !== value)
                : [...r.allowedValues, value],
            }
          : r
      ),
    }));
  };

  const clearParam = (param: WorkFilterParam) => {
    setForm((prev) => ({
      ...prev,
      rules: prev.rules.map((r) => (r.param === param ? { ...r, allowedValues: [] } : r)),
    }));
  };

  const selectAllParam = (param: WorkFilterParam) => {
    const vals = paramValues[param];
    setForm((prev) => ({
      ...prev,
      rules: prev.rules.map((r) => (r.param === param ? { ...r, allowedValues: [...vals] } : r)),
    }));
  };

  const getRuleForParam = (param: WorkFilterParam): WorkFilterRule =>
    form.rules.find((r) => r.param === param) ?? { param, allowedValues: [] };

  // Посчитать активные ограничения в фильтре
  const countActiveRules = (f: WorkFilter) =>
    f.rules.filter((r) => r.allowedValues.length > 0).length;

  if (worksDatabase.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-14 h-14 rounded-full bg-amber-50 flex items-center justify-center mb-4">
          <Icon name="AlertTriangle" size={24} className="text-amber-500" />
        </div>
        <p className="font-semibold text-foreground mb-1">Сначала загрузите список работ</p>
        <p className="text-sm text-muted-foreground max-w-sm">
          Перейдите в раздел «Базы данных» и загрузите файл с перечнем работ — тогда здесь можно будет настроить ограничения.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-foreground">Фильтры доступности работ</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Укажите, при каких параметрах автомобиля та или иная работа доступна для выбора.
            Например: «Замена турбины» — только для авто с турбонаддувом.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 bg-[hsl(215,70%,22%)] text-white rounded-lg text-sm font-semibold hover:bg-[hsl(215,70%,18%)] transition-colors shrink-0"
        >
          <Icon name="Plus" size={16} />
          Добавить правило
        </button>
      </div>

      {saved && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-lg border bg-green-50 border-green-200 text-green-700 text-sm font-medium animate-fade-in">
          <Icon name="CheckCircle" size={16} />
          Правило сохранено
        </div>
      )}

      {/* Форма создания/редактирования */}
      {showForm && (
        <div className="border border-[hsl(215,70%,22%)]/30 rounded-xl bg-white shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 bg-[hsl(215,70%,22%)]/5 border-b">
            <p className="font-semibold text-foreground">
              {editing ? "Редактировать правило" : "Новое правило"}
            </p>
            <button onClick={cancelForm} className="text-muted-foreground hover:text-foreground">
              <Icon name="X" size={18} />
            </button>
          </div>

          <div className="p-5 space-y-5">
            {/* Выбор работы */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                Работа <span className="text-red-500">*</span>
              </label>
              {form.workName ? (
                <div className="flex items-center gap-2 px-3 py-2 bg-[hsl(215,70%,22%)]/5 rounded-lg border border-[hsl(215,70%,22%)]/20">
                  <Icon name="Wrench" size={14} className="text-[hsl(215,70%,22%)] shrink-0" />
                  <span className="text-sm font-medium text-foreground flex-1">{form.workName}</span>
                  <button
                    onClick={() => setForm((p) => ({ ...p, workName: "" }))}
                    className="text-muted-foreground hover:text-red-500 transition-colors"
                  >
                    <Icon name="X" size={14} />
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="relative">
                    <Icon name="Search" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      value={workSearch}
                      onChange={(e) => setWorkSearch(e.target.value)}
                      placeholder="Поиск работы…"
                      className="w-full pl-8 pr-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(215,70%,22%)]/30"
                    />
                  </div>
                  <div className="max-h-44 overflow-y-auto border rounded-lg divide-y">
                    {filteredWorks.length === 0 && (
                      <p className="px-3 py-3 text-sm text-muted-foreground text-center">Не найдено</p>
                    )}
                    {filteredWorks.slice(0, 80).map((name) => {
                      const alreadyHasFilter = workFilters.some(
                        (f) => f.workName === name && f.id !== editing?.id
                      );
                      return (
                        <button
                          key={name}
                          onClick={() => { setForm((p) => ({ ...p, workName: name })); setWorkSearch(""); }}
                          disabled={alreadyHasFilter}
                          className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                            alreadyHasFilter
                              ? "text-muted-foreground/50 cursor-not-allowed bg-gray-50"
                              : "hover:bg-[hsl(215,70%,22%)]/5 text-foreground"
                          }`}
                        >
                          {name}
                          {alreadyHasFilter && (
                            <span className="ml-2 text-xs text-amber-500">(уже есть правило)</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Параметры ограничений */}
            {form.workName && (
              <div>
                <p className="text-sm font-semibold text-foreground mb-1">Ограничения по параметрам авто</p>
                <p className="text-xs text-muted-foreground mb-4">
                  Выберите допустимые значения. Если для параметра ничего не выбрано — ограничения нет.
                </p>
                <div className="space-y-4">
                  {WORK_FILTER_PARAMS.map((param) => {
                    const rule = getRuleForParam(param);
                    const values = paramValues[param];
                    const pSearch = (paramSearch[param] ?? "").toLowerCase();
                    const filteredVals = pSearch ? values.filter((v) => v.toLowerCase().includes(pSearch)) : values;
                    const hasActive = rule.allowedValues.length > 0;

                    return (
                      <div key={param} className={`rounded-lg border p-4 transition-colors ${hasActive ? "border-[hsl(215,70%,22%)]/30 bg-[hsl(215,70%,22%)]/3" : "border-border"}`}>
                        <div className="flex items-center gap-2 mb-3">
                          <Icon name={PARAM_ICONS[param]} size={15} className={hasActive ? "text-[hsl(215,70%,22%)]" : "text-muted-foreground"} />
                          <span className={`text-sm font-semibold ${hasActive ? "text-[hsl(215,70%,22%)]" : "text-foreground"}`}>
                            {WORK_FILTER_PARAM_LABELS[param]}
                          </span>
                          {hasActive && (
                            <span className="ml-auto text-xs text-[hsl(215,70%,22%)] font-medium bg-[hsl(215,70%,22%)]/10 px-2 py-0.5 rounded-full">
                              {rule.allowedValues.length} из {values.length}
                            </span>
                          )}
                          {!hasActive && values.length > 0 && (
                            <span className="ml-auto text-xs text-muted-foreground">без ограничений</span>
                          )}
                        </div>

                        {values.length === 0 ? (
                          <p className="text-xs text-muted-foreground italic">Нет данных в базе авто</p>
                        ) : (
                          <>
                            {values.length > 5 && (
                              <div className="relative mb-2">
                                <Icon name="Search" size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                <input
                                  value={paramSearch[param] ?? ""}
                                  onChange={(e) => setParamSearch((p) => ({ ...p, [param]: e.target.value }))}
                                  placeholder="Поиск…"
                                  className="w-full pl-7 pr-2 py-1.5 border rounded text-xs focus:outline-none focus:ring-1 focus:ring-[hsl(215,70%,22%)]/30"
                                />
                              </div>
                            )}
                            <div className="flex flex-wrap gap-2">
                              {filteredVals.map((val) => {
                                const active = rule.allowedValues.includes(val);
                                return (
                                  <button
                                    key={val}
                                    onClick={() => toggleValue(param, val)}
                                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                                      active
                                        ? "bg-[hsl(215,70%,22%)] text-white border-[hsl(215,70%,22%)]"
                                        : "bg-white text-foreground border-border hover:border-[hsl(215,70%,22%)]/50 hover:bg-[hsl(215,70%,22%)]/5"
                                    }`}
                                  >
                                    {val}
                                  </button>
                                );
                              })}
                            </div>
                            {values.length > 1 && (
                              <div className="flex gap-2 mt-2">
                                <button
                                  onClick={() => selectAllParam(param)}
                                  className="text-xs text-[hsl(215,70%,22%)] hover:underline"
                                >
                                  Выбрать все
                                </button>
                                {hasActive && (
                                  <button
                                    onClick={() => clearParam(param)}
                                    className="text-xs text-red-500 hover:underline"
                                  >
                                    Сбросить
                                  </button>
                                )}
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Кнопки */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={handleSave}
                disabled={!form.workName}
                className="flex items-center gap-2 px-5 py-2.5 bg-[hsl(215,70%,22%)] text-white rounded-lg text-sm font-semibold hover:bg-[hsl(215,70%,18%)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Icon name="Save" size={15} />
                {editing ? "Сохранить" : "Добавить правило"}
              </button>
              <button
                onClick={cancelForm}
                className="px-5 py-2.5 border rounded-lg text-sm font-semibold text-foreground hover:bg-gray-50 transition-colors"
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Список правил */}
      {workFilters.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-foreground">
              Правила ({workFilters.length})
            </p>
            <div className="relative">
              <Icon name="Search" size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Поиск по работе…"
                className="pl-8 pr-3 py-1.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(215,70%,22%)]/30 w-56"
              />
            </div>
          </div>

          {filteredFilters.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-6">Ничего не найдено</p>
          )}

          <div className="space-y-2">
            {filteredFilters.map((f) => {
              const activeRules = f.rules.filter((r) => r.allowedValues.length > 0);
              const isDeleting = deleteConfirm === f.id;
              return (
                <div
                  key={f.id}
                  className="border rounded-xl bg-white p-4 hover:border-[hsl(215,70%,22%)]/30 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[hsl(215,70%,22%)]/8 flex items-center justify-center shrink-0 mt-0.5">
                      <Icon name="Filter" size={15} className="text-[hsl(215,70%,22%)]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-foreground truncate">{f.workName}</p>
                      {activeRules.length === 0 ? (
                        <p className="text-xs text-muted-foreground mt-0.5">Без ограничений — доступна всегда</p>
                      ) : (
                        <div className="mt-2 space-y-1.5">
                          {activeRules.map((r) => (
                            <div key={r.param} className="flex items-start gap-2">
                              <span className="text-xs text-muted-foreground shrink-0 mt-0.5 w-32 truncate">
                                {WORK_FILTER_PARAM_LABELS[r.param]}:
                              </span>
                              <div className="flex flex-wrap gap-1">
                                {r.allowedValues.map((v) => (
                                  <span
                                    key={v}
                                    className="inline-block px-2 py-0.5 rounded-full bg-[hsl(215,70%,22%)]/10 text-[hsl(215,70%,22%)] text-xs font-medium"
                                  >
                                    {v}
                                  </span>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {activeRules.length > 0 && (
                        <span className="text-xs text-muted-foreground mr-1">
                          {countActiveRules(f)} пар.
                        </span>
                      )}
                      <button
                        onClick={() => openEdit(f)}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-gray-100 transition-colors"
                        title="Редактировать"
                      >
                        <Icon name="Pencil" size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(f.id)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          isDeleting
                            ? "bg-red-100 text-red-600"
                            : "text-muted-foreground hover:text-red-500 hover:bg-red-50"
                        }`}
                        title={isDeleting ? "Нажмите ещё раз для подтверждения" : "Удалить"}
                      >
                        <Icon name={isDeleting ? "Trash2" : "Trash2"} size={14} />
                      </button>
                      {isDeleting && (
                        <button
                          onClick={() => setDeleteConfirm(null)}
                          className="p-1.5 rounded-lg text-muted-foreground hover:bg-gray-100 transition-colors"
                        >
                          <Icon name="X" size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                  {isDeleting && (
                    <p className="mt-2 text-xs text-red-600 ml-11">
                      Нажмите кнопку удаления ещё раз для подтверждения
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {workFilters.length === 0 && !showForm && (
        <div className="flex flex-col items-center justify-center py-14 text-center border-2 border-dashed rounded-xl">
          <div className="w-14 h-14 rounded-full bg-gray-50 flex items-center justify-center mb-4">
            <Icon name="Filter" size={24} className="text-muted-foreground" />
          </div>
          <p className="font-semibold text-foreground mb-1">Правила ещё не добавлены</p>
          <p className="text-sm text-muted-foreground max-w-sm mb-4">
            Добавьте правило, чтобы скрывать неподходящие работы в зависимости от типа двигателя, тормозов, подвески и других параметров авто.
          </p>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2 bg-[hsl(215,70%,22%)] text-white rounded-lg text-sm font-semibold hover:bg-[hsl(215,70%,18%)] transition-colors"
          >
            <Icon name="Plus" size={16} />
            Добавить первое правило
          </button>
        </div>
      )}
    </div>
  );
}
