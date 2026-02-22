import { useState, useMemo } from "react";
import Icon from "@/components/ui/icon";
import { useAppData, WorkEntry } from "@/pages/Index";

const SelectBox = ({
  label, value, onChange, options, placeholder, disabled,
}: {
  label: string; value: string; onChange: (v: string) => void;
  options: { id: string; label: string }[]; placeholder: string; disabled?: boolean;
}) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</label>
    <select value={value} onChange={(e) => onChange(e.target.value)} disabled={disabled}
      className={`w-full border border-border rounded px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[hsl(215,70%,22%)] transition-all ${disabled ? "opacity-40 cursor-not-allowed bg-gray-50" : "cursor-pointer hover:border-[hsl(215,70%,40%)]"}`}>
      <option value="">{placeholder}</option>
      {options.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
    </select>
  </div>
);

const TabEditor = () => {
  const { carDatabase, setCarDatabase, worksDatabase, setWorksDatabase } = useAppData();

  // ── Норма-часы по модификации ──────────────────────────────────────────────
  const [brandId, setBrandId] = useState("");
  const [modelId, setModelId] = useState("");
  const [genId, setGenId] = useState("");
  const [modId, setModId] = useState("");
  const [saved, setSaved] = useState(false);
  const [hoursMap, setHoursMap] = useState<Record<string, string>>({});

  const brand = useMemo(() => carDatabase.find((b) => b.id === brandId), [carDatabase, brandId]);
  const model = useMemo(() => brand?.models.find((m) => m.id === modelId), [brand, modelId]);
  const gen = useMemo(() => model?.generations.find((g) => g.id === genId), [model, genId]);
  const mod = useMemo(() => gen?.modifications.find((m) => m.id === modId), [gen, modId]);

  const handleModChange = (v: string) => {
    setModId(v); setSaved(false);
    const selectedMod = gen?.modifications.find((m) => m.id === v);
    if (selectedMod) {
      const map: Record<string, string> = {};
      selectedMod.works.forEach((w) => { map[w.name] = String(w.hours); });
      setHoursMap(map);
    } else setHoursMap({});
  };

  const handleHoursChange = (workName: string, val: string) => {
    setHoursMap((prev) => ({ ...prev, [workName]: val }));
    setSaved(false);
  };

  const handleSaveHours = () => {
    if (!modId || !mod) return;
    const worksList = worksDatabase.map((w) => {
      const existingWork = mod.works.find((ew) => ew.name === w.name);
      const hours = parseFloat(String(hoursMap[w.name]).replace(",", "."));
      if (!isNaN(hours) && hours > 0) return { id: existingWork?.id ?? `w-${modId}-${w.id}`, name: w.name, hours };
      if (existingWork) return existingWork;
      return null;
    }).filter(Boolean) as typeof mod.works;

    setCarDatabase(carDatabase.map((b) => ({
      ...b,
      models: b.models.map((m) => ({
        ...m,
        generations: m.generations.map((g) => ({
          ...g,
          modifications: g.modifications.map((mod_) => mod_.id === modId ? { ...mod_, works: worksList } : mod_),
        })),
      })),
    })));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const filledCount = worksDatabase.filter((w) => {
    const v = parseFloat(String(hoursMap[w.name]).replace(",", "."));
    return !isNaN(v) && v > 0;
  }).length;

  // ── Управление списком работ ───────────────────────────────────────────────
  const [newWorkName, setNewWorkName] = useState("");
  const [addError, setAddError] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editError, setEditError] = useState("");
  const [worksSaved, setWorksSaved] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const handleAddWork = () => {
    const name = newWorkName.trim();
    if (!name) { setAddError("Введите название работы"); return; }
    if (worksDatabase.some((w) => w.name.toLowerCase() === name.toLowerCase())) {
      setAddError("Такая работа уже есть в списке"); return;
    }
    const newWork: WorkEntry = { id: `work-manual-${Date.now()}`, name };
    setWorksDatabase([...worksDatabase, newWork]);
    setNewWorkName(""); setAddError("");
    setWorksSaved(true); setTimeout(() => setWorksSaved(false), 2000);
  };

  const startEdit = (w: WorkEntry) => {
    setEditingId(w.id); setEditName(w.name); setEditError("");
  };

  const handleSaveEdit = (oldName: string) => {
    const name = editName.trim();
    if (!name) { setEditError("Название не может быть пустым"); return; }
    if (worksDatabase.some((w) => w.id !== editingId && w.name.toLowerCase() === name.toLowerCase())) {
      setEditError("Такое название уже существует"); return;
    }
    // Переименовываем в worksDatabase
    setWorksDatabase(worksDatabase.map((w) => w.id === editingId ? { ...w, name } : w));
    // Переименовываем в нормативах всех модификаций
    setCarDatabase(carDatabase.map((b) => ({
      ...b,
      models: b.models.map((m) => ({
        ...m,
        generations: m.generations.map((g) => ({
          ...g,
          modifications: g.modifications.map((mod_) => ({
            ...mod_,
            works: mod_.works.map((work) => work.name === oldName ? { ...work, name } : work),
          })),
        })),
      })),
    })));
    // Обновляем hoursMap если открыта модификация
    if (hoursMap[oldName] !== undefined) {
      setHoursMap((prev) => {
        const next = { ...prev };
        next[name] = next[oldName];
        delete next[oldName];
        return next;
      });
    }
    setEditingId(null); setEditError("");
    setWorksSaved(true); setTimeout(() => setWorksSaved(false), 2000);
  };

  const handleDeleteWork = (w: WorkEntry) => {
    if (deleteConfirm !== w.id) { setDeleteConfirm(w.id); return; }
    setWorksDatabase(worksDatabase.filter((x) => x.id !== w.id));
    // Удаляем работу из всех модификаций
    setCarDatabase(carDatabase.map((b) => ({
      ...b,
      models: b.models.map((m) => ({
        ...m,
        generations: m.generations.map((g) => ({
          ...g,
          modifications: g.modifications.map((mod_) => ({
            ...mod_,
            works: mod_.works.filter((work) => work.name !== w.name),
          })),
        })),
      })),
    })));
    setDeleteConfirm(null);
    if (editingId === w.id) { setEditingId(null); }
  };

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">Управляйте списком работ и проставляйте нормачасы для каждой модификации автомобиля.</p>

      {/* ── Список работ ──────────────────────────────────────────────────── */}
      <div className="bg-white rounded-lg border border-border shadow-sm">
        <div className="px-5 py-3.5 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon name="ListChecks" size={16} className="text-[hsl(215,70%,22%)]" />
            <h3 className="font-semibold text-sm uppercase tracking-wider">Список работ</h3>
            <span className="text-xs text-muted-foreground bg-gray-100 px-2 py-0.5 rounded-full">{worksDatabase.length}</span>
          </div>
          {worksSaved && (
            <span className="flex items-center gap-1.5 text-xs text-green-600 animate-fade-in">
              <Icon name="CheckCircle" size={13} />Сохранено
            </span>
          )}
        </div>

        {/* Add new */}
        <div className="px-5 py-4 border-b border-border bg-blue-50/40">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Добавить новую работу</p>
          <div className="flex gap-3">
            <div className="flex-1">
              <input
                type="text"
                value={newWorkName}
                onChange={(e) => { setNewWorkName(e.target.value); setAddError(""); }}
                onKeyDown={(e) => { if (e.key === "Enter") handleAddWork(); }}
                placeholder="Название работы, например: Замена масла двигателя"
                className="w-full border border-border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(215,70%,22%)]"
              />
              {addError && <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><Icon name="AlertCircle" size={11} />{addError}</p>}
            </div>
            <button onClick={handleAddWork}
              className="flex items-center gap-2 px-4 py-2 bg-[hsl(215,70%,22%)] text-white rounded text-sm font-semibold hover:bg-[hsl(215,70%,18%)] transition-all shrink-0">
              <Icon name="Plus" size={15} />Добавить
            </button>
          </div>
        </div>

        {/* Works list */}
        {worksDatabase.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <Icon name="ListX" size={32} className="mx-auto mb-2 opacity-30" />
            <p className="text-sm">Список работ пуст. Добавьте работы вручную или загрузите через «Базы данных».</p>
          </div>
        ) : (
          <div className="divide-y divide-border max-h-96 overflow-y-auto">
            {worksDatabase.map((w, i) => (
              <div key={w.id} className={`flex items-center gap-3 px-5 py-3 transition-colors ${i % 2 === 0 ? "bg-white" : "bg-gray-50/50"} hover:bg-blue-50/30`}>
                {editingId === w.id ? (
                  <>
                    <div className="flex-1">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => { setEditName(e.target.value); setEditError(""); }}
                        onKeyDown={(e) => { if (e.key === "Enter") handleSaveEdit(w.name); if (e.key === "Escape") setEditingId(null); }}
                        autoFocus
                        className="w-full border border-[hsl(215,70%,22%)] rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(215,70%,22%)]"
                      />
                      {editError && <p className="mt-1 text-xs text-red-500">{editError}</p>}
                    </div>
                    <button onClick={() => handleSaveEdit(w.name)}
                      className="p-1.5 text-green-600 hover:bg-green-50 rounded transition-colors" title="Сохранить">
                      <Icon name="Check" size={14} />
                    </button>
                    <button onClick={() => setEditingId(null)}
                      className="p-1.5 text-muted-foreground hover:bg-gray-100 rounded transition-colors" title="Отмена">
                      <Icon name="X" size={14} />
                    </button>
                  </>
                ) : (
                  <>
                    <span className="flex-1 text-sm text-foreground">{w.name}</span>
                    <button onClick={() => startEdit(w)}
                      className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-gray-100 rounded transition-colors" title="Переименовать">
                      <Icon name="Pencil" size={13} />
                    </button>
                    <button
                      onClick={() => handleDeleteWork(w)}
                      className={`p-1.5 rounded transition-colors text-xs font-medium ${
                        deleteConfirm === w.id
                          ? "bg-red-500 text-white hover:bg-red-600 px-2"
                          : "text-red-400 hover:text-red-600 hover:bg-red-50"
                      }`}
                      title={deleteConfirm === w.id ? "Нажмите ещё раз для подтверждения" : "Удалить"}
                    >
                      {deleteConfirm === w.id
                        ? <span className="flex items-center gap-1"><Icon name="Trash2" size={13} />Удалить?</span>
                        : <Icon name="Trash2" size={13} />
                      }
                    </button>
                    {deleteConfirm === w.id && (
                      <button onClick={() => setDeleteConfirm(null)}
                        className="p-1.5 text-muted-foreground hover:bg-gray-100 rounded transition-colors text-xs">
                        <Icon name="X" size={13} />
                      </button>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Нормачасы по модификации ──────────────────────────────────────── */}
      <div className="bg-white rounded-lg border border-border shadow-sm">
        <div className="px-5 py-3.5 border-b border-border flex items-center gap-2">
          <Icon name="Car" size={16} className="text-[hsl(215,70%,22%)]" />
          <h3 className="font-semibold text-sm uppercase tracking-wider">Нормачасы по модификации</h3>
        </div>
        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <SelectBox label="Марка" value={brandId}
            onChange={(v) => { setBrandId(v); setModelId(""); setGenId(""); setModId(""); setHoursMap({}); setSaved(false); }}
            options={carDatabase.map((b) => ({ id: b.id, label: b.name }))} placeholder="— Марка —" />
          <SelectBox label="Модель" value={modelId}
            onChange={(v) => { setModelId(v); setGenId(""); setModId(""); setHoursMap({}); setSaved(false); }}
            options={brand?.models.map((m) => ({ id: m.id, label: m.name })) || []} placeholder="— Модель —" disabled={!brandId} />
          <SelectBox label="Поколение" value={genId}
            onChange={(v) => { setGenId(v); setModId(""); setHoursMap({}); setSaved(false); }}
            options={model?.generations.map((g) => ({ id: g.id, label: `${g.name} (${g.years})` })) || []} placeholder="— Поколение —" disabled={!modelId} />
          <SelectBox label="Модификация" value={modId} onChange={handleModChange}
            options={gen?.modifications.map((m) => ({ id: m.id, label: m.name })) || []} placeholder="— Модификация —" disabled={!genId} />
        </div>
        {mod && (
          <div className="mx-5 mb-5 p-3 bg-blue-50 border border-blue-100 rounded-md flex flex-wrap gap-5 text-xs">
            <span><span className="text-muted-foreground">Двигатель: </span><strong>{mod.engine}</strong></span>
            <span><span className="text-muted-foreground">КПП: </span><strong>{mod.transmission}</strong></span>
            <span><span className="text-muted-foreground">Мощность: </span><strong>{mod.power}</strong></span>
          </div>
        )}
      </div>

      {!modId ? (
        <div className="flex items-center gap-3 p-5 bg-gray-50 border border-border rounded-lg text-muted-foreground text-sm">
          <Icon name="Info" size={16} className="shrink-0" />
          Выберите автомобиль и модификацию для редактирования нормачасов
        </div>
      ) : worksDatabase.length === 0 ? (
        <div className="flex items-center gap-3 p-5 bg-amber-50 border border-amber-200 rounded-lg text-amber-700 text-sm">
          <Icon name="AlertTriangle" size={16} className="shrink-0" />
          Список работ пуст. Добавьте работы в блоке выше или загрузите в разделе «Базы данных».
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-border shadow-sm">
          <div className="px-5 py-3.5 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon name="Wrench" size={16} className="text-[hsl(215,70%,22%)]" />
              <h3 className="font-semibold text-sm uppercase tracking-wider">Нормачасы</h3>
            </div>
            <span className="text-xs text-muted-foreground">
              Заполнено: <strong className="text-[hsl(215,70%,22%)]">{filledCount}</strong> / {worksDatabase.length}
            </span>
          </div>
          <div className="divide-y divide-border">
            {worksDatabase.map((work) => {
              const val = hoursMap[work.name] ?? "";
              const existing = mod?.works.find((w) => w.name === work.name);
              const isFilled = val !== "" && !isNaN(parseFloat(String(val).replace(",", "."))) && parseFloat(String(val).replace(",", ".")) > 0;
              return (
                <div key={work.id} className="flex items-center gap-4 px-5 py-3 hover:bg-gray-50 transition-colors">
                  <div className="flex-1">
                    <span className="text-sm text-foreground">{work.name}</span>
                    {existing && !val && (
                      <span className="text-xs text-muted-foreground ml-2">(сейчас: {existing.hours} н/ч)</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <input type="number" value={val}
                      onChange={(e) => handleHoursChange(work.name, e.target.value)}
                      placeholder={existing ? String(existing.hours) : "0.0"}
                      step="0.1" min="0"
                      className={`w-24 border rounded px-3 py-1.5 text-sm text-center focus:outline-none focus:ring-2 focus:ring-[hsl(215,70%,22%)] transition-all ${isFilled ? "border-green-300 bg-green-50" : "border-border"}`}
                    />
                    <span className="text-xs text-muted-foreground w-8">н/ч</span>
                    {isFilled && <Icon name="Check" size={14} className="text-green-500" />}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="px-5 py-4 border-t border-border flex items-center gap-3">
            <button onClick={handleSaveHours}
              className="flex items-center gap-2 px-6 py-2.5 bg-[hsl(215,70%,22%)] text-white rounded text-sm font-semibold hover:bg-[hsl(215,70%,18%)] transition-all shadow-sm">
              <Icon name="Save" size={15} />Сохранить нормачасы
            </button>
            {saved && (
              <span className="flex items-center gap-1.5 text-sm text-green-600 animate-fade-in">
                <Icon name="CheckCircle" size={15} />Нормачасы сохранены!
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TabEditor;
