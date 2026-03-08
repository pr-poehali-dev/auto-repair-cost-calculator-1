import { useState, useRef } from "react";
import Icon from "@/components/ui/icon";
import { useAppData, WorkEntry } from "@/pages/Index";
import { CarBrand, Work } from "@/data/carDatabase";
import { reapplyWorks, parseCarBase, downloadCarsTemplate as downloadCarsTemplateHelper, FUNC_FETCH_YANDEX_FILE, FUNC_PARSE_YANDEX_CHUNKS, FUNC_PARSE_YANDEX_FILE } from "@/components/admin/adminHelpers";

const FUNC_SAVE_CARS_TREE = "https://functions.poehali.dev/1e853609-fb61-44ee-b891-395a0182cc16";
import * as XLSX from "xlsx";
import TabDashboard from "@/components/admin/TabDashboard";
import TabBranches from "@/components/admin/TabBranches";
import TabUsers from "@/components/admin/TabUsers";
import TabEditor from "@/components/admin/TabEditor";
import TabLinks from "@/components/admin/TabLinks";
import TabWorkFilters from "@/components/admin/TabWorkFilters";

type AdminTab = "dashboard" | "branches" | "users" | "editor" | "links" | "workfilters" | "database";

const ADMIN_TABS: { id: AdminTab; label: string; icon: string }[] = [
  { id: "dashboard", label: "Главная", icon: "LayoutDashboard" },
  { id: "branches", label: "Филиалы", icon: "Building2" },
  { id: "users", label: "Пользователи", icon: "Users" },
  { id: "editor", label: "Консоль редактирования", icon: "TerminalSquare" },
  { id: "links", label: "Связи работ", icon: "Link" },
  { id: "workfilters", label: "Доступность работ", icon: "Filter" },
  { id: "database", label: "Базы данных", icon: "Database" },
];

interface Props {
  ratePerHour: number;
  onRateChange: (rate: number) => void;
}

// ─── Excel helpers ──────────────────────────────────────────────────────────



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
  const { carDatabase, setCarDatabase, worksDatabase, setWorksDatabase, carsUrl, setCarsUrl, carsUrlEnabled, setCarsUrlEnabled, reloadCarDb, dbSyncStatus } = useAppData();
  const [activeTab, setActiveTab] = useState<AdminTab>("dashboard");
  const [reloadLoading, setReloadLoading] = useState(false);
  const [reloadStatus, setReloadStatus] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const handleReloadDb = async () => {
    const source = pendingCars ?? carDatabase;
    if (!source || source.length === 0) {
      setReloadStatus({ type: "error", msg: "Сначала загрузите Excel-файл с базой автомобилей." });
      return;
    }
    setReloadLoading(true);
    setReloadStatus(null);

    type Chunk = CarBrand[];
    const chunks: Chunk[] = [];

    for (const brand of source) {
      const modCount = brand.models.reduce((s, m) => s + m.generations.reduce((s2, g) => s2 + g.modifications.length, 0), 0);
      if (modCount <= 300) {
        chunks.push([brand]);
      } else {
        for (const model of brand.models) {
          chunks.push([{ ...brand, models: [model] }]);
        }
      }
    }

    let savedMods = 0;
    const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));
    const MAX_RETRIES = 3;
    try {
      for (let i = 0; i < chunks.length; i++) {
        if (i > 0) await delay(500);
        setReloadStatus({ type: "success", msg: `Сохраняю на сервер… ${i + 1}/${chunks.length} (${chunks[i][0]?.name ?? ""})` });
        let lastErr: Error | null = null;
        for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
          try {
            const res = await fetch(FUNC_SAVE_CARS_TREE, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ brands: chunks[i], chunk: i, total_chunks: chunks.length, mode: i === 0 ? "replace" : "merge" }),
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const d = await res.json();
            const parsed = typeof d === "string" ? JSON.parse(d) : d;
            savedMods += parsed.modifications ?? 0;
            lastErr = null;
            break;
          } catch (e) {
            lastErr = e instanceof Error ? e : new Error(String(e));
            if (attempt < MAX_RETRIES - 1) {
              await delay(2000 * (attempt + 1));
              setReloadStatus({ type: "success", msg: `Повтор ${attempt + 2}/${MAX_RETRIES} для ${chunks[i][0]?.name ?? ""}…` });
            }
          }
        }
        if (lastErr) throw new Error(`${lastErr.message} на марке ${chunks[i][0]?.name ?? i}`);
      }
      setCarDatabase(source);
      setDbReady(true);
      setReloadStatus({ type: "success", msg: `База сохранена на сервер! ${source.length} марок, ${savedMods.toLocaleString("ru-RU")} модификаций. Данные доступны всем пользователям.` });
    } catch (e) {
      setCarDatabase(source);
      setDbReady(true);
      setReloadStatus({ type: "error", msg: `Сохранено ${savedMods.toLocaleString("ru-RU")} мод., но ошибка: ${e instanceof Error ? e.message : "неизвестная ошибка"}` });
    } finally {
      setReloadLoading(false);
    }
  };

  // Rate
  const [inputValue, setInputValue] = useState(ratePerHour.toString());
  const [rateSaved, setRateSaved] = useState(false);
  const [rateError, setRateError] = useState("");

  // Яндекс.Диск
  const [urlInput, setUrlInput] = useState(carsUrl);
  const [urlStatus, setUrlStatus] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [urlLoading, setUrlLoading] = useState(false);

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

  const handleFetchFromDisk = async (urlOverride?: string) => {
    const url = (urlOverride ?? urlInput).trim();
    if (!url) { setUrlStatus({ type: "error", msg: "Введите ссылку на файл Яндекс.Диска" }); return; }
    setUrlLoading(true);
    setUrlStatus(null);
    setCarsStatus(null);
    try {
      // Шаг 1: скачиваем файл с Яндекс.Диска в S3
      setUrlStatus({ type: "success", msg: "Шаг 1/2: скачиваю файл с Яндекс.Диска…" });
      const res1 = await fetch(FUNC_FETCH_YANDEX_FILE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const d1 = await res1.json().then((r: unknown) => typeof r === "string" ? JSON.parse(r) : r);
      if (!res1.ok || (d1 as { error?: string }).error) throw new Error((d1 as { error?: string }).error || "Ошибка скачивания файла");

      // Шаг 2: инициализируем мету (считаем строки) 
      setUrlStatus({ type: "success", msg: "Шаг 2/2: считаю строки в файле…" });
      const resInit = await fetch(FUNC_PARSE_YANDEX_FILE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ init: true }),
      });
      const dInit = await resInit.json().then((r: unknown) => typeof r === "string" ? JSON.parse(r) : r) as { ok?: boolean; total_rows?: number; total_chunks?: number; error?: string };
      if (!resInit.ok || dInit.error) throw new Error(dInit.error || "Ошибка чтения файла");

      // Загружаем чанки в БД
      let chunkIndex = 0;
      let totalInserted = 0;
      let totalSkipped = 0;
      let totalChunks = dInit.total_chunks ?? 1;

      do {
        setUrlStatus({ type: "success", msg: `Загружаю в базу… чанк ${chunkIndex + 1}/${totalChunks}` });
        const res3 = await fetch(FUNC_PARSE_YANDEX_FILE, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ chunk: chunkIndex, mode: "replace" }),
        });
        const d3 = await res3.json().then((r: unknown) => typeof r === "string" ? JSON.parse(r) : r) as { inserted?: number; skipped?: number; total_chunks?: number; done?: boolean; error?: string };
        if (!res3.ok || d3.error) throw new Error(d3.error || "Ошибка загрузки в базу");
        totalInserted += d3.inserted ?? 0;
        totalSkipped += d3.skipped ?? 0;
        totalChunks = d3.total_chunks ?? totalChunks;
        if (d3.done) break;
        chunkIndex++;
      } while (chunkIndex < totalChunks);

      setCarsUrl(url);
      await reloadCarDb();
      setUrlStatus({ type: "success", msg: `Готово! Загружено ${totalInserted.toLocaleString("ru-RU")} модификаций с Яндекс.Диска` });
      setCarsStatus({ type: "success", msg: `Загружено ${totalInserted.toLocaleString("ru-RU")} модификаций. Пропущено: ${totalSkipped}.` });
    } catch (e) {
      setUrlStatus({ type: "error", msg: e instanceof Error ? e.message : "Неизвестная ошибка" });
    } finally {
      setUrlLoading(false);
    }
  };

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
      <div className="flex items-start justify-between">
        <div>
          <h2 className="font-montserrat font-bold text-2xl text-foreground">Панель администратора</h2>
          <p className="text-muted-foreground text-sm mt-1">Управление системой Remtech</p>
        </div>
        {dbSyncStatus !== "idle" && (
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
            dbSyncStatus === "saving" ? "bg-blue-50 text-blue-600 border border-blue-200" :
            dbSyncStatus === "saved" ? "bg-green-50 text-green-600 border border-green-200" :
            "bg-red-50 text-red-600 border border-red-200"
          }`}>
            <Icon name={dbSyncStatus === "saving" ? "Loader" : dbSyncStatus === "saved" ? "CloudCheck" : "CloudOff"} size={13} className={dbSyncStatus === "saving" ? "animate-spin" : ""} fallback={dbSyncStatus === "saved" ? "Check" : "X"} />
            {dbSyncStatus === "saving" ? "Сохраняю..." : dbSyncStatus === "saved" ? "Сохранено на сервер" : "Ошибка сохранения"}
          </div>
        )}
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

          {/* ── Доступность работ ── */}
          {activeTab === "workfilters" && <TabWorkFilters />}

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

              {/* Блок Яндекс.Диска */}
              <div className="border border-blue-200 rounded-lg p-5 bg-blue-50 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <Icon name="Link" size={20} className="text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-sm text-blue-900">Автообновление с Яндекс.Диска</p>
                      <p className="text-xs text-blue-700 mt-1">
                        Укажите постоянную публичную ссылку на xlsx-файл. Включите тогл — кнопка «Загрузить» в Шаге 1 будет брать файл с диска. При выключенном тогле — загрузка файлом вручную.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCarsUrlEnabled(!carsUrlEnabled)}
                    className={`relative shrink-0 w-11 h-6 rounded-full transition-colors ${carsUrlEnabled ? "bg-blue-600" : "bg-gray-300"}`}
                  >
                    <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${carsUrlEnabled ? "translate-x-5" : "translate-x-0"}`} />
                  </button>
                </div>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={urlInput}
                    onChange={e => setUrlInput(e.target.value)}
                    placeholder="https://disk.yandex.ru/d/..."
                    className="flex-1 text-sm px-3 py-2 border border-blue-300 rounded-lg bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
                  />
                  <button
                    type="button"
                    onClick={() => { setCarsUrl(urlInput.trim()); setUrlStatus({ type: "success", msg: "Ссылка сохранена" }); }}
                    disabled={!urlInput.trim() || urlInput.trim() === carsUrl}
                    className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-all disabled:opacity-40 disabled:pointer-events-none whitespace-nowrap"
                  >
                    Сохранить
                  </button>
                </div>
                {urlStatus && (
                  <div className={`flex items-center gap-2 p-2.5 rounded-lg border text-xs ${urlStatus.type === "success" ? "bg-green-50 border-green-200 text-green-700" : "bg-red-50 border-red-200 text-red-700"}`}>
                    <Icon name={urlStatus.type === "success" ? "CheckCircle" : "XCircle"} size={13} className="shrink-0" />
                    {urlStatus.msg}
                  </div>
                )}
                {carsUrlEnabled && carsUrl && (
                  <button
                    type="button"
                    onClick={() => handleFetchFromDisk(carsUrl)}
                    disabled={urlLoading}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-700 text-white rounded-lg text-sm font-semibold hover:bg-blue-800 transition-all disabled:opacity-60 disabled:pointer-events-none"
                  >
                    {urlLoading
                      ? <><Icon name="Loader" size={14} className="animate-spin" />Загружаю с Яндекс.Диска…</>
                      : <><Icon name="RefreshCw" size={14} />Обновить базу с Яндекс.Диска</>
                    }
                  </button>
                )}
              </div>

              <div className="border-t border-border pt-5 space-y-4">
                {/* Step 1 */}
                <UploadBlock title="Шаг 1 — Загрузите базу автомобилей"
                  description="Файл должен содержать все 89 колонок с точными названиями. Структура шаблона:"
                  buttonLabel="Загрузить базу авто (.xlsx)" accept=".xlsx,.xls"
                  onFile={handleCarsFile} onUpdate={handleCarsUpdate} hasData={hasCars}
                  onDownloadTemplate={downloadCarsTemplateHelper} status={carsStatus}>
                  <div className="overflow-x-auto rounded border border-border mb-4" style={{maxHeight: 180}}>
                    <table className="text-xs border-collapse" style={{minWidth: "max-content"}}>
                      <thead className="sticky top-0 z-10">
                        <tr className="bg-[hsl(215,70%,22%)] text-white">
                          {[
                            "Марка","Модель","Поколение","Год от (Поколение)","Год до (Поколение)","Серия","Модификация",
                            "Тип кузова","Количество мест","Длина [мм]","Ширина [мм]","Высота [мм]","Колёсная база [мм]",
                            "Колея передняя [мм]","Колея задняя [мм]","Снаряженная масса [кг]","Размер колёс","Дорожный просвет [мм]",
                            "Объем багажника максимальный [л]","Объем багажника минимальный [л]","Полная масса [кг]","Размер дисков",
                            "Клиренс [мм]","Ширина передней колеи [мм]","Ширина задней колеи [мм]","Грузоподъёмность [кг]",
                            "Разрешённая масса автопоезда [кг]","Нагрузка на переднюю/заднюю ось [кг]","Погрузочная высота [мм]",
                            "Грузовой отсек (Длина x Ширина x Высота) [мм]","Объём грузового отсека [м3]","Сверловка [мм]",
                            "Тип двигателя","Объем двигателя [см3]","Мощность двигателя [л.с.]","Обороты максимальной мощности [об/мин]",
                            "Максимальный крутящий момент [Н*м]","Тип впуска","Расположение цилиндров","Количество цилиндров",
                            "Степень сжатия","Количество клапанов на цилиндр","Тип наддува","Диаметр цилиндра [мм]","Ход поршня [мм]",
                            "Модель двигателя","Расположение двигателя","Максимальная мощность (кВт) [кВт]",
                            "Обороты максимального крутящего момента [об/мин]","Наличие интеркулера","Код двигателя","ГРМ",
                            "Методика расчета расхода","Тип КПП","Количество передач","Привод","Диаметр разворота [м]",
                            "Марка топлива","Максимальная скорость [км/ч]","Разгон до 100 км/ч [сек]","Объём топливного бака [л]",
                            "Экологический стандарт","Расход топлива в городе на 100 км [л]","Расход топлива на шоссе на 100 км [л]",
                            "Расход топлива в смешанном цикле на 100 км [л]","Запас хода [км]","Выбросы CO2 [г/км]",
                            "Передние тормоза","Задние тормоза","Передняя подвеска","Задняя подвеска",
                            "Количество дверей","Страна марки","Класс автомобиля","Расположение руля",
                            "Оценка безопасности","Название рейтинга",
                            "Емкость батареи [КВт⋅ч]","Запас хода на электричестве [км]","Время зарядки [ч]","Тип батареи",
                            "Температурный режим батареи [C]","Время быстрой зарядки [ч]","Описание быстрой зарядки",
                            "Тип разъема для зарядки","Расход [КВт⋅ч/100 км]","Максимальная мощность зарядки [КВт]",
                            "Ёмкость батареи (доступная) [КВт⋅ч]","Количество циклов зарядки",
                          ].map((h) => (
                            <th key={h} className="px-2 py-1.5 text-center whitespace-nowrap border-r border-blue-800 last:border-0 font-medium">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          [
                            "Toyota","Camry","VII (V70)","2017","н.в.","SE","2.5 AT",
                            "Седан","5","4885","1840","1455","2825","1570","1580","1545",
                            "235/45 R18","160","490","390","1965","7Jx18","160","1570","1580",
                            "","","","","","","5x114.3",
                            "Бензин","2494","181","6000","235","Атмосферный","Рядный","4",
                            "10.4","4","—","87.5","96.9","2AR-FE","Спереди, поперечно","133",
                            "4200","Нет","2AR-FE","Цепь","Комбинированный",
                            "Автомат","6","Передний","11.4",
                            "АИ-95","210","8.2","70",
                            "Евро-5","9.8","6.2","7.5","","162",
                            "Дисковые вентилируемые","Дисковые","Стойки МакФерсон","Многорычажная",
                            "4","Япония","E","Левый","5","Euro NCAP",
                            "","","","","","","","","","","","",
                          ],
                          [
                            "Toyota","Camry","VII (V70)","2017","н.в.","SE","3.5 AT",
                            "Седан","5","4885","1840","1455","2825","1570","1580","1580",
                            "235/45 R18","160","490","390","2045","7Jx18","160","1570","1580",
                            "","","","","","","5x114.3",
                            "Бензин","3456","249","6200","317","Атмосферный","V-образный","6",
                            "10.8","4","—","94.0","83.0","2GR-FE","Спереди, поперечно","184",
                            "4800","Нет","2GR-FE","Цепь","Комбинированный",
                            "Автомат","6","Передний","11.4",
                            "АИ-95","210","9.4","70",
                            "Евро-5","11.2","7.3","8.8","","203",
                            "Дисковые вентилируемые","Дисковые","Стойки МакФерсон","Многорычажная",
                            "4","Япония","E","Левый","5","Euro NCAP",
                            "","","","","","","","","","","","",
                          ],
                        ].map((row, i) => (
                          <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                            {row.map((c, j) => <td key={j} className="px-2 py-1.5 border-r border-b border-border text-center whitespace-nowrap text-gray-600 last:border-r-0">{c}</td>)}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </UploadBlock>

                {/* Кнопка обновления базы */}
                <div className="p-4 border-2 border-dashed border-blue-400 rounded-lg bg-blue-50">
                  <p className="text-xs text-blue-700 mb-2">После загрузки Excel-файла нажмите, чтобы обновить все справочники:</p>
                  <button
                    type="button"
                    onClick={handleReloadDb}
                    disabled={reloadLoading || (!pendingCars && !hasCars)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Icon name={reloadLoading ? "Loader" : "CloudUpload"} size={14} className={reloadLoading ? "animate-spin" : ""} fallback="RefreshCw" />
                    {reloadLoading ? "Сохраняю на сервер…" : "Сохранить базу на сервер"}
                  </button>
                  {reloadStatus && (
                    <div className={`mt-2 flex items-center gap-2 p-2.5 rounded border text-xs ${reloadStatus.type === "success" ? "bg-green-50 border-green-200 text-green-700" : "bg-red-50 border-red-200 text-red-700"}`}>
                      <Icon name={reloadStatus.type === "success" ? "CheckCircle" : "XCircle"} size={13} className="shrink-0" />
                      {reloadStatus.msg}
                    </div>
                  )}
                </div>

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