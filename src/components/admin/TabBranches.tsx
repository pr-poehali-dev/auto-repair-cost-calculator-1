import { useState } from "react";
import Icon from "@/components/ui/icon";
import { useAppData } from "@/pages/Index";

export interface Branch {
  id: string;
  name: string;
  address: string;
  phone: string;
  rate: number;
  active: boolean;
}

const TabBranches = () => {
  const { branches, setBranches, defaultRate } = useAppData();
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", address: "", phone: "", rate: "" });
  const [adding, setAdding] = useState(false);

  const startAdd = () => {
    setForm({ name: "", address: "", phone: "", rate: String(defaultRate) });
    setAdding(true);
    setEditing(null);
  };

  const startEdit = (b: Branch) => {
    setForm({ name: b.name, address: b.address, phone: b.phone, rate: String(b.rate) });
    setEditing(b.id);
    setAdding(false);
  };

  const handleSave = () => {
    if (!form.name.trim()) return;
    const rate = parseFloat(form.rate) || defaultRate;
    if (adding) {
      setBranches((prev) => [...prev, { id: Date.now().toString(), name: form.name, address: form.address, phone: form.phone, rate, active: true }]);
      setAdding(false);
    } else if (editing) {
      setBranches((prev) => prev.map((b) => b.id === editing ? { ...b, name: form.name, address: form.address, phone: form.phone, rate } : b));
      setEditing(null);
    }
  };

  const toggleActive = (id: string) => {
    setBranches((prev) => prev.map((b) => b.id === id ? { ...b, active: !b.active } : b));
  };

  const remove = (id: string) => {
    setBranches((prev) => prev.filter((b) => b.id !== id));
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Управление филиалами сети</p>
        <button onClick={startAdd}
          className="flex items-center gap-2 px-4 py-2 bg-[hsl(215,70%,22%)] text-white rounded text-sm font-semibold hover:bg-[hsl(215,70%,18%)] transition-all shadow-sm">
          <Icon name="Plus" size={15} />Добавить филиал
        </button>
      </div>

      {/* Form */}
      {(adding || editing) && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-5 space-y-3 animate-fade-in">
          <p className="font-semibold text-sm text-foreground">{adding ? "Новый филиал" : "Редактирование филиала"}</p>
          {[
            { label: "Название", key: "name", placeholder: "Remtech — Северный" },
            { label: "Адрес", key: "address", placeholder: "г. Москва, ул. Пушкина, 10" },
            { label: "Телефон", key: "phone", placeholder: "+7 (495) 000-00-00" },
          ].map((f) => (
            <div key={f.key}>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">{f.label}</label>
              <input
                type="text"
                value={form[f.key as keyof typeof form]}
                onChange={(e) => setForm((prev) => ({ ...prev, [f.key]: e.target.value }))}
                placeholder={f.placeholder}
                className="w-full border border-border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(215,70%,22%)]"
              />
            </div>
          ))}
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">Ставка нормачаса (₽)</label>
            <div className="relative max-w-xs">
              <input
                type="number"
                value={form.rate}
                onChange={(e) => setForm((prev) => ({ ...prev, rate: e.target.value }))}
                placeholder={String(defaultRate)}
                min="1" max="50000"
                className="w-full border border-border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(215,70%,22%)] pr-8"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">₽</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Если не указана — используется базовая ставка из «Главной»</p>
          </div>
          <div className="flex gap-2 pt-1">
            <button onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 bg-[hsl(215,70%,22%)] text-white rounded text-sm font-semibold hover:bg-[hsl(215,70%,18%)] transition-all">
              <Icon name="Save" size={14} />Сохранить
            </button>
            <button onClick={() => { setAdding(false); setEditing(null); }}
              className="flex items-center gap-2 px-4 py-2 border border-border rounded text-sm text-muted-foreground hover:bg-gray-50 transition-all">
              Отмена
            </button>
          </div>
        </div>
      )}

      {/* List */}
      {branches.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Icon name="Building2" size={36} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">Нет добавленных филиалов</p>
        </div>
      ) : (
        <div className="space-y-3">
          {branches.map((b) => (
            <div key={b.id} className={`border rounded-lg p-4 flex items-start justify-between gap-4 transition-colors ${b.active ? "bg-white border-border" : "bg-gray-50 border-border opacity-60"}`}>
              <div className="flex items-start gap-3">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${b.active ? "bg-[hsl(215,70%,22%)]" : "bg-gray-300"}`}>
                  <Icon name="Building2" size={18} className="text-white" />
                </div>
                <div>
                  <p className="font-semibold text-sm text-foreground">{b.name}</p>
                  {b.address && (
                    <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                      <Icon name="MapPin" size={11} />{b.address}
                    </p>
                  )}
                  {b.phone && (
                    <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                      <Icon name="Phone" size={11} />{b.phone}
                    </p>
                  )}
                  <p className="text-xs text-[hsl(215,70%,22%)] font-semibold mt-1 flex items-center gap-1">
                    <Icon name="DollarSign" size={11} />{b.rate.toLocaleString("ru-RU")} ₽/н.ч.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <span className={`text-xs px-2 py-0.5 rounded-full border mr-2 ${b.active ? "bg-green-50 border-green-200 text-green-700" : "bg-gray-100 border-gray-200 text-gray-500"}`}>
                  {b.active ? "Активен" : "Неактивен"}
                </span>
                <button onClick={() => startEdit(b)} title="Редактировать"
                  className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-gray-100 rounded transition-colors">
                  <Icon name="Pencil" size={14} />
                </button>
                <button onClick={() => toggleActive(b.id)} title={b.active ? "Деактивировать" : "Активировать"}
                  className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-gray-100 rounded transition-colors">
                  <Icon name={b.active ? "ToggleRight" : "ToggleLeft"} size={14} />
                </button>
                <button onClick={() => remove(b.id)} title="Удалить"
                  className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors">
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

export default TabBranches;
