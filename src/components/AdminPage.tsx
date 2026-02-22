import { useState } from "react";
import Icon from "@/components/ui/icon";
import TabDashboard from "@/components/admin/TabDashboard";
import TabBranches from "@/components/admin/TabBranches";
import TabUsers from "@/components/admin/TabUsers";
import TabEditor from "@/components/admin/TabEditor";
import TabLinks from "@/components/admin/TabLinks";
import TabDatabase from "@/components/admin/TabDatabase";

type AdminTab = "dashboard" | "branches" | "users" | "editor" | "links" | "database";

const ADMIN_TABS: { id: AdminTab; label: string; icon: string }[] = [
  { id: "dashboard", label: "Главная", icon: "LayoutDashboard" },
  { id: "branches", label: "Филиалы", icon: "Building2" },
  { id: "users", label: "Пользователи", icon: "Users" },
  { id: "editor", label: "Консоль редактирования", icon: "TerminalSquare" },
  { id: "links", label: "Связи работ", icon: "Link" },
  { id: "database", label: "Базы данных", icon: "Database" },
];

interface Props {
  ratePerHour: number;
  onRateChange: (rate: number) => void;
}

const AdminPage = ({ ratePerHour, onRateChange }: Props) => {
  const [activeTab, setActiveTab] = useState<AdminTab>("dashboard");
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

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-montserrat font-bold text-2xl text-foreground">Панель администратора</h2>
        <p className="text-muted-foreground text-sm mt-1">Управление системой Remtech</p>
      </div>

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
          {activeTab === "dashboard" && (
            <TabDashboard
              ratePerHour={ratePerHour} onRateChange={onRateChange}
              inputValue={inputValue} setInputValue={(v) => { setInputValue(v); setRateSaved(false); setRateError(""); }}
              rateSaved={rateSaved} rateError={rateError} onSave={handleSaveRate}
            />
          )}
          {activeTab === "branches" && <TabBranches />}
          {activeTab === "users" && <TabUsers />}
          {activeTab === "editor" && <TabEditor />}
          {activeTab === "links" && <TabLinks />}
          {activeTab === "database" && <TabDatabase />}
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
