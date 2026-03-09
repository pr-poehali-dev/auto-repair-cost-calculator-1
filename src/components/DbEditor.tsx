import { useState } from "react";
import Icon from "@/components/ui/icon";
import { EditorTab } from "./db-editor/DbEditorShared";
import CarsTab from "./db-editor/CarsTab";
import WorksTab from "./db-editor/WorksTab";
import NormsTab from "./db-editor/NormsTab";

const DbEditor = () => {
  const [tab, setTab] = useState<EditorTab>("cars");

  const tabs: { id: EditorTab; label: string; icon: string }[] = [
    { id: "cars", label: "Автомобили", icon: "Car" },
    { id: "works", label: "Виды работ", icon: "Wrench" },
    { id: "norms", label: "Нормативы", icon: "Clock" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex gap-0 border-b border-border">
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-all ${
              tab === t.id ? "border-[hsl(25,95%,50%)] text-[hsl(215,70%,22%)]" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}>
            <Icon name={t.icon} size={15} />
            {t.label}
          </button>
        ))}
      </div>

      {tab === "cars" && <CarsTab />}
      {tab === "works" && <WorksTab />}
      {tab === "norms" && <NormsTab />}
    </div>
  );
};

export default DbEditor;
