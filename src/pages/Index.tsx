import { useState, createContext, useContext } from "react";
import Layout from "@/components/Layout";
import CalculatorPage from "@/components/CalculatorPage";
import AdminPage from "@/components/AdminPage";
import HistoryPage from "@/components/HistoryPage";
import HelpPage from "@/components/HelpPage";
import { CAR_DATABASE, SPARE_PARTS, CarBrand, SparePartWork } from "@/data/carDatabase";

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

export interface ExcelData {
  cars: CarBrand[];
  parts: SparePartWork[];
}

interface AppDataContextType {
  carDatabase: CarBrand[];
  spareParts: SparePartWork[];
  setExcelData: (data: ExcelData) => void;
}

export const AppDataContext = createContext<AppDataContextType>({
  carDatabase: CAR_DATABASE,
  spareParts: SPARE_PARTS,
  setExcelData: () => {},
});

export const useAppData = () => useContext(AppDataContext);

const Index = () => {
  const [activeTab, setActiveTab] = useState<Tab>("calculator");
  const [ratePerHour, setRatePerHour] = useState<number>(2500);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [carDatabase, setCarDatabase] = useState<CarBrand[]>(CAR_DATABASE);
  const [spareParts, setSpareParts] = useState<SparePartWork[]>(SPARE_PARTS);

  const addToHistory = (item: Omit<HistoryItem, "id" | "date">) => {
    const newItem: HistoryItem = {
      ...item,
      id: Date.now().toString(),
      date: new Date().toLocaleString("ru-RU"),
    };
    setHistory((prev) => [newItem, ...prev]);
  };

  const setExcelData = (data: ExcelData) => {
    if (data.cars.length > 0) setCarDatabase(data.cars);
    if (data.parts.length > 0) setSpareParts(data.parts);
  };

  return (
    <AppDataContext.Provider value={{ carDatabase, spareParts, setExcelData }}>
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
