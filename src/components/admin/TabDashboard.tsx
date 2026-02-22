import Icon from "@/components/ui/icon";
import { useAppData } from "@/pages/Index";


interface Props {
  ratePerHour: number;
  onRateChange: (rate: number) => void;
  inputValue: string;
  setInputValue: (v: string) => void;
  rateSaved: boolean;
  rateError: string;
  onSave: () => void;
}

const TabDashboard = ({ ratePerHour, inputValue, setInputValue, rateSaved, rateError, onSave }: Props) => {
  const { carDatabase, worksDatabase, branches } = useAppData();

  const totalMods = carDatabase.reduce((s, b) => s + b.models.reduce((s2, m) => s2 + m.generations.reduce((s3, g) => s3 + g.modifications.length, 0), 0), 0);
  const totalWorks = carDatabase.reduce((s, b) => s + b.models.reduce((s2, m) => s2 + m.generations.reduce((s3, g) => s3 + g.modifications.reduce((s4, mod) => s4 + mod.works.length, 0), 0), 0), 0);

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Марок авто", value: carDatabase.length, icon: "Car", color: "blue" },
          { label: "Модификаций", value: totalMods, icon: "Settings2", color: "blue" },
          { label: "Норм в базе", value: totalWorks, icon: "Wrench", color: "green" },
          { label: "Видов работ", value: worksDatabase.length, icon: "ClipboardList", color: "blue" },
        ].map((s) => (
          <div key={s.label} className="bg-blue-50 border border-blue-100 rounded-lg p-4 text-center">
            <Icon name={s.icon} size={20} className="text-[hsl(215,70%,22%)] mx-auto mb-2" />
            <p className="text-2xl font-bold font-montserrat text-[hsl(215,70%,22%)]">{s.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Rate */}
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
                  type="number" value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  className="w-full border border-border rounded px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(215,70%,22%)] pr-8"
                  placeholder="2500" min="1" max="50000"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">₽</span>
              </div>
              <button onClick={onSave}
                className="flex items-center gap-2 px-5 py-2.5 bg-[hsl(215,70%,22%)] text-white rounded text-sm font-semibold hover:bg-[hsl(215,70%,18%)] transition-all shadow-sm">
                <Icon name="Save" size={15} />Сохранить
              </button>
            </div>
            {rateError && <p className="mt-2 text-xs text-red-500 flex items-center gap-1"><Icon name="AlertCircle" size={12} />{rateError}</p>}
            {rateSaved && <p className="mt-2 text-xs text-green-600 flex items-center gap-1 animate-fade-in"><Icon name="CheckCircle" size={12} />Ставка успешно обновлена</p>}
          </div>
          <div className="mt-5 p-4 bg-gray-50 border border-border rounded-md">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">Примеры расчёта</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[0.5, 1, 2, 4].map((h) => (
                <div key={h} className="bg-white border border-border rounded p-3 text-center">
                  <p className="text-xs text-muted-foreground">{h} н/ч</p>
                  <p className="font-bold text-sm text-[hsl(215,70%,22%)] mt-1">{(h * ratePerHour).toLocaleString("ru-RU")} ₽</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Branch rates */}
      <div className="bg-white rounded-lg border border-border shadow-sm">
        <div className="px-6 py-4 border-b border-border flex items-center gap-2">
          <Icon name="Building2" size={18} className="text-[hsl(215,70%,22%)]" />
          <h3 className="font-semibold text-sm uppercase tracking-wider">Ставки по филиалам</h3>
        </div>
        <div className="p-6 space-y-2">
          {branches.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">Филиалы не добавлены. Перейдите в раздел «Филиалы».</p>
          ) : branches.map((b) => (
            <div key={b.id} className={`flex items-center justify-between py-2 px-3 border border-border rounded hover:bg-gray-50 transition-colors ${!b.active ? "opacity-50" : ""}`}>
              <div className="flex items-center gap-2">
                <Icon name="Building2" size={14} className="text-muted-foreground" />
                <span className="text-sm font-medium">{b.name}</span>
                {!b.active && <span className="text-xs text-muted-foreground">(неактивен)</span>}
              </div>
              <span className="text-sm font-bold text-[hsl(215,70%,22%)]">{b.rate.toLocaleString("ru-RU")} ₽/н.ч.</span>
            </div>
          ))}
        </div>
      </div>

      {/* Car list summary */}
      <div className="bg-white rounded-lg border border-border shadow-sm">
        <div className="px-6 py-4 border-b border-border flex items-center gap-2">
          <Icon name="BarChart2" size={18} className="text-[hsl(215,70%,22%)]" />
          <h3 className="font-semibold text-sm uppercase tracking-wider">Состояние базы</h3>
        </div>
        <div className="p-6 space-y-2">
          {carDatabase.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">База автомобилей пуста. Перейдите в раздел «Базы данных».</p>
          ) : carDatabase.map((brand) => {
            const bWorks = brand.models.reduce((s, m) => s + m.generations.reduce((s2, g) => s2 + g.modifications.reduce((s3, mod) => s3 + mod.works.length, 0), 0), 0);
            const bMods = brand.models.reduce((s, m) => s + m.generations.reduce((s2, g) => s2 + g.modifications.length, 0), 0);
            return (
              <div key={brand.id} className="flex items-center justify-between py-2 px-3 border border-border rounded hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-2">
                  <Icon name="Car" size={14} className="text-muted-foreground" />
                  <span className="text-sm font-medium">{brand.name}</span>
                  <span className="text-xs text-muted-foreground">({brand.models.length} мод.)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground bg-gray-100 px-2 py-0.5 rounded-full">{bMods} модиф.</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${bWorks > 0 ? "bg-green-50 border-green-200 text-green-700" : "bg-amber-50 border-amber-200 text-amber-600"}`}>
                    {bWorks > 0 ? `${bWorks} норм.` : "нет норм."}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TabDashboard;