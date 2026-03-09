import { useState } from "react";
import { useAppData } from "@/pages/Index";
import { CarBrand } from "@/data/carDatabase";
import Icon from "@/components/ui/icon";
import { Modal, Field, makeId, slug } from "./DbEditorShared";

const CarsTab = () => {
  const { carDatabase, setCarDatabase } = useAppData();

  const [expandedBrand, setExpandedBrand] = useState<string | null>(null);
  const [expandedModel, setExpandedModel] = useState<string | null>(null);
  const [expandedGen, setExpandedGen] = useState<string | null>(null);

  // Modals
  const [modal, setModal] = useState<null | {
    type: "addBrand" | "editBrand" | "addModel" | "editModel" | "addGen" | "editGen" | "addMod" | "editMod";
    brandId?: string; modelId?: string; genId?: string; modId?: string;
  }>(null);

  const [form, setForm] = useState<Record<string, string>>({});
  const f = (k: string) => form[k] ?? "";
  const sf = (k: string) => (v: string) => setForm((p) => ({ ...p, [k]: v }));

  const openModal = (type: typeof modal extends null ? never : NonNullable<typeof modal>["type"], ids?: { brandId?: string; modelId?: string; genId?: string; modId?: string }, prefill?: Record<string, string>) => {
    setForm(prefill ?? {});
    setModal({ type, ...ids });
  };
  const closeModal = () => setModal(null);

  // Deletes
  const deleteBrand = (bId: string) => setCarDatabase(carDatabase.filter((b) => b.id !== bId));
  const deleteModel = (bId: string, mId: string) => setCarDatabase(carDatabase.map((b) => b.id !== bId ? b : { ...b, models: b.models.filter((m) => m.id !== mId) }));
  const deleteGen = (bId: string, mId: string, gId: string) => setCarDatabase(carDatabase.map((b) => b.id !== bId ? b : { ...b, models: b.models.map((m) => m.id !== mId ? m : { ...m, generations: m.generations.filter((g) => g.id !== gId) }) }));
  const deleteMod = (bId: string, mId: string, gId: string, modId: string) =>
    setCarDatabase(carDatabase.map((b) => b.id !== bId ? b : { ...b, models: b.models.map((m) => m.id !== mId ? m : { ...m, generations: m.generations.map((g) => g.id !== gId ? g : { ...g, modifications: g.modifications.filter((mod) => mod.id !== modId) }) }) }));

  const save = () => {
    if (!modal) return;
    const db = JSON.parse(JSON.stringify(carDatabase)) as CarBrand[];

    if (modal.type === "addBrand") {
      const id = makeId(f("name"));
      if (!f("name") || db.find((b) => b.id === id)) return;
      db.push({ id, name: f("name"), models: [] });
    }
    if (modal.type === "editBrand") {
      const b = db.find((x) => x.id === modal.brandId);
      if (b) b.name = f("name");
    }
    if (modal.type === "addModel") {
      const b = db.find((x) => x.id === modal.brandId);
      if (!b || !f("name")) return;
      const id = makeId(modal.brandId!, f("name"));
      if (b.models.find((m) => m.id === id)) return;
      b.models.push({ id, name: f("name"), generations: [] });
    }
    if (modal.type === "editModel") {
      const b = db.find((x) => x.id === modal.brandId);
      const m = b?.models.find((x) => x.id === modal.modelId);
      if (m) m.name = f("name");
    }
    if (modal.type === "addGen") {
      const b = db.find((x) => x.id === modal.brandId);
      const m = b?.models.find((x) => x.id === modal.modelId);
      if (!m || !f("name")) return;
      const years = f("yearsTo") ? `${f("yearsFrom")} — ${f("yearsTo")}` : f("yearsFrom");
      const id = makeId(modal.modelId!, f("name"));
      if (m.generations.find((g) => g.id === id)) return;
      m.generations.push({ id, name: f("name"), years, modifications: [] });
    }
    if (modal.type === "editGen") {
      const b = db.find((x) => x.id === modal.brandId);
      const m = b?.models.find((x) => x.id === modal.modelId);
      const g = m?.generations.find((x) => x.id === modal.genId);
      if (g) { g.name = f("name"); g.years = f("yearsTo") ? `${f("yearsFrom")} — ${f("yearsTo")}` : f("yearsFrom"); }
    }
    if (modal.type === "addMod") {
      const b = db.find((x) => x.id === modal.brandId);
      const m = b?.models.find((x) => x.id === modal.modelId);
      const g = m?.generations.find((x) => x.id === modal.genId);
      if (!g || !f("name")) return;
      const id = makeId(modal.genId!, f("name"));
      if (g.modifications.find((mod) => mod.id === id)) return;
      g.modifications.push({ id, name: f("name"), engine: f("engine") || f("name"), transmission: f("transmission") || "—", power: f("power") || "—", works: [] });
    }
    if (modal.type === "editMod") {
      const b = db.find((x) => x.id === modal.brandId);
      const m = b?.models.find((x) => x.id === modal.modelId);
      const g = m?.generations.find((x) => x.id === modal.genId);
      const mod = g?.modifications.find((x) => x.id === modal.modId);
      if (mod) { mod.name = f("name"); mod.engine = f("engine"); mod.transmission = f("transmission"); mod.power = f("power"); }
    }

    setCarDatabase(db);
    closeModal();
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Всего марок: <strong>{carDatabase.length}</strong></p>
        <button onClick={() => openModal("addBrand")}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[hsl(215,70%,22%)] text-white rounded text-xs font-semibold hover:bg-[hsl(215,70%,18%)] transition-all">
          <Icon name="Plus" size={13} />Добавить марку
        </button>
      </div>

      {carDatabase.length === 0 && (
        <div className="py-10 text-center text-muted-foreground text-sm border border-dashed border-border rounded-lg">
          База автомобилей пуста. Загрузите через «Загрузка баз» или добавьте вручную.
        </div>
      )}

      {carDatabase.map((brand) => (
        <div key={brand.id} className="border border-border rounded-lg overflow-hidden">
          {/* Brand row */}
          <div className="flex items-center justify-between px-4 py-3 bg-[hsl(215,70%,22%)] text-white">
            <button className="flex items-center gap-2 flex-1 text-left" onClick={() => setExpandedBrand(expandedBrand === brand.id ? null : brand.id)}>
              <Icon name={expandedBrand === brand.id ? "ChevronDown" : "ChevronRight"} size={15} />
              <span className="font-semibold text-sm">{brand.name}</span>
              <span className="text-xs text-blue-200 ml-1">({brand.models.length} мод.)</span>
            </button>
            <div className="flex items-center gap-1">
              <button onClick={() => openModal("addModel", { brandId: brand.id })} className="p-1.5 rounded hover:bg-white/10 transition-colors" title="Добавить модель">
                <Icon name="Plus" size={14} />
              </button>
              <button onClick={() => openModal("editBrand", { brandId: brand.id }, { name: brand.name })} className="p-1.5 rounded hover:bg-white/10 transition-colors" title="Редактировать">
                <Icon name="Pencil" size={14} />
              </button>
              <button onClick={() => { if (confirm(`Удалить марку «${brand.name}» со всеми данными?`)) deleteBrand(brand.id); }} className="p-1.5 rounded hover:bg-red-400/30 transition-colors" title="Удалить">
                <Icon name="Trash2" size={14} />
              </button>
            </div>
          </div>

          {expandedBrand === brand.id && (
            <div className="divide-y divide-border">
              {brand.models.map((model) => (
                <div key={model.id}>
                  {/* Model row */}
                  <div className="flex items-center justify-between px-6 py-2.5 bg-blue-50">
                    <button className="flex items-center gap-2 flex-1 text-left" onClick={() => setExpandedModel(expandedModel === model.id ? null : model.id)}>
                      <Icon name={expandedModel === model.id ? "ChevronDown" : "ChevronRight"} size={13} className="text-[hsl(215,70%,22%)]" />
                      <span className="text-sm font-medium text-foreground">{model.name}</span>
                      <span className="text-xs text-muted-foreground ml-1">({model.generations.length} пок.)</span>
                    </button>
                    <div className="flex items-center gap-1">
                      <button onClick={() => openModal("addGen", { brandId: brand.id, modelId: model.id })} className="p-1 rounded hover:bg-blue-200 transition-colors" title="Добавить поколение">
                        <Icon name="Plus" size={13} className="text-[hsl(215,70%,22%)]" />
                      </button>
                      <button onClick={() => openModal("editModel", { brandId: brand.id, modelId: model.id }, { name: model.name })} className="p-1 rounded hover:bg-blue-200 transition-colors">
                        <Icon name="Pencil" size={13} className="text-[hsl(215,70%,22%)]" />
                      </button>
                      <button onClick={() => { if (confirm(`Удалить модель «${model.name}»?`)) deleteModel(brand.id, model.id); }} className="p-1 rounded hover:bg-red-100 transition-colors">
                        <Icon name="Trash2" size={13} className="text-red-500" />
                      </button>
                    </div>
                  </div>

                  {expandedModel === model.id && (
                    <div className="pl-8 divide-y divide-border bg-white">
                      {model.generations.map((gen) => (
                        <div key={gen.id}>
                          {/* Generation row */}
                          <div className="flex items-center justify-between px-4 py-2">
                            <button className="flex items-center gap-2 flex-1 text-left" onClick={() => setExpandedGen(expandedGen === gen.id ? null : gen.id)}>
                              <Icon name={expandedGen === gen.id ? "ChevronDown" : "ChevronRight"} size={12} className="text-muted-foreground" />
                              <span className="text-xs font-semibold text-foreground">{gen.name}</span>
                              <span className="text-xs text-muted-foreground">{gen.years}</span>
                              <span className="text-xs text-muted-foreground ml-1">({gen.modifications.length} модиф.)</span>
                            </button>
                            <div className="flex items-center gap-1">
                              <button onClick={() => openModal("addMod", { brandId: brand.id, modelId: model.id, genId: gen.id })} className="p-1 rounded hover:bg-gray-100 transition-colors" title="Добавить модификацию">
                                <Icon name="Plus" size={12} className="text-[hsl(215,70%,22%)]" />
                              </button>
                              <button onClick={() => {
                                const [yf, yt] = gen.years.split(" — ");
                                openModal("editGen", { brandId: brand.id, modelId: model.id, genId: gen.id }, { name: gen.name, yearsFrom: yf?.trim() ?? "", yearsTo: yt?.trim() ?? "" });
                              }} className="p-1 rounded hover:bg-gray-100 transition-colors">
                                <Icon name="Pencil" size={12} className="text-[hsl(215,70%,22%)]" />
                              </button>
                              <button onClick={() => { if (confirm(`Удалить поколение «${gen.name}»?`)) deleteGen(brand.id, model.id, gen.id); }} className="p-1 rounded hover:bg-red-50 transition-colors">
                                <Icon name="Trash2" size={12} className="text-red-400" />
                              </button>
                            </div>
                          </div>

                          {expandedGen === gen.id && (
                            <div className="pl-8 pb-2">
                              {gen.modifications.map((mod) => (
                                <div key={mod.id} className="flex items-center justify-between py-1.5 px-3 hover:bg-gray-50 rounded group">
                                  <div>
                                    <span className="text-xs font-medium text-foreground">{mod.name}</span>
                                    <span className="text-xs text-muted-foreground ml-2">{mod.engine} · {mod.transmission} · {mod.power}</span>
                                    <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-full ${mod.works.length > 0 ? "bg-green-50 text-green-700 border border-green-200" : "bg-amber-50 text-amber-600 border border-amber-200"}`}>
                                      {mod.works.length > 0 ? `${mod.works.length} норм.` : "нет норм."}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => openModal("editMod", { brandId: brand.id, modelId: model.id, genId: gen.id, modId: mod.id }, { name: mod.name, engine: mod.engine, transmission: mod.transmission, power: mod.power })} className="p-1 rounded hover:bg-gray-100">
                                      <Icon name="Pencil" size={12} className="text-[hsl(215,70%,22%)]" />
                                    </button>
                                    <button onClick={() => { if (confirm(`Удалить модификацию «${mod.name}»?`)) deleteMod(brand.id, model.id, gen.id, mod.id); }} className="p-1 rounded hover:bg-red-50">
                                      <Icon name="Trash2" size={12} className="text-red-400" />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      {/* Modal */}
      {modal && (
        <Modal
          title={{
            addBrand: "Добавить марку", editBrand: "Редактировать марку",
            addModel: "Добавить модель", editModel: "Редактировать модель",
            addGen: "Добавить поколение", editGen: "Редактировать поколение",
            addMod: "Добавить модификацию", editMod: "Редактировать модификацию",
          }[modal.type]}
          onClose={closeModal}
        >
          {(modal.type === "addBrand" || modal.type === "editBrand") && (
            <Field label="Название марки" value={f("name")} onChange={sf("name")} placeholder="Toyota" />
          )}
          {(modal.type === "addModel" || modal.type === "editModel") && (
            <Field label="Название модели" value={f("name")} onChange={sf("name")} placeholder="Camry" />
          )}
          {(modal.type === "addGen" || modal.type === "editGen") && (<>
            <Field label="Название поколения" value={f("name")} onChange={sf("name")} placeholder="VII (V70)" />
            <div className="grid grid-cols-2 gap-3">
              <Field label="Год начала" value={f("yearsFrom")} onChange={sf("yearsFrom")} placeholder="2017" />
              <Field label="Год окончания" value={f("yearsTo")} onChange={sf("yearsTo")} placeholder="н.в." />
            </div>
          </>)}
          {(modal.type === "addMod" || modal.type === "editMod") && (<>
            <Field label="Название модификации" value={f("name")} onChange={sf("name")} placeholder="2.5 AT" />
            <Field label="Двигатель" value={f("engine")} onChange={sf("engine")} placeholder="2.5 бензин (181 л.с.)" />
            <Field label="КПП" value={f("transmission")} onChange={sf("transmission")} placeholder="Автомат" />
            <Field label="Мощность" value={f("power")} onChange={sf("power")} placeholder="181 л.с." />
          </>)}
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={closeModal} className="px-4 py-2 border border-border rounded text-sm text-muted-foreground hover:bg-gray-50 transition-all">Отмена</button>
            <button onClick={save} className="px-5 py-2 bg-[hsl(215,70%,22%)] text-white rounded text-sm font-semibold hover:bg-[hsl(215,70%,18%)] transition-all">Сохранить</button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default CarsTab;
