import { HistoryItem } from "@/pages/Index";
import Icon from "@/components/ui/icon";

interface Props {
  history: HistoryItem[];
  onClear: () => void;
}

const HistoryPage = ({ history, onClear }: Props) => {
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="font-montserrat font-bold text-2xl text-foreground">История расчётов</h2>
          <p className="text-muted-foreground text-sm mt-1">
            Все расчёты текущей сессии — {history.length} записей
          </p>
        </div>
        {history.length > 0 && (
          <button
            onClick={onClear}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 border border-red-200 rounded hover:bg-red-50 transition-all"
          >
            <Icon name="Trash2" size={14} />
            Очистить
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="bg-white rounded-lg border border-border shadow-sm">
          <div className="py-20 text-center">
            <Icon name="ClipboardList" size={40} className="text-muted-foreground mx-auto mb-3 opacity-30" />
            <p className="text-muted-foreground font-medium">История пуста</p>
            <p className="text-sm text-muted-foreground mt-1">Выполните расчёт в разделе «Калькулятор»</p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {history.map((item, index) => (
            <div
              key={item.id}
              className="bg-white rounded-lg border border-border shadow-sm hover:shadow-md transition-shadow animate-fade-in"
            >
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 bg-[hsl(215,70%,22%)] text-white rounded text-xs font-bold flex items-center justify-center">
                      {history.length - index}
                    </span>
                    <div>
                      <p className="font-semibold text-sm text-foreground">{item.car}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{item.part}</p>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Icon name="Clock" size={12} />
                    {item.date}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-gray-50 border border-border rounded p-3 text-center">
                    <p className="text-xs text-muted-foreground mb-1">Нормачасов</p>
                    <p className="font-bold text-base font-montserrat text-[hsl(215,70%,22%)]">{item.hours} н/ч</p>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded p-3 text-center">
                    <p className="text-xs text-green-700 mb-1">Со своими зч</p>
                    <p className="font-bold text-base font-montserrat text-green-700">
                      {item.costWithParts.toLocaleString("ru-RU")} ₽
                    </p>
                  </div>
                  <div className="bg-orange-50 border border-orange-200 rounded p-3 text-center">
                    <p className="text-xs text-orange-700 mb-1">С наценкой +20%</p>
                    <p className="font-bold text-base font-montserrat text-orange-700">
                      {item.costWithMarkup.toLocaleString("ru-RU")} ₽
                    </p>
                  </div>
                </div>

                <div className="mt-2 text-xs text-muted-foreground">
                  Ставка на момент расчёта: {item.ratePerHour.toLocaleString("ru-RU")} ₽/н.ч
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HistoryPage;
