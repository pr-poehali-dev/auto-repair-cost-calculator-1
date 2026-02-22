import { useState, useMemo } from "react";
import { useAppData } from "@/pages/Index";
import Icon from "@/components/ui/icon";
import { HistoryItem } from "@/pages/Index";

interface Props {
  onAddToHistory: (item: Omit<HistoryItem, "id" | "date">) => void;
}

interface CartItem {
  workId: string;
  workName: string;
  hours: number;
}

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

const CalculatorPage = ({ onAddToHistory }: Props) => {
  const { carDatabase, branches, defaultRate } = useAppData();

  const [branchId, setBranchId] = useState(() => {
    const active = branches.filter((b) => b.active);
    return active.length === 1 ? active[0].id : "";
  });
  const [brandId, setBrandId] = useState("");
  const [modelId, setModelId] = useState("");
  const [generationId, setGenerationId] = useState("");
  const [modificationId, setModificationId] = useState("");
  const [workId, setWorkId] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showResult, setShowResult] = useState(false);

  const activeBranches = useMemo(() => branches.filter((b) => b.active), [branches]);
  const selectedBranch = useMemo(() => branches.find((b) => b.id === branchId), [branches, branchId]);
  const ratePerHour = selectedBranch?.rate ?? defaultRate;

  const brand = useMemo(() => carDatabase.find((b) => b.id === brandId), [carDatabase, brandId]);
  const model = useMemo(() => brand?.models.find((m) => m.id === modelId), [brand, modelId]);
  const generation = useMemo(() => model?.generations.find((g) => g.id === generationId), [model, generationId]);
  const modification = useMemo(() => generation?.modifications.find((m) => m.id === modificationId), [generation, modificationId]);
  const works = useMemo(() => modification?.works ?? [], [modification]);

  const selectedWork = useMemo(() => works.find((w) => w.id === workId), [works, workId]);
  const isInCart = useMemo(() => cart.some((c) => c.workId === workId), [cart, workId]);

  const totalHours = cart.reduce((s, c) => s + c.hours, 0);
  const totalCost = totalHours * ratePerHour;
  const totalCostMarkup = totalCost * 1.2;

  const handleBranchChange = (v: string) => {
    setBranchId(v);
    setCart([]); setShowResult(false);
  };
  const handleBrandChange = (v: string) => { setBrandId(v); setModelId(""); setGenerationId(""); setModificationId(""); setWorkId(""); setCart([]); setShowResult(false); };
  const handleModelChange = (v: string) => { setModelId(v); setGenerationId(""); setModificationId(""); setWorkId(""); setCart([]); setShowResult(false); };
  const handleGenerationChange = (v: string) => { setGenerationId(v); setModificationId(""); setWorkId(""); setCart([]); setShowResult(false); };
  const handleModChange = (v: string) => { setModificationId(v); setWorkId(""); setCart([]); setShowResult(false); };

  const handleAddWork = () => {
    if (!selectedWork || isInCart) return;
    setCart((prev) => [...prev, { workId: selectedWork.id, workName: selectedWork.name, hours: selectedWork.hours }]);
    setWorkId("");
    setShowResult(false);
  };

  const handleRemoveWork = (workId: string) => {
    setCart((prev) => prev.filter((c) => c.workId !== workId));
    setShowResult(false);
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
    setShowResult(true);
  };

  const handleReset = () => {
    setBrandId(""); setModelId(""); setGenerationId(""); setModificationId("");
    setWorkId(""); setCart([]); setShowResult(false);
  };

  const carReady = brandId && modelId && generationId && modificationId;

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-montserrat font-bold text-2xl text-foreground">Калькулятор стоимости работ</h2>
        <p className="text-muted-foreground text-sm mt-1">Выберите филиал, автомобиль и добавьте нужные работы для суммарного расчёта</p>
      </div>

      {/* Branch — compact selector */}
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

      {/* Car selection */}
      <div className={`bg-white rounded-lg border border-border shadow-sm ${!branchId ? "opacity-50 pointer-events-none" : ""}`}>
        <div className="px-5 py-3.5 border-b border-border flex items-center gap-2">
          <Icon name="Car" size={16} className="text-[hsl(215,70%,22%)]" />
          <h3 className="font-semibold text-sm uppercase tracking-wider text-foreground">Выбор автомобиля</h3>
        </div>
        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <SelectBox label="Марка" value={brandId} onChange={handleBrandChange}
            options={carDatabase.map((b) => ({ id: b.id, label: b.name }))} placeholder="— Марка —" />
          <SelectBox label="Модель" value={modelId} onChange={handleModelChange}
            options={brand?.models.map((m) => ({ id: m.id, label: m.name })) || []}
            placeholder="— Модель —" disabled={!brandId} />
          <SelectBox label="Поколение" value={generationId} onChange={handleGenerationChange}
            options={model?.generations.map((g) => ({ id: g.id, label: `${g.name} (${g.years})` })) || []}
            placeholder="— Поколение —" disabled={!modelId} />
          <SelectBox label="Модификация" value={modificationId} onChange={handleModChange}
            options={generation?.modifications.map((m) => ({ id: m.id, label: m.name })) || []}
            placeholder="— Модификация —" disabled={!generationId} />
        </div>
        {modification && (
          <div className="mx-5 mb-5 p-3 bg-blue-50 border border-blue-100 rounded-md flex flex-wrap gap-5 text-xs animate-fade-in">
            <span><span className="text-muted-foreground">Двигатель: </span><strong>{modification.engine}</strong></span>
            <span><span className="text-muted-foreground">КПП: </span><strong>{modification.transmission}</strong></span>
            <span><span className="text-muted-foreground">Мощность: </span><strong>{modification.power}</strong></span>
            <span><span className="text-muted-foreground">Работ в базе: </span><strong>{works.length}</strong></span>
          </div>
        )}
      </div>

      {/* Work picker */}
      <div className={`bg-white rounded-lg border border-border shadow-sm ${!carReady ? "opacity-50 pointer-events-none" : ""}`}>
        <div className="px-5 py-3.5 border-b border-border flex items-center gap-2">
          <Icon name="Wrench" size={16} className="text-[hsl(215,70%,22%)]" />
          <h3 className="font-semibold text-sm uppercase tracking-wider text-foreground">Список работ</h3>
          {cart.length > 0 && (
            <span className="ml-auto bg-[hsl(215,70%,22%)] text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {cart.length}
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
              {/* Add work row */}
              <div className="flex gap-3 items-end">
                <div className="flex-1">
                  <SelectBox label="Добавить работу" value={workId}
                    onChange={(v) => { setWorkId(v); setShowResult(false); }}
                    options={works
                      .filter((w) => !cart.some((c) => c.workId === w.id))
                      .map((w) => ({ id: w.id, label: `${w.name} (${w.hours} н/ч)` }))}
                    placeholder="— Выберите работу —" />
                </div>
                <button onClick={handleAddWork} disabled={!workId || isInCart}
                  className="flex items-center gap-2 px-4 py-2.5 bg-[hsl(215,70%,22%)] text-white rounded text-sm font-semibold hover:bg-[hsl(215,70%,18%)] transition-all disabled:opacity-40 disabled:cursor-not-allowed shrink-0">
                  <Icon name="Plus" size={15} />Добавить
                </button>
              </div>

              {/* Cart */}
              {cart.length > 0 && (
                <div className="border border-border rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-4 py-2 border-b border-border flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Добавленные работы</span>
                    <span className="text-xs text-muted-foreground">Итого: <strong>{totalHours.toFixed(1)} н/ч</strong></span>
                  </div>
                  {cart.map((item, i) => (
                    <div key={item.workId} className={`flex items-center gap-3 px-4 py-3 ${i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}`}>
                      <Icon name="Wrench" size={13} className="text-muted-foreground shrink-0" />
                      <span className="flex-1 text-sm text-foreground">{item.workName}</span>
                      <span className="text-sm font-semibold text-[hsl(215,70%,22%)] shrink-0">{item.hours} н/ч</span>
                      <span className="text-sm text-muted-foreground shrink-0 w-28 text-right">
                        {(item.hours * ratePerHour).toLocaleString("ru-RU")} ₽
                      </span>
                      <button onClick={() => handleRemoveWork(item.workId)}
                        className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors shrink-0">
                        <Icon name="X" size={14} />
                      </button>
                    </div>
                  ))}
                  <div className="bg-blue-50 px-4 py-3 border-t border-border flex items-center justify-between">
                    <span className="text-sm font-semibold text-[hsl(215,70%,22%)]">Итого нормачасов:</span>
                    <span className="text-base font-bold text-[hsl(215,70%,22%)]">{totalHours.toFixed(1)} н/ч</span>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-1">
            <button onClick={handleCalculate} disabled={cart.length === 0}
              className="flex items-center gap-2 px-6 py-2.5 bg-[hsl(215,70%,22%)] text-white rounded text-sm font-semibold hover:bg-[hsl(215,70%,18%)] transition-all shadow-sm disabled:opacity-40 disabled:cursor-not-allowed">
              <Icon name="Calculator" size={16} />
              Рассчитать стоимость {cart.length > 0 && `(${cart.length} работ)`}
            </button>
            {(cart.length > 0 || showResult) && (
              <button onClick={handleReset}
                className="flex items-center gap-2 px-4 py-2.5 rounded text-sm font-medium text-muted-foreground border border-border hover:bg-gray-50 transition-all">
                <Icon name="RotateCcw" size={14} />Сбросить
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Result */}
      {showResult && cart.length > 0 && (
        <div className="animate-scale-in">
          <div className="bg-white rounded-lg border border-border shadow-sm overflow-hidden">
            <div className="bg-[hsl(215,70%,22%)] px-6 py-4 flex items-center gap-2">
              <Icon name="FileText" size={18} className="text-white" />
              <h3 className="font-semibold text-sm uppercase tracking-wider text-white">Результат расчёта</h3>
            </div>
            <div className="p-6 space-y-5">
              {/* Header info */}
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
                <div className="bg-[hsl(215,70%,22%)] px-4 py-2.5 grid grid-cols-12 gap-2 text-xs font-semibold text-white">
                  <span className="col-span-6">Работа</span>
                  <span className="col-span-2 text-center">Н/ч</span>
                  <span className="col-span-2 text-right">Без наценки</span>
                  <span className="col-span-2 text-right">+20%</span>
                </div>
                {cart.map((item, i) => (
                  <div key={item.workId} className={`px-4 py-3 grid grid-cols-12 gap-2 text-sm ${i % 2 === 0 ? "bg-white" : "bg-gray-50"}`}>
                    <span className="col-span-6 text-foreground">{item.workName}</span>
                    <span className="col-span-2 text-center font-semibold text-[hsl(215,70%,22%)]">{item.hours}</span>
                    <span className="col-span-2 text-right text-green-700 font-medium">{(item.hours * ratePerHour).toLocaleString("ru-RU")} ₽</span>
                    <span className="col-span-2 text-right text-orange-600 font-medium">{(item.hours * ratePerHour * 1.2).toLocaleString("ru-RU")} ₽</span>
                  </div>
                ))}
                <div className="px-4 py-3 bg-gray-100 border-t border-border grid grid-cols-12 gap-2 text-sm font-bold">
                  <span className="col-span-6 text-foreground">ИТОГО</span>
                  <span className="col-span-2 text-center text-[hsl(215,70%,22%)]">{totalHours.toFixed(1)}</span>
                  <span className="col-span-2 text-right text-green-700">{totalCost.toLocaleString("ru-RU")} ₽</span>
                  <span className="col-span-2 text-right text-orange-600">{totalCostMarkup.toLocaleString("ru-RU")} ₽</span>
                </div>
              </div>

              {/* Summary cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  <p className="text-xs text-green-600 mt-1">{totalHours.toFixed(1)} н/ч × {ratePerHour.toLocaleString("ru-RU")} ₽/н.ч.</p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Icon name="Info" size={13} />
                <span>Расчёты сохранены в истории</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalculatorPage;
