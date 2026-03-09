import { useState } from "react";
import Icon from "@/components/ui/icon";
import { useAppData } from "@/pages/Index";
import TabDashboard from "@/components/admin/TabDashboard";
import TabBranches from "@/components/admin/TabBranches";
import TabUsers from "@/components/admin/TabUsers";
import TabEditor from "@/components/admin/TabEditor";
import TabLinks from "@/components/admin/TabLinks";
import TabWorkFilters from "@/components/admin/TabWorkFilters";
import AdminPageDatabase from "@/components/admin/AdminPageDatabase";

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

const AdminPage = ({ ratePerHour, onRateChange }: Props) => {
  const { dbSyncStatus } = useAppData();
  const [activeTab, setActiveTab] = useState<AdminTab>("dashboard");

  // Rate
  const [inputValue, setInputValue] = useState(ratePerHour.toString());
  const [rateSaved, setRateSaved] = useState(false);
  const [rateError, setRateError] = useState("");

  const handleSaveRate = () => {
    const val = parseFloat(inputValue);
    if (isNaN(val) || val <= 0) { setRateError("Введите корректное число больше 0"); return; }
    if (val > 50000) { setRateError("Ставка не может превышать 50 000 ₽"); return; }
    setRateError(""); onRateChange(val); setRateSaved(true);
    setTimeout(() => setRateSaved(false), 3000);
  };

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
          {activeTab === "database" && <AdminPageDatabase />}
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
