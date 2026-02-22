import { useState, createContext, useContext } from "react";
import { Branch } from "@/components/admin/TabBranches";

const LS_CARS = "remtech_cars_v1";
const LS_WORKS = "remtech_works_v1";
const LS_BRANCHES = "remtech_branches_v1";
const LS_LINKS = "remtech_links_v1";

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
 */
export interface WorkLinkGroup {
  id: string;
  label: string;         // произвольное название группы, например "Сцепление + подрамник"
  color: string;         // HEX-цвет для подсветки в калькуляторе
  mainWorkName: string;  // название главной работы
  linkedWorkNames: string[]; // названия сопутствующих работ
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
  const [carDatabase, setCarDatabaseRaw] = useState<CarBrand[]>(() => loadLS<CarBrand[]>(LS_CARS, CAR_DATABASE));
  const [worksDatabase, setWorksDatabaseRaw] = useState<WorkEntry[]>(() => loadLS<WorkEntry[]>(LS_WORKS, []));
  const [branches, setBranchesRaw] = useState<Branch[]>(() => loadLS<Branch[]>(LS_BRANCHES, DEFAULT_BRANCHES));
  const [workLinks, setWorkLinksRaw] = useState<WorkLinkGroup[]>(() => loadLS<WorkLinkGroup[]>(LS_LINKS, []));

  const setCarDatabase = (data: CarBrand[]) => { setCarDatabaseRaw(data); saveLS(LS_CARS, data); };
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
    <AppDataContext.Provider value={{ carDatabase, setCarDatabase, worksDatabase, setWorksDatabase, branches, setBranches, defaultRate: ratePerHour, workLinks, setWorkLinks }}>
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
