import { useMemo } from "react";
import Icon from "@/components/ui/icon";
import { useAppData } from "@/pages/Index";
import { CartItem, ChainBlock, CONSUMABLES_PCT, buildChain, getApplicableLinks } from "@/components/calculator/calculatorUtils";
import type { Modification } from "@/data/carDatabase";

interface CalculationResultProps {
  cart: CartItem[];
  works: { id: string; name: string; hours: number }[];
  ratePerHour: number;
  brandId: string;
  modelId: string;
  brandName: string;
  modelName: string;
  generationName: string;
  modification: Modification | undefined;
  branchName: string;
  onBackToEdit: () => void;
  onReset: () => void;
}

export default function CalculationResult({
  cart, works, ratePerHour,
  brandId, modelId,
  brandName, modelName, generationName, modification,
  branchName,
  onBackToEdit, onReset,
}: CalculationResultProps) {
  const { workLinks } = useAppData();

  const applicableLinks = useMemo(
    () => getApplicableLinks(workLinks, brandId, modelId),
    [workLinks, brandId, modelId]
  );

  const totalHours = cart.filter((c) => !c.isLinkedChild).reduce((s, c) => s + c.hours, 0);
  const totalCost = totalHours * ratePerHour;
  const totalCostMarkup = totalCost * 1.2;
  const consumablesCost = Math.round(totalCost * CONSUMABLES_PCT);
  const consumablesMarkup = Math.round(totalCostMarkup * CONSUMABLES_PCT);

  return (
    <div className="animate-slide-up-in space-y-4">
      <button onClick={onBackToEdit}
        className="flex items-center gap-2 px-4 py-2 border border-border rounded text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-gray-50 transition-all">
        <Icon name="ChevronLeft" size={16} />
        Вернуться к выбору работ
      </button>

      <div className="bg-white rounded-lg border border-border shadow-sm overflow-hidden">
        <div className="px-6 py-4 flex items-center gap-2 bg-sky-350">
          <Icon name="FileText" size={18} className="text-white" />
          <h3 className="font-semibold text-sm uppercase tracking-wider text-white">Результат расчёта</h3>
        </div>
        <div className="p-6 space-y-5">
          {/* Header */}
          <div className="flex flex-wrap gap-6 pb-5 border-b border-border">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Филиал</p>
              <p className="font-semibold text-foreground flex items-center gap-1.5">
                <Icon name="Building2" size={14} className="text-[hsl(215,70%,22%)]" />
                {branchName}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Автомобиль</p>
              <p className="font-semibold text-foreground">
                {brandName} {modelName} {generationName} · {modification?.name}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Ставка</p>
              <p className="font-semibold text-foreground">{ratePerHour.toLocaleString("ru-RU")} ₽/н.ч.</p>
            </div>
          </div>

          {/* Works table */}
          <div className="border border-border rounded-lg overflow-hidden">
            <div className="bg-[hsl(215,70%,22%)] px-4 py-2.5 grid gap-2 text-xs font-semibold text-white"
              style={{ gridTemplateColumns: "1fr 80px 1fr 1fr" }}>
              <span>Работа</span>
              <span className="text-center">Н/ч</span>
              <span className="text-right">Цена со скидкой</span>
              <span className="text-right">Цены с запчастями клиента</span>
            </div>
            {cart.filter((item) => !item.isLinkedChild).map((item, i) => {
              const chain = buildChain(item.workName, applicableLinks, works);
              return (
                <div key={item.workId} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                  <div className="px-4 py-3 grid gap-2 text-sm"
                    style={{ gridTemplateColumns: "1fr 80px 1fr 1fr", ...(item.linkColor ? { borderLeft: `3px solid ${item.linkColor}` } : {}) }}>
                    <span className="text-foreground flex items-center gap-1.5 font-medium">
                      {item.linkGroupId && (
                        <span className="w-2 h-2 rounded-full shrink-0 inline-block" style={{ background: item.linkColor }} />
                      )}
                      {item.workName}
                    </span>
                    <span className="text-center font-bold text-[hsl(215,70%,22%)]">{item.baseHours.toFixed(1)}</span>
                    <span className="text-right text-green-700 font-medium">{(item.baseHours * ratePerHour).toLocaleString("ru-RU")} ₽</span>
                    <span className="text-right text-orange-600 font-medium">{(item.baseHours * ratePerHour * 1.2).toLocaleString("ru-RU")} ₽</span>
                  </div>
                  <ChainBlock chain={chain} linkColor={item.linkColor ?? "#888"} ratePerHour={ratePerHour} />
                </div>
              );
            })}
            <div className="px-4 py-3 bg-gray-100 border-t border-border grid gap-2 text-sm font-bold"
              style={{ gridTemplateColumns: "1fr 80px 1fr 1fr" }}>
              <span className="text-foreground">ИТОГО</span>
              <span className="text-center text-[hsl(215,70%,22%)]">{totalHours.toFixed(1)}</span>
              <span className="text-right text-green-700">{totalCost.toLocaleString("ru-RU")} ₽</span>
              <span className="text-right text-orange-600">{totalCostMarkup.toLocaleString("ru-RU")} ₽</span>
            </div>
          </div>

          {/* Summary cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-3">
              <div className="bg-gray-50 border border-border rounded-lg px-4 py-3 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Обязательные расходные материалы</p>
                  <p className="text-xs text-muted-foreground mt-0.5">~6% от стоимости работ</p>
                </div>
                <p className="text-base font-bold text-foreground shrink-0 ml-3">~{consumablesCost.toLocaleString("ru-RU")} ₽</p>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-5">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-green-700 mb-1">Запчасти автотехцентра Remtech</p>
                    <p className="text-xs text-green-600">Расширенная гарантия 1 год на работы и запчасти</p>
                  </div>
                  <Icon name="ShieldCheck" size={18} className="text-green-600 mt-0.5 shrink-0" />
                </div>
                <p className="text-3xl font-bold font-montserrat text-green-700 mt-3">
                  {totalCost.toLocaleString("ru-RU")} ₽
                </p>
                <p className="text-xs text-green-600 mt-1">{totalHours.toFixed(1)} н/ч × {ratePerHour.toLocaleString("ru-RU")} ₽/н.ч. · {cart.length} работ</p>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <div className="bg-gray-50 border border-border rounded-lg px-4 py-3 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Обязательные расходные материалы</p>
                  <p className="text-xs text-muted-foreground mt-0.5">~6% от стоимости работ</p>
                </div>
                <p className="text-base font-bold text-foreground shrink-0 ml-3">~{consumablesMarkup.toLocaleString("ru-RU")} ₽</p>
              </div>
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-5">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-orange-700 mb-1">Запчасти клиента</p>
                    <p className="text-xs text-orange-600">С наценкой +20%. Сокращённая гарантия до 3 месяцев</p>
                  </div>
                  <Icon name="TrendingUp" size={18} className="text-orange-600 mt-0.5 shrink-0" />
                </div>
                <p className="text-3xl font-bold font-montserrat text-orange-700 mt-3">
                  {totalCostMarkup.toLocaleString("ru-RU")} ₽
                </p>
                <p className="text-xs text-orange-600 mt-1">{totalHours.toFixed(1)} н/ч · {cart.length} работ</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Icon name="Info" size={13} />
              <span>Расчёты сохранены в истории</span>
            </div>
            <button onClick={onReset}
              className="flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground border border-border rounded hover:bg-gray-50 transition-all">
              <Icon name="RotateCcw" size={14} />Новый расчёт
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
