import { useState, useRef } from "react";
import Icon from "@/components/ui/icon";
import { useAppData, WorkEntry } from "@/pages/Index";
import { CarBrand, Work } from "@/data/carDatabase";
import * as XLSX from "xlsx";

const ACCESS_CODE = "0170";

interface Props {
  ratePerHour: number;
  onRateChange: (rate: number) => void;
}

// ─── helpers ───────────────────────────────────────────────────────────────

function parseCarBase(rows: Record<string, unknown>[]): CarBrand[] | null {
  if (rows.length === 0) return null;
  const keys = Object.keys(rows[0]);
  if (keys.length < 5) return null;
  const get = (row: Record<string, unknown>, i: number) =>
    String(row[keys[i]] ?? "").trim();

  const brandsMap = new Map<string, CarBrand>();
  rows.forEach((row) => {
    const brandName = get(row, 0);
    const modelName = get(row, 1);
    const genName = get(row, 2);
    const years = get(row, 3);
    const modName = get(row, 4);
    const engine = get(row, 5) || modName;
    const transmission = get(row, 6) || "—";
    const power = get(row, 7) || "—";
    if (!brandName || !modelName || !modName) return;

    const brandId = brandName.toLowerCase().replace(/\s+/g, "-");
    const modelId = `${brandId}__${modelName.toLowerCase().replace(/\s+/g, "-")}`;
    const genId = `${modelId}__${genName.toLowerCase().replace(/\s+/g, "-")}`;
    const modId = `${genId}__${modName.toLowerCase().replace(/\s+/g, "-")}`;

    if (!brandsMap.has(brandId)) brandsMap.set(brandId, { id: brandId, name: brandName, models: [] });
    const brand = brandsMap.get(brandId)!;

    let model = brand.models.find((m) => m.id === modelId);
    if (!model) { model = { id: modelId, name: modelName, generations: [] }; brand.models.push(model); }

    let gen = model.generations.find((g) => g.id === genId);
    if (!gen) { gen = { id: genId, name: genName || modName, years, modifications: [] }; model.generations.push(gen); }

    if (!gen.modifications.find((m) => m.id === modId)) {
      gen.modifications.push({ id: modId, name: modName, engine, transmission, power, works: [] });
    }
  });
  return Array.from(brandsMap.values());
}

function parseWorksList(rows: Record<string, unknown>[]): WorkEntry[] | null {
  if (rows.length === 0) return null;
  const keys = Object.keys(rows[0]);
  const works: WorkEntry[] = rows
    .map((row, i) => ({ id: `work-${i}`, name: String(row[keys[0]] ?? "").trim() }))
    .filter((w) => w.name.length > 0);
  return works.length > 0 ? works : null;
}

// Генерирует шаблон: строка на каждую пару (модификация × работа), нормачасы пустые
function generateTemplate(cars: CarBrand[], works: WorkEntry[]): void {
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
              "", // нормачасы — заполняет пользователь
            ]);
          });
        });
      });
    });
  });

  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  ws["!cols"] = [14, 14, 14, 14, 16, 22, 14, 12, 36, 12].map((w) => ({ wch: w }));

  // Подсвечиваем столбец Нормачасы (J) жёлтым
  rows.forEach((_, i) => {
    const cell = `J${i + 2}`;
    if (!ws[cell]) ws[cell] = { t: "s", v: "" };
  });

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Нормачасы");
  XLSX.writeFile(wb, "шаблон_нормачасов_заполнить.xlsx");
}

// Парсит заполненный шаблон → обновляет works[] у каждой модификации
function parseFilledTemplate(
  rows: Record<string, unknown>[],
  cars: CarBrand[]
): { updatedCars: CarBrand[]; totalFilled: number } {
  const keys = Object.keys(rows[0] ?? {});
  if (keys.length < 10) return { updatedCars: cars, totalFilled: 0 };

  const get = (row: Record<string, unknown>, i: number) =>
    String(row[keys[i]] ?? "").trim();

  // Строим быстрый lookup modId → works[]
  interface WorkAccum { modId: string; works: Work[] }
  const modMap = new Map<string, WorkAccum>();

  // Сначала сканируем строки, накапливаем текущие brand/model/gen/mod по "последнему непустому"
  let curBrand = "", curModel = "", curGen = "", curYears = "", curMod = "";
  let curEngine = "", curTransmission = "", curPower = "";

  rows.forEach((row, i) => {
    const brandName = get(row, 0) || curBrand;
    const modelName = get(row, 1) || curModel;
    const genName = get(row, 2) || curGen;
    const years = get(row, 3) || curYears;
    const modName = get(row, 4) || curMod;
    const engine = get(row, 5) || curEngine;
    const transmission = get(row, 6) || curTransmission;
    const power = get(row, 7) || curPower;
    const workName = get(row, 8);
    const hoursRaw = get(row, 9).replace(",", ".");
    const hours = parseFloat(hoursRaw);

    curBrand = brandName; curModel = modelName; curGen = genName; curYears = years;
    curMod = modName; curEngine = engine; curTransmission = transmission; curPower = power;

    if (!brandName || !modelName || !modName || !workName || isNaN(hours) || hours <= 0) return;

    const brandId = brandName.toLowerCase().replace(/\s+/g, "-");
    const modelId = `${brandId}__${modelName.toLowerCase().replace(/\s+/g, "-")}`;
    const genId = `${modelId}__${genName.toLowerCase().replace(/\s+/g, "-")}`;
    const modId = `${genId}__${modName.toLowerCase().replace(/\s+/g, "-")}`;

    if (!modMap.has(modId)) modMap.set(modId, { modId, works: [] });
    modMap.get(modId)!.works.push({ id: `w-${modId}-${i}`, name: workName, hours });
  });

  let totalFilled = 0;

  const updatedCars = cars.map((brand) => ({
    ...brand,
    models: brand.models.map((model) => ({
      ...model,
      generations: model.generations.map((gen) => ({
        ...gen,
        modifications: gen.modifications.map((mod) => {
          const entry = modMap.get(mod.id);
          if (entry && entry.works.length > 0) {
            totalFilled += entry.works.length;
            return { ...mod, works: entry.works };
          }
          return mod;
        }),
      })),
    })),
  }));

  return { updatedCars, totalFilled };
}

// ─── Step indicator ─────────────────────────────────────────────────────────

const StepBadge = ({ n, active, done, label }: { n: number; active: boolean; done: boolean; label: string }) => (
  <div className="flex items-center gap-2">
    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 transition-colors ${
      done ? "bg-green-500 text-white" : active ? "bg-[hsl(215,70%,22%)] text-white" : "bg-gray-200 text-gray-500"
    }`}>
      {done ? <Icon name="Check" size={14} /> : n}
    </div>
    <span className={`text-sm font-medium ${active ? "text-foreground" : done ? "text-green-700" : "text-muted-foreground"}`}>
      {label}
    </span>
  </div>
);

// ─── Upload block ────────────────────────────────────────────────────────────

const UploadBlock = ({
  title, description, buttonLabel, accept, onFile, status, disabled, children,
}: {
  title: string; description: string; buttonLabel: string; accept: string;
  onFile: (file: File) => void; status: { type: "success" | "error"; msg: string } | null;
  disabled?: boolean; children?: React.ReactNode;
}) => {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div className={`border rounded-lg p-5 transition-colors ${disabled ? "opacity-50 pointer-events-none bg-gray-50" : "bg-white border-border"}`}>
      <p className="font-semibold text-sm text-foreground mb-1">{title}</p>
      <p className="text-xs text-muted-foreground mb-4">{description}</p>
      {children}
      {status && (
        <div className={`flex items-start gap-2 p-3 rounded-lg border mb-3 text-xs animate-fade-in ${
          status.type === "success" ? "bg-green-50 border-green-200 text-green-700" : "bg-red-50 border-red-200 text-red-700"
        }`}>
          <Icon name={status.type === "success" ? "CheckCircle" : "XCircle"} size={14} className="shrink-0 mt-0.5" />
          {status.msg}
        </div>
      )}
      <input ref={ref} type="file" accept={accept} className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); e.target.value = ""; }} />
      <button
        onClick={() => ref.current?.click()}
        className="flex items-center gap-2 px-4 py-2 bg-[hsl(215,70%,22%)] text-white rounded text-sm font-semibold hover:bg-[hsl(215,70%,18%)] transition-all shadow-sm"
      >
        <Icon name="Upload" size={14} />
        {buttonLabel}
      </button>
    </div>
  );
};

// ─── Main component ──────────────────────────────────────────────────────────

const AdminPage = ({ ratePerHour, onRateChange }: Props) => {
  const { carDatabase, setCarDatabase, worksDatabase, setWorksDatabase } = useAppData();

  // Auth
  const [authenticated, setAuthenticated] = useState(false);
  const [codeInput, setCodeInput] = useState("");
  const [codeError, setCodeError] = useState(false);

  // Rate
  const [inputValue, setInputValue] = useState(ratePerHour.toString());
  const [rateSaved, setRateSaved] = useState(false);
  const [rateError, setRateError] = useState("");

  // Wizard state
  const [carsStatus, setCarsStatus] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [worksStatus, setWorksStatus] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [filledStatus, setFilledStatus] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  // Локальные данные мастера (до финального сохранения)
  const [pendingCars, setPendingCars] = useState<CarBrand[] | null>(null);
  const [pendingWorks, setPendingWorks] = useState<WorkEntry[] | null>(null);
  const [dbReady, setDbReady] = useState(false);
  const filledFileRef = useRef<HTMLInputElement>(null);

  const handleAuth = () => {
    if (codeInput === ACCESS_CODE) { setAuthenticated(true); setCodeError(false); }
    else { setCodeError(true); setCodeInput(""); }
  };

  const handleSaveRate = () => {
    const val = parseFloat(inputValue);
    if (isNaN(val) || val <= 0) { setRateError("Введите корректное число больше 0"); return; }
    if (val > 50000) { setRateError("Ставка не может превышать 50 000 ₽"); return; }
    setRateError(""); onRateChange(val); setRateSaved(true);
    setTimeout(() => setRateSaved(false), 3000);
  };

  // Шаг 1 — загрузка базы авто
  const handleCarsFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = new Uint8Array(ev.target!.result as ArrayBuffer);
        const wb = XLSX.read(data, { type: "array" });
        const rows: Record<string, unknown>[] = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { defval: "" });
        const cars = parseCarBase(rows);
        if (!cars || cars.length === 0) {
          setCarsStatus({ type: "error", msg: "Не удалось распознать автомобили. Проверьте формат: Марка | Модель | Поколение | Годы | Модификация ..." });
        } else {
          const totalMods = cars.reduce((s, b) => s + b.models.reduce((s2, m) => s2 + m.generations.reduce((s3, g) => s3 + g.modifications.length, 0), 0), 0);
          setPendingCars(cars);
          setCarsStatus({ type: "success", msg: `Загружено: ${cars.length} марок, ${totalMods} модификаций из «${file.name}»` });
        }
      } catch { setCarsStatus({ type: "error", msg: "Ошибка чтения файла." }); }
    };
    reader.readAsArrayBuffer(file);
  };

  // Шаг 2 — загрузка списка работ
  const handleWorksFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = new Uint8Array(ev.target!.result as ArrayBuffer);
        const wb = XLSX.read(data, { type: "array" });
        const rows: Record<string, unknown>[] = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { defval: "" });
        const works = parseWorksList(rows);
        if (!works) {
          setWorksStatus({ type: "error", msg: "Файл пустой или не содержит работ. Нужен один столбец с названиями работ." });
        } else {
          setPendingWorks(works);
          setWorksDatabase(works);
          setWorksStatus({ type: "success", msg: `Загружено ${works.length} видов работ из «${file.name}»` });
        }
      } catch { setWorksStatus({ type: "error", msg: "Ошибка чтения файла." }); }
    };
    reader.readAsArrayBuffer(file);
  };

  // Скачать шаблон (после загрузки авто + работ)
  const handleDownloadTemplate = () => {
    const cars = pendingCars ?? carDatabase;
    const works = pendingWorks ?? worksDatabase;
    generateTemplate(cars, works);
  };

  // Шаг 3 — загрузка заполненного шаблона
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
          setFilledStatus({ type: "error", msg: "Нормачасы не найдены. Убедитесь, что столбец J заполнен числами." });
        } else {
          setCarDatabase(updatedCars);
          if (pendingCars) setPendingCars(updatedCars);
          setDbReady(true);
          setFilledStatus({ type: "success", msg: `База знаний готова! Заполнено ${totalFilled} нормативов из «${file.name}»` });
        }
      } catch { setFilledStatus({ type: "error", msg: "Ошибка чтения файла." }); }
    };
    reader.readAsArrayBuffer(file);
  };

  const carsReady = !!pendingCars || carDatabase.length > 0;
  const worksReady = !!pendingWorks || worksDatabase.length > 0;
  const templateReady = carsReady && worksReady;

  const step1Done = !!pendingCars;
  const step2Done = !!pendingWorks;
  const step3Done = dbReady;

  // Статистика
  const totalMods = carDatabase.reduce((s, b) => s + b.models.reduce((s2, m) => s2 + m.generations.reduce((s3, g) => s3 + g.modifications.length, 0), 0), 0);
  const totalWorks = carDatabase.reduce((s, b) => s + b.models.reduce((s2, m) => s2 + m.generations.reduce((s3, g) => s3 + g.modifications.reduce((s4, mod) => s4 + mod.works.length, 0), 0), 0), 0);

  // ─── Auth screen ─────────────────────────────────────────────────────────

  if (!authenticated) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="bg-white border border-border rounded-xl shadow-md p-8 w-full max-w-sm">
          <div className="flex flex-col items-center mb-6">
            <div className="w-14 h-14 rounded-full bg-[hsl(215,70%,22%)] flex items-center justify-center mb-4">
              <Icon name="Lock" size={26} className="text-white" />
            </div>
            <h2 className="font-montserrat font-bold text-xl text-foreground">Панель администратора</h2>
            <p className="text-sm text-muted-foreground mt-1 text-center">Введите код доступа для входа</p>
          </div>
          <div className="space-y-3">
            <input
              type="password" value={codeInput}
              onChange={(e) => { setCodeInput(e.target.value); setCodeError(false); }}
              onKeyDown={(e) => e.key === "Enter" && handleAuth()}
              placeholder="• • • •" maxLength={10}
              className={`w-full border rounded px-4 py-3 text-center text-xl tracking-widest focus:outline-none focus:ring-2 focus:ring-[hsl(215,70%,22%)] transition-all ${codeError ? "border-red-400 bg-red-50" : "border-border"}`}
            />
            {codeError && (
              <p className="text-xs text-red-500 text-center flex items-center justify-center gap-1">
                <Icon name="AlertCircle" size={12} />Неверный код доступа
              </p>
            )}
            <button onClick={handleAuth}
              className="w-full py-2.5 bg-[hsl(215,70%,22%)] text-white rounded font-semibold text-sm hover:bg-[hsl(215,70%,18%)] transition-all shadow-sm">
              Войти
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Admin content ───────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-montserrat font-bold text-2xl text-foreground">Панель администратора</h2>
          <p className="text-muted-foreground text-sm mt-1">Управление тарифами и базой данных</p>
        </div>
        <button onClick={() => setAuthenticated(false)}
          className="flex items-center gap-2 text-xs text-muted-foreground border border-border rounded px-3 py-1.5 hover:bg-gray-50 transition-all">
          <Icon name="LogOut" size={13} />Выйти
        </button>
      </div>

      {/* Rate */}
      <div className="bg-white rounded-lg border border-border shadow-sm">
        <div className="px-6 py-4 border-b border-border flex items-center gap-2">
          <Icon name="DollarSign" size={18} className="text-[hsl(215,70%,22%)]" />
          <h3 className="font-semibold text-sm uppercase tracking-wider">Ставка нормачаса</h3>
        </div>
        <div className="p-6">
          <div className="max-w-sm">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-2">
              Базовая ставка нормачаса (₽)
            </label>
            <div className="flex gap-3">
              <div className="relative flex-1">
                <input type="number" value={inputValue}
                  onChange={(e) => { setInputValue(e.target.value); setRateSaved(false); setRateError(""); }}
                  className="w-full border border-border rounded px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(215,70%,22%)] pr-8"
                  placeholder="2500" min="1" max="50000" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">₽</span>
              </div>
              <button onClick={handleSaveRate}
                className="flex items-center gap-2 px-5 py-2.5 bg-[hsl(215,70%,22%)] text-white rounded text-sm font-semibold hover:bg-[hsl(215,70%,18%)] transition-all shadow-sm">
                <Icon name="Save" size={15} />Сохранить
              </button>
            </div>
            {rateError && <p className="mt-2 text-xs text-red-500 flex items-center gap-1"><Icon name="AlertCircle" size={12} />{rateError}</p>}
            {rateSaved && <p className="mt-2 text-xs text-green-600 flex items-center gap-1 animate-fade-in"><Icon name="CheckCircle" size={12} />Ставка успешно обновлена</p>}
          </div>
          <div className="mt-5 p-4 bg-gray-50 border border-border rounded-md">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">Примеры расчёта</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[0.5, 1, 2, 4].map((h) => (
                <div key={h} className="bg-white border border-border rounded p-3 text-center">
                  <p className="text-xs text-muted-foreground">{h} н/ч</p>
                  <p className="font-bold text-sm text-[hsl(215,70%,22%)] mt-1">{(h * ratePerHour).toLocaleString("ru-RU")} ₽</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Wizard */}
      <div className="bg-white rounded-lg border border-border shadow-sm">
        <div className="px-6 py-4 border-b border-border flex items-center gap-2">
          <Icon name="Database" size={18} className="text-[hsl(215,70%,22%)]" />
          <h3 className="font-semibold text-sm uppercase tracking-wider">Загрузка базы знаний</h3>
        </div>
        <div className="p-6 space-y-6">

          {/* Step indicators */}
          <div className="flex flex-wrap gap-4 items-center">
            <StepBadge n={1} active={!step1Done} done={step1Done} label="База автомобилей" />
            <Icon name="ChevronRight" size={16} className="text-muted-foreground hidden sm:block" />
            <StepBadge n={2} active={step1Done && !step2Done} done={step2Done} label="Список работ" />
            <Icon name="ChevronRight" size={16} className="text-muted-foreground hidden sm:block" />
            <StepBadge n={3} active={step2Done && !step3Done} done={step3Done} label="Нормативы (шаблон)" />
          </div>

          <div className="border-t border-border pt-5 space-y-4">

            {/* Step 1 — Cars */}
            <UploadBlock
              title="Шаг 1 — Загрузите базу автомобилей"
              description="Файл со столбцами: Марка | Модель | Поколение | Годы | Модификация | Двигатель (необяз.) | КПП (необяз.) | Мощность (необяз.). Каждая строка — одна модификация."
              buttonLabel="Загрузить базу авто (.xlsx)"
              accept=".xlsx,.xls"
              onFile={handleCarsFile}
              status={carsStatus}
            >
              <div className="overflow-x-auto rounded border border-border mb-4">
                <table className="text-xs w-full border-collapse">
                  <thead>
                    <tr className="bg-[hsl(215,70%,22%)] text-white">
                      {["Марка","Модель","Поколение","Годы","Модификация","Двигатель","КПП","Мощность"].map((h) => (
                        <th key={h} className="px-2 py-1.5 text-center whitespace-nowrap border-r border-blue-800 last:border-0">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ["Toyota","Camry","V70","2017-н.в.","2.5 AT","2.5 бенз.","Автомат","181 л.с."],
                      ["Toyota","Camry","V70","2017-н.в.","3.5 AT","3.5 бенз.","Автомат","249 л.с."],
                      ["BMW","3 Series","G20","2018-н.в.","320i AT","2.0 бенз.","Автомат","184 л.с."],
                    ].map((row, i) => (
                      <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                        {row.map((c, j) => <td key={j} className="px-2 py-1.5 border-r border-b border-border text-center text-gray-600 last:border-r-0">{c}</td>)}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </UploadBlock>

            {/* Step 2 — Works list */}
            <UploadBlock
              title="Шаг 2 — Загрузите список работ"
              description="Файл с одним столбцом: перечень всех видов работ (без нормачасов). Эти работы будут применены ко всем автомобилям в шаблоне."
              buttonLabel="Загрузить список работ (.xlsx)"
              accept=".xlsx,.xls"
              onFile={handleWorksFile}
              status={worksStatus}
              disabled={!step1Done}
            >
              <div className="overflow-x-auto rounded border border-border mb-4 max-w-xs">
                <table className="text-xs w-full border-collapse">
                  <thead>
                    <tr className="bg-[hsl(215,70%,22%)] text-white">
                      <th className="px-3 py-1.5 text-left">Наименование работы</th>
                    </tr>
                  </thead>
                  <tbody>
                    {["Замена масла двигателя","Замена тормозных колодок передних","Замена воздушного фильтра","Замена свечей зажигания","Замена ремня / цепи ГРМ"].map((w, i) => (
                      <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                        <td className="px-3 py-1.5 border-b border-border text-gray-600">{w}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </UploadBlock>

            {/* Step 3 — Template + filled upload */}
            <div className={`border rounded-lg p-5 space-y-4 transition-colors ${!templateReady ? "opacity-50 pointer-events-none bg-gray-50" : "bg-white border-border"}`}>
              <p className="font-semibold text-sm text-foreground">Шаг 3 — Скачайте шаблон, заполните нормачасы и загрузите обратно</p>
              <p className="text-xs text-muted-foreground">
                Шаблон содержит строку на каждую пару <strong>автомобиль × работа</strong>. В столбце <strong>J «Нормачасы»</strong> проставьте число для каждой строки и загрузите файл обратно.
              </p>

              {/* Download template */}
              <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <Icon name="FileSpreadsheet" size={20} className="text-[hsl(215,70%,22%)] shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground">Шаблон для заполнения</p>
                  <p className="text-xs text-muted-foreground">
                    {pendingCars && pendingWorks
                      ? `${pendingCars.length} марок × ${pendingWorks.length} работ = строк для заполнения`
                      : "Загрузите шаги 1 и 2 для активации"}
                  </p>
                </div>
                <button
                  onClick={handleDownloadTemplate}
                  disabled={!templateReady}
                  className="flex items-center gap-2 px-4 py-2 bg-[hsl(215,70%,22%)] text-white rounded text-sm font-semibold hover:bg-[hsl(215,70%,18%)] transition-all disabled:opacity-50 shrink-0"
                >
                  <Icon name="Download" size={15} />
                  Скачать шаблон
                </button>
              </div>

              {/* Upload filled */}
              {filledStatus && (
                <div className={`flex items-start gap-2 p-3 rounded-lg border text-xs animate-fade-in ${
                  filledStatus.type === "success" ? "bg-green-50 border-green-200 text-green-700" : "bg-red-50 border-red-200 text-red-700"
                }`}>
                  <Icon name={filledStatus.type === "success" ? "CheckCircle" : "XCircle"} size={14} className="shrink-0 mt-0.5" />
                  {filledStatus.msg}
                </div>
              )}
              <input ref={filledFileRef} type="file" accept=".xlsx,.xls" className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFilledFile(f); e.target.value = ""; }} />
              <button
                onClick={() => filledFileRef.current?.click()}
                disabled={!templateReady}
                className="flex items-center gap-2 px-4 py-2 border border-[hsl(215,70%,22%)] text-[hsl(215,70%,22%)] rounded text-sm font-semibold hover:bg-blue-50 transition-all disabled:opacity-50"
              >
                <Icon name="Upload" size={14} />
                Загрузить заполненный шаблон
              </button>
            </div>
          </div>

          {/* DB Ready banner */}
          {step3Done && (
            <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-300 rounded-lg animate-fade-in">
              <Icon name="CheckCircle" size={22} className="text-green-600 shrink-0" />
              <div>
                <p className="font-semibold text-green-800 text-sm">База знаний загружена и готова к работе!</p>
                <p className="text-xs text-green-700 mt-0.5">Калькулятор теперь использует ваши нормативы. Перейдите в раздел «Калькулятор».</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="bg-white rounded-lg border border-border shadow-sm">
        <div className="px-6 py-4 border-b border-border flex items-center gap-2">
          <Icon name="BarChart2" size={18} className="text-[hsl(215,70%,22%)]" />
          <h3 className="font-semibold text-sm uppercase tracking-wider">Текущая база данных</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
            {[
              { label: "Марок авто", value: carDatabase.length.toString(), icon: "Car" },
              { label: "Модификаций", value: totalMods.toString(), icon: "Settings2" },
              { label: "Норм в базе", value: totalWorks.toString(), icon: "Wrench" },
              { label: "Видов работ", value: worksDatabase.length.toString(), icon: "ClipboardList" },
            ].map((s) => (
              <div key={s.label} className="bg-blue-50 border border-blue-100 rounded-lg p-4 text-center">
                <Icon name={s.icon} size={20} className="text-[hsl(215,70%,22%)] mx-auto mb-2" />
                <p className="text-xl font-bold font-montserrat text-[hsl(215,70%,22%)]">{s.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
              </div>
            ))}
          </div>
          <div className="space-y-2">
            {carDatabase.map((brand) => {
              const bWorks = brand.models.reduce((s, m) => s + m.generations.reduce((s2, g) => s2 + g.modifications.reduce((s3, mod) => s3 + mod.works.length, 0), 0), 0);
              const bMods = brand.models.reduce((s, m) => s + m.generations.reduce((s2, g) => s2 + g.modifications.length, 0), 0);
              return (
                <div key={brand.id} className="flex items-center justify-between py-2 px-3 border border-border rounded hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-2">
                    <Icon name="Car" size={14} className="text-muted-foreground" />
                    <span className="text-sm font-medium">{brand.name}</span>
                    <span className="text-xs text-muted-foreground">({brand.models.length} мод.)</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground bg-gray-100 px-2 py-0.5 rounded-full">{bMods} модиф.</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${bWorks > 0 ? "bg-green-50 border-green-200 text-green-700" : "bg-amber-50 border-amber-200 text-amber-600"}`}>
                      {bWorks > 0 ? `${bWorks} норм.` : "нет норм."}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;