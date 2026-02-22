import { useState, useMemo } from "react";
import Icon from "@/components/ui/icon";
import { useAppData, WorkLinkGroup, WorkLinkScope, LINK_COLORS } from "@/pages/Index";

type BulkTab = "list" | "bulk";

const TabLinks = () => {
  const { worksDatabase, workLinks, setWorkLinks, carDatabase } = useAppData();

  const [activeTab, setActiveTab] = useState<BulkTab>("list");
  const [editing, setEditing] = useState<WorkLinkGroup | null>(null);
  const [showForm, setShowForm] = useState(false);

  const emptyForm = (): WorkLinkGroup => ({
    id: `link-${Date.now()}`,
    label: "",
    color: LINK_COLORS[workLinks.length % LINK_COLORS.length],
    mainWorkName: "",
    linkedWorkNames: [],
    scope: [],
  });

  const [form, setForm] = useState<WorkLinkGroup>(emptyForm());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // scope picker state
  const [scopeBrandId, setScopeBrandId] = useState("");
  const [scopeModelId, setScopeModelId] = useState("");

  // ── Bulk editor state ──────────────────────────────────────────────────────
  const [bulkBrandId, setBulkBrandId] = useState("");
  const [bulkModelId, setBulkModelId] = useState("");
  const [bulkGenId, setBulkGenId] = useState("");
  const [bulkModId, setBulkModId] = useState("");
  const [bulkEngine, setBulkEngine] = useState("");
  const [bulkTransmission, setBulkTransmission] = useState("");
  const [bulkSaved, setBulkSaved] = useState(false);

  const workNames = useMemo(() => worksDatabase.map((w) => w.name), [worksDatabase]);

  const scopeBrand = useMemo(() => carDatabase.find((b) => b.id === scopeBrandId), [carDatabase, scopeBrandId]);

  // ── Bulk: вычисляем уникальные двигатели и КПП из базы ──────────────────
  const allEngines = useMemo(() => {
    const set = new Set<string>();
    carDatabase.forEach((brand) =>
      brand.models.forEach((model) =>
        model.generations.forEach((gen) =>
          gen.modifications.forEach((mod) => { if (mod.engine) set.add(mod.engine); })
        )
      )
    );
    return Array.from(set).sort();
  }, [carDatabase]);

  const allTransmissions = useMemo(() => {
    const set = new Set<string>();
    carDatabase.forEach((brand) =>
      brand.models.forEach((model) =>
        model.generations.forEach((gen) =>
          gen.modifications.forEach((mod) => { if (mod.transmission) set.add(mod.transmission); })
        )
      )
    );
    return Array.from(set).sort();
  }, [carDatabase]);

  const bulkBrand = useMemo(() => carDatabase.find((b) => b.id === bulkBrandId), [carDatabase, bulkBrandId]);
  const bulkModel = useMemo(() => bulkBrand?.models.find((m) => m.id === bulkModelId), [bulkBrand, bulkModelId]);
  const bulkGen = useMemo(() => bulkModel?.generations.find((g) => g.id === bulkGenId), [bulkModel, bulkGenId]);

  // Фильтруем модификации по двигателю/КПП
  const filteredMods = useMemo(() => {
    const mods = bulkGen?.modifications ?? [];
    return mods.filter((m) => {
      if (bulkEngine && m.engine !== bulkEngine) return false;
      if (bulkTransmission && m.transmission !== bulkTransmission) return false;
      return true;
    });
  }, [bulkGen, bulkEngine, bulkTransmission]);

  // Группы, применимые к выбранным фильтрам
  const bulkApplicableGroups = useMemo(() => {
    if (!bulkBrandId) return workLinks;
    return workLinks.filter((g) => {
      if (g.scope.length === 0) return true;
      return g.scope.some((s) => {
        if (s.brandId !== bulkBrandId) return false;
        if (bulkModelId && s.modelId && s.modelId !== bulkModelId) return false;
        return true;
      });
    });
  }, [workLinks, bulkBrandId, bulkModelId]);

  // Выбранные для массового добавления scope
  const [bulkSelected, setBulkSelected] = useState<Set<string>>(new Set());

  const openCreate = () => {
    setForm(emptyForm());
    setEditing(null);
    setErrors({});
    setScopeBrandId("");
    setScopeModelId("");
    setShowForm(true);
  };

  const openEdit = (group: WorkLinkGroup) => {
    setForm({ ...group, scope: [...group.scope] });
    setEditing(group);
    setErrors({});
    setScopeBrandId("");
    setScopeModelId("");
    setShowForm(true);
    setActiveTab("list");
  };

  const cancelForm = () => {
    setShowForm(false);
    setEditing(null);
    setErrors({});
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.label.trim()) e.label = "Введите название группы";
    if (!form.mainWorkName) e.mainWorkName = "Выберите главную работу";
    if (form.linkedWorkNames.length === 0) e.linked = "Добавьте хотя бы одну сопутствующую работу";
    if (form.linkedWorkNames.includes(form.mainWorkName)) e.linked = "Сопутствующая работа не может совпадать с главной";
    const existingGroup = workLinks.find(
      (g) => g.id !== form.id && g.mainWorkName === form.mainWorkName &&
        form.linkedWorkNames.some((ln) => g.linkedWorkNames.includes(ln))
    );
    if (existingGroup) e.linked = `Пересечение с группой «${existingGroup.label}»`;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    const updated = editing
      ? workLinks.map((g) => (g.id === editing.id ? form : g))
      : [...workLinks, form];
    setWorkLinks(updated);
    setShowForm(false);
    setEditing(null);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleDelete = (id: string) => {
    if (deleteConfirm !== id) { setDeleteConfirm(id); return; }
    setWorkLinks(workLinks.filter((g) => g.id !== id));
    setDeleteConfirm(null);
    if (editing?.id === id) setShowForm(false);
  };

  const toggleLinked = (name: string) => {
    setForm((prev) => ({
      ...prev,
      linkedWorkNames: prev.linkedWorkNames.includes(name)
        ? prev.linkedWorkNames.filter((n) => n !== name)
        : [...prev.linkedWorkNames, name],
    }));
    setErrors((e) => ({ ...e, linked: "" }));
  };

  // ── scope helpers ──────────────────────────────────────────────────────────
  const addScope = () => {
    if (!scopeBrandId) return;
    const brand = carDatabase.find((b) => b.id === scopeBrandId);
    if (!brand) return;
    const model = scopeModelId ? brand.models.find((m) => m.id === scopeModelId) : undefined;
    const newScope: WorkLinkScope = {
      brandId: scopeBrandId,
      brandName: brand.name,
      modelId: model?.id,
      modelName: model?.name,
    };
    const exists = form.scope.some(
      (s) => s.brandId === newScope.brandId && (s.modelId ?? "") === (newScope.modelId ?? "")
    );
    if (exists) return;
    setForm((p) => ({ ...p, scope: [...p.scope, newScope] }));
    setScopeBrandId("");
    setScopeModelId("");
  };

  const removeScope = (idx: number) => {
    setForm((p) => ({ ...p, scope: p.scope.filter((_, i) => i !== idx) }));
  };

  // ── Bulk: применить scope к выбранным группам ──────────────────────────────
  const handleBulkApply = () => {
    if (!bulkBrandId || bulkSelected.size === 0) return;
    const brand = carDatabase.find((b) => b.id === bulkBrandId);
    if (!brand) return;
    const model = bulkModelId ? bulkBrand?.models.find((m) => m.id === bulkModelId) : undefined;

    const targets = filteredMods.length > 0 && bulkModId
      ? [bulkModId]
      : filteredMods.map((m) => m.id);

    const updated = workLinks.map((g) => {
      if (!bulkSelected.has(g.id)) return g;
      const newScopes: WorkLinkScope[] = [];
      if (targets.length > 0 && bulkGen && bulkModel) {
        targets.forEach((modId) => {
          const mod = bulkGen.modifications.find((m) => m.id === modId);
          if (!mod) return;
          const sc: WorkLinkScope = {
            brandId: brand.id,
            brandName: brand.name,
            modelId: bulkModel.id,
            modelName: bulkModel.name,
          };
          const dup = g.scope.some((s) => s.brandId === sc.brandId && (s.modelId ?? "") === (sc.modelId ?? ""));
          if (!dup) newScopes.push(sc);
        });
      } else {
        const sc: WorkLinkScope = {
          brandId: brand.id,
          brandName: brand.name,
          modelId: model?.id,
          modelName: model?.name,
        };
        const dup = g.scope.some((s) => s.brandId === sc.brandId && (s.modelId ?? "") === (sc.modelId ?? ""));
        if (!dup) newScopes.push(sc);
      }
      return { ...g, scope: [...g.scope, ...newScopes] };
    });

    setWorkLinks(updated);
    setBulkSelected(new Set());
    setBulkSaved(true);
    setTimeout(() => setBulkSaved(false), 2500);
  };

  const handleBulkRemoveScope = () => {
    if (!bulkBrandId || bulkSelected.size === 0) return;
    const updated = workLinks.map((g) => {
      if (!bulkSelected.has(g.id)) return g;
      return {
        ...g,
        scope: g.scope.filter((s) => {
          if (s.brandId !== bulkBrandId) return true;
          if (bulkModelId && s.modelId !== bulkModelId) return true;
          return false;
        }),
      };
    });
    setWorkLinks(updated);
    setBulkSelected(new Set());
    setBulkSaved(true);
    setTimeout(() => setBulkSaved(false), 2500);
  };

  const toggleBulkSelect = (id: string) => {
    setBulkSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); } else { next.add(id); }
      return next;
    });
  };

  const selectAllBulk = () => {
    setBulkSelected(new Set(bulkApplicableGroups.map((g) => g.id)));
  };
  const clearBulkSelect = () => setBulkSelected(new Set());

  const availableForLinked = workNames.filter((n) => n !== form.mainWorkName);

  const scopeLabel = (group: WorkLinkGroup) => {
    if (group.scope.length === 0) return "Все автомобили";
    return group.scope.map((s) => s.modelName ? `${s.brandName} ${s.modelName}` : s.brandName).join(", ");
  };

  const globalGroups = workLinks.filter((g) => g.scope.length === 0);
  const specificGroups = workLinks.filter((g) => g.scope.length > 0);

  const GroupCard = ({ group }: { group: WorkLinkGroup }) => (
    <div key={group.id}
      className={`bg-white rounded-lg border shadow-sm overflow-hidden transition-all ${editing?.id === group.id && showForm ? "ring-2 ring-offset-1" : ""}`}
      style={editing?.id === group.id && showForm ? { borderColor: group.color } : {}}>
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="w-3.5 h-3.5 rounded-full shrink-0 border border-black/10" style={{ background: group.color }} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-sm text-foreground">{group.label}</span>
            {group.scope.length > 0 ? (
              <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-muted-foreground flex items-center gap-1">
                <Icon name="Car" size={10} />{scopeLabel(group)}
              </span>
            ) : (
              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">Все авто</span>
            )}
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs">
            <span className="px-2 py-0.5 rounded-full font-medium text-white" style={{ background: group.color }}>
              {group.mainWorkName}
            </span>
            <Icon name="Link" size={11} className="text-muted-foreground" />
            {group.linkedWorkNames.map((n) => (
              <span key={n} className="px-2 py-0.5 rounded-full border font-medium" style={{ borderColor: group.color, color: group.color }}>
                {n}
              </span>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button onClick={() => openEdit(group)}
            className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-gray-100 rounded transition-colors" title="Редактировать">
            <Icon name="Pencil" size={13} />
          </button>
          <button
            onClick={() => handleDelete(group.id)}
            className={`p-1.5 rounded transition-colors text-xs font-medium ${
              deleteConfirm === group.id
                ? "bg-red-500 text-white hover:bg-red-600 px-2"
                : "text-red-400 hover:text-red-600 hover:bg-red-50"
            }`}
            title={deleteConfirm === group.id ? "Нажмите ещё раз для удаления" : "Удалить"}>
            {deleteConfirm === group.id
              ? <span className="flex items-center gap-1"><Icon name="Trash2" size={12} />Удалить?</span>
              : <Icon name="Trash2" size={13} />}
          </button>
          {deleteConfirm === group.id && (
            <button onClick={() => setDeleteConfirm(null)}
              className="p-1.5 text-muted-foreground hover:bg-gray-100 rounded text-xs">
              <Icon name="X" size={13} />
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between">
        <p className="text-sm text-muted-foreground max-w-2xl">
          Связывайте работы, которые пересекаются по трудозатратам. Можно задать группу глобально
          (для всех авто) или ограничить конкретными марками и моделями.
        </p>
        {(saved || bulkSaved) && (
          <span className="flex items-center gap-1.5 text-xs text-green-600 shrink-0 ml-4 animate-fade-in">
            <Icon name="CheckCircle" size={14} />Сохранено
          </span>
        )}
      </div>

      {worksDatabase.length < 2 && (
        <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-700 text-sm">
          <Icon name="AlertTriangle" size={16} className="shrink-0" />
          Для создания связей нужно минимум 2 работы в списке. Добавьте работы во вкладке «Консоль редактирования».
        </div>
      )}

      {/* ── Переключатель вкладок ─────────────────────────────────────────── */}
      <div className="flex gap-1 p-1 bg-gray-100 rounded-lg w-fit">
        <button onClick={() => { setActiveTab("list"); setShowForm(false); }}
          className={`flex items-center gap-2 px-4 py-2 rounded text-sm font-medium transition-all ${activeTab === "list" ? "bg-white shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
          <Icon name="List" size={14} />Группы связей
          {workLinks.length > 0 && <span className="bg-[hsl(215,70%,22%)] text-white text-xs px-1.5 py-0.5 rounded-full">{workLinks.length}</span>}
        </button>
        <button onClick={() => { setActiveTab("bulk"); setShowForm(false); }}
          className={`flex items-center gap-2 px-4 py-2 rounded text-sm font-medium transition-all ${activeTab === "bulk" ? "bg-white shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
          <Icon name="Filter" size={14} />Массовое редактирование
        </button>
      </div>

      {/* ══ ВКЛАДКА: СПИСОК ГРУПП ════════════════════════════════════════════ */}
      {activeTab === "list" && (
        <>
          {globalGroups.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <Icon name="Globe" size={12} />Глобальные ({globalGroups.length})
              </h3>
              {globalGroups.map((g) => <GroupCard key={g.id} group={g} />)}
            </div>
          )}

          {specificGroups.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <Icon name="Car" size={12} />Для конкретных авто ({specificGroups.length})
              </h3>
              {specificGroups.map((g) => <GroupCard key={g.id} group={g} />)}
            </div>
          )}

          {/* ── Форма / кнопка создания ─────────────────────────────────── */}
          {!showForm ? (
            <button onClick={openCreate} disabled={worksDatabase.length < 2}
              className="flex items-center gap-2 px-5 py-2.5 bg-[hsl(215,70%,22%)] text-white rounded text-sm font-semibold hover:bg-[hsl(215,70%,18%)] transition-all shadow-sm disabled:opacity-40 disabled:cursor-not-allowed">
              <Icon name="Plus" size={15} />Создать новую группу связей
            </button>
          ) : (
            <div className="bg-white rounded-lg border border-border shadow-sm">
              <div className="px-5 py-3.5 border-b border-border flex items-center gap-2">
                <div className="w-3 h-3 rounded-full border border-black/10" style={{ background: form.color }} />
                <h3 className="font-semibold text-sm uppercase tracking-wider">
                  {editing ? "Редактировать группу" : "Новая группа связей"}
                </h3>
              </div>
              <div className="p-5 space-y-5">

                {/* Название + цвет */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 block">
                      Название группы
                    </label>
                    <input
                      type="text"
                      value={form.label}
                      onChange={(e) => { setForm((p) => ({ ...p, label: e.target.value })); setErrors((e2) => ({ ...e2, label: "" })); }}
                      placeholder="Например: Сцепление + подрамник"
                      className="w-full border border-border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(215,70%,22%)]"
                    />
                    {errors.label && <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><Icon name="AlertCircle" size={11} />{errors.label}</p>}
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 block">
                      Цвет группы
                    </label>
                    <div className="flex gap-2 flex-wrap">
                      {LINK_COLORS.map((c) => (
                        <button key={c} onClick={() => setForm((p) => ({ ...p, color: c }))}
                          className={`w-8 h-8 rounded-full border-2 transition-all hover:scale-110 ${form.color === c ? "border-gray-800 scale-110 shadow-md" : "border-transparent"}`}
                          style={{ background: c }} />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Область применения */}
                <div className="border border-border rounded-lg overflow-hidden">
                  <div className="px-4 py-3 bg-gray-50 border-b border-border flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon name="Car" size={14} className="text-[hsl(215,70%,22%)]" />
                      <span className="text-xs font-semibold uppercase tracking-wider">Область применения</span>
                    </div>
                    {form.scope.length === 0 && (
                      <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">Применяется ко всем авто</span>
                    )}
                  </div>
                  <div className="p-4 space-y-3">
                    <p className="text-xs text-muted-foreground">
                      Оставьте пустым — группа будет работать для всех автомобилей. Или добавьте конкретные марки/модели.
                    </p>
                    <div className="flex flex-wrap gap-2 items-end">
                      <div className="flex flex-col gap-1">
                        <label className="text-xs text-muted-foreground">Марка</label>
                        <select value={scopeBrandId} onChange={(e) => { setScopeBrandId(e.target.value); setScopeModelId(""); }}
                          className="border border-border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(215,70%,22%)] min-w-[160px]">
                          <option value="">— Марка —</option>
                          {carDatabase.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                        </select>
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-xs text-muted-foreground">Модель <span className="text-muted-foreground/60">(необязательно)</span></label>
                        <select value={scopeModelId} onChange={(e) => setScopeModelId(e.target.value)} disabled={!scopeBrandId}
                          className="border border-border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(215,70%,22%)] min-w-[160px] disabled:opacity-40">
                          <option value="">— Все модели —</option>
                          {scopeBrand?.models.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
                        </select>
                      </div>
                      <button onClick={addScope} disabled={!scopeBrandId}
                        className="flex items-center gap-1.5 px-4 py-2 bg-[hsl(215,70%,22%)] text-white rounded text-sm font-semibold hover:bg-[hsl(215,70%,18%)] transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                        <Icon name="Plus" size={14} />Добавить
                      </button>
                    </div>
                    {form.scope.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-1">
                        {form.scope.map((s, idx) => (
                          <div key={idx} className="flex items-center gap-1.5 px-3 py-1.5 bg-[hsl(215,70%,22%)] text-white rounded-full text-xs font-medium">
                            <Icon name="Car" size={11} />
                            {s.modelName ? `${s.brandName} ${s.modelName}` : `${s.brandName} (все модели)`}
                            <button onClick={() => removeScope(idx)} className="ml-1 hover:text-red-200 transition-colors">
                              <Icon name="X" size={11} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Главная работа */}
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 block">
                    Главная работа
                    <span className="ml-2 font-normal normal-case text-muted-foreground/70">(та, которая включает в себя другие)</span>
                  </label>
                  <select
                    value={form.mainWorkName}
                    onChange={(e) => {
                      const v = e.target.value;
                      setForm((p) => ({ ...p, mainWorkName: v, linkedWorkNames: p.linkedWorkNames.filter((n) => n !== v) }));
                      setErrors((e2) => ({ ...e2, mainWorkName: "" }));
                    }}
                    className="w-full border border-border rounded px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(215,70%,22%)]">
                    <option value="">— Выберите главную работу —</option>
                    {workNames.map((n) => <option key={n} value={n}>{n}</option>)}
                  </select>
                  {errors.mainWorkName && <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><Icon name="AlertCircle" size={11} />{errors.mainWorkName}</p>}
                </div>

                {/* Сопутствующие */}
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 block">
                    Сопутствующие работы
                    <span className="ml-2 font-normal normal-case text-muted-foreground/70">(чьи часы уже входят в главную)</span>
                  </label>
                  {!form.mainWorkName ? (
                    <div className="p-3 bg-gray-50 border border-border rounded text-xs text-muted-foreground">
                      Сначала выберите главную работу
                    </div>
                  ) : availableForLinked.length === 0 ? (
                    <div className="p-3 bg-gray-50 border border-border rounded text-xs text-muted-foreground">
                      Нет других работ для связи
                    </div>
                  ) : (
                    <div className="border border-border rounded-lg overflow-hidden max-h-60 overflow-y-auto">
                      {availableForLinked.map((name, i) => {
                        const checked = form.linkedWorkNames.includes(name);
                        return (
                          <label key={name}
                            className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors ${checked ? "bg-blue-50" : i % 2 === 0 ? "bg-white" : "bg-gray-50/50"} hover:bg-blue-50/70`}>
                            <input type="checkbox" checked={checked} onChange={() => toggleLinked(name)}
                              className="w-4 h-4 rounded accent-[hsl(215,70%,22%)]" />
                            <span className={`text-sm flex-1 ${checked ? "font-medium text-[hsl(215,70%,22%)]" : "text-foreground"}`}>{name}</span>
                            {checked && <Icon name="Link" size={13} className="text-[hsl(215,70%,22%)] shrink-0" />}
                          </label>
                        );
                      })}
                    </div>
                  )}
                  {form.linkedWorkNames.length > 0 && (
                    <p className="mt-1.5 text-xs text-muted-foreground flex items-center gap-1">
                      <Icon name="Info" size={11} />Выбрано: {form.linkedWorkNames.length} работ
                    </p>
                  )}
                  {errors.linked && <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><Icon name="AlertCircle" size={11} />{errors.linked}</p>}
                </div>

                {/* Preview */}
                {form.mainWorkName && form.linkedWorkNames.length > 0 && (
                  <div className="p-4 rounded-lg border" style={{ borderColor: form.color, background: `${form.color}0d` }}>
                    <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: form.color }}>
                      Как это будет работать в калькуляторе:
                    </p>
                    <p className="text-sm text-foreground">
                      При добавлении <strong>«{form.mainWorkName}»</strong> — норматив включает в себя{" "}
                      <strong>«{form.linkedWorkNames.join("» / «")}»</strong>.{" "}
                      {form.scope.length > 0
                        ? <>Только для: <strong>{form.scope.map((s) => s.modelName ? `${s.brandName} ${s.modelName}` : s.brandName).join(", ")}</strong>.</>
                        : "Для всех автомобилей."}
                    </p>
                  </div>
                )}

                {/* Buttons */}
                <div className="flex gap-3 pt-1">
                  <button onClick={handleSave}
                    className="flex items-center gap-2 px-6 py-2.5 bg-[hsl(215,70%,22%)] text-white rounded text-sm font-semibold hover:bg-[hsl(215,70%,18%)] transition-all shadow-sm">
                    <Icon name="Save" size={15} />{editing ? "Сохранить изменения" : "Создать группу"}
                  </button>
                  <button onClick={cancelForm}
                    className="flex items-center gap-2 px-4 py-2.5 border border-border rounded text-sm font-medium text-muted-foreground hover:bg-gray-50 transition-all">
                    <Icon name="X" size={14} />Отмена
                  </button>
                </div>
              </div>
            </div>
          )}

          {workLinks.length === 0 && !showForm && worksDatabase.length >= 2 && (
            <div className="flex items-center gap-3 p-5 bg-gray-50 border border-border rounded-lg text-muted-foreground text-sm">
              <Icon name="Link" size={16} className="shrink-0" />
              Групп связей пока нет. Создайте первую, чтобы калькулятор автоматически учитывал пересечения работ.
            </div>
          )}
        </>
      )}

      {/* ══ ВКЛАДКА: МАССОВОЕ РЕДАКТИРОВАНИЕ ════════════════════════════════ */}
      {activeTab === "bulk" && (
        <div className="space-y-5">
          <div className="bg-white rounded-lg border border-border shadow-sm">
            <div className="px-5 py-3.5 border-b border-border flex items-center gap-2 bg-gray-50">
              <Icon name="Filter" size={15} className="text-[hsl(215,70%,22%)]" />
              <h3 className="font-semibold text-sm uppercase tracking-wider">Фильтр по автомобилю</h3>
            </div>
            <div className="p-5 space-y-4">
              <p className="text-xs text-muted-foreground">
                Выберите параметры — и назначьте или снимите область применения сразу у нескольких групп связей.
              </p>

              {/* Строка 1: Марка / Модель */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Марка</label>
                  <select value={bulkBrandId}
                    onChange={(e) => { setBulkBrandId(e.target.value); setBulkModelId(""); setBulkGenId(""); setBulkModId(""); setBulkEngine(""); setBulkTransmission(""); }}
                    className="border border-border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(215,70%,22%)]">
                    <option value="">— Все марки —</option>
                    {carDatabase.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Модель</label>
                  <select value={bulkModelId} disabled={!bulkBrandId}
                    onChange={(e) => { setBulkModelId(e.target.value); setBulkGenId(""); setBulkModId(""); }}
                    className="border border-border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(215,70%,22%)] disabled:opacity-40">
                    <option value="">— Все модели —</option>
                    {bulkBrand?.models.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Поколение</label>
                  <select value={bulkGenId} disabled={!bulkModelId}
                    onChange={(e) => { setBulkGenId(e.target.value); setBulkModId(""); }}
                    className="border border-border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(215,70%,22%)] disabled:opacity-40">
                    <option value="">— Все поколения —</option>
                    {bulkModel?.generations.map((g) => <option key={g.id} value={g.id}>{g.name} ({g.years})</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Модификация</label>
                  <select value={bulkModId} disabled={!bulkGenId}
                    onChange={(e) => setBulkModId(e.target.value)}
                    className="border border-border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(215,70%,22%)] disabled:opacity-40">
                    <option value="">— Все модификации —</option>
                    {filteredMods.map((m) => <option key={m.id} value={m.id}>{m.name} · {m.engine} · {m.transmission}</option>)}
                  </select>
                </div>
              </div>

              {/* Строка 2: Тип двигателя / КПП */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <Icon name="Fuel" size={11} />Тип двигателя
                  </label>
                  <select value={bulkEngine} onChange={(e) => setBulkEngine(e.target.value)}
                    className="border border-border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(215,70%,22%)]">
                    <option value="">— Все типы —</option>
                    {allEngines.map((e) => <option key={e} value={e}>{e}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <Icon name="Settings2" size={11} />Тип КПП
                  </label>
                  <select value={bulkTransmission} onChange={(e) => setBulkTransmission(e.target.value)}
                    className="border border-border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(215,70%,22%)]">
                    <option value="">— Все КПП —</option>
                    {allTransmissions.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>

              {/* Счётчик найденных модификаций */}
              {bulkGenId && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Icon name="Info" size={12} />
                  {filteredMods.length > 0
                    ? <>Найдено модификаций: <strong className="text-foreground">{filteredMods.length}</strong></>
                    : <span className="text-amber-600">Нет модификаций, соответствующих фильтру</span>}
                </div>
              )}
            </div>
          </div>

          {/* Список групп для массового выбора */}
          <div className="bg-white rounded-lg border border-border shadow-sm">
            <div className="px-5 py-3.5 border-b border-border flex items-center justify-between bg-gray-50">
              <div className="flex items-center gap-2">
                <Icon name="CheckSquare" size={15} className="text-[hsl(215,70%,22%)]" />
                <h3 className="font-semibold text-sm uppercase tracking-wider">
                  Группы связей
                  {bulkSelected.size > 0 && (
                    <span className="ml-2 bg-[hsl(215,70%,22%)] text-white text-xs px-2 py-0.5 rounded-full font-normal">
                      Выбрано: {bulkSelected.size}
                    </span>
                  )}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={selectAllBulk} className="text-xs text-[hsl(215,70%,22%)] hover:underline">
                  Выбрать все
                </button>
                <span className="text-muted-foreground/40">|</span>
                <button onClick={clearBulkSelect} className="text-xs text-muted-foreground hover:underline">
                  Снять выделение
                </button>
              </div>
            </div>

            {workLinks.length === 0 ? (
              <div className="p-5 text-sm text-muted-foreground text-center">
                Групп связей пока нет
              </div>
            ) : (
              <div className="divide-y divide-border">
                {workLinks.map((g) => {
                  const isSelected = bulkSelected.has(g.id);
                  const isApplicable = bulkApplicableGroups.some((ag) => ag.id === g.id);
                  return (
                    <label key={g.id}
                      className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${isSelected ? "bg-blue-50" : "hover:bg-gray-50/60"} ${!isApplicable && bulkBrandId ? "opacity-50" : ""}`}>
                      <input type="checkbox" checked={isSelected} onChange={() => toggleBulkSelect(g.id)}
                        className="w-4 h-4 rounded accent-[hsl(215,70%,22%)] shrink-0" />
                      <div className="w-3 h-3 rounded-full shrink-0" style={{ background: g.color }} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-sm">{g.label}</span>
                          {g.scope.length === 0
                            ? <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">Все авто</span>
                            : <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-muted-foreground">
                                {g.scope.length} авто
                              </span>
                          }
                        </div>
                        <div className="mt-0.5 flex flex-wrap gap-1">
                          <span className="text-xs font-medium px-1.5 py-0.5 rounded text-white" style={{ background: g.color }}>{g.mainWorkName}</span>
                          {g.linkedWorkNames.map((n) => (
                            <span key={n} className="text-xs px-1.5 py-0.5 rounded border" style={{ borderColor: g.color, color: g.color }}>{n}</span>
                          ))}
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>
            )}

            {/* Кнопки действий */}
            <div className="px-5 py-4 border-t border-border bg-gray-50 flex flex-wrap gap-3 items-center">
              <button
                onClick={handleBulkApply}
                disabled={bulkSelected.size === 0 || !bulkBrandId}
                className="flex items-center gap-2 px-5 py-2.5 bg-[hsl(215,70%,22%)] text-white rounded text-sm font-semibold hover:bg-[hsl(215,70%,18%)] transition-all shadow-sm disabled:opacity-40 disabled:cursor-not-allowed">
                <Icon name="Plus" size={14} />
                Добавить область применения
              </button>
              <button
                onClick={handleBulkRemoveScope}
                disabled={bulkSelected.size === 0 || !bulkBrandId}
                className="flex items-center gap-2 px-5 py-2.5 border border-red-200 text-red-600 bg-red-50 rounded text-sm font-semibold hover:bg-red-100 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                <Icon name="Minus" size={14} />
                Снять область применения
              </button>
              {(!bulkBrandId) && (
                <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Icon name="Info" size={12} />
                  Выберите хотя бы марку для применения
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TabLinks;