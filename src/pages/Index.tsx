import { useState, createContext, useContext, useEffect, useCallback, useRef } from "react";
import { FUNC_FETCH_YANDEX_FILE, FUNC_PARSE_YANDEX_FILE } from "@/components/admin/adminHelpers";
import { Branch } from "@/components/admin/TabBranches";

const FUNC_GET_CARS = "https://functions.poehali.dev/135a6c4a-9149-40f9-a7a8-cf2ce637fdb2";
const FUNC_LOAD_ADMIN = "https://functions.poehali.dev/29e28049-1517-455f-9455-fb5b931d0ba4";
const FUNC_SAVE_ADMIN = "https://functions.poehali.dev/1a0f5a3e-6b5e-4087-8f32-7dac070e3112";

const LS_CARS = "remtech_cars_v1";
const LS_WORKS = "remtech_works_v1";
const LS_BRANCHES = "remtech_branches_v1";
const LS_LINKS = "remtech_links_v1";
const LS_CARS_URL = "remtech_cars_url_v1";
const LS_CARS_URL_ENABLED = "remtech_cars_url_enabled_v1";
const LS_WORK_FILTERS = "remtech_work_filters_v1";

function loadLS<T>(key: string, fallback: T): T {
  try {
    const r = localStorage.getItem(key);
    return r ? (JSON.parse(r) as T) : fallback;
  } catch {
    return fallback;
  }
}
function saveLS(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // quota exceeded — ignore
  }
}

const DB_KEY_MAP: Record<string, string> = {
  [LS_WORKS]: "works",
  [LS_LINKS]: "work_links",
  [LS_WORK_FILTERS]: "work_filters",
  [LS_BRANCHES]: "branches",
};

const dbSyncState = { setter: null as ((s: DbSyncStatus) => void) | null, timer: null as ReturnType<typeof setTimeout> | null };

function saveToDb(lsKey: string, value: unknown) {
  const dbKey = DB_KEY_MAP[lsKey];
  if (!dbKey) return;
  dbSyncState.setter?.("saving");
  if (dbSyncState.timer) clearTimeout(dbSyncState.timer);
  fetch(FUNC_SAVE_ADMIN, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ key: dbKey, value }),
  }).then((r) => {
    dbSyncState.setter?.(r.ok ? "saved" : "error");
    dbSyncState.timer = setTimeout(() => dbSyncState.setter?.("idle"), 3000);
  }).catch(() => {
    dbSyncState.setter?.("error");
    dbSyncState.timer = setTimeout(() => dbSyncState.setter?.("idle"), 5000);
  });
}
import Layout from "@/components/Layout";
import CalculatorPage from "@/components/CalculatorPage";
import AdminPage from "@/components/AdminPage";
import HistoryPage from "@/components/HistoryPage";
import HelpPage from "@/components/HelpPage";
import { CAR_DATABASE, CarBrand } from "@/data/carDatabase";

export type Tab = "calculator" | "admin" | "history" | "help";

export interface HistoryItem {
  id: string;
  date: string;
  car: string;
  part: string;
  hours: number;
  ratePerHour: number;
  costWithParts: number;
  costWithMarkup: number;
}

export interface WorkEntry {
  id: string;
  name: string;
}

/**
 * Параметры автомобиля, по которым можно фильтровать доступность работ.
 * Поля соответствуют полям Modification из базы авто.
 */
export type WorkFilterParam =
  | "engineType"      // Тип двигателя: "Бензин", "Дизель", "Гибрид"
  | "transmission"    // Тип КПП: "Автомат", "Механика", "Вариатор", "Робот"
  | "frontBrakes"     // Передние тормоза
  | "rearBrakes"      // Задние тормоза
  | "driveType"       // Привод: "Передний", "Задний", "Полный"
  | "frontSuspension" // Подвеска передняя
  | "rearSuspension"  // Подвеска задняя
  | "turboType";      // Тип наддува: "Атмосферный", "Турбокомпрессор"

export const WORK_FILTER_PARAM_LABELS: Record<WorkFilterParam, string> = {
  engineType: "Тип двигателя",
  transmission: "Тип КПП",
  frontBrakes: "Передние тормоза",
  rearBrakes: "Задние тормоза",
  driveType: "Привод",
  frontSuspension: "Подвеска передняя",
  rearSuspension: "Подвеска задняя",
  turboType: "Тип наддува",
};

export const WORK_FILTER_PARAMS: WorkFilterParam[] = [
  "engineType", "transmission", "frontBrakes", "rearBrakes",
  "driveType", "frontSuspension", "rearSuspension", "turboType",
];

/**
 * Одно правило: работа workName доступна ТОЛЬКО если значение поля param
 * входит в список allowedValues. Если allowedValues пусто — правило не ограничивает.
 */
export interface WorkFilterRule {
  param: WorkFilterParam;
  allowedValues: string[]; // пустой = нет ограничений по этому параметру
}

/**
 * Набор правил для одной работы (все правила применяются через AND).
 * Если у работы нет записи в workFilters — она доступна всегда.
 */
export interface WorkFilter {
  id: string;
  workName: string;
  rules: WorkFilterRule[];
}

/**
 * Группа связанных работ.
 * mainWorkName — «главная» работа, которая уже включает в себя сопутствующие.
 * linkedWorkNames — работы, пересекающиеся с главной.
 * При добавлении любой linkedWork в корзину — часы главной уменьшаются
 * ровно на норматив этой linkedWork для данной модификации.
 *
 * scope — опциональная привязка к конкретным авто:
 *   если не задана — группа применяется ко всем автомобилям (глобальная).
 *   если задана — только для указанных brandId / modelId (и вложенных).
 */
export interface WorkLinkScope {
  brandId: string;    // ID марки
  brandName: string;  // для отображения
  modelId?: string;   // если указана — только для этой модели
  modelName?: string;
}

export interface WorkLinkGroup {
  id: string;
  label: string;
  color: string;
  mainWorkName: string;
  linkedWorkNames: string[];
  /** Если пусто — группа глобальная (все авто). Если заполнено — только для этих марок/моделей */
  scope: WorkLinkScope[];
}

const DEFAULT_BRANCHES: Branch[] = [
  { id: "1", name: "Remtech — Главный", address: "г. Москва, ул. Примерная, 1", phone: "+7 (495) 000-00-01", rate: 2500, active: true },
];

// Набор приятных цветов для групп связей
export const LINK_COLORS = [
  "#4f46e5", "#0891b2", "#16a34a", "#d97706",
  "#dc2626", "#9333ea", "#0d9488", "#db2777",
];

export type AutoSyncStatus = "idle" | "syncing" | "done" | "error";
export type DbSyncStatus = "idle" | "saving" | "saved" | "error";

interface AppDataContextType {
  carDatabase: CarBrand[];
  setCarDatabase: (data: CarBrand[]) => void;
  worksDatabase: WorkEntry[];
  setWorksDatabase: (data: WorkEntry[]) => void;
  branches: Branch[];
  setBranches: (fn: (prev: Branch[]) => Branch[]) => void;
  defaultRate: number;
  workLinks: WorkLinkGroup[];
  setWorkLinks: (data: WorkLinkGroup[]) => void;
  workFilters: WorkFilter[];
  setWorkFilters: (data: WorkFilter[]) => void;
  carDbCount: number;
  carDbLoading: boolean;
  reloadCarDb: () => Promise<void>;
  carsUrl: string;
  setCarsUrl: (url: string) => void;
  carsUrlEnabled: boolean;
  setCarsUrlEnabled: (v: boolean) => void;
  autoSyncStatus: AutoSyncStatus;
  autoSyncMsg: string;
  triggerAutoSync: () => void;
  dbSyncStatus: DbSyncStatus;
}

export const AppDataContext = createContext<AppDataContextType>({
  carDatabase: CAR_DATABASE,
  setCarDatabase: () => {},
  worksDatabase: [],
  setWorksDatabase: () => {},
  branches: DEFAULT_BRANCHES,
  setBranches: () => {},
  defaultRate: 2500,
  workLinks: [],
  setWorkLinks: () => {},
  workFilters: [],
  setWorkFilters: () => {},
  carDbCount: 0,
  carDbLoading: false,
  reloadCarDb: async () => {},
  carsUrl: "",
  setCarsUrl: () => {},
  carsUrlEnabled: false,
  setCarsUrlEnabled: () => {},
  autoSyncStatus: "idle",
  autoSyncMsg: "",
  triggerAutoSync: () => {},
  dbSyncStatus: "idle",
});

export const useAppData = () => useContext(AppDataContext);

const Index = () => {
  const [activeTab, setActiveTab] = useState<Tab>("calculator");
  const [ratePerHour, setRatePerHour] = useState<number>(2500);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [carDatabase, setCarDatabaseRaw] = useState<CarBrand[]>(() => loadLS<CarBrand[]>(LS_CARS, CAR_DATABASE));
  const [worksDatabase, setWorksDatabaseRaw] = useState<WorkEntry[]>(() => loadLS<WorkEntry[]>(LS_WORKS, []));
  const [branches, setBranchesRaw] = useState<Branch[]>(() => loadLS<Branch[]>(LS_BRANCHES, DEFAULT_BRANCHES));
  const [workLinks, setWorkLinksRaw] = useState<WorkLinkGroup[]>(() => loadLS<WorkLinkGroup[]>(LS_LINKS, []));
  const [workFilters, setWorkFiltersRaw] = useState<WorkFilter[]>(() => loadLS<WorkFilter[]>(LS_WORK_FILTERS, []));
  const [carDbCount, setCarDbCount] = useState<number>(0);
  const [carDbLoading, setCarDbLoading] = useState<boolean>(false);
  const [carsUrl, setCarsUrlRaw] = useState<string>(() => loadLS<string>(LS_CARS_URL, ""));
  const [carsUrlEnabled, setCarsUrlEnabledRaw] = useState<boolean>(() => loadLS<boolean>(LS_CARS_URL_ENABLED, false));
  const [autoSyncStatus, setAutoSyncStatus] = useState<AutoSyncStatus>("idle");
  const [autoSyncMsg, setAutoSyncMsg] = useState<string>("");
  const [dbSyncStatus, setDbSyncStatus] = useState<DbSyncStatus>("idle");
  const autoSyncRanRef = useRef(false);

  useEffect(() => { dbSyncState.setter = setDbSyncStatus; return () => { dbSyncState.setter = null; }; }, []);

  const setCarDatabase = (data: CarBrand[]) => { setCarDatabaseRaw(data); saveLS(LS_CARS, data); };
  const setWorksDatabase = (data: WorkEntry[]) => { setWorksDatabaseRaw(data); saveLS(LS_WORKS, data); saveToDb(LS_WORKS, data); };
  const setWorkLinks = (data: WorkLinkGroup[]) => { setWorkLinksRaw(data); saveLS(LS_LINKS, data); saveToDb(LS_LINKS, data); };
  const setWorkFilters = (data: WorkFilter[]) => { setWorkFiltersRaw(data); saveLS(LS_WORK_FILTERS, data); saveToDb(LS_WORK_FILTERS, data); };
  const setCarsUrl = (url: string) => { setCarsUrlRaw(url); saveLS(LS_CARS_URL, url); };
  const setCarsUrlEnabled = (v: boolean) => { setCarsUrlEnabledRaw(v); saveLS(LS_CARS_URL_ENABLED, v); };

  const reloadCarDb = useCallback(async () => {
    setCarDbLoading(true);
    try {
      const res = await fetch(`${FUNC_GET_CARS}?count=1`);
      const raw = await res.json();
      const data = typeof raw === "string" ? JSON.parse(raw) : raw;
      setCarDbCount(data.modifications ?? 0);
    } catch {
      // ignore
    } finally {
      setCarDbLoading(false);
    }
  }, []);

  const runAutoSync = useCallback(async (url: string) => {
    setAutoSyncStatus("syncing");
    setAutoSyncMsg("Обновляю базу авто с Яндекс.Диска…");
    try {
      const res1 = await fetch(FUNC_FETCH_YANDEX_FILE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const d1 = await res1.json().then((r: unknown) => typeof r === "string" ? JSON.parse(r) : r) as { ok?: boolean; error?: string };
      if (!res1.ok || d1.error) throw new Error(d1.error || "Ошибка скачивания файла");

      const resInit = await fetch(FUNC_PARSE_YANDEX_FILE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ init: true }),
      });
      const dInit = await resInit.json().then((r: unknown) => typeof r === "string" ? JSON.parse(r) : r) as { ok?: boolean; total_chunks?: number; error?: string };
      if (!resInit.ok || dInit.error) throw new Error(dInit.error || "Ошибка чтения файла");

      let chunkIndex = 0;
      let totalInserted = 0;
      let totalChunks = dInit.total_chunks ?? 1;

      do {
        setAutoSyncMsg(`Обновляю базу авто… чанк ${chunkIndex + 1}/${totalChunks}`);
        const res3 = await fetch(FUNC_PARSE_YANDEX_FILE, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ chunk: chunkIndex, mode: "replace" }),
        });
        const d3 = await res3.json().then((r: unknown) => typeof r === "string" ? JSON.parse(r) : r) as { inserted?: number; total_chunks?: number; done?: boolean; error?: string };
        if (!res3.ok || d3.error) throw new Error(d3.error || `Ошибка на чанке ${chunkIndex + 1}`);
        totalInserted += d3.inserted ?? 0;
        totalChunks = d3.total_chunks ?? totalChunks;
        if (d3.done) break;
        chunkIndex++;
      } while (chunkIndex < totalChunks);

      await reloadCarDb();
      setAutoSyncStatus("done");
      setAutoSyncMsg(`База авто обновлена: ${totalInserted.toLocaleString("ru-RU")} модификаций`);
    } catch (e) {
      setAutoSyncStatus("error");
      setAutoSyncMsg(e instanceof Error ? e.message : "Ошибка автообновления");
    }
  }, [reloadCarDb]);

  const triggerAutoSync = useCallback(() => {
    const url = loadLS<string>(LS_CARS_URL, "");
    if (url) runAutoSync(url);
  }, [runAutoSync]);

  const dbLoadedRef = useRef(false);

  useEffect(() => {
    reloadCarDb();
    if (!autoSyncRanRef.current) {
      autoSyncRanRef.current = true;
      const url = loadLS<string>(LS_CARS_URL, "");
      if (url) runAutoSync(url);
    }
    if (!dbLoadedRef.current) {
      dbLoadedRef.current = true;
      fetch(FUNC_LOAD_ADMIN)
        .then((r) => r.json())
        .then((raw) => {
          const data = typeof raw === "string" ? JSON.parse(raw) : raw;
          if (data.works && Array.isArray(data.works) && data.works.length > 0) {
            setWorksDatabaseRaw(data.works);
            saveLS(LS_WORKS, data.works);
          }
          if (data.work_links && Array.isArray(data.work_links) && data.work_links.length > 0) {
            setWorkLinksRaw(data.work_links);
            saveLS(LS_LINKS, data.work_links);
          }
          if (data.work_filters && Array.isArray(data.work_filters) && data.work_filters.length > 0) {
            setWorkFiltersRaw(data.work_filters);
            saveLS(LS_WORK_FILTERS, data.work_filters);
          }
          if (data.branches && Array.isArray(data.branches) && data.branches.length > 0) {
            setBranchesRaw(data.branches);
            saveLS(LS_BRANCHES, data.branches);
          }
          if (data.settings && typeof data.settings === "object") {
            if (data.settings.ratePerHour) setRatePerHour(data.settings.ratePerHour);
          }
        })
        .catch(() => {});
      fetch(FUNC_GET_CARS)
        .then((r) => r.json())
        .then((raw) => {
          const tree = typeof raw === "string" ? JSON.parse(raw) : raw;
          if (Array.isArray(tree) && tree.length > 0) {
            setCarDatabaseRaw(tree);
            saveLS(LS_CARS, tree);
          }
        })
        .catch(() => {});
    }
  }, [reloadCarDb, runAutoSync]);
  const setBranches = (fn: (prev: Branch[]) => Branch[]) => {
    setBranchesRaw((prev) => {
      const next = fn(prev);
      saveLS(LS_BRANCHES, next);
      saveToDb(LS_BRANCHES, next);
      return next;
    });
  };

  const addToHistory = (item: Omit<HistoryItem, "id" | "date">) => {
    const newItem: HistoryItem = {
      ...item,
      id: Date.now().toString(),
      date: new Date().toLocaleString("ru-RU"),
    };
    setHistory((prev) => [newItem, ...prev]);
  };

  return (
    <AppDataContext.Provider value={{ carDatabase, setCarDatabase, worksDatabase, setWorksDatabase, branches, setBranches, defaultRate: ratePerHour, workLinks, setWorkLinks, workFilters, setWorkFilters, carDbCount, carDbLoading, reloadCarDb, carsUrl, setCarsUrl, carsUrlEnabled, setCarsUrlEnabled, autoSyncStatus, autoSyncMsg, triggerAutoSync, dbSyncStatus }}>
      <Layout activeTab={activeTab} onTabChange={setActiveTab}>
        <div style={{ display: activeTab === "calculator" ? undefined : "none" }}>
          <CalculatorPage onAddToHistory={addToHistory} />
        </div>
        <div style={{ display: activeTab === "admin" ? undefined : "none" }}>
          <AdminPage ratePerHour={ratePerHour} onRateChange={(v: number) => { setRatePerHour(v); setDbSyncStatus("saving"); fetch(FUNC_SAVE_ADMIN, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ key: "settings", value: { ratePerHour: v } }) }).then((r) => { setDbSyncStatus(r.ok ? "saved" : "error"); setTimeout(() => setDbSyncStatus("idle"), 3000); }).catch(() => { setDbSyncStatus("error"); setTimeout(() => setDbSyncStatus("idle"), 5000); }); }} />
        </div>
        <div style={{ display: activeTab === "history" ? undefined : "none" }}>
          <HistoryPage history={history} onClear={() => setHistory([])} />
        </div>
        <div style={{ display: activeTab === "help" ? undefined : "none" }}>
          <HelpPage />
        </div>
      </Layout>
    </AppDataContext.Provider>
  );
};

export default Index;