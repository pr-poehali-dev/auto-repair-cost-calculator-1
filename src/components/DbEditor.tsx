import { useState, useMemo } from "react";
import { useAppData, WorkEntry } from "@/pages/Index";
import { CarBrand, Modification, Work } from "@/data/carDatabase";
import Icon from "@/components/ui/icon";

type EditorTab = "cars" | "works" | "norms";

// ─── tiny helpers ────────────────────────────────────────────────────────────

const slug = (s: string) => s.toLowerCase().replace(/[\s()]/g, "-");

function makeId(...parts: string[]) {
  return parts.map(slug).join("__");
}

// ─── modal ───────────────────────────────────────────────────────────────────

const Modal = ({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
    <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <h3 className="font-montserrat font-bold text-base">{title}</h3>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
          <Icon name="X" size={18} />
        </button>
      </div>
      <div className="px-6 py-5 space-y-4">{children}</div>
    </div>
  </div>
);

const Field = ({ label, value, onChange, placeholder, type = "text" }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string;
}) => (
  <div>
    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-1">{label}</label>
    <input
      type={type} value={value} onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full border border-border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(215,70%,22%)]"
    />
  </div>
);

// ─── Cars tab ────────────────────────────────────────────────────────────────

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
      g.modifications.push({
        id, name: f("name"),
        engine: f("engine") || f("name"), transmission: f("transmission") || "—", power: f("power") || "—",
        engineType: f("engineType"), engineVolumeCC: f("engineVolumeCC"), powerRpm: f("powerRpm"),
        torqueNm: f("torqueNm"), intakeType: f("intakeType"), cylinderLayout: f("cylinderLayout"),
        cylinderCount: f("cylinderCount"), compressionRatio: f("compressionRatio"),
        valvesPerCylinder: f("valvesPerCylinder"), turboType: f("turboType"),
        boreMm: f("boreMm"), strokeMm: f("strokeMm"), engineModel: f("engineModel"),
        engineLocation: f("engineLocation"), powerKw: f("powerKw"), torqueRpm: f("torqueRpm"),
        intercooler: f("intercooler"), engineCode: f("engineCode"), timingSystem: f("timingSystem"),
        fuelConsumptionMethod: f("fuelConsumptionMethod"),
        bodyType: f("bodyType"), seats: f("seats"), lengthMm: f("lengthMm"), widthMm: f("widthMm"),
        heightMm: f("heightMm"), wheelbaseMm: f("wheelbaseMm"), trackFrontMm: f("trackFrontMm"),
        trackRearMm: f("trackRearMm"), curbWeightKg: f("curbWeightKg"), wheelSize: f("wheelSize"),
        groundClearanceMm: f("groundClearanceMm"), trunkMaxL: f("trunkMaxL"), trunkMinL: f("trunkMinL"),
        grossWeightKg: f("grossWeightKg"), diskSize: f("diskSize"), clearanceMm: f("clearanceMm"),
        trackFrontWidthMm: f("trackFrontWidthMm"), trackRearWidthMm: f("trackRearWidthMm"),
        payloadKg: f("payloadKg"), trainWeightKg: f("trainWeightKg"), axleLoadKg: f("axleLoadKg"),
        loadingHeightMm: f("loadingHeightMm"), cargoCompartmentDims: f("cargoCompartmentDims"),
        cargoVolumeM3: f("cargoVolumeM3"), boltPattern: f("boltPattern"),
        gearCount: f("gearCount"), driveType: f("driveType"), turningDiameterM: f("turningDiameterM"),
        fuelType: f("fuelType"), maxSpeedKmh: f("maxSpeedKmh"), acceleration100: f("acceleration100"),
        fuelTankL: f("fuelTankL"), ecoStandard: f("ecoStandard"),
        fuelCityL: f("fuelCityL"), fuelHighwayL: f("fuelHighwayL"), fuelMixedL: f("fuelMixedL"),
        rangeKm: f("rangeKm"), co2GKm: f("co2GKm"),
        frontBrakes: f("frontBrakes"), rearBrakes: f("rearBrakes"),
        frontSuspension: f("frontSuspension"), rearSuspension: f("rearSuspension"),
        doorsCount: f("doorsCount"), countryOfOrigin: f("countryOfOrigin"),
        vehicleClass: f("vehicleClass"), steeringPosition: f("steeringPosition"),
        safetyRating: f("safetyRating"), safetyRatingName: f("safetyRatingName"),
        works: [],
      });
    }
    if (modal.type === "editMod") {
      const b = db.find((x) => x.id === modal.brandId);
      const m = b?.models.find((x) => x.id === modal.modelId);
      const g = m?.generations.find((x) => x.id === modal.genId);
      const mod = g?.modifications.find((x) => x.id === modal.modId);
      if (mod) {
        mod.name = f("name"); mod.engine = f("engine"); mod.transmission = f("transmission"); mod.power = f("power");
        mod.engineType = f("engineType"); mod.engineVolumeCC = f("engineVolumeCC"); mod.powerRpm = f("powerRpm");
        mod.torqueNm = f("torqueNm"); mod.intakeType = f("intakeType"); mod.cylinderLayout = f("cylinderLayout");
        mod.cylinderCount = f("cylinderCount"); mod.compressionRatio = f("compressionRatio");
        mod.valvesPerCylinder = f("valvesPerCylinder"); mod.turboType = f("turboType");
        mod.boreMm = f("boreMm"); mod.strokeMm = f("strokeMm"); mod.engineModel = f("engineModel");
        mod.engineLocation = f("engineLocation"); mod.powerKw = f("powerKw"); mod.torqueRpm = f("torqueRpm");
        mod.intercooler = f("intercooler"); mod.engineCode = f("engineCode"); mod.timingSystem = f("timingSystem");
        mod.fuelConsumptionMethod = f("fuelConsumptionMethod");
        mod.bodyType = f("bodyType"); mod.seats = f("seats"); mod.lengthMm = f("lengthMm");
        mod.widthMm = f("widthMm"); mod.heightMm = f("heightMm"); mod.wheelbaseMm = f("wheelbaseMm");
        mod.trackFrontMm = f("trackFrontMm"); mod.trackRearMm = f("trackRearMm");
        mod.curbWeightKg = f("curbWeightKg"); mod.wheelSize = f("wheelSize");
        mod.groundClearanceMm = f("groundClearanceMm"); mod.trunkMaxL = f("trunkMaxL");
        mod.trunkMinL = f("trunkMinL"); mod.grossWeightKg = f("grossWeightKg");
        mod.diskSize = f("diskSize"); mod.clearanceMm = f("clearanceMm");
        mod.trackFrontWidthMm = f("trackFrontWidthMm"); mod.trackRearWidthMm = f("trackRearWidthMm");
        mod.payloadKg = f("payloadKg"); mod.trainWeightKg = f("trainWeightKg"); mod.axleLoadKg = f("axleLoadKg");
        mod.loadingHeightMm = f("loadingHeightMm"); mod.cargoCompartmentDims = f("cargoCompartmentDims");
        mod.cargoVolumeM3 = f("cargoVolumeM3"); mod.boltPattern = f("boltPattern");
        mod.gearCount = f("gearCount"); mod.driveType = f("driveType"); mod.turningDiameterM = f("turningDiameterM");
        mod.fuelType = f("fuelType"); mod.maxSpeedKmh = f("maxSpeedKmh"); mod.acceleration100 = f("acceleration100");
        mod.fuelTankL = f("fuelTankL"); mod.ecoStandard = f("ecoStandard");
        mod.fuelCityL = f("fuelCityL"); mod.fuelHighwayL = f("fuelHighwayL"); mod.fuelMixedL = f("fuelMixedL");
        mod.rangeKm = f("rangeKm"); mod.co2GKm = f("co2GKm");
        mod.frontBrakes = f("frontBrakes"); mod.rearBrakes = f("rearBrakes");
        mod.frontSuspension = f("frontSuspension"); mod.rearSuspension = f("rearSuspension");
        mod.doorsCount = f("doorsCount"); mod.countryOfOrigin = f("countryOfOrigin");
        mod.vehicleClass = f("vehicleClass"); mod.steeringPosition = f("steeringPosition");
        mod.safetyRating = f("safetyRating"); mod.safetyRatingName = f("safetyRatingName");
      }
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
                                    <button onClick={() => openModal("editMod", { brandId: brand.id, modelId: model.id, genId: gen.id, modId: mod.id }, {
                                      name: mod.name, engine: mod.engine, transmission: mod.transmission, power: mod.power,
                                      engineType: mod.engineType ?? "", engineVolumeCC: mod.engineVolumeCC ?? "",
                                      powerRpm: mod.powerRpm ?? "", torqueNm: mod.torqueNm ?? "",
                                      intakeType: mod.intakeType ?? "", cylinderLayout: mod.cylinderLayout ?? "",
                                      cylinderCount: mod.cylinderCount ?? "", compressionRatio: mod.compressionRatio ?? "",
                                      valvesPerCylinder: mod.valvesPerCylinder ?? "", turboType: mod.turboType ?? "",
                                      boreMm: mod.boreMm ?? "", strokeMm: mod.strokeMm ?? "",
                                      engineModel: mod.engineModel ?? "", engineCode: mod.engineCode ?? "",
                                      engineLocation: mod.engineLocation ?? "", powerKw: mod.powerKw ?? "",
                                      torqueRpm: mod.torqueRpm ?? "", intercooler: mod.intercooler ?? "",
                                      timingSystem: mod.timingSystem ?? "", fuelConsumptionMethod: mod.fuelConsumptionMethod ?? "",
                                      bodyType: mod.bodyType ?? "", seats: mod.seats ?? "",
                                      lengthMm: mod.lengthMm ?? "", widthMm: mod.widthMm ?? "",
                                      heightMm: mod.heightMm ?? "", wheelbaseMm: mod.wheelbaseMm ?? "",
                                      trackFrontMm: mod.trackFrontMm ?? "", trackRearMm: mod.trackRearMm ?? "",
                                      curbWeightKg: mod.curbWeightKg ?? "", wheelSize: mod.wheelSize ?? "",
                                      groundClearanceMm: mod.groundClearanceMm ?? "", trunkMaxL: mod.trunkMaxL ?? "",
                                      trunkMinL: mod.trunkMinL ?? "", grossWeightKg: mod.grossWeightKg ?? "",
                                      diskSize: mod.diskSize ?? "", clearanceMm: mod.clearanceMm ?? "",
                                      trackFrontWidthMm: mod.trackFrontWidthMm ?? "", trackRearWidthMm: mod.trackRearWidthMm ?? "",
                                      payloadKg: mod.payloadKg ?? "", trainWeightKg: mod.trainWeightKg ?? "",
                                      axleLoadKg: mod.axleLoadKg ?? "", loadingHeightMm: mod.loadingHeightMm ?? "",
                                      cargoCompartmentDims: mod.cargoCompartmentDims ?? "", cargoVolumeM3: mod.cargoVolumeM3 ?? "",
                                      boltPattern: mod.boltPattern ?? "",
                                      gearCount: mod.gearCount ?? "", driveType: mod.driveType ?? "",
                                      turningDiameterM: mod.turningDiameterM ?? "",
                                      fuelType: mod.fuelType ?? "", maxSpeedKmh: mod.maxSpeedKmh ?? "",
                                      acceleration100: mod.acceleration100 ?? "", fuelTankL: mod.fuelTankL ?? "",
                                      ecoStandard: mod.ecoStandard ?? "", fuelCityL: mod.fuelCityL ?? "",
                                      fuelHighwayL: mod.fuelHighwayL ?? "", fuelMixedL: mod.fuelMixedL ?? "",
                                      rangeKm: mod.rangeKm ?? "", co2GKm: mod.co2GKm ?? "",
                                      frontBrakes: mod.frontBrakes ?? "", rearBrakes: mod.rearBrakes ?? "",
                                      frontSuspension: mod.frontSuspension ?? "", rearSuspension: mod.rearSuspension ?? "",
                                      doorsCount: mod.doorsCount ?? "", countryOfOrigin: mod.countryOfOrigin ?? "",
                                      vehicleClass: mod.vehicleClass ?? "", steeringPosition: mod.steeringPosition ?? "",
                                      safetyRating: mod.safetyRating ?? "", safetyRatingName: mod.safetyRatingName ?? "",
                                    })} className="p-1 rounded hover:bg-gray-100">
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

            <p className="text-xs font-bold uppercase tracking-widest text-[hsl(215,70%,22%)] pt-1 border-t border-border">Кузов</p>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Тип кузова" value={f("bodyType")} onChange={sf("bodyType")} placeholder="Седан" />
              <Field label="Количество мест" value={f("seats")} onChange={sf("seats")} placeholder="5" />
              <Field label="Количество дверей" value={f("doorsCount")} onChange={sf("doorsCount")} placeholder="4" />
              <Field label="Длина [мм]" value={f("lengthMm")} onChange={sf("lengthMm")} placeholder="4885" />
              <Field label="Ширина [мм]" value={f("widthMm")} onChange={sf("widthMm")} placeholder="1840" />
              <Field label="Высота [мм]" value={f("heightMm")} onChange={sf("heightMm")} placeholder="1455" />
              <Field label="Колёсная база [мм]" value={f("wheelbaseMm")} onChange={sf("wheelbaseMm")} placeholder="2825" />
              <Field label="Колея передняя [мм]" value={f("trackFrontMm")} onChange={sf("trackFrontMm")} placeholder="1570" />
              <Field label="Колея задняя [мм]" value={f("trackRearMm")} onChange={sf("trackRearMm")} placeholder="1580" />
              <Field label="Снаряженная масса [кг]" value={f("curbWeightKg")} onChange={sf("curbWeightKg")} placeholder="1545" />
              <Field label="Полная масса [кг]" value={f("grossWeightKg")} onChange={sf("grossWeightKg")} placeholder="1965" />
              <Field label="Размер колёс" value={f("wheelSize")} onChange={sf("wheelSize")} placeholder="235/45 R18" />
              <Field label="Размер дисков" value={f("diskSize")} onChange={sf("diskSize")} placeholder="7Jx18" />
              <Field label="Сверловка [мм]" value={f("boltPattern")} onChange={sf("boltPattern")} placeholder="5x114.3" />
              <Field label="Дорожный просвет [мм]" value={f("groundClearanceMm")} onChange={sf("groundClearanceMm")} placeholder="160" />
              <Field label="Клиренс [мм]" value={f("clearanceMm")} onChange={sf("clearanceMm")} placeholder="160" />
              <Field label="Объем багажника макс. [л]" value={f("trunkMaxL")} onChange={sf("trunkMaxL")} placeholder="490" />
              <Field label="Объем багажника мин. [л]" value={f("trunkMinL")} onChange={sf("trunkMinL")} placeholder="390" />
              <Field label="Ширина передней колеи [мм]" value={f("trackFrontWidthMm")} onChange={sf("trackFrontWidthMm")} placeholder="" />
              <Field label="Ширина задней колеи [мм]" value={f("trackRearWidthMm")} onChange={sf("trackRearWidthMm")} placeholder="" />
              <Field label="Грузоподъёмность [кг]" value={f("payloadKg")} onChange={sf("payloadKg")} placeholder="" />
              <Field label="Разреш. масса автопоезда [кг]" value={f("trainWeightKg")} onChange={sf("trainWeightKg")} placeholder="" />
              <Field label="Нагрузка на ось [кг]" value={f("axleLoadKg")} onChange={sf("axleLoadKg")} placeholder="" />
              <Field label="Погрузочная высота [мм]" value={f("loadingHeightMm")} onChange={sf("loadingHeightMm")} placeholder="" />
              <Field label="Объём груз. отсека [м3]" value={f("cargoVolumeM3")} onChange={sf("cargoVolumeM3")} placeholder="" />
            </div>
            <Field label="Грузовой отсек (Д x Ш x В) [мм]" value={f("cargoCompartmentDims")} onChange={sf("cargoCompartmentDims")} placeholder="" />

            <p className="text-xs font-bold uppercase tracking-widest text-[hsl(215,70%,22%)] pt-1 border-t border-border">Двигатель</p>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Тип двигателя" value={f("engineType")} onChange={sf("engineType")} placeholder="Бензин" />
              <Field label="Объем двигателя [см3]" value={f("engineVolumeCC")} onChange={sf("engineVolumeCC")} placeholder="2494" />
              <Field label="Мощность [л.с.]" value={f("power")} onChange={sf("power")} placeholder="181" />
              <Field label="Обороты макс. мощности [об/мин]" value={f("powerRpm")} onChange={sf("powerRpm")} placeholder="6000" />
              <Field label="Макс. крутящий момент [Н*м]" value={f("torqueNm")} onChange={sf("torqueNm")} placeholder="235" />
              <Field label="Обороты макс. момента [об/мин]" value={f("torqueRpm")} onChange={sf("torqueRpm")} placeholder="4200" />
              <Field label="Тип впуска" value={f("intakeType")} onChange={sf("intakeType")} placeholder="Атмосферный" />
              <Field label="Расположение цилиндров" value={f("cylinderLayout")} onChange={sf("cylinderLayout")} placeholder="Рядный" />
              <Field label="Количество цилиндров" value={f("cylinderCount")} onChange={sf("cylinderCount")} placeholder="4" />
              <Field label="Степень сжатия" value={f("compressionRatio")} onChange={sf("compressionRatio")} placeholder="10.4" />
              <Field label="Кол-во клапанов на цилиндр" value={f("valvesPerCylinder")} onChange={sf("valvesPerCylinder")} placeholder="4" />
              <Field label="Тип наддува" value={f("turboType")} onChange={sf("turboType")} placeholder="—" />
              <Field label="Диаметр цилиндра [мм]" value={f("boreMm")} onChange={sf("boreMm")} placeholder="87.5" />
              <Field label="Ход поршня [мм]" value={f("strokeMm")} onChange={sf("strokeMm")} placeholder="96.9" />
              <Field label="Модель двигателя" value={f("engineModel")} onChange={sf("engineModel")} placeholder="2AR-FE" />
              <Field label="Код двигателя" value={f("engineCode")} onChange={sf("engineCode")} placeholder="2AR-FE" />
              <Field label="Расположение двигателя" value={f("engineLocation")} onChange={sf("engineLocation")} placeholder="Спереди, поперечно" />
              <Field label="Макс. мощность [кВт]" value={f("powerKw")} onChange={sf("powerKw")} placeholder="133" />
              <Field label="Наличие интеркулера" value={f("intercooler")} onChange={sf("intercooler")} placeholder="Нет" />
              <Field label="ГРМ" value={f("timingSystem")} onChange={sf("timingSystem")} placeholder="Цепь" />
            </div>
            <Field label="Методика расчёта расхода" value={f("fuelConsumptionMethod")} onChange={sf("fuelConsumptionMethod")} placeholder="Комбинированный" />
            <Field label="Описание двигателя (итог)" value={f("engine")} onChange={sf("engine")} placeholder="2.5 бензин (181 л.с.)" />

            <p className="text-xs font-bold uppercase tracking-widest text-[hsl(215,70%,22%)] pt-1 border-t border-border">Трансмиссия</p>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Тип КПП" value={f("transmission")} onChange={sf("transmission")} placeholder="Автомат" />
              <Field label="Количество передач" value={f("gearCount")} onChange={sf("gearCount")} placeholder="6" />
              <Field label="Привод" value={f("driveType")} onChange={sf("driveType")} placeholder="Передний" />
              <Field label="Диаметр разворота [м]" value={f("turningDiameterM")} onChange={sf("turningDiameterM")} placeholder="11.4" />
            </div>

            <p className="text-xs font-bold uppercase tracking-widest text-[hsl(215,70%,22%)] pt-1 border-t border-border">Эксплуатация</p>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Марка топлива" value={f("fuelType")} onChange={sf("fuelType")} placeholder="АИ-95" />
              <Field label="Объём топливного бака [л]" value={f("fuelTankL")} onChange={sf("fuelTankL")} placeholder="70" />
              <Field label="Макс. скорость [км/ч]" value={f("maxSpeedKmh")} onChange={sf("maxSpeedKmh")} placeholder="210" />
              <Field label="Разгон 0-100 км/ч [сек]" value={f("acceleration100")} onChange={sf("acceleration100")} placeholder="8.2" />
              <Field label="Экологический стандарт" value={f("ecoStandard")} onChange={sf("ecoStandard")} placeholder="Евро-5" />
              <Field label="Расход город [л/100км]" value={f("fuelCityL")} onChange={sf("fuelCityL")} placeholder="9.8" />
              <Field label="Расход шоссе [л/100км]" value={f("fuelHighwayL")} onChange={sf("fuelHighwayL")} placeholder="6.2" />
              <Field label="Расход смеш. [л/100км]" value={f("fuelMixedL")} onChange={sf("fuelMixedL")} placeholder="7.5" />
              <Field label="Запас хода [км]" value={f("rangeKm")} onChange={sf("rangeKm")} placeholder="" />
              <Field label="Выбросы CO2 [г/км]" value={f("co2GKm")} onChange={sf("co2GKm")} placeholder="162" />
            </div>

            <p className="text-xs font-bold uppercase tracking-widest text-[hsl(215,70%,22%)] pt-1 border-t border-border">Тормоза и подвеска</p>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Передние тормоза" value={f("frontBrakes")} onChange={sf("frontBrakes")} placeholder="Дисковые вентилируемые" />
              <Field label="Задние тормоза" value={f("rearBrakes")} onChange={sf("rearBrakes")} placeholder="Дисковые" />
              <Field label="Передняя подвеска" value={f("frontSuspension")} onChange={sf("frontSuspension")} placeholder="Стойки МакФерсон" />
              <Field label="Задняя подвеска" value={f("rearSuspension")} onChange={sf("rearSuspension")} placeholder="Многорычажная" />
            </div>

            <p className="text-xs font-bold uppercase tracking-widest text-[hsl(215,70%,22%)] pt-1 border-t border-border">Прочее</p>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Страна марки" value={f("countryOfOrigin")} onChange={sf("countryOfOrigin")} placeholder="Япония" />
              <Field label="Класс автомобиля" value={f("vehicleClass")} onChange={sf("vehicleClass")} placeholder="E" />
              <Field label="Расположение руля" value={f("steeringPosition")} onChange={sf("steeringPosition")} placeholder="Левый" />
              <Field label="Оценка безопасности" value={f("safetyRating")} onChange={sf("safetyRating")} placeholder="5" />
              <Field label="Название рейтинга" value={f("safetyRatingName")} onChange={sf("safetyRatingName")} placeholder="Euro NCAP" />
            </div>
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

// ─── Works tab ────────────────────────────────────────────────────────────────

const WorksTab = () => {
  const { worksDatabase, setWorksDatabase } = useAppData();
  const [modal, setModal] = useState<null | { type: "add" | "edit"; idx?: number }>(null);
  const [name, setName] = useState("");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() =>
    worksDatabase.filter((w) => w.name.toLowerCase().includes(search.toLowerCase())),
    [worksDatabase, search]
  );

  const openAdd = () => { setName(""); setModal({ type: "add" }); };
  const openEdit = (idx: number) => { setName(worksDatabase[idx].name); setModal({ type: "edit", idx }); };

  const save = () => {
    if (!name.trim()) return;
    const db = [...worksDatabase];
    if (modal?.type === "add") {
      if (db.find((w) => w.name.toLowerCase() === name.trim().toLowerCase())) return;
      db.push({ id: `work-manual-${Date.now()}`, name: name.trim() });
    } else if (modal?.type === "edit" && modal.idx !== undefined) {
      db[modal.idx] = { ...db[modal.idx], name: name.trim() };
    }
    setWorksDatabase(db);
    setModal(null);
  };

  const remove = (idx: number) => {
    if (!confirm(`Удалить работу «${worksDatabase[idx].name}»?`)) return;
    setWorksDatabase(worksDatabase.filter((_, i) => i !== idx));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Icon name="Search" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Поиск по названию..."
            className="w-full border border-border rounded pl-8 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(215,70%,22%)]" />
        </div>
        <button onClick={openAdd}
          className="flex items-center gap-1.5 px-3 py-2 bg-[hsl(215,70%,22%)] text-white rounded text-xs font-semibold hover:bg-[hsl(215,70%,18%)] transition-all shrink-0">
          <Icon name="Plus" size={13} />Добавить работу
        </button>
      </div>

      <p className="text-xs text-muted-foreground">Всего: {worksDatabase.length} работ{search ? `, найдено: ${filtered.length}` : ""}</p>

      {worksDatabase.length === 0 && (
        <div className="py-10 text-center text-muted-foreground text-sm border border-dashed border-border rounded-lg">
          Список работ пуст. Загрузите через «Загрузка баз» или добавьте вручную.
        </div>
      )}

      <div className="border border-border rounded-lg divide-y divide-border overflow-hidden">
        {filtered.map((work, i) => {
          const realIdx = worksDatabase.indexOf(work);
          return (
            <div key={work.id} className="flex items-center justify-between px-4 py-2.5 hover:bg-gray-50 group">
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground w-6 text-right">{realIdx + 1}</span>
                <span className="text-sm text-foreground">{work.name}</span>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => openEdit(realIdx)} className="p-1.5 rounded hover:bg-gray-100 transition-colors">
                  <Icon name="Pencil" size={13} className="text-[hsl(215,70%,22%)]" />
                </button>
                <button onClick={() => remove(realIdx)} className="p-1.5 rounded hover:bg-red-50 transition-colors">
                  <Icon name="Trash2" size={13} className="text-red-400" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {modal && (
        <Modal title={modal.type === "add" ? "Добавить работу" : "Редактировать работу"} onClose={() => setModal(null)}>
          <Field label="Название работы" value={name} onChange={setName} placeholder="Замена масла двигателя" />
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setModal(null)} className="px-4 py-2 border border-border rounded text-sm text-muted-foreground hover:bg-gray-50 transition-all">Отмена</button>
            <button onClick={save} className="px-5 py-2 bg-[hsl(215,70%,22%)] text-white rounded text-sm font-semibold hover:bg-[hsl(215,70%,18%)] transition-all">Сохранить</button>
          </div>
        </Modal>
      )}
    </div>
  );
};

// ─── Norms tab ────────────────────────────────────────────────────────────────

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

// ─── Main export ─────────────────────────────────────────────────────────────

const DbEditor = () => {
  const [tab, setTab] = useState<EditorTab>("cars");

  const tabs: { id: EditorTab; label: string; icon: string }[] = [
    { id: "cars", label: "Автомобили", icon: "Car" },
    { id: "works", label: "Виды работ", icon: "Wrench" },
    { id: "norms", label: "Нормативы", icon: "Clock" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex gap-0 border-b border-border">
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-all ${
              tab === t.id ? "border-[hsl(25,95%,50%)] text-[hsl(215,70%,22%)]" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}>
            <Icon name={t.icon} size={15} />
            {t.label}
          </button>
        ))}
      </div>

      {tab === "cars" && <CarsTab />}
      {tab === "works" && <WorksTab />}
      {tab === "norms" && <NormsTab />}
    </div>
  );
};

export default DbEditor;