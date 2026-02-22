import { useState } from "react";
import Icon from "@/components/ui/icon";

interface User {
  id: string;
  name: string;
  role: "admin" | "manager" | "mechanic";
  branch: string;
  active: boolean;
}

const roleLabels: Record<string, string> = {
  admin: "Администратор",
  manager: "Менеджер",
  mechanic: "Механик",
};

const roleColors: Record<string, string> = {
  admin: "bg-purple-50 border-purple-200 text-purple-700",
  manager: "bg-blue-50 border-blue-200 text-blue-700",
  mechanic: "bg-orange-50 border-orange-200 text-orange-700",
};

const TabUsers = () => {
  const [users, setUsers] = useState<User[]>([
    { id: "1", name: "Иванов Иван", role: "admin", branch: "Главный", active: true },
    { id: "2", name: "Петрова Мария", role: "manager", branch: "Главный", active: true },
  ]);
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", role: "mechanic" as User["role"], branch: "" });

  const startAdd = () => {
    setForm({ name: "", role: "mechanic", branch: "" });
    setAdding(true);
    setEditing(null);
  };

  const startEdit = (u: User) => {
    setForm({ name: u.name, role: u.role, branch: u.branch });
    setEditing(u.id);
    setAdding(false);
  };

  const handleSave = () => {
    if (!form.name.trim()) return;
    if (adding) {
      setUsers((prev) => [...prev, { id: Date.now().toString(), ...form, active: true }]);
      setAdding(false);
    } else if (editing) {
      setUsers((prev) => prev.map((u) => u.id === editing ? { ...u, ...form } : u));
      setEditing(null);
    }
  };

  const toggleActive = (id: string) => {
    setUsers((prev) => prev.map((u) => u.id === id ? { ...u, active: !u.active } : u));
  };

  const remove = (id: string) => setUsers((prev) => prev.filter((u) => u.id !== id));

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Управление учётными записями</p>
        <button onClick={startAdd}
          className="flex items-center gap-2 px-4 py-2 bg-[hsl(215,70%,22%)] text-white rounded text-sm font-semibold hover:bg-[hsl(215,70%,18%)] transition-all shadow-sm">
          <Icon name="UserPlus" size={15} />Добавить пользователя
        </button>
      </div>

      {/* Form */}
      {(adding || editing) && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-5 space-y-3 animate-fade-in">
          <p className="font-semibold text-sm">{adding ? "Новый пользователь" : "Редактирование"}</p>
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">ФИО</label>
            <input type="text" value={form.name} placeholder="Иванов Иван Иванович"
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              className="w-full border border-border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(215,70%,22%)]" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">Роль</label>
              <select value={form.role} onChange={(e) => setForm((p) => ({ ...p, role: e.target.value as User["role"] }))}
                className="w-full border border-border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(215,70%,22%)]">
                <option value="admin">Администратор</option>
                <option value="manager">Менеджер</option>
                <option value="mechanic">Механик</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">Филиал</label>
              <input type="text" value={form.branch} placeholder="Главный"
                onChange={(e) => setForm((p) => ({ ...p, branch: e.target.value }))}
                className="w-full border border-border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(215,70%,22%)]" />
            </div>
          </div>
          <div className="flex gap-2 pt-1">
            <button onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 bg-[hsl(215,70%,22%)] text-white rounded text-sm font-semibold hover:bg-[hsl(215,70%,18%)] transition-all">
              <Icon name="Save" size={14} />Сохранить
            </button>
            <button onClick={() => { setAdding(false); setEditing(null); }}
              className="px-4 py-2 border border-border rounded text-sm text-muted-foreground hover:bg-gray-50 transition-all">
              Отмена
            </button>
          </div>
        </div>
      )}

      {/* List */}
      {users.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Icon name="Users" size={36} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">Нет добавленных пользователей</p>
        </div>
      ) : (
        <div className="space-y-3">
          {users.map((u) => (
            <div key={u.id} className={`border rounded-lg p-4 flex items-center justify-between gap-4 transition-colors ${u.active ? "bg-white border-border" : "bg-gray-50 opacity-60"}`}>
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${u.active ? "bg-[hsl(215,70%,22%)] text-white" : "bg-gray-300 text-white"}`}>
                  {u.name.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-sm">{u.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${roleColors[u.role]}`}>{roleLabels[u.role]}</span>
                    {u.branch && <span className="text-xs text-muted-foreground flex items-center gap-1"><Icon name="Building2" size={10} />{u.branch}</span>}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <span className={`text-xs px-2 py-0.5 rounded-full border mr-2 ${u.active ? "bg-green-50 border-green-200 text-green-700" : "bg-gray-100 border-gray-200 text-gray-500"}`}>
                  {u.active ? "Активен" : "Заблокирован"}
                </span>
                <button onClick={() => startEdit(u)} className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-gray-100 rounded transition-colors">
                  <Icon name="Pencil" size={14} />
                </button>
                <button onClick={() => toggleActive(u.id)} className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-gray-100 rounded transition-colors">
                  <Icon name={u.active ? "UserX" : "UserCheck"} size={14} />
                </button>
                <button onClick={() => remove(u.id)} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors">
                  <Icon name="Trash2" size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TabUsers;
