import { useState, useMemo } from "react";
import { useAppData } from "@/pages/Index";
import Icon from "@/components/ui/icon";
import { Modal, Field } from "./DbEditorShared";

const WorksTab = () => {
  const { worksDatabase, setWorksDatabase } = useAppData();
  const [modal, setModal] = useState<null | { type: "add" | "edit"; idx?: number }>(null);
  const [name, setName] = useState("");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() =>
    worksDatabase.filter((w) => w.name.toLowerCase().includes(search.toLowerCase())),
    [worksDatabase, search]
  );

  const openAdd = () => { setName(""); setModal({ type: "add" }); };
  const openEdit = (idx: number) => { setName(worksDatabase[idx].name); setModal({ type: "edit", idx }); };

  const save = () => {
    if (!name.trim()) return;
    const db = [...worksDatabase];
    if (modal?.type === "add") {
      if (db.find((w) => w.name.toLowerCase() === name.trim().toLowerCase())) return;
      db.push({ id: `work-manual-${Date.now()}`, name: name.trim() });
    } else if (modal?.type === "edit" && modal.idx !== undefined) {
      db[modal.idx] = { ...db[modal.idx], name: name.trim() };
    }
    setWorksDatabase(db);
    setModal(null);
  };

  const remove = (idx: number) => {
    if (!confirm(`Удалить работу «${worksDatabase[idx].name}»?`)) return;
    setWorksDatabase(worksDatabase.filter((_, i) => i !== idx));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Icon name="Search" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Поиск по названию..."
            className="w-full border border-border rounded pl-8 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(215,70%,22%)]" />
        </div>
        <button onClick={openAdd}
          className="flex items-center gap-1.5 px-3 py-2 bg-[hsl(215,70%,22%)] text-white rounded text-xs font-semibold hover:bg-[hsl(215,70%,18%)] transition-all shrink-0">
          <Icon name="Plus" size={13} />Добавить работу
        </button>
      </div>

      <p className="text-xs text-muted-foreground">Всего: {worksDatabase.length} работ{search ? `, найдено: ${filtered.length}` : ""}</p>

      {worksDatabase.length === 0 && (
        <div className="py-10 text-center text-muted-foreground text-sm border border-dashed border-border rounded-lg">
          Список работ пуст. Загрузите через «Загрузка баз» или добавьте вручную.
        </div>
      )}

      <div className="border border-border rounded-lg divide-y divide-border overflow-hidden">
        {filtered.map((work, i) => {
          const realIdx = worksDatabase.indexOf(work);
          return (
            <div key={work.id} className="flex items-center justify-between px-4 py-2.5 hover:bg-gray-50 group">
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground w-6 text-right">{realIdx + 1}</span>
                <span className="text-sm text-foreground">{work.name}</span>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => openEdit(realIdx)} className="p-1.5 rounded hover:bg-gray-100 transition-colors">
                  <Icon name="Pencil" size={13} className="text-[hsl(215,70%,22%)]" />
                </button>
                <button onClick={() => remove(realIdx)} className="p-1.5 rounded hover:bg-red-50 transition-colors">
                  <Icon name="Trash2" size={13} className="text-red-400" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {modal && (
        <Modal title={modal.type === "add" ? "Добавить работу" : "Редактировать работу"} onClose={() => setModal(null)}>
          <Field label="Название работы" value={name} onChange={setName} placeholder="Замена масла двигателя" />
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setModal(null)} className="px-4 py-2 border border-border rounded text-sm text-muted-foreground hover:bg-gray-50 transition-all">Отмена</button>
            <button onClick={save} className="px-5 py-2 bg-[hsl(215,70%,22%)] text-white rounded text-sm font-semibold hover:bg-[hsl(215,70%,18%)] transition-all">Сохранить</button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default WorksTab;
