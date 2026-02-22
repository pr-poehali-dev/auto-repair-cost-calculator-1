import { Tab } from "@/pages/Index";
import Icon from "@/components/ui/icon";

interface LayoutProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
  children: React.ReactNode;
}

const tabs = [
  { id: "calculator" as Tab, label: "Калькулятор", icon: "Calculator" },
  { id: "admin" as Tab, label: "Администратор", icon: "Settings" },
  { id: "history" as Tab, label: "История", icon: "ClipboardList" },
  { id: "help" as Tab, label: "Справка", icon: "BookOpen" },
];

const Layout = ({ activeTab, onTabChange, children }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-background flex flex-col font-ibm">
      {/* Header */}
      <header className="text-white shadow-lg bg-sky-500 my-0">
        <div className="max-w-7xl mx-auto px-6 py-0">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-[hsl(25,95%,50%)] rounded flex items-center justify-center">
                <Icon name="Wrench" size={18} className="text-white" />
              </div>
              <div>
                <h1 className="font-montserrat font-700 text-lg leading-tight tracking-wide">
                  REMTECH
                </h1>
                <p className="text-[10px] text-blue-200 uppercase tracking-widest">
                  Калькулятор нормачасов
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-sm text-blue-200">
              <Icon name="Shield" size={14} />
              <span className="text-xs">Профессиональная система</span>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-0">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center gap-2 px-5 py-4 text-sm font-medium border-b-2 transition-all duration-200 ${
                  activeTab === tab.id
                    ? "border-[hsl(25,95%,50%)] text-[hsl(215,70%,22%)] bg-orange-50"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:bg-gray-50"
                }`}
              >
                <Icon name={tab.icon} size={16} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8">
        <div>{children}</div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-border mt-auto">
        <div className="max-w-7xl mx-auto px-6 py-3">
          <p className="text-xs text-muted-foreground text-center">
            REMTECH · Система расчёта стоимости работ · 2024
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;