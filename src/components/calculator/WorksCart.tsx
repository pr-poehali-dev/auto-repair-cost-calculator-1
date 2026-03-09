import { useMemo } from "react";
import Icon from "@/components/ui/icon";
import { useAppData } from "@/pages/Index";
import { CartItem, ChainBlock, SelectBox, buildChain, getApplicableLinks } from "@/components/calculator/calculatorUtils";

interface WorksCartProps {
  modificationId: string;
  works: { id: string; name: string; hours: number }[];
  blockedWorkNames: Set<string>;
  rawCart: CartItem[];
  cart: CartItem[];
  workId: string;
  brandId: string;
  modelId: string;
  ratePerHour: number;
  carReady: boolean;
  totalHours: number;
  onWorkIdChange: (v: string) => void;
  onAddWork: () => void;
  onRemoveWork: (workId: string) => void;
  onCalculate: () => void;
  onReset: () => void;
}

export default function WorksCart({
  modificationId, works, blockedWorkNames,
  rawCart, cart, workId, brandId, modelId,
  ratePerHour, carReady, totalHours,
  onWorkIdChange, onAddWork, onRemoveWork, onCalculate, onReset,
}: WorksCartProps) {
  const { workLinks } = useAppData();

  const applicableLinks = useMemo(
    () => getApplicableLinks(workLinks, brandId, modelId),
    [workLinks, brandId, modelId]
  );

  const selectedWork = useMemo(() => works.find((w) => w.id === workId), [works, workId]);
  const isInCart = useMemo(() => rawCart.some((c) => c.workId === workId), [rawCart, workId]);

  const selectedWorkHint = useMemo(() => {
    if (!selectedWork) return null;
    const asMain = applicableLinks.find((g) => g.mainWorkName === selectedWork.name);
    if (asMain) {
      const presentLinked = rawCart.filter((c) => asMain.linkedWorkNames.includes(c.workName));
      if (presentLinked.length > 0) {
        const deduction = presentLinked.reduce((s, c) => s + c.baseHours, 0);
        return {
          type: "main",
          text: `Группа «${asMain.label}»: в корзине уже есть ${presentLinked.map((c) => `«${c.workName}»`).join(", ")}. Часы будут скорректированы: ${selectedWork.hours} → ${Math.max(0, selectedWork.hours - deduction)} н/ч.`,
          color: asMain.color,
        };
      }
    }
    const asChild = applicableLinks.find((g) =>
      g.linkedWorkNames.includes(selectedWork.name) &&
      rawCart.some((c) => c.workName === g.mainWorkName)
    );
    if (asChild) {
      return {
        type: "child",
        text: `Группа «${asChild.label}»: эта работа входит в норматив «${asChild.mainWorkName}» и уже включена в его часы. Добавлять отдельно не нужно.`,
        color: asChild.color,
      };
    }
    return null;
  }, [selectedWork, applicableLinks, rawCart]);

  return (
    <div className={`bg-white rounded-lg border border-border shadow-sm ${!carReady ? "opacity-50 pointer-events-none" : ""}`}>
      <div className="px-5 py-3.5 border-b border-border flex items-center gap-2">
        <Icon name="Wrench" size={16} className="text-[hsl(215,70%,22%)]" />
        <h3 className="font-semibold text-sm uppercase tracking-wider text-foreground">Список работ</h3>
        {rawCart.length > 0 && (
          <span className="ml-auto bg-[hsl(215,70%,22%)] text-white text-xs font-bold px-2 py-0.5 rounded-full">
            {rawCart.length}
          </span>
        )}
      </div>
      <div className="p-5 space-y-4">
        {!modificationId ? (
          <div className="flex items-center gap-3 p-4 bg-gray-50 border border-border rounded-lg text-muted-foreground text-sm">
            <Icon name="Info" size={16} className="shrink-0" />
            Сначала выберите автомобиль и модификацию
          </div>
        ) : works.length === 0 ? (
          <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-700 text-sm">
            <Icon name="AlertTriangle" size={16} className="shrink-0" />
            Для этой модификации нет работ в базе. Загрузите данные в панели администратора.
          </div>
        ) : (
          <>
            <div className="flex gap-3 items-end">
              <div className="flex-1">
                <SelectBox label="Добавить работу" value={workId}
                  onChange={(v) => { onWorkIdChange(v); }}
                  options={works
                    .filter((w) => {
                      if (rawCart.some((c) => c.workId === w.id)) return false;
                      if (blockedWorkNames.has(w.name)) return false;
                      const isLinkedToExistingMain = applicableLinks.some(
                        (g) => g.linkedWorkNames.includes(w.name) &&
                          rawCart.some((c) => c.workName === g.mainWorkName)
                      );
                      return !isLinkedToExistingMain;
                    })
                    .map((w) => ({ id: w.id, label: `${w.name} (${w.hours} н/ч)` }))}
                  placeholder="— Выберите работу —" />
              </div>
              <button onClick={onAddWork} disabled={!workId || isInCart}
                className="flex items-center gap-2 px-4 py-2.5 bg-[hsl(215,70%,22%)] text-white rounded text-sm font-semibold hover:bg-[hsl(215,70%,18%)] transition-all disabled:opacity-40 disabled:cursor-not-allowed shrink-0">
                <Icon name="Plus" size={15} />Добавить
              </button>
            </div>

            {selectedWorkHint && (
              <div className="flex items-start gap-2 p-3 rounded-lg border text-xs animate-fade-in"
                style={{ borderColor: selectedWorkHint.color, background: `${selectedWorkHint.color}12` }}>
                <Icon name="Link" size={13} className="shrink-0 mt-0.5" style={{ color: selectedWorkHint.color } as React.CSSProperties} />
                <span style={{ color: selectedWorkHint.color }}>{selectedWorkHint.text}</span>
              </div>
            )}

            {rawCart.length > 0 && (
              <div className="border border-border rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-4 py-2 border-b border-border flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Добавленные работы</span>
                  <span className="text-xs text-muted-foreground">Итого: <strong>{totalHours.toFixed(1)} н/ч</strong></span>
                </div>
                {cart.filter((item) => !item.isLinkedChild).map((item, i) => {
                  const chain = buildChain(item.workName, applicableLinks, works);
                  return (
                    <div key={item.workId} className={i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}>
                      <div className="flex items-center gap-3 px-4 py-3"
                        style={item.linkColor ? { borderLeft: `3px solid ${item.linkColor}` } : {}}>
                        {item.linkGroupId ? (
                          <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                            style={{ background: item.linkColor }}>
                            <Icon name="Link" size={10} className="text-white" />
                          </div>
                        ) : (
                          <Icon name="Wrench" size={13} className="text-muted-foreground shrink-0" />
                        )}
                        <span className="flex-1 text-sm font-medium text-foreground">{item.workName}</span>
                        <span className="text-sm font-bold text-[hsl(215,70%,22%)] shrink-0">{item.baseHours} н/ч</span>
                        <span className="text-sm text-muted-foreground shrink-0 w-28 text-right">
                          {(item.baseHours * ratePerHour).toLocaleString("ru-RU")} ₽
                        </span>
                        <button onClick={() => onRemoveWork(item.workId)}
                          className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors shrink-0">
                          <Icon name="X" size={14} />
                        </button>
                      </div>
                      <ChainBlock chain={chain} linkColor={item.linkColor ?? "#888"} ratePerHour={ratePerHour} compact />
                    </div>
                  );
                })}

                <div className="px-4 py-3 bg-gray-100/50 border-t border-border flex items-center justify-between">
                  <span className="text-sm font-semibold text-[hsl(215,70%,22%)]">Итого нормачасов:</span>
                  <span className="text-base font-bold text-[hsl(215,70%,22%)]">{totalHours.toFixed(1)} н/ч</span>
                </div>
              </div>
            )}
          </>
        )}

        <div className="flex gap-3 pt-1">
          <button onClick={onCalculate} disabled={rawCart.length === 0}
            className="flex items-center gap-2 px-6 py-2.5 bg-[hsl(215,70%,22%)] text-white rounded text-sm font-semibold hover:bg-[hsl(215,70%,18%)] transition-all shadow-sm disabled:opacity-40 disabled:cursor-not-allowed">
            <Icon name="Calculator" size={16} />
            Рассчитать стоимость {cart.filter((c) => !c.isLinkedChild).length > 0 && `(${cart.filter((c) => !c.isLinkedChild).length} работ)`}
          </button>
          {rawCart.length > 0 && (
            <button onClick={onReset}
              className="flex items-center gap-2 px-4 py-2.5 rounded text-sm font-medium text-muted-foreground border border-border hover:bg-gray-50 transition-all">
              <Icon name="RotateCcw" size={14} />Сбросить
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
