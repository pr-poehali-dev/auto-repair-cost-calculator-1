import { useState } from "react";
import Layout from "@/components/Layout";
import CalculatorPage from "@/components/CalculatorPage";
import AdminPage from "@/components/AdminPage";
import HistoryPage from "@/components/HistoryPage";
import HelpPage from "@/components/HelpPage";

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

const Index = () => {
  const [activeTab, setActiveTab] = useState<Tab>("calculator");
  const [ratePerHour, setRatePerHour] = useState<number>(2500);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  const addToHistory = (item: Omit<HistoryItem, "id" | "date">) => {
    const newItem: HistoryItem = {
      ...item,
      id: Date.now().toString(),
      date: new Date().toLocaleString("ru-RU"),
    };
    setHistory((prev) => [newItem, ...prev]);
  };

  return (
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
  );
};

export default Index;
