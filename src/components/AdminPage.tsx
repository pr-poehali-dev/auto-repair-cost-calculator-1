import { useState } from "react";
import Icon from "@/components/ui/icon";
import { SPARE_PARTS } from "@/data/carDatabase";

interface Props {
  ratePerHour: number;
  onRateChange: (rate: number) => void;
}

const AdminPage = ({ ratePerHour, onRateChange }: Props) => {
  const [inputValue, setInputValue] = useState(ratePerHour.toString());
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const handleSave = () => {
    const val = parseFloat(inputValue);
    if (isNaN(val) || val <= 0) {
      setError("Введите корректное число больше 0");
      return;
    }
    if (val > 50000) {
      setError("Ставка не может превышать 50 000 ₽");
      return;
    }
    setError("");
    onRateChange(val);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const categories = [...new Set(SPARE_PARTS.map((p) => p.category))];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-montserrat font-bold text-2xl text-foreground">Панель администратора</h2>
        <p className="text-muted-foreground text-sm mt-1">Управление тарифами и настройками системы</p>
      </div>

      {/* Rate setting */}
      <div className="bg-white rounded-lg border border-border shadow-sm">
        <div className="px-6 py-4 border-b border-border flex items-center gap-2">
          <Icon name="DollarSign" size={18} className="text-[hsl(215,70%,22%)]" />
          <h3 className="font-semibold text-sm uppercase tracking-wider">Ставка нормачаса</h3>
        </div>
        <div className="p-6">
          <div className="max-w-sm">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-2">
              Базовая ставка нормачаса (₽)
            </label>
            <div className="flex gap-3">
              <div className="relative flex-1">
                <input
                  type="number"
                  value={inputValue}
                  onChange={(e) => { setInputValue(e.target.value); setSaved(false); setError(""); }}
                  className="w-full border border-border rounded px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(215,70%,22%)] pr-8"
                  placeholder="2500"
                  min="1"
                  max="50000"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">₽</span>
              </div>
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-5 py-2.5 bg-[hsl(215,70%,22%)] text-white rounded text-sm font-semibold hover:bg-[hsl(215,70%,18%)] transition-all shadow-sm"
              >
                <Icon name="Save" size={15} />
                Сохранить
              </button>
            </div>
            {error && (
              <p className="mt-2 text-xs text-red-500 flex items-center gap-1">
                <Icon name="AlertCircle" size={12} />
                {error}
              </p>
            )}
            {saved && (
              <p className="mt-2 text-xs text-green-600 flex items-center gap-1 animate-fade-in">
                <Icon name="CheckCircle" size={12} />
                Ставка успешно обновлена
              </p>
            )}
          </div>

          {/* Preview */}
          <div className="mt-6 p-4 bg-gray-50 border border-border rounded-md">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">Примеры расчёта при текущей ставке</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[0.5, 1, 2, 4].map((h) => (
                <div key={h} className="bg-white border border-border rounded p-3 text-center">
                  <p className="text-xs text-muted-foreground">{h} н/ч</p>
                  <p className="font-bold text-sm text-[hsl(215,70%,22%)] mt-1">
                    {(h * ratePerHour).toLocaleString("ru-RU")} ₽
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-white rounded-lg border border-border shadow-sm">
        <div className="px-6 py-4 border-b border-border flex items-center gap-2">
          <Icon name="BarChart2" size={18} className="text-[hsl(215,70%,22%)]" />
          <h3 className="font-semibold text-sm uppercase tracking-wider">Статистика базы данных</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            {[
              { label: "Марок авто", value: "6", icon: "Car" },
              { label: "Видов работ", value: SPARE_PARTS.length.toString(), icon: "Wrench" },
              { label: "Категорий", value: categories.length.toString(), icon: "Layers" },
              { label: "Текущая ставка", value: `${ratePerHour.toLocaleString("ru-RU")} ₽`, icon: "DollarSign" },
            ].map((s) => (
              <div key={s.label} className="bg-blue-50 border border-blue-100 rounded-lg p-4 text-center">
                <Icon name={s.icon} size={20} className="text-[hsl(215,70%,22%)] mx-auto mb-2" />
                <p className="text-xl font-bold font-montserrat text-[hsl(215,70%,22%)]">{s.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
              </div>
            ))}
          </div>

          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">Категории работ</p>
            <div className="space-y-2">
              {categories.map((cat) => {
                const count = SPARE_PARTS.filter((p) => p.category === cat).length;
                return (
                  <div key={cat} className="flex items-center justify-between py-2 px-3 border border-border rounded hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-2">
                      <Icon name="ChevronRight" size={14} className="text-muted-foreground" />
                      <span className="text-sm font-medium">{cat}</span>
                    </div>
                    <span className="text-xs text-muted-foreground bg-gray-100 px-2 py-0.5 rounded-full">
                      {count} работ
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-5 p-4 bg-amber-50 border border-amber-200 rounded-md flex items-start gap-3">
            <Icon name="Info" size={16} className="text-amber-600 mt-0.5 shrink-0" />
            <div className="text-xs text-amber-700">
              <p className="font-semibold mb-1">Обновление базы данных</p>
              <p>Для загрузки данных из Excel-файла — обратитесь к разработчику. База содержит марки, модели, поколения, модификации автомобилей и нормативы на замену деталей.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
