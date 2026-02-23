import { useState, useRef } from "react";
import Icon from "@/components/ui/icon";
import { useAppData, WorkEntry } from "@/pages/Index";
import { CarBrand, Work } from "@/data/carDatabase";
import { reapplyWorks } from "@/components/admin/adminHelpers";
import * as XLSX from "xlsx";
import TabDashboard from "@/components/admin/TabDashboard";
import TabBranches from "@/components/admin/TabBranches";
import TabUsers from "@/components/admin/TabUsers";
import TabEditor from "@/components/admin/TabEditor";
import TabLinks from "@/components/admin/TabLinks";

type AdminTab = "dashboard" | "branches" | "users" | "editor" | "links" | "database";

const ADMIN_TABS: { id: AdminTab; label: string; icon: string }[] = [
  { id: "dashboard", label: "Главная", icon: "LayoutDashboard" },
  { id: "branches", label: "Филиалы", icon: "Building2" },
  { id: "users", label: "Пользователи", icon: "Users" },
  { id: "editor", label: "Консоль редактирования", icon: "TerminalSquare" },
  { id: "links", label: "Связи работ", icon: "Link" },
  { id: "database", label: "Базы данных", icon: "Database" },
];

interface Props {
  ratePerHour: number;
  onRateChange: (rate: number) => void;
}

// ─── Excel helpers ──────────────────────────────────────────────────────────

function downloadCarsTemplate() {
  const headers = ["Марка", "Модель", "Поколение", "Годы от", "Годы до", "Серия", "Модификация", "Двигатель", "КПП", "Мощность"];
  const example = [
    ["Toyota", "Camry", "VII (V70)", "2017", "н.в.", "SE", "2.5 AT", "2.5 бензин (181 л.с.)", "Автомат", "181 л.с."],
    ["Toyota", "Camry", "VII (V70)", "2017", "н.в.", "SE", "3.5 AT", "3.5 бензин (249 л.с.)", "Автомат", "249 л.с."],
    ["Toyota", "Camry", "VI (V50)", "2011", "2017", "Classic", "2.5 AT", "2.5 бензин (181 л.с.)", "Автомат", "181 л.с."],
    ["BMW", "3 Series", "G20", "2018", "н.в.", "", "320i AT", "2.0 бензин (184 л.с.)", "Автомат", "184 л.с."],
    ["BMW", "3 Series", "G20", "2018", "н.в.", "", "320d AT", "2.0 дизель (190 л.с.)", "Автомат", "190 л.с."],
  ];
  const ws = XLSX.utils.aoa_to_sheet([headers, ...example]);
  ws["!cols"] = [12, 12, 14, 10, 10, 12, 14, 22, 12, 12].map((w) => ({ wch: w }));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "База авто");
  XLSX.writeFile(wb, "шаблон_база_авто.xlsx");
}

function downloadWorksTemplate() {
  const headers = ["Наименование работы"];
  const example = [
    ["Замена масла двигателя"], ["Замена тормозных колодок передних"], ["Замена тормозных колодок задних"],
    ["Замена воздушного фильтра"], ["Замена салонного фильтра"], ["Замена свечей зажигания"],
    ["Замена ремня / цепи ГРМ"], ["Замена амортизаторов передних"], ["Замена рычага подвески"], ["Замена сцепления"],
  ];
  const ws = XLSX.utils.aoa_to_sheet([headers, ...example]);
  ws["!cols"] = [{ wch: 40 }];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Список работ");
  XLSX.writeFile(wb, "шаблон_список_работ.xlsx");
}

function mergeCars(existing: CarBrand[], incoming: CarBrand[]): CarBrand[] {
  const result: CarBrand[] = [...existing];
  incoming.forEach((inBrand) => {
    const brand = result.find((b) => b.id === inBrand.id);
    if (!brand) { result.push({ ...inBrand }); return; }
    inBrand.models.forEach((inModel) => {
      const model = brand.models.find((m) => m.id === inModel.id);
      if (!model) { brand.models.push({ ...inModel }); return; }
      inModel.generations.forEach((inGen) => {
        const gen = model.generations.find((g) => g.id === inGen.id);
        if (!gen) { model.generations.push({ ...inGen }); return; }
        inGen.modifications.forEach((inMod) => {
          if (!gen.modifications.find((m) => m.id === inMod.id)) gen.modifications.push({ ...inMod });
        });
      });
    });
  });
  return result;
}

function mergeWorks(existing: WorkEntry[], incoming: WorkEntry[]): WorkEntry[] {
  const names = new Set(existing.map((w) => w.name.toLowerCase()));
  return [...existing, ...incoming.filter((w) => !names.has(w.name.toLowerCase()))];
}

function parseCarBase(rows: Record<string, unknown>[]): CarBrand[] | null {
  if (rows.length === 0) return null;
  const keys = Object.keys(rows[0]);
  if (keys.length < 7) return null;
  const get = (row: Record<string, unknown>, i: number) => String(row[keys[i]] ?? "").trim();
  const brandsMap = new Map<string, CarBrand>();
  rows.forEach((row) => {
    const brandName = get(row, 0), modelName = get(row, 1), genName = get(row, 2);
    const yearsFrom = get(row, 3), yearsTo = get(row, 4), series = get(row, 5);
    const modName = get(row, 6), engine = get(row, 7) || "", transmission = get(row, 8) || "—", power = get(row, 9) || "—";
    if (!brandName || !modelName || !modName) return;
    const years = yearsTo ? `${yearsFrom} — ${yearsTo}` : yearsFrom;
    const genLabel = series ? `${genName} ${series}`.trim() : genName;
    const brandId = brandName.toLowerCase().replace(/\s+/g, "-");
    const modelId = `${brandId}__${modelName.toLowerCase().replace(/\s+/g, "-")}`;
    const genId = `${modelId}__${genLabel.toLowerCase().replace(/[\s()]/g, "-")}`;
    const modId = `${genId}__${modName.toLowerCase().replace(/\s+/g, "-")}`;
    if (!brandsMap.has(brandId)) brandsMap.set(brandId, { id: brandId, name: brandName, models: [] });
    const brand = brandsMap.get(brandId)!;
    let model = brand.models.find((m) => m.id === modelId);
    if (!model) { model = { id: modelId, name: modelName, generations: [] }; brand.models.push(model); }
    let gen = model.generations.find((g) => g.id === genId);
    if (!gen) { gen = { id: genId, name: genLabel || modName, years, modifications: [] }; model.generations.push(gen); }
    if (!gen.modifications.find((m) => m.id === modId)) gen.modifications.push({ id: modId, name: modName, engine, transmission, power, works: [] });
  });
  return Array.from(brandsMap.values());
}

function parseWorksList(rows: Record<string, unknown>[]): WorkEntry[] | null {
  if (rows.length === 0) return null;
  const keys = Object.keys(rows[0]);
  const works = rows.map((row, i) => ({ id: `work-${i}`, name: String(row[keys[0]] ?? "").trim() })).filter((w) => w.name.length > 0);
  return works.length > 0 ? works : null;
}

function generateNormsTemplate(cars: CarBrand[], works: WorkEntry[]): void {
  const headers = ["Марка", "Модель", "Поколение", "Годы", "Модификация", "Двигатель", "КПП", "Мощность", "Работа", "Нормачасы"];
  const rows: (string | number)[][] = [];
  cars.forEach((brand) => {
    brand.models.forEach((model) => {
      model.generations.forEach((gen) => {
        gen.modifications.forEach((mod, mIdx) => {
          works.forEach((work, wIdx) => {
            rows.push([
              mIdx === 0 && wIdx === 0 ? brand.name : "",
              mIdx === 0 && wIdx === 0 ? model.name : "",
              wIdx === 0 ? gen.name : "",
              wIdx === 0 ? gen.years : "",
              wIdx === 0 ? mod.name : "",
              wIdx === 0 ? mod.engine : "",
              wIdx === 0 ? mod.transmission : "",
              wIdx === 0 ? mod.power : "",
              work.name,
              "",
            ]);
          });
        });
      });
    });
  });
  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  ws["!cols"] = [14, 14, 14, 14, 16, 22, 14, 12, 36, 12].map((w) => ({ wch: w }));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Нормачасы");
  XLSX.writeFile(wb, "шаблон_нормачасов_заполнить.xlsx");
}

function parseFilledTemplate(rows: Record<string, unknown>[], cars: CarBrand[]): { updatedCars: CarBrand[]; totalFilled: number } {
  const keys = Object.keys(rows[0] ?? {});
  if (keys.length < 10) return { updatedCars: cars, totalFilled: 0 };
  const get = (row: Record<string, unknown>, i: number) => String(row[keys[i]] ?? "").trim();
  interface WA { modId: string; works: Work[] }
  const modMap = new Map<string, WA>();
  let curBrand = "", curModel = "", curGen = "", curMod = "", curEngine = "", curTrans = "", curPower = "";
  rows.forEach((row, i) => {
    const brandName = get(row, 0) || curBrand, modelName = get(row, 1) || curModel;
    const genName = get(row, 2) || curGen, modName = get(row, 4) || curMod;
    const engine = get(row, 5) || curEngine, transmission = get(row, 6) || curTrans, power = get(row, 7) || curPower;
    const workName = get(row, 8), hours = parseFloat(get(row, 9).replace(",", "."));
    curBrand = brandName; curModel = modelName; curGen = genName; curMod = modName;
    curEngine = engine; curTrans = transmission; curPower = power;
    if (!brandName || !modelName || !modName || !workName || isNaN(hours) || hours <= 0) return;
    const brandId = brandName.toLowerCase().replace(/\s+/g, "-");
    const modelId = `${brandId}__${modelName.toLowerCase().replace(/\s+/g, "-")}`;
    const genId = `${modelId}__${genName.toLowerCase().replace(/[\s()]/g, "-")}`;
    const modId = `${genId}__${modName.toLowerCase().replace(/\s+/g, "-")}`;
    if (!modMap.has(modId)) modMap.set(modId, { modId, works: [] });
    modMap.get(modId)!.works.push({ id: `w-${modId}-${i}`, name: workName, hours });
  });
  let totalFilled = 0;
  const updatedCars = cars.map((b) => ({
    ...b,
    models: b.models.map((m) => ({
      ...m,
      generations: m.generations.map((g) => ({
        ...g,
        modifications: g.modifications.map((mod) => {
          const entry = modMap.get(mod.id);
          if (entry && entry.works.length > 0) { totalFilled += entry.works.length; return { ...mod, works: entry.works }; }
          return mod;
        }),
      })),
    })),
  }));
  return { updatedCars, totalFilled };
}

// ─── UploadBlock ─────────────────────────────────────────────────────────────

const UploadBlock = ({ title, description, buttonLabel, accept, onFile, onUpdate, onDownloadTemplate, status, disabled, hasData, children }: {
  title: string; description: string; buttonLabel: string; accept: string;
  onFile: (file: File) => void; onUpdate?: (file: File) => void;
  onDownloadTemplate: () => void;
  status: { type: "success" | "error"; msg: string } | null;
  disabled?: boolean; hasData?: boolean; children?: React.ReactNode;
}) => {
  const refLoad = useRef<HTMLInputElement>(null);
  const refUpdate = useRef<HTMLInputElement>(null);
  return (
    <div className={`border rounded-lg p-5 transition-colors ${disabled ? "opacity-50 pointer-events-none bg-gray-50" : "bg-white border-border"}`}>
      <div className="flex items-start justify-between mb-1 gap-3">
        <p className="font-semibold text-sm text-foreground">{title}</p>
        <button onClick={onDownloadTemplate}
          className="flex items-center gap-1.5 px-3 py-1.5 border border-[hsl(215,70%,22%)] text-[hsl(215,70%,22%)] rounded text-xs font-semibold hover:bg-blue-50 transition-all shrink-0">
          <Icon name="Download" size={13} />Скачать шаблон
        </button>
      </div>
      <p className="text-xs text-muted-foreground mb-4">{description}</p>
      {children}
      {status && (
        <div className={`flex items-start gap-2 p-3 rounded-lg border mb-3 text-xs animate-fade-in ${status.type === "success" ? "bg-green-50 border-green-200 text-green-700" : "bg-red-50 border-red-200 text-red-700"}`}>
          <Icon name={status.type === "success" ? "CheckCircle" : "XCircle"} size={14} className="shrink-0 mt-0.5" />
          {status.msg}
        </div>
      )}
      <div className="flex flex-wrap gap-2">
        <input ref={refLoad} type="file" accept={accept} className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); e.target.value = ""; }} />
        <button onClick={() => refLoad.current?.click()}
          className="flex items-center gap-2 px-4 py-2 bg-[hsl(215,70%,22%)] text-white rounded text-sm font-semibold hover:bg-[hsl(215,70%,18%)] transition-all shadow-sm">
          <Icon name="Upload" size={14} />{buttonLabel}
        </button>
        {onUpdate && hasData && (
          <>
            <input ref={refUpdate} type="file" accept={accept} className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) onUpdate(f); e.target.value = ""; }} />
            <button onClick={() => refUpdate.current?.click()}
              className="flex items-center gap-2 px-4 py-2 border border-[hsl(215,70%,22%)] text-[hsl(215,70%,22%)] rounded text-sm font-semibold hover:bg-blue-50 transition-all">
              <Icon name="RefreshCw" size={14} />Добавить / обновить
            </button>
          </>
        )}
      </div>
    </div>
  );
};

// ─── StepBadge ───────────────────────────────────────────────────────────────

const StepBadge = ({ n, active, done, label }: { n: number; active: boolean; done: boolean; label: string }) => (
  <div className="flex items-center gap-2">
    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${done ? "bg-green-500 text-white" : active ? "bg-[hsl(215,70%,22%)] text-white" : "bg-gray-200 text-gray-500"}`}>
      {done ? <Icon name="Check" size={14} /> : n}
    </div>
    <span className={`text-sm font-medium ${active ? "text-foreground" : done ? "text-green-700" : "text-muted-foreground"}`}>{label}</span>
  </div>
);

// ─── Main ─────────────────────────────────────────────────────────────────────

const AdminPage = ({ ratePerHour, onRateChange }: Props) => {
  const { carDatabase, setCarDatabase, worksDatabase, setWorksDatabase } = useAppData();
  const [activeTab, setActiveTab] = useState<AdminTab>("dashboard");

  // Rate
  const [inputValue, setInputValue] = useState(ratePerHour.toString());
  const [rateSaved, setRateSaved] = useState(false);
  const [rateError, setRateError] = useState("");

  // DB wizard
  const [carsStatus, setCarsStatus] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [worksStatus, setWorksStatus] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [filledStatus, setFilledStatus] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [pendingCars, setPendingCars] = useState<CarBrand[] | null>(null);
  const [pendingWorks, setPendingWorks] = useState<WorkEntry[] | null>(() => worksDatabase.length > 0 ? worksDatabase : null);
  const [dbReady, setDbReady] = useState(false);
  const filledFileRef = useRef<HTMLInputElement>(null);

  const handleSaveRate = () => {
    const val = parseFloat(inputValue);
    if (isNaN(val) || val <= 0) { setRateError("Введите корректное число больше 0"); return; }
    if (val > 50000) { setRateError("Ставка не может превышать 50 000 ₽"); return; }
    setRateError(""); onRateChange(val); setRateSaved(true);
    setTimeout(() => setRateSaved(false), 3000);
  };

  const parseCarsFile = (file: File, onResult: (cars: CarBrand[]) => void, onError: (m: string) => void) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = new Uint8Array(ev.target!.result as ArrayBuffer);
        const wb = XLSX.read(data, { type: "array" });
        const rows: Record<string, unknown>[] = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { defval: "" });
        const cars = parseCarBase(rows);
        if (!cars || cars.length === 0) onError("Не удалось распознать автомобили. Скачайте шаблон и проверьте формат.");
        else onResult(cars);
      } catch { onError("Ошибка чтения файла."); }
    };
    reader.readAsArrayBuffer(file);
  };

  const parseWorksFile = (file: File, onResult: (w: WorkEntry[]) => void, onError: (m: string) => void) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = new Uint8Array(ev.target!.result as ArrayBuffer);
        const wb = XLSX.read(data, { type: "array" });
        const rows: Record<string, unknown>[] = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { defval: "" });
        const works = parseWorksList(rows);
        if (!works) onError("Файл пустой или не содержит работ.");
        else onResult(works);
      } catch { onError("Ошибка чтения файла."); }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleCarsFile = (file: File) => parseCarsFile(file, (cars) => {
    const withWorks = reapplyWorks(cars, pendingCars ?? carDatabase);
    const total = withWorks.reduce((s, b) => s + b.models.reduce((s2, m) => s2 + m.generations.reduce((s3, g) => s3 + g.modifications.length, 0), 0), 0);
    const restored = withWorks.reduce((s, b) => s + b.models.reduce((s2, m) => s2 + m.generations.reduce((s3, g) => s3 + g.modifications.reduce((s4, mod) => s4 + (mod.works.length > 0 ? 1 : 0), 0), 0), 0), 0);
    setPendingCars(withWorks);
    if (worksDatabase.length > 0) setPendingWorks(worksDatabase);
    setCarsStatus({ type: "success", msg: `Загружено: ${cars.length} марок, ${total} модификаций из «${file.name}»${restored > 0 ? `. Восстановлены нормативы для ${restored} модификаций.` : ""}` });
  }, (msg) => setCarsStatus({ type: "error", msg }));

  const handleCarsUpdate = (file: File) => parseCarsFile(file, (incoming) => {
    const base = pendingCars ?? carDatabase;
    const merged = mergeCars(base, incoming);
    const withWorks = reapplyWorks(merged, base);
    setPendingCars(withWorks);
    if (worksDatabase.length > 0) setPendingWorks(worksDatabase);
    setCarsStatus({ type: "success", msg: `Обновлено. Нормативы существующих моделей сохранены.` });
  }, (msg) => setCarsStatus({ type: "error", msg }));

  const handleWorksFile = (file: File) => parseWorksFile(file, (works) => {
    setPendingWorks(works); setWorksDatabase(works); setWorksStatus({ type: "success", msg: `Загружено ${works.length} видов работ из «${file.name}»` });
  }, (msg) => setWorksStatus({ type: "error", msg }));

  const handleWorksUpdate = (file: File) => parseWorksFile(file, (incoming) => {
    const merged = mergeWorks(pendingWorks ?? worksDatabase, incoming);
    const added = merged.length - (pendingWorks ?? worksDatabase).length;
    setPendingWorks(merged); setWorksDatabase(merged);
    setWorksStatus({ type: "success", msg: `Добавлено ${added} новых работ, итого ${merged.length}.` });
  }, (msg) => setWorksStatus({ type: "error", msg }));

  const handleFilledFile = (file: File) => {
    const cars = pendingCars ?? carDatabase;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = new Uint8Array(ev.target!.result as ArrayBuffer);
        const wb = XLSX.read(data, { type: "array" });
        const rows: Record<string, unknown>[] = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { defval: "" });
        if (rows.length === 0) { setFilledStatus({ type: "error", msg: "Файл пустой." }); return; }
        const { updatedCars, totalFilled } = parseFilledTemplate(rows, cars);
        if (totalFilled === 0) {
          setFilledStatus({ type: "error", msg: "Нормачасы не найдены. Убедитесь что столбец J заполнен числами." });
        } else {
          setCarDatabase(updatedCars); if (pendingCars) setPendingCars(updatedCars);
          setDbReady(true); setFilledStatus({ type: "success", msg: `База знаний готова! Заполнено ${totalFilled} нормативов из «${file.name}»` });
        }
      } catch { setFilledStatus({ type: "error", msg: "Ошибка чтения файла." }); }
    };
    reader.readAsArrayBuffer(file);
  };

  const totalWorks = carDatabase.reduce((s, b) => s + b.models.reduce((s2, m) => s2 + m.generations.reduce((s3, g) => s3 + g.modifications.reduce((s4, mod) => s4 + mod.works.length, 0), 0), 0), 0);
  const hasCars = carDatabase.length > 0;
  const hasWorks = worksDatabase.length > 0;
  const step1Done = !!pendingCars || hasCars;
  const step2Done = !!pendingWorks || hasWorks;
  const step3Done = dbReady || (hasCars && hasWorks && totalWorks > 0);
  const templateReady = step1Done && step2Done;

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-montserrat font-bold text-2xl text-foreground">Панель администратора</h2>
        <p className="text-muted-foreground text-sm mt-1">Управление системой Remtech</p>
      </div>

      {/* Tab bar */}
      <div className="bg-white rounded-lg border border-border shadow-sm overflow-hidden">
        <div className="flex overflow-x-auto border-b border-border">
          {ADMIN_TABS.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium whitespace-nowrap border-b-2 transition-all duration-200 shrink-0 ${
                activeTab === tab.id
                  ? "border-[hsl(25,95%,50%)] text-[hsl(215,70%,22%)] bg-orange-50"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:bg-gray-50"
              }`}>
              <Icon name={tab.icon} size={16} />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {/* ── Главная ── */}
          {activeTab === "dashboard" && (
            <TabDashboard
              ratePerHour={ratePerHour} onRateChange={onRateChange}
              inputValue={inputValue} setInputValue={(v) => { setInputValue(v); setRateSaved(false); setRateError(""); }}
              rateSaved={rateSaved} rateError={rateError} onSave={handleSaveRate}
            />
          )}

          {/* ── Филиалы ── */}
          {activeTab === "branches" && <TabBranches />}

          {/* ── Пользователи ── */}
          {activeTab === "users" && <TabUsers />}

          {/* ── Консоль редактирования ── */}
          {activeTab === "editor" && <TabEditor />}

          {/* ── Связи работ ── */}
          {activeTab === "links" && <TabLinks />}

          {/* ── Базы данных ── */}
          {activeTab === "database" && (
            <div className="space-y-6">
              {/* Step indicators */}
              <div className="flex flex-wrap gap-4 items-center">
                <StepBadge n={1} active={!step1Done} done={step1Done} label="База автомобилей" />
                <Icon name="ChevronRight" size={16} className="text-muted-foreground hidden sm:block" />
                <StepBadge n={2} active={step1Done && !step2Done} done={step2Done} label="Список работ" />
                <Icon name="ChevronRight" size={16} className="text-muted-foreground hidden sm:block" />
                <StepBadge n={3} active={step2Done && !step3Done} done={step3Done} label="Нормативы" />
              </div>

              <div className="border-t border-border pt-5 space-y-4">
                {/* Step 1 */}
                <UploadBlock title="Шаг 1 — Загрузите базу автомобилей"
                  description="Файл должен содержать колонки с точными названиями. Ключевые колонки для фильтров показаны ниже."
                  buttonLabel="Загрузить базу авто (.xlsx)" accept=".xlsx,.xls"
                  onFile={handleCarsFile} onUpdate={handleCarsUpdate} hasData={hasCars}
                  onDownloadTemplate={downloadCarsTemplate} status={carsStatus}>
                  <div className="overflow-x-auto rounded border border-border mb-4">
                    <table className="text-xs w-full border-collapse">
                      <thead>
                        <tr className="bg-[hsl(215,70%,22%)] text-white">
                          {["Марка","Модель","Поколение","Год от (Поколение)","Год до (Поколение)","Серия","Модификация","…","Тип двигателя","Мощность двигателя [л.с.]","…","Код двигателя","…","Тип КПП","Кол-во передач","Привод"].map((h) => (
                            <th key={h} className={`px-2 py-1.5 text-center whitespace-nowrap border-r border-blue-800 last:border-0 ${h === "…" ? "text-blue-300" : ""}`}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          ["Toyota","Camry","VII (V70)","2017","н.в.","SE","2.5 AT","…","Бензин","181","…","2AR-FE","…","Автомат","6","Передний"],
                          ["Toyota","Camry","VII (V70)","2017","н.в.","SE","3.5 AT","…","Бензин","249","…","2GR-FE","…","Автомат","6","Передний"],
                          ["BMW","3 Series","G20","2018","н.в.","","320d AT","…","Дизель","190","…","B47D20","…","Автомат","8","Задний"],
                        ].map((row, i) => (
                          <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                            {row.map((c, j) => <td key={j} className={`px-2 py-1.5 border-r border-b border-border text-center last:border-r-0 ${c === "…" ? "text-gray-300" : "text-gray-600"}`}>{c}</td>)}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </UploadBlock>

                {/* Step 2 */}
                <UploadBlock title="Шаг 2 — Загрузите список работ"
                  description="Один столбец — все виды работ. Нормачасы проставляются на шаге 3 или через «Консоль редактирования»."
                  buttonLabel="Загрузить список работ (.xlsx)" accept=".xlsx,.xls"
                  onFile={handleWorksFile} onUpdate={handleWorksUpdate} hasData={hasWorks}
                  onDownloadTemplate={downloadWorksTemplate} status={worksStatus}
                  disabled={!step1Done && !hasCars}>
                  {hasWorks && step1Done && (
                    <div className="mb-3 flex items-start gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-xs text-green-700">
                      <Icon name="CheckCircle" size={14} className="shrink-0 mt-0.5" />
                      <span>Ранее загруженные <strong>{worksDatabase.length} работ</strong> автоматически привязаны. Этот шаг можно пропустить.</span>
                    </div>
                  )}
                  <div className="overflow-x-auto rounded border border-border mb-4 max-w-xs">
                    <table className="text-xs w-full border-collapse">
                      <thead><tr className="bg-[hsl(215,70%,22%)] text-white"><th className="px-3 py-1.5 text-left">Наименование работы</th></tr></thead>
                      <tbody>
                        {["Замена масла двигателя","Замена тормозных колодок передних","Замена воздушного фильтра","Замена свечей","Замена ремня ГРМ"].map((w, i) => (
                          <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                            <td className="px-3 py-1.5 border-b border-border text-gray-600">{w}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </UploadBlock>

                {/* Step 3 */}
                <div className={`border rounded-lg p-5 space-y-4 ${!templateReady ? "opacity-50 pointer-events-none bg-gray-50" : "bg-white border-border"}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-sm">Шаг 3 — Скачайте шаблон, заполните нормачасы и загрузите обратно</p>
                      <p className="text-xs text-muted-foreground mt-1">Каждая строка = автомобиль × работа. Заполните столбец <strong>J «Нормачасы»</strong>.</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <Icon name="FileSpreadsheet" size={20} className="text-[hsl(215,70%,22%)] shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold">Шаблон нормативов</p>
                      <p className="text-xs text-muted-foreground">
                        {pendingCars && pendingWorks ? `${pendingCars.length} марок × ${pendingWorks.length} работ` : "Загрузите шаги 1 и 2"}
                      </p>
                    </div>
                    <button onClick={() => generateNormsTemplate(pendingCars ?? carDatabase, pendingWorks ?? worksDatabase)} disabled={!templateReady}
                      className="flex items-center gap-2 px-4 py-2 bg-[hsl(215,70%,22%)] text-white rounded text-sm font-semibold hover:bg-[hsl(215,70%,18%)] transition-all disabled:opacity-50 shrink-0">
                      <Icon name="Download" size={15} />Скачать шаблон
                    </button>
                  </div>
                  {filledStatus && (
                    <div className={`flex items-start gap-2 p-3 rounded-lg border text-xs animate-fade-in ${filledStatus.type === "success" ? "bg-green-50 border-green-200 text-green-700" : "bg-red-50 border-red-200 text-red-700"}`}>
                      <Icon name={filledStatus.type === "success" ? "CheckCircle" : "XCircle"} size={14} className="shrink-0 mt-0.5" />
                      {filledStatus.msg}
                    </div>
                  )}
                  <input ref={filledFileRef} type="file" accept=".xlsx,.xls" className="hidden"
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFilledFile(f); e.target.value = ""; }} />
                  <button onClick={() => filledFileRef.current?.click()} disabled={!templateReady}
                    className="flex items-center gap-2 px-4 py-2 border border-[hsl(215,70%,22%)] text-[hsl(215,70%,22%)] rounded text-sm font-semibold hover:bg-blue-50 transition-all disabled:opacity-50">
                    <Icon name="Upload" size={14} />Загрузить заполненный шаблон
                  </button>
                </div>

                {step3Done && (
                  <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-300 rounded-lg animate-fade-in">
                    <Icon name="CheckCircle" size={22} className="text-green-600 shrink-0" />
                    <div>
                      <p className="font-semibold text-green-800 text-sm">База знаний загружена и готова к работе!</p>
                      <p className="text-xs text-green-700 mt-0.5">Перейдите в «Калькулятор» или используйте «Консоль редактирования» для точечных правок.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPage;