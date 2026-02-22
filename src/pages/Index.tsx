import { useState, createContext, useContext } from "react";
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

// Список работ (без нормачасов) — загружается на шаге 1
export interface WorkEntry {
  id: string;
  name: string;
}

interface AppDataContextType {
  carDatabase: CarBrand[];
  setCarDatabase: (data: CarBrand[]) => void;
  worksDatabase: WorkEntry[];
  setWorksDatabase: (data: WorkEntry[]) => void;
}

export const AppDataContext = createContext<AppDataContextType>({
  carDatabase: CAR_DATABASE,
  setCarDatabase: () => {},
  worksDatabase: [],
  setWorksDatabase: () => {},
});

export const useAppData = () => useContext(AppDataContext);

const Index = () => {
  const [activeTab, setActiveTab] = useState<Tab>("calculator");
  const [ratePerHour, setRatePerHour] = useState<number>(2500);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [carDatabase, setCarDatabase] = useState<CarBrand[]>(CAR_DATABASE);
  const [worksDatabase, setWorksDatabase] = useState<WorkEntry[]>([]);

  const addToHistory = (item: Omit<HistoryItem, "id" | "date">) => {
    const newItem: HistoryItem = {
      ...item,
      id: Date.now().toString(),
      date: new Date().toLocaleString("ru-RU"),
    };
    setHistory((prev) => [newItem, ...prev]);
  };

  return (
    <AppDataContext.Provider value={{ carDatabase, setCarDatabase, worksDatabase, setWorksDatabase }}>
      <Layout activeTab={activeTab} onTabChange={setActiveTab}>
        {activeTab === "calculator" && (
          <CalculatorPage ratePerHour={ratePerHour} onAddToHistory={addToHistory} />
        )}
        {activeTab === "admin" && (
          <AdminPage ratePerHour={ratePerHour} onRateChange={setRatePerHour} />
        )}
        {activeTab === "history" && (
          <HistoryPage history={history} onClear={() => setHistory([])} />
        )}
        {activeTab === "help" && <HelpPage />}
      </Layout>
    </AppDataContext.Provider>
  );
};

export default Index;
