import { useState, useMemo } from "react";
import { useAppData, WorkFilterParam } from "@/pages/Index";
import Icon from "@/components/ui/icon";
import { HistoryItem } from "@/pages/Index";

interface Props {
  onAddToHistory: (item: Omit<HistoryItem, "id" | "date">) => void;
}

interface CartItem {
  workId: string;
  workName: string;
  /** Нормативные часы из базы (не изменяются) */
  baseHours: number;
  /** Фактически учитываемые часы (для главной = baseHours, для старых совместимых) */
  hours: number;
  /** ID группы связей (если есть) */
  linkGroupId?: string;
  /** Цвет группы */
  linkColor?: string;
  /** Если true — это сопутствующая работа (скрывается из основного списка) */
  isLinkedChild?: boolean;
}

/** Один уровень в иерархии цепочки работ */
interface ChainStep {
  workName: string;
  baseHours: number;
  /** Уникальные часы этого уровня = baseHours − baseHours следующего уровня (или baseHours если последний) */
  uniqueHours: number;
  color: string;
  depth: number;
}

/** Построить цепочку от самой базовой работы до текущей (снизу вверх) */
function buildChain(
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

/** Блок детализации иерархии работ */
const ChainBlock = ({ chain, linkColor, ratePerHour, compact = false }: {
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
              {/* Иконка уровня */}
              <div className="flex flex-col items-center shrink-0 pt-0.5 gap-0.5 w-4">
                {isLast ? (
                  <Icon name="Star" size={11} style={{ color: linkColor } as React.CSSProperties} />
                ) : (
                  <>
                    <Icon name="ArrowUp" size={9} className="text-muted-foreground/40" />
                  </>
                )}
              </div>
              {/* Название */}
              <div className="flex-1 min-w-0">
                <span className={`${isLast ? "text-sm font-bold" : "text-xs text-muted-foreground"}`}
                  style={isLast ? { color: linkColor } : {}}>
                  {step.workName}
                  {isLast && (
                    <span className="ml-1.5 text-xs font-semibold text-[hsl(215,70%,22%)]">= {step.baseHours.toFixed(1)} н/ч</span>
                  )}
                </span>
              </div>
              {/* Часы + цены */}
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

const CONSUMABLES_PCT = 0.06;

const SelectBox = ({
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

/**
 * Возвращает только те группы связей, которые применимы к данному авто.
 * Глобальные (scope пуст) — всегда. С scope — только если brandId и modelId совпадают.
 */
function getApplicableLinks(
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

/**
 * Пересчитывает корзину: главная работа хранит полные baseHours,
 * сопутствующие помечаются isLinkedChild и скрываются из основного списка.
 */
function recalcCart(rawCart: CartItem[], workLinks: ReturnType<typeof useAppData>["workLinks"], _works: { id: string; name: string; hours: number }[]): CartItem[] {
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

const CalculatorPage = ({ onAddToHistory }: Props) => {
  const { carDatabase, branches, defaultRate, workLinks, workFilters } = useAppData();

  const [branchId, setBranchId] = useState(() => {
    const active = branches.filter((b) => b.active);
    return active.length === 1 ? active[0].id : "";
  });
  const [brandId, setBrandId] = useState("");
  const [modelId, setModelId] = useState("");
  const [generationId, setGenerationId] = useState("");
  const [filterEngineType, setFilterEngineType] = useState("");
  const [filterEngineCode, setFilterEngineCode] = useState("");
  const [filterTransmission, setFilterTransmission] = useState("");
  const [filterDrive, setFilterDrive] = useState("");
  const [modificationId, setModificationId] = useState("");
  const [workId, setWorkId] = useState("");
  const [rawCart, setRawCart] = useState<CartItem[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [hiding, setHiding] = useState(false);

  const activeBranches = useMemo(() => branches.filter((b) => b.active), [branches]);
  const selectedBranch = useMemo(() => branches.find((b) => b.id === branchId), [branches, branchId]);
  const ratePerHour = selectedBranch?.rate ?? defaultRate;

  const brand = useMemo(() => carDatabase.find((b) => b.id === brandId), [carDatabase, brandId]);
  const model = useMemo(() => brand?.models.find((m) => m.id === modelId), [brand, modelId]);
  const generation = useMemo(() => model?.generations.find((g) => g.id === generationId), [model, generationId]);

  // Все модификации выбранного поколения
  const allMods = useMemo(() => generation?.modifications ?? [], [generation]);

  // Уникальные значения для каждого фильтра (из оставшихся после предыдущих фильтров)
  const engineTypeOptions = useMemo(() => {
    const vals = [...new Set(allMods.map((m) => m.engineType).filter(Boolean))] as string[];
    return vals.map((v) => ({ id: v, label: v }));
  }, [allMods]);

  const modsAfterEngineType = useMemo(
    () => (filterEngineType ? allMods.filter((m) => m.engineType === filterEngineType) : allMods),
    [allMods, filterEngineType]
  );

  const engineCodeOptions = useMemo(() => {
    const vals = [...new Set(modsAfterEngineType.map((m) => m.engineCode).filter(Boolean))] as string[];
    return vals.map((v) => ({ id: v, label: v }));
  }, [modsAfterEngineType]);

  const modsAfterEngineCode = useMemo(
    () => (filterEngineCode ? modsAfterEngineType.filter((m) => m.engineCode === filterEngineCode) : modsAfterEngineType),
    [modsAfterEngineType, filterEngineCode]
  );

  const transmissionOptions = useMemo(() => {
    const vals = [...new Set(modsAfterEngineCode.map((m) => m.transmission).filter((v) => v && v !== "—"))] as string[];
    return vals.map((v) => ({ id: v, label: v }));
  }, [modsAfterEngineCode]);

  const modsAfterTransmission = useMemo(
    () => (filterTransmission ? modsAfterEngineCode.filter((m) => m.transmission === filterTransmission) : modsAfterEngineCode),
    [modsAfterEngineCode, filterTransmission]
  );

  const driveOptions = useMemo(() => {
    const vals = [...new Set(modsAfterTransmission.map((m) => m.driveType).filter(Boolean))] as string[];
    return vals.map((v) => ({ id: v, label: v }));
  }, [modsAfterTransmission]);

  const filteredMods = useMemo(
    () => (filterDrive ? modsAfterTransmission.filter((m) => m.driveType === filterDrive) : modsAfterTransmission),
    [modsAfterTransmission, filterDrive]
  );

  const modification = useMemo(() => filteredMods.find((m) => m.id === modificationId), [filteredMods, modificationId]);
  const works = useMemo(() => modification?.works ?? [], [modification]);

  // Набор заблокированных работ для данной модификации
  const blockedWorkNames = useMemo(() => {
    if (!modification || workFilters.length === 0) return new Set<string>();
    const blocked = new Set<string>();
    workFilters.forEach((wf) => {
      const activeRules = wf.rules.filter((r) => r.allowedValues.length > 0);
      if (activeRules.length === 0) return; // нет ограничений
      // Работа заблокирована если хотя бы одно правило не выполняется
      const isBlocked = activeRules.some((r) => {
        const modVal = String((modification as Record<string, unknown>)[r.param as WorkFilterParam] ?? "").trim();
        if (!modVal || modVal === "—") return false; // нет данных — не блокируем
        return !r.allowedValues.includes(modVal);
      });
      if (isBlocked) blocked.add(wf.workName);
    });
    return blocked;
  }, [modification, workFilters]);

  // Только применимые к текущему авто связи
  const applicableLinks = useMemo(
    () => getApplicableLinks(workLinks, brandId, modelId),
    [workLinks, brandId, modelId]
  );

  // Пересчитанная корзина с учётом применимых групп связей
  const cart = useMemo(() => recalcCart(rawCart, applicableLinks, works), [rawCart, applicableLinks, works]);

  const selectedWork = useMemo(() => works.find((w) => w.id === workId), [works, workId]);
  const isInCart = useMemo(() => rawCart.some((c) => c.workId === workId), [rawCart, workId]);

  // Подсказка при выборе работы: предупредить если она пересекается с тем, что уже в корзине
  const selectedWorkHint = useMemo(() => {
    if (!selectedWork) return null;
    // Выбранная работа — главная группы, в корзине уже есть её сопутствующие
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
    // Выбранная работа — сопутствующая, в корзине уже есть главная
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

  const totalHours = cart.filter((c) => !c.isLinkedChild).reduce((s, c) => s + c.hours, 0);
  const totalCost = totalHours * ratePerHour;
  const totalCostMarkup = totalCost * 1.2;
  const consumablesCost = Math.round(totalCost * CONSUMABLES_PCT);
  const consumablesMarkup = Math.round(totalCostMarkup * CONSUMABLES_PCT);

  const handleBranchChange = (v: string) => {
    setBranchId(v); setRawCart([]); setShowResult(false); setHiding(false);
  };
  const resetFilters = () => { setFilterEngineType(""); setFilterEngineCode(""); setFilterTransmission(""); setFilterDrive(""); setModificationId(""); };
  const handleBrandChange = (v: string) => { setBrandId(v); setModelId(""); setGenerationId(""); resetFilters(); setWorkId(""); setRawCart([]); setShowResult(false); setHiding(false); };
  const handleModelChange = (v: string) => { setModelId(v); setGenerationId(""); resetFilters(); setWorkId(""); setRawCart([]); setShowResult(false); setHiding(false); };
  const handleGenerationChange = (v: string) => { setGenerationId(v); resetFilters(); setWorkId(""); setRawCart([]); setShowResult(false); setHiding(false); };
  const handleFilterEngineType = (v: string) => { setFilterEngineType(v); setFilterEngineCode(""); setFilterTransmission(""); setFilterDrive(""); setModificationId(""); setWorkId(""); setRawCart([]); setShowResult(false); setHiding(false); };
  const handleFilterEngineCode = (v: string) => { setFilterEngineCode(v); setFilterTransmission(""); setFilterDrive(""); setModificationId(""); setWorkId(""); setRawCart([]); setShowResult(false); setHiding(false); };
  const handleFilterTransmission = (v: string) => { setFilterTransmission(v); setFilterDrive(""); setModificationId(""); setWorkId(""); setRawCart([]); setShowResult(false); setHiding(false); };
  const handleFilterDrive = (v: string) => { setFilterDrive(v); setModificationId(""); setWorkId(""); setRawCart([]); setShowResult(false); setHiding(false); };
  const handleModChange = (v: string) => { setModificationId(v); setWorkId(""); setRawCart([]); setShowResult(false); setHiding(false); };

  const handleAddWork = () => {
    if (!selectedWork || isInCart) return;
    const newItem: CartItem = {
      workId: selectedWork.id,
      workName: selectedWork.name,
      baseHours: selectedWork.hours,
      hours: selectedWork.hours,
    };
    setRawCart((prev) => [...prev, newItem]);
    setWorkId("");
    setShowResult(false);
  };

  const handleRemoveWork = (wId: string) => {
    setRawCart((prev) => prev.filter((c) => c.workId !== wId));
    setShowResult(false); setHiding(false);
  };

  const handleCalculate = () => {
    if (cart.length === 0 || !brand || !model || !generation || !modification) return;
    const carStr = `${brand.name} ${model.name} ${generation.name} ${modification.name}`;
    cart.forEach((item) => {
      onAddToHistory({
        car: carStr, part: item.workName, hours: item.hours, ratePerHour,
        costWithParts: item.hours * ratePerHour,
        costWithMarkup: item.hours * ratePerHour * 1.2,
      });
    });
    setHiding(true);
    setTimeout(() => { setShowResult(true); setHiding(false); }, 380);
  };

  const handleBackToEdit = () => {
    setShowResult(false); setHiding(false);
  };

  const handleReset = () => {
    setBrandId(""); setModelId(""); setGenerationId(""); resetFilters();
    setWorkId(""); setRawCart([]); setShowResult(false); setHiding(false);
  };

  const carReady = brandId && modelId && generationId && modificationId;

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-montserrat font-bold text-2xl text-foreground">Калькулятор стоимости работ</h2>
        <p className="text-muted-foreground text-sm mt-1">Выберите филиал, автомобиль и добавьте нужные работы для суммарного расчёта</p>
      </div>

      {/* ── Форма ── */}
      <div className={hiding ? "animate-slide-up-out pointer-events-none" : showResult ? "hidden" : ""}>
        <div className="space-y-5">
          {/* Branch */}
          <div className="bg-white rounded-lg border border-border shadow-sm">
            <div className="px-5 py-3.5 flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2 shrink-0">
                <Icon name="Building2" size={16} className="text-[hsl(215,70%,22%)]" />
                <span className="font-semibold text-sm text-foreground">Филиал:</span>
              </div>
              {activeBranches.length === 0 ? (
                <span className="text-sm text-amber-600">Нет активных филиалов</span>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {activeBranches.map((b) => (
                    <button key={b.id} onClick={() => handleBranchChange(b.id)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-medium transition-all ${
                        branchId === b.id
                          ? "bg-[hsl(215,70%,22%)] border-[hsl(215,70%,22%)] text-white"
                          : "border-border text-foreground hover:border-[hsl(215,70%,40%)] hover:bg-gray-50"
                      }`}>
                      {branchId === b.id && <Icon name="Check" size={12} />}
                      {b.name}
                      <span className={`text-xs ${branchId === b.id ? "text-blue-200" : "text-muted-foreground"}`}>
                        {b.rate.toLocaleString("ru-RU")} ₽
                      </span>
                    </button>
                  ))}
                </div>
              )}
              {branchId && (
                <span className="ml-auto text-xs text-muted-foreground">
                  Ставка: <strong className="text-[hsl(215,70%,22%)]">{ratePerHour.toLocaleString("ru-RU")} ₽/н.ч.</strong>
                </span>
              )}
            </div>
          </div>

          {/* Car */}
          <div className={`bg-white rounded-lg border border-border shadow-sm ${!branchId ? "opacity-50 pointer-events-none" : ""}`}>
            <div className="px-5 py-3.5 border-b border-border flex items-center gap-2">
              <Icon name="Car" size={16} className="text-[hsl(215,70%,22%)]" />
              <h3 className="font-semibold text-sm uppercase tracking-wider text-foreground">Выбор автомобиля</h3>
            </div>
            <div className="p-5 space-y-4">
              {/* Строка 1: Марка / Модель / Поколение */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <SelectBox label="Марка" value={brandId} onChange={handleBrandChange}
                  options={carDatabase.map((b) => ({ id: b.id, label: b.name }))} placeholder="— Марка —" />
                <SelectBox label="Модель" value={modelId} onChange={handleModelChange}
                  options={brand?.models.map((m) => ({ id: m.id, label: m.name })) || []}
                  placeholder="— Модель —" disabled={!brandId} />
                <SelectBox label="Поколение" value={generationId} onChange={handleGenerationChange}
                  options={model?.generations.map((g) => ({ id: g.id, label: `${g.name} (${g.years})` })) || []}
                  placeholder="— Поколение —" disabled={!modelId} />
              </div>

              {/* Строка 2: фильтры модификации (только если выбрано поколение) */}
              {generationId && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <SelectBox label="Тип двигателя" value={filterEngineType} onChange={handleFilterEngineType}
                    options={engineTypeOptions} placeholder="— Любой —"
                    disabled={engineTypeOptions.length === 0} />
                  <SelectBox label="Номер двигателя" value={filterEngineCode} onChange={handleFilterEngineCode}
                    options={engineCodeOptions} placeholder="— Любой —"
                    disabled={engineCodeOptions.length === 0} />
                  <SelectBox label="КПП" value={filterTransmission} onChange={handleFilterTransmission}
                    options={transmissionOptions} placeholder="— Любая —"
                    disabled={transmissionOptions.length === 0} />
                  <SelectBox label="Привод" value={filterDrive} onChange={handleFilterDrive}
                    options={driveOptions} placeholder="— Любой —"
                    disabled={driveOptions.length === 0} />
                </div>
              )}

              {/* Строка 3: выбор конкретной модификации */}
              {generationId && (
                <SelectBox label="Модификация" value={modificationId} onChange={handleModChange}
                  options={filteredMods.map((m) => ({ id: m.id, label: m.name }))}
                  placeholder={filteredMods.length === 0 ? "— Нет совпадений —" : "— Выберите модификацию —"} />
              )}
            </div>
            {modification && (
              <div className="mx-5 mb-5 space-y-2 animate-fade-in">
                <div className="p-3 bg-blue-50 border border-blue-100 rounded-md flex flex-wrap gap-5 text-xs">
                  <span><span className="text-muted-foreground">Двигатель: </span><strong>{modification.engine}</strong></span>
                  {modification.engineCode && <span><span className="text-muted-foreground">Код: </span><strong>{modification.engineCode}</strong></span>}
                  <span><span className="text-muted-foreground">КПП: </span><strong>{modification.transmission}</strong></span>
                  {modification.driveType && <span><span className="text-muted-foreground">Привод: </span><strong>{modification.driveType}</strong></span>}
                  {(modification as Record<string, unknown>).turboType && <span><span className="text-muted-foreground">Наддув: </span><strong>{String((modification as Record<string, unknown>).turboType)}</strong></span>}
                  {(modification as Record<string, unknown>).frontBrakes && <span><span className="text-muted-foreground">Тормоза пер.: </span><strong>{String((modification as Record<string, unknown>).frontBrakes)}</strong></span>}
                  {(modification as Record<string, unknown>).rearBrakes && <span><span className="text-muted-foreground">Тормоза зад.: </span><strong>{String((modification as Record<string, unknown>).rearBrakes)}</strong></span>}
                  <span><span className="text-muted-foreground">Мощность: </span><strong>{modification.power}</strong></span>
                  <span><span className="text-muted-foreground">Работ в базе: </span><strong>{works.length}</strong></span>
                  {blockedWorkNames.size > 0 && <span className="text-amber-600"><span className="text-muted-foreground">Скрыто по параметрам: </span><strong>{blockedWorkNames.size}</strong></span>}
                </div>
                {blockedWorkNames.size > 0 && (
                  <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-md text-xs text-amber-700">
                    <Icon name="FilterX" size={13} className="shrink-0" />
                    <span>
                      Для этого авто скрыто <strong>{blockedWorkNames.size}</strong> {blockedWorkNames.size === 1 ? "работа" : blockedWorkNames.size < 5 ? "работы" : "работ"} — они не подходят по параметрам (тормоза, наддув и др.)
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Works */}
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
                        onChange={(v) => { setWorkId(v); setShowResult(false); }}
                        options={works
                          .filter((w) => {
                            if (rawCart.some((c) => c.workId === w.id)) return false;
                            if (blockedWorkNames.has(w.name)) return false;
                            // Скрываем работу если она — сопутствующая к уже добавленной главной
                            const isLinkedToExistingMain = applicableLinks.some(
                              (g) => g.linkedWorkNames.includes(w.name) &&
                                rawCart.some((c) => c.workName === g.mainWorkName)
                            );
                            return !isLinkedToExistingMain;
                          })
                          .map((w) => ({ id: w.id, label: `${w.name} (${w.hours} н/ч)` }))}
                        placeholder="— Выберите работу —" />
                    </div>
                    <button onClick={handleAddWork} disabled={!workId || isInCart}
                      className="flex items-center gap-2 px-4 py-2.5 bg-[hsl(215,70%,22%)] text-white rounded text-sm font-semibold hover:bg-[hsl(215,70%,18%)] transition-all disabled:opacity-40 disabled:cursor-not-allowed shrink-0">
                      <Icon name="Plus" size={15} />Добавить
                    </button>
                  </div>

                  {/* Подсказка о связях при выборе работы */}
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
                            {/* Главная работа */}
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
                              <button onClick={() => handleRemoveWork(item.workId)}
                                className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors shrink-0">
                                <Icon name="X" size={14} />
                              </button>
                            </div>
                            {/* Иерархия снизу вверх */}
                            <ChainBlock chain={chain} linkColor={item.linkColor ?? "#888"} ratePerHour={ratePerHour} compact />
                          </div>
                        );
                      })}

                      <div className="bg-blue-50 px-4 py-3 border-t border-border flex items-center justify-between">
                        <span className="text-sm font-semibold text-[hsl(215,70%,22%)]">Итого нормачасов:</span>
                        <span className="text-base font-bold text-[hsl(215,70%,22%)]">{totalHours.toFixed(1)} н/ч</span>
                      </div>
                    </div>
                  )}
                </>
              )}

              <div className="flex gap-3 pt-1">
                <button onClick={handleCalculate} disabled={rawCart.length === 0}
                  className="flex items-center gap-2 px-6 py-2.5 bg-[hsl(215,70%,22%)] text-white rounded text-sm font-semibold hover:bg-[hsl(215,70%,18%)] transition-all shadow-sm disabled:opacity-40 disabled:cursor-not-allowed">
                  <Icon name="Calculator" size={16} />
                  Рассчитать стоимость {cart.filter((c) => !c.isLinkedChild).length > 0 && `(${cart.filter((c) => !c.isLinkedChild).length} работ)`}
                </button>
                {rawCart.length > 0 && (
                  <button onClick={handleReset}
                    className="flex items-center gap-2 px-4 py-2.5 rounded text-sm font-medium text-muted-foreground border border-border hover:bg-gray-50 transition-all">
                    <Icon name="RotateCcw" size={14} />Сбросить
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Результат ── */}
      {showResult && cart.length > 0 && (
        <div className="animate-slide-up-in space-y-4">
          <button onClick={handleBackToEdit}
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
                    {selectedBranch?.name}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Автомобиль</p>
                  <p className="font-semibold text-foreground">
                    {brand?.name} {model?.name} {generation?.name} · {modification?.name}
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
                      {/* Строка главной работы */}
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
                      {/* Иерархия снизу вверх */}
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
                <button onClick={handleReset}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground border border-border rounded hover:bg-gray-50 transition-all">
                  <Icon name="RotateCcw" size={14} />Новый расчёт
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalculatorPage;