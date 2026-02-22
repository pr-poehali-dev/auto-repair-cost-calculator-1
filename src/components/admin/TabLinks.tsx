import { useState, useMemo } from "react";
import Icon from "@/components/ui/icon";
import { useAppData, WorkLinkGroup, LINK_COLORS } from "@/pages/Index";

const TabLinks = () => {
  const { worksDatabase, workLinks, setWorkLinks } = useAppData();

  // ── Форма создания/редактирования группы ───────────────────────────────
  const [editing, setEditing] = useState<WorkLinkGroup | null>(null);
  const [showForm, setShowForm] = useState(false);

  const emptyForm = (): WorkLinkGroup => ({
    id: `link-${Date.now()}`,
    label: "",
    color: LINK_COLORS[workLinks.length % LINK_COLORS.length],
    mainWorkName: "",
    linkedWorkNames: [],
  });

  const [form, setForm] = useState<WorkLinkGroup>(emptyForm());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const workNames = useMemo(() => worksDatabase.map((w) => w.name), [worksDatabase]);

  const openCreate = () => {
    setForm(emptyForm());
    setEditing(null);
    setErrors({});
    setShowForm(true);
  };

  const openEdit = (group: WorkLinkGroup) => {
    setForm({ ...group });
    setEditing(group);
    setErrors({});
    setShowForm(true);
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
    // Проверка дублей с другими группами
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

  const availableForLinked = workNames.filter((n) => n !== form.mainWorkName);

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground max-w-2xl">
            Связывайте работы, которые частично пересекаются по трудозатратам. Когда в калькуляторе
            добавляются сразу несколько работ из одной группы — они подсвечиваются одним цветом,
            а нормачасы главной работы автоматически уменьшаются на сумму сопутствующих.
          </p>
        </div>
        {saved && (
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

      {/* ── Список существующих групп ──────────────────────────────────── */}
      {workLinks.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Созданные группы ({workLinks.length})
          </h3>
          {workLinks.map((group) => (
            <div key={group.id}
              className={`bg-white rounded-lg border shadow-sm overflow-hidden transition-all ${editing?.id === group.id && showForm ? "ring-2 ring-offset-1" : ""}`}
              style={editing?.id === group.id && showForm ? { borderColor: group.color, ringColor: group.color } : {}}>
              <div className="flex items-center gap-3 px-4 py-3">
                {/* Color dot */}
                <div className="w-3.5 h-3.5 rounded-full shrink-0 border border-black/10" style={{ background: group.color }} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm text-foreground">{group.label}</span>
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
          ))}
        </div>
      )}

      {/* ── Кнопка создания / форма ────────────────────────────────────── */}
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
                      style={{ background: c }} title={c} />
                  ))}
                </div>
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
                  setForm((p) => ({
                    ...p,
                    mainWorkName: v,
                    linkedWorkNames: p.linkedWorkNames.filter((n) => n !== v),
                  }));
                  setErrors((e2) => ({ ...e2, mainWorkName: "" }));
                }}
                className="w-full border border-border rounded px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(215,70%,22%)]">
                <option value="">— Выберите главную работу —</option>
                {workNames.map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
              {errors.mainWorkName && <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><Icon name="AlertCircle" size={11} />{errors.mainWorkName}</p>}
            </div>

            {/* Сопутствующие работы */}
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
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleLinked(name)}
                          className="w-4 h-4 rounded accent-[hsl(215,70%,22%)]"
                        />
                        <span className={`text-sm flex-1 ${checked ? "font-medium text-[hsl(215,70%,22%)]" : "text-foreground"}`}>{name}</span>
                        {checked && <Icon name="Link" size={13} className="text-[hsl(215,70%,22%)] shrink-0" />}
                      </label>
                    );
                  })}
                </div>
              )}
              {form.linkedWorkNames.length > 0 && (
                <p className="mt-1.5 text-xs text-muted-foreground flex items-center gap-1">
                  <Icon name="Info" size={11} />
                  Выбрано: {form.linkedWorkNames.length} работ
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
                  При добавлении <strong>«{form.mainWorkName}»</strong> и{" "}
                  <strong>«{form.linkedWorkNames.join("» / «")}»</strong> — обе работы подсветятся
                  одним цветом. Нормачасы «{form.mainWorkName}» автоматически уменьшатся
                  на часы сопутствующих работ, чтобы итог не задваивался.
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
    </div>
  );
};

export default TabLinks;
