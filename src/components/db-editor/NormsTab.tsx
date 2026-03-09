import { useState, useMemo } from "react";
import { useAppData, WorkEntry } from "@/pages/Index";
import { Modification, Work } from "@/data/carDatabase";
import Icon from "@/components/ui/icon";
import { Modal, Field } from "./DbEditorShared";

const NormsTab = () => {
  const { carDatabase, setCarDatabase, worksDatabase } = useAppData();

  const [brandId, setBrandId] = useState("");
  const [modelId, setModelId] = useState("");
  const [genId, setGenId] = useState("");
  const [modId, setModId] = useState("");
  const [editingWork, setEditingWork] = useState<{ workId: string; hours: string } | null>(null);
  const [addModal, setAddModal] = useState(false);
  const [newWorkName, setNewWorkName] = useState("");
  const [newWorkHours, setNewWorkHours] = useState("");

  const brand = carDatabase.find((b) => b.id === brandId);
  const model = brand?.models.find((m) => m.id === modelId);
  const gen = model?.generations.find((g) => g.id === genId);
  const mod = gen?.modifications.find((m) => m.id === modId);

  const updateMod = (updater: (m: Modification) => Modification) => {
    setCarDatabase(carDatabase.map((b) => b.id !== brandId ? b : {
      ...b, models: b.models.map((m) => m.id !== modelId ? m : {
        ...m, generations: m.generations.map((g) => g.id !== genId ? g : {
          ...g, modifications: g.modifications.map((mod) => mod.id !== modId ? mod : updater(mod))
        })
      })
    }));
  };

  const saveEditWork = (workId: string) => {
    if (!editingWork) return;
    const h = parseFloat(editingWork.hours.replace(",", "."));
    if (isNaN(h) || h <= 0) return;
    updateMod((m) => ({ ...m, works: m.works.map((w) => w.id === workId ? { ...w, hours: h } : w) }));
    setEditingWork(null);
  };

  const deleteWork = (workId: string) => {
    updateMod((m) => ({ ...m, works: m.works.filter((w) => w.id !== workId) }));
  };

  const addWork = () => {
    if (!newWorkName.trim()) return;
    const h = parseFloat(newWorkHours.replace(",", "."));
    if (isNaN(h) || h <= 0) return;
    const work: Work = { id: `w-manual-${Date.now()}`, name: newWorkName.trim(), hours: h };
    updateMod((m) => ({ ...m, works: [...m.works, work] }));
    setNewWorkName(""); setNewWorkHours(""); setAddModal(false);
  };

  // Работы из worksDatabase, которых ещё нет у модификации
  const missingWorks = useMemo(() => {
    if (!mod) return [];
    const existing = new Set(mod.works.map((w) => w.name.toLowerCase()));
    return worksDatabase.filter((w) => !existing.has(w.name.toLowerCase()));
  }, [mod, worksDatabase]);

  const addMissingWork = (work: WorkEntry) => {
    updateMod((m) => ({ ...m, works: [...m.works, { id: `w-auto-${Date.now()}`, name: work.name, hours: 0 }] }));
  };

  const Sel = ({ label, value, onChange, options, placeholder, disabled }: {
    label: string; value: string; onChange: (v: string) => void; options: { id: string; label: string }[];
    placeholder: string; disabled?: boolean;
  }) => (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)} disabled={disabled}
        className={`border border-border rounded px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[hsl(215,70%,22%)] ${disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}>
        <option value="">{placeholder}</option>
        {options.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
      </select>
    </div>
  );

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">Выберите конкретную модификацию для редактирования нормативов</p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Sel label="Марка" value={brandId} onChange={(v) => { setBrandId(v); setModelId(""); setGenId(""); setModId(""); }}
          options={carDatabase.map((b) => ({ id: b.id, label: b.name }))} placeholder="— Марка —" />
        <Sel label="Модель" value={modelId} onChange={(v) => { setModelId(v); setGenId(""); setModId(""); }}
          options={brand?.models.map((m) => ({ id: m.id, label: m.name })) ?? []} placeholder="— Модель —" disabled={!brandId} />
        <Sel label="Поколение" value={genId} onChange={(v) => { setGenId(v); setModId(""); }}
          options={model?.generations.map((g) => ({ id: g.id, label: `${g.name} (${g.years})` })) ?? []} placeholder="— Поколение —" disabled={!modelId} />
        <Sel label="Модификация" value={modId} onChange={setModId}
          options={gen?.modifications.map((m) => ({ id: m.id, label: m.name })) ?? []} placeholder="— Модификация —" disabled={!genId} />
      </div>

      {mod && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-foreground">{brand?.name} {model?.name} {gen?.name} · {mod.name}</p>
              <p className="text-xs text-muted-foreground">{mod.engine} · {mod.transmission} · {mod.power}</p>
            </div>
            <button onClick={() => setAddModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-[hsl(215,70%,22%)] text-white rounded text-xs font-semibold hover:bg-[hsl(215,70%,18%)] transition-all">
              <Icon name="Plus" size={13} />Добавить норматив
            </button>
          </div>

          {/* Missing works hint */}
          {missingWorks.length > 0 && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-xs font-semibold text-amber-700 mb-2 flex items-center gap-1.5">
                <Icon name="AlertTriangle" size={13} />
                Работы без нормативов для этой модификации ({missingWorks.length}):
              </p>
              <div className="flex flex-wrap gap-1.5">
                {missingWorks.map((w) => (
                  <button key={w.id} onClick={() => addMissingWork(w)}
                    className="flex items-center gap-1 text-xs px-2 py-1 bg-white border border-amber-300 rounded hover:bg-amber-50 text-amber-800 transition-all">
                    <Icon name="Plus" size={11} />{w.name}
                  </button>
                ))}
              </div>
              <p className="text-xs text-amber-600 mt-2">Нажмите на работу чтобы добавить с нулевым нормативом, затем отредактируйте</p>
            </div>
          )}

          {mod.works.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground text-sm border border-dashed border-border rounded-lg">
              Нет нормативов. Добавьте вручную или нажмите на работы выше.
            </div>
          ) : (
            <div className="border border-border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-border">
                    <th className="text-left px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Работа</th>
                    <th className="text-center px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground w-28">Нормачасы</th>
                    <th className="w-20" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {mod.works.map((work) => (
                    <tr key={work.id} className="hover:bg-gray-50 group">
                      <td className="px-4 py-2.5 text-sm text-foreground">{work.name}</td>
                      <td className="px-4 py-2.5 text-center">
                        {editingWork?.workId === work.id ? (
                          <div className="flex items-center gap-1.5 justify-center">
                            <input
                              type="number" step="0.1" min="0.1"
                              value={editingWork.hours}
                              onChange={(e) => setEditingWork({ ...editingWork, hours: e.target.value })}
                              className="w-20 border border-[hsl(215,70%,22%)] rounded px-2 py-1 text-sm text-center focus:outline-none"
                              autoFocus
                              onKeyDown={(e) => { if (e.key === "Enter") saveEditWork(work.id); if (e.key === "Escape") setEditingWork(null); }}
                            />
                            <button onClick={() => saveEditWork(work.id)} className="p-1 rounded bg-green-500 hover:bg-green-600 text-white">
                              <Icon name="Check" size={12} />
                            </button>
                            <button onClick={() => setEditingWork(null)} className="p-1 rounded bg-gray-200 hover:bg-gray-300">
                              <Icon name="X" size={12} />
                            </button>
                          </div>
                        ) : (
                          <span className={`font-semibold font-montserrat ${work.hours > 0 ? "text-[hsl(215,70%,22%)]" : "text-amber-500"}`}>
                            {work.hours > 0 ? `${work.hours} н/ч` : "—"}
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => setEditingWork({ workId: work.id, hours: String(work.hours) })} className="p-1.5 rounded hover:bg-gray-100">
                            <Icon name="Pencil" size={12} className="text-[hsl(215,70%,22%)]" />
                          </button>
                          <button onClick={() => deleteWork(work.id)} className="p-1.5 rounded hover:bg-red-50">
                            <Icon name="Trash2" size={12} className="text-red-400" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {!mod && brandId && modelId && genId && (
        <div className="py-6 text-center text-muted-foreground text-sm">Выберите модификацию</div>
      )}

      {addModal && (
        <Modal title="Добавить норматив" onClose={() => setAddModal(false)}>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-1">Работа</label>
            <select value={newWorkName} onChange={(e) => setNewWorkName(e.target.value)}
              className="w-full border border-border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(215,70%,22%)]">
              <option value="">— Выберите из базы работ —</option>
              {worksDatabase.map((w) => <option key={w.id} value={w.name}>{w.name}</option>)}
              <option value="__custom__">Ввести вручную...</option>
            </select>
            {newWorkName === "__custom__" && (
              <input value="" onChange={(e) => setNewWorkName(e.target.value)} placeholder="Введите название работы"
                className="mt-2 w-full border border-border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(215,70%,22%)]" />
            )}
          </div>
          <Field label="Нормачасы" value={newWorkHours} onChange={setNewWorkHours} placeholder="1.5" type="number" />
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setAddModal(false)} className="px-4 py-2 border border-border rounded text-sm text-muted-foreground hover:bg-gray-50">Отмена</button>
            <button onClick={addWork} className="px-5 py-2 bg-[hsl(215,70%,22%)] text-white rounded text-sm font-semibold hover:bg-[hsl(215,70%,18%)]">Сохранить</button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default NormsTab;
