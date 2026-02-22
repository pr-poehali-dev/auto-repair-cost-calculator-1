import { useState, createContext, useContext, useEffect, useCallback } from "react";
import { Branch } from "@/components/admin/TabBranches";

const LS_WORKS = "remtech_works_v1";
const LS_BRANCHES = "remtech_branches_v1";
const LS_LINKS = "remtech_links_v1";

const FUNC_GET_CARS = "https://functions.poehali.dev/135a6c4a-9149-40f9-a7a8-cf2ce637fdb2";

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

interface AppDataContextType {
  carDatabase: CarBrand[];
  setCarDatabase: (data: CarBrand[]) => void;
  carDbLoading: boolean;
  carDbCount: number;
  reloadCarDb: () => void;
  worksDatabase: WorkEntry[];
  setWorksDatabase: (data: WorkEntry[]) => void;
  branches: Branch[];
  setBranches: (fn: (prev: Branch[]) => Branch[]) => void;
  defaultRate: number;
  workLinks: WorkLinkGroup[];
  setWorkLinks: (data: WorkLinkGroup[]) => void;
}

export const AppDataContext = createContext<AppDataContextType>({
  carDatabase: CAR_DATABASE,
  setCarDatabase: () => {},
  carDbLoading: false,
  carDbCount: 0,
  reloadCarDb: () => {},
  worksDatabase: [],
  setWorksDatabase: () => {},
  branches: DEFAULT_BRANCHES,
  setBranches: () => {},
  defaultRate: 2500,
  workLinks: [],
  setWorkLinks: () => {},
});

export const useAppData = () => useContext(AppDataContext);

const Index = () => {
  const [activeTab, setActiveTab] = useState<Tab>("calculator");
  const [ratePerHour, setRatePerHour] = useState<number>(2500);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // carDatabase: загружается из БД, fallback — встроенная база
  const [carDatabase, setCarDatabaseRaw] = useState<CarBrand[]>(CAR_DATABASE);
  const [carDbLoading, setCarDbLoading] = useState(false);
  const [carDbCount, setCarDbCount] = useState(0);

  const [worksDatabase, setWorksDatabaseRaw] = useState<WorkEntry[]>(() => loadLS<WorkEntry[]>(LS_WORKS, []));
  const [branches, setBranchesRaw] = useState<Branch[]>(() => loadLS<Branch[]>(LS_BRANCHES, DEFAULT_BRANCHES));
  const [workLinks, setWorkLinksRaw] = useState<WorkLinkGroup[]>(() => loadLS<WorkLinkGroup[]>(LS_LINKS, []));

  const reloadCarDb = useCallback(async () => {
    setCarDbLoading(true);
    try {
      // Сначала проверяем счётчик — если 0, используем встроенную базу
      const countRes = await fetch(`${FUNC_GET_CARS}?count=1`);
      const countData = await countRes.json();
      const count = typeof countData === "string" ? JSON.parse(countData).modifications : countData.modifications;
      setCarDbCount(count);
      if (count === 0) {
        setCarDatabaseRaw(CAR_DATABASE);
        return;
      }
      // Загружаем полное дерево
      const res = await fetch(FUNC_GET_CARS);
      const data = await res.json();
      const parsed: CarBrand[] = typeof data === "string" ? JSON.parse(data) : data;
      if (Array.isArray(parsed) && parsed.length > 0) {
        setCarDatabaseRaw(parsed);
        setCarDbCount(count);
      }
    } catch {
      // Оставляем встроенную базу
    } finally {
      setCarDbLoading(false);
    }
  }, []);

  useEffect(() => { reloadCarDb(); }, [reloadCarDb]);

  const setCarDatabase = (data: CarBrand[]) => { setCarDatabaseRaw(data); };
  const setWorksDatabase = (data: WorkEntry[]) => { setWorksDatabaseRaw(data); saveLS(LS_WORKS, data); };
  const setWorkLinks = (data: WorkLinkGroup[]) => { setWorkLinksRaw(data); saveLS(LS_LINKS, data); };
  const setBranches = (fn: (prev: Branch[]) => Branch[]) => {
    setBranchesRaw((prev) => {
      const next = fn(prev);
      saveLS(LS_BRANCHES, next);
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
    <AppDataContext.Provider value={{ carDatabase, setCarDatabase, carDbLoading, carDbCount, reloadCarDb, worksDatabase, setWorksDatabase, branches, setBranches, defaultRate: ratePerHour, workLinks, setWorkLinks }}>
      <Layout activeTab={activeTab} onTabChange={setActiveTab}>
        <div style={{ display: activeTab === "calculator" ? undefined : "none" }}>
          <CalculatorPage onAddToHistory={addToHistory} />
        </div>
        <div style={{ display: activeTab === "admin" ? undefined : "none" }}>
          <AdminPage ratePerHour={ratePerHour} onRateChange={setRatePerHour} />
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