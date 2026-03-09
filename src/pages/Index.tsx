import { useState } from "react";
import Layout from "@/components/Layout";
import CalculatorPage from "@/components/CalculatorPage";
import AdminPage from "@/components/AdminPage";
import HistoryPage from "@/components/HistoryPage";
import HelpPage from "@/components/HelpPage";
import AppDataProvider, { FUNC_SAVE_ADMIN } from "@/context/AppDataProvider";
import type { Tab, HistoryItem, DbSyncStatus } from "@/types/appTypes";

export type {
  Tab,
  HistoryItem,
  WorkEntry,
  WorkFilterParam,
  WorkFilter,
  WorkFilterRule,
  WorkLinkGroup,
  WorkLinkScope,
  AutoSyncStatus,
  DbSyncStatus,
  AppDataContextType,
} from "@/types/appTypes";

export {
  WORK_FILTER_PARAM_LABELS,
  WORK_FILTER_PARAMS,
  LINK_COLORS,
  DEFAULT_BRANCHES,
} from "@/types/appTypes";

export { AppDataContext, useAppData } from "@/context/AppDataContext";

const Index = () => {
  const [activeTab, setActiveTab] = useState<Tab>("calculator");
  const [ratePerHour, setRatePerHour] = useState<number>(2500);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [dbReady, setDbReady] = useState<boolean>(false);
  const [dbSyncStatus, setDbSyncStatus] = useState<DbSyncStatus>("idle");

  const addToHistory = (item: Omit<HistoryItem, "id" | "date">) => {
    const newItem: HistoryItem = {
      ...item,
      id: Date.now().toString(),
      date: new Date().toLocaleString("ru-RU"),
    };
    setHistory((prev) => [newItem, ...prev]);
  };

  if (!dbReady) {
    return (
      <AppDataProvider
        ratePerHour={ratePerHour}
        setRatePerHour={setRatePerHour}
        dbReady={dbReady}
        setDbReady={setDbReady}
        dbSyncStatus={dbSyncStatus}
        setDbSyncStatus={setDbSyncStatus}
      >
        <div className="min-h-screen flex flex-col items-center justify-center bg-background">
          <div className="w-10 h-10 border-4 border-[hsl(25,95%,50%)] border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-foreground font-montserrat font-semibold text-lg">Загрузка данных...</p>
          <p className="text-muted-foreground text-sm mt-1">Подключаемся к серверу</p>
        </div>
      </AppDataProvider>
    );
  }

  return (
    <AppDataProvider
      ratePerHour={ratePerHour}
      setRatePerHour={setRatePerHour}
      dbReady={dbReady}
      setDbReady={setDbReady}
      dbSyncStatus={dbSyncStatus}
      setDbSyncStatus={setDbSyncStatus}
    >
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
    </AppDataProvider>
  );
};

export default Index;
