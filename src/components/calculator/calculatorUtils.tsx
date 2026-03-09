import React from "react";
import Icon from "@/components/ui/icon";
import { useAppData } from "@/pages/Index";

export interface CartItem {
  workId: string;
  workName: string;
  baseHours: number;
  hours: number;
  linkGroupId?: string;
  linkColor?: string;
  isLinkedChild?: boolean;
}

export interface ChainStep {
  workName: string;
  baseHours: number;
  uniqueHours: number;
  color: string;
  depth: number;
}

export const CONSUMABLES_PCT = 0.06;

export function buildChain(
  workName: string,
  links: ReturnType<typeof useAppData>["workLinks"],
  works: { id: string; name: string; hours: number }[],
  depth = 0,
): ChainStep[] {
  const group = links.find((g) => g.mainWorkName === workName);
  if (!group) return [];

  const firstLinked = group.linkedWorkNames[0];
  const childWork = works.find((w) => w.name === firstLinked);

  const myHours = works.find((w) => w.name === workName)?.hours ?? 0;
  const childHours = childWork?.hours ?? 0;
  const uniqueHours = childWork ? Math.max(0, myHours - childHours) : myHours;

  const childChain = buildChain(firstLinked, links, works, depth + 1);

  const meStep: ChainStep = { workName, baseHours: myHours, uniqueHours, color: group.color, depth };

  if (childChain.length > 0) return [...childChain, meStep];

  if (childWork) {
    const allLinked = group.linkedWorkNames
      .map((ln) => works.find((w) => w.name === ln))
      .filter(Boolean) as { id: string; name: string; hours: number }[];
    return [
      ...allLinked.map((lw) => ({ workName: lw.name, baseHours: lw.hours, uniqueHours: lw.hours, color: group.color, depth: depth + 1 })),
      meStep,
    ];
  }
  return [];
}

export function getApplicableLinks(
  workLinks: ReturnType<typeof useAppData>["workLinks"],
  brandId: string,
  modelId: string,
): ReturnType<typeof useAppData>["workLinks"] {
  return workLinks.filter((g) => {
    if (g.scope.length === 0) return true;
    return g.scope.some(
      (s) => s.brandId === brandId && (!s.modelId || s.modelId === modelId)
    );
  });
}

export function recalcCart(rawCart: CartItem[], workLinks: ReturnType<typeof useAppData>["workLinks"], _works: { id: string; name: string; hours: number }[]): CartItem[] {
  return rawCart.map((item) => {
    const group = workLinks.find((g) => g.mainWorkName === item.workName);
    if (group) {
      return {
        ...item,
        hours: item.baseHours,
        linkGroupId: group.id,
        linkColor: group.color,
        isLinkedChild: false,
      };
    }
    const parentGroup = workLinks.find(
      (g) => g.linkedWorkNames.includes(item.workName) &&
        rawCart.some((c) => c.workName === g.mainWorkName)
    );
    if (parentGroup) {
      return { ...item, hours: item.baseHours, linkGroupId: parentGroup.id, linkColor: parentGroup.color, isLinkedChild: true };
    }
    return { ...item, hours: item.baseHours, linkGroupId: undefined, linkColor: undefined, isLinkedChild: false };
  });
}

export const SelectBox = ({
  label, value, onChange, options, placeholder, disabled,
}: {
  label: string; value: string; onChange: (v: string) => void;
  options: { id: string; label: string }[]; placeholder: string; disabled?: boolean;
}) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</label>
    <select value={value} onChange={(e) => onChange(e.target.value)} disabled={disabled}
      className={`w-full border border-border rounded px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[hsl(215,70%,22%)] transition-all ${
        disabled ? "opacity-40 cursor-not-allowed bg-gray-50" : "cursor-pointer hover:border-[hsl(215,70%,40%)]"
      }`}>
      <option value="">{placeholder}</option>
      {options.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
    </select>
  </div>
);

export const ChainBlock = ({ chain, linkColor, ratePerHour, compact = false }: {
  chain: ChainStep[];
  linkColor: string;
  ratePerHour: number;
  compact?: boolean;
}) => {
  if (chain.length === 0) return null;
  return (
    <div className={`${compact ? "mx-4 mb-2" : "mx-4 mb-3"} rounded-md overflow-hidden border border-border/50`}
      style={{ borderLeft: `3px solid ${linkColor}` }}>
      <div className="px-3 py-1.5 flex items-center gap-1.5 bg-gray-100/80 border-b border-border/30">
        <Icon name="ListOrdered" size={10} className="text-muted-foreground" />
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Очерёдность выполнения (↑ снизу вверх)</span>
      </div>
      {chain.map((step, si) => {
        const isLast = si === chain.length - 1;
        const costOwn = step.uniqueHours * ratePerHour;
        const costMarkup = costOwn * 1.2;
        return (
          <div key={step.workName + si}
            className={`${si < chain.length - 1 ? "border-b border-border/20" : ""} ${isLast ? "bg-white" : "bg-gray-50/40"}`}>
            <div className="flex items-start gap-2 px-3 py-2">
              <div className="flex flex-col items-center shrink-0 pt-0.5 gap-0.5 w-4">
                {isLast ? (
                  <Icon name="Star" size={11} style={{ color: linkColor } as React.CSSProperties} />
                ) : (
                  <>
                    <Icon name="ArrowUp" size={9} className="text-muted-foreground/40" />
                  </>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <span className={`${isLast ? "text-sm font-bold" : "text-xs text-muted-foreground"}`}
                  style={isLast ? { color: linkColor } : {}}>
                  {step.workName}
                  {isLast && (
                    <span className="ml-1.5 text-xs font-semibold text-[hsl(215,70%,22%)]">= {step.baseHours.toFixed(1)} н/ч</span>
                  )}
                </span>
              </div>
              <div className="flex items-center gap-3 shrink-0 text-right">
                <span className={`tabular-nums font-semibold ${isLast ? "text-sm" : "text-xs"}`}
                  style={{ color: linkColor }}>
                  {step.uniqueHours.toFixed(1)} н/ч
                </span>
                <div className={`flex flex-col items-end ${isLast ? "text-xs" : "text-[10px]"}`}>
                  <span className="text-green-700 font-medium tabular-nums">{costOwn.toLocaleString("ru-RU")} ₽</span>
                  <span className="text-orange-500 tabular-nums">{costMarkup.toLocaleString("ru-RU")} ₽</span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
