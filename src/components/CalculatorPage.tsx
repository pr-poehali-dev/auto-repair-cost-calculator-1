import { useState, useMemo } from "react";
import { CAR_DATABASE, SPARE_PARTS, SparePartWork } from "@/data/carDatabase";
import Icon from "@/components/ui/icon";
import { HistoryItem } from "@/pages/Index";

interface Props {
  ratePerHour: number;
  onAddToHistory: (item: Omit<HistoryItem, "id" | "date">) => void;
}

const SelectBox = ({
  label,
  value,
  onChange,
  options,
  placeholder,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { id: string; label: string }[];
  placeholder: string;
  disabled?: boolean;
}) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
      {label}
    </label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className={`w-full border border-border rounded px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[hsl(215,70%,22%)] focus:border-transparent transition-all ${
        disabled ? "opacity-40 cursor-not-allowed bg-gray-50" : "cursor-pointer hover:border-[hsl(215,70%,40%)]"
      }`}
    >
      <option value="">{placeholder}</option>
      {options.map((o) => (
        <option key={o.id} value={o.id}>
          {o.label}
        </option>
      ))}
    </select>
  </div>
);

const CalculatorPage = ({ ratePerHour, onAddToHistory }: Props) => {
  const [brandId, setBrandId] = useState("");
  const [modelId, setModelId] = useState("");
  const [generationId, setGenerationId] = useState("");
  const [modificationId, setModificationId] = useState("");
  const [partCategory, setPartCategory] = useState("");
  const [partId, setPartId] = useState("");
  const [result, setResult] = useState<SparePartWork | null>(null);
  const [calculated, setCalculated] = useState(false);

  const brand = useMemo(() => CAR_DATABASE.find((b) => b.id === brandId), [brandId]);
  const model = useMemo(() => brand?.models.find((m) => m.id === modelId), [brand, modelId]);
  const generation = useMemo(() => model?.generations.find((g) => g.id === generationId), [model, generationId]);
  const modification = useMemo(() => generation?.modifications.find((m) => m.id === modificationId), [generation, modificationId]);

  const categories = useMemo(() => [...new Set(SPARE_PARTS.map((p) => p.category))], []);
  const partsInCategory = useMemo(
    () => SPARE_PARTS.filter((p) => p.category === partCategory),
    [partCategory]
  );

  const handleBrandChange = (v: string) => {
    setBrandId(v); setModelId(""); setGenerationId(""); setModificationId("");
    setCalculated(false); setResult(null);
  };
  const handleModelChange = (v: string) => {
    setModelId(v); setGenerationId(""); setModificationId("");
    setCalculated(false); setResult(null);
  };
  const handleGenerationChange = (v: string) => {
    setGenerationId(v); setModificationId("");
    setCalculated(false); setResult(null);
  };
  const handleCategoryChange = (v: string) => {
    setPartCategory(v); setPartId("");
    setCalculated(false); setResult(null);
  };

  const canCalculate = brandId && modelId && generationId && modificationId && partId;

  const handleCalculate = () => {
    const part = SPARE_PARTS.find((p) => p.id === partId);
    if (!part || !brand || !model || !generation || !modification) return;
    setResult(part);
    setCalculated(true);

    const carStr = `${brand.name} ${model.name} ${generation.name} ${modification.name}`;
    const costWithParts = part.hours * ratePerHour;
    const costWithMarkup = part.hours * ratePerHour * 1.2;

    onAddToHistory({
      car: carStr,
      part: part.name,
      hours: part.hours,
      ratePerHour,
      costWithParts,
      costWithMarkup,
    });
  };

  const handleReset = () => {
    setBrandId(""); setModelId(""); setGenerationId(""); setModificationId("");
    setPartCategory(""); setPartId(""); setResult(null); setCalculated(false);
  };

  const costWithParts = result ? result.hours * ratePerHour : 0;
  const costWithMarkup = result ? result.hours * ratePerHour * 1.2 : 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-montserrat font-bold text-2xl text-foreground">Калькулятор стоимости работ</h2>
        <p className="text-muted-foreground text-sm mt-1">Выберите автомобиль и запчасть для расчёта стоимости замены</p>
      </div>

      {/* Car selection */}
      <div className="bg-white rounded-lg border border-border shadow-sm">
        <div className="px-6 py-4 border-b border-border flex items-center gap-2">
          <Icon name="Car" size={18} className="text-[hsl(215,70%,22%)]" />
          <h3 className="font-semibold text-sm uppercase tracking-wider text-foreground">Выбор автомобиля</h3>
        </div>
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <SelectBox
            label="Марка"
            value={brandId}
            onChange={handleBrandChange}
            options={CAR_DATABASE.map((b) => ({ id: b.id, label: b.name }))}
            placeholder="— Выберите марку —"
          />
          <SelectBox
            label="Модель"
            value={modelId}
            onChange={handleModelChange}
            options={brand?.models.map((m) => ({ id: m.id, label: m.name })) || []}
            placeholder="— Выберите модель —"
            disabled={!brandId}
          />
          <SelectBox
            label="Поколение"
            value={generationId}
            onChange={handleGenerationChange}
            options={model?.generations.map((g) => ({ id: g.id, label: `${g.name} (${g.years})` })) || []}
            placeholder="— Выберите поколение —"
            disabled={!modelId}
          />
          <SelectBox
            label="Модификация"
            value={modificationId}
            onChange={(v) => { setModificationId(v); setCalculated(false); setResult(null); }}
            options={generation?.modifications.map((m) => ({ id: m.id, label: m.name })) || []}
            placeholder="— Выберите модификацию —"
            disabled={!generationId}
          />
        </div>

        {/* Modification details */}
        {modification && (
          <div className="mx-6 mb-6 p-4 bg-blue-50 border border-blue-100 rounded-md flex flex-wrap gap-6 animate-fade-in">
            <div className="flex items-center gap-2">
              <Icon name="Zap" size={14} className="text-[hsl(215,70%,22%)]" />
              <span className="text-xs text-muted-foreground">Двигатель:</span>
              <span className="text-xs font-semibold">{modification.engine}</span>
            </div>
            <div className="flex items-center gap-2">
              <Icon name="Settings2" size={14} className="text-[hsl(215,70%,22%)]" />
              <span className="text-xs text-muted-foreground">КПП:</span>
              <span className="text-xs font-semibold">{modification.transmission}</span>
            </div>
            <div className="flex items-center gap-2">
              <Icon name="Gauge" size={14} className="text-[hsl(215,70%,22%)]" />
              <span className="text-xs text-muted-foreground">Мощность:</span>
              <span className="text-xs font-semibold">{modification.power}</span>
            </div>
          </div>
        )}
      </div>

      {/* Part selection */}
      <div className="bg-white rounded-lg border border-border shadow-sm">
        <div className="px-6 py-4 border-b border-border flex items-center gap-2">
          <Icon name="Wrench" size={18} className="text-[hsl(215,70%,22%)]" />
          <h3 className="font-semibold text-sm uppercase tracking-wider text-foreground">Выбор работы</h3>
        </div>
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <SelectBox
            label="Категория"
            value={partCategory}
            onChange={handleCategoryChange}
            options={categories.map((c) => ({ id: c, label: c }))}
            placeholder="— Выберите категорию —"
          />
          <SelectBox
            label="Наименование работы"
            value={partId}
            onChange={(v) => { setPartId(v); setCalculated(false); setResult(null); }}
            options={partsInCategory.map((p) => ({ id: p.id, label: p.name }))}
            placeholder="— Выберите работу —"
            disabled={!partCategory}
          />
        </div>
        <div className="px-6 pb-6 flex gap-3">
          <button
            onClick={handleCalculate}
            disabled={!canCalculate}
            className={`flex items-center gap-2 px-6 py-2.5 rounded text-sm font-semibold transition-all duration-200 ${
              canCalculate
                ? "bg-[hsl(215,70%,22%)] text-white hover:bg-[hsl(215,70%,18%)] shadow-sm hover:shadow-md"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
          >
            <Icon name="Calculator" size={16} />
            Рассчитать стоимость
          </button>
          {calculated && (
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-4 py-2.5 rounded text-sm font-medium text-muted-foreground border border-border hover:bg-gray-50 transition-all"
            >
              <Icon name="RotateCcw" size={14} />
              Сбросить
            </button>
          )}
        </div>
      </div>

      {/* Result */}
      {calculated && result && (
        <div className="animate-scale-in">
          <div className="bg-white rounded-lg border border-border shadow-sm overflow-hidden">
            <div className="bg-[hsl(215,70%,22%)] px-6 py-4 flex items-center gap-2">
              <Icon name="FileText" size={18} className="text-white" />
              <h3 className="font-semibold text-sm uppercase tracking-wider text-white">Результат расчёта</h3>
            </div>
            <div className="p-6">
              {/* Car info */}
              <div className="mb-5 pb-5 border-b border-border">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Автомобиль</p>
                <p className="font-semibold text-foreground">
                  {brand?.name} {model?.name} {generation?.name} · {modification?.name}
                </p>
              </div>
              <div className="mb-5 pb-5 border-b border-border">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Вид работы</p>
                <p className="font-semibold text-foreground">{result.name}</p>
              </div>

              {/* Hours */}
              <div className="mb-6 inline-flex items-center gap-3 bg-blue-50 border border-blue-100 rounded-md px-5 py-3">
                <Icon name="Clock" size={20} className="text-[hsl(215,70%,22%)]" />
                <div>
                  <p className="text-xs text-muted-foreground">Нормачасов</p>
                  <p className="text-2xl font-bold font-montserrat text-[hsl(215,70%,22%)]">{result.hours} н/ч</p>
                </div>
              </div>

              {/* Price cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-5">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-green-700 mb-1">
                        Со своими запчастями
                      </p>
                      <p className="text-xs text-green-600">Клиент использует запчасти автотехцентра</p>
                    </div>
                    <Icon name="Package" size={18} className="text-green-600 mt-0.5" />
                  </div>
                  <p className="text-3xl font-bold font-montserrat text-green-700 mt-3">
                    {costWithParts.toLocaleString("ru-RU")} ₽
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    {result.hours} н/ч × {ratePerHour.toLocaleString("ru-RU")} ₽
                  </p>
                </div>

                <div className="bg-orange-50 border border-orange-200 rounded-lg p-5">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-orange-700 mb-1">
                        С наценкой +20%
                      </p>
                      <p className="text-xs text-orange-600">Клиент использует сторонние запчасти</p>
                    </div>
                    <Icon name="TrendingUp" size={18} className="text-orange-600 mt-0.5" />
                  </div>
                  <p className="text-3xl font-bold font-montserrat text-orange-700 mt-3">
                    {costWithMarkup.toLocaleString("ru-RU")} ₽
                  </p>
                  <p className="text-xs text-orange-600 mt-1">
                    {costWithParts.toLocaleString("ru-RU")} ₽ + 20% = {(costWithMarkup - costWithParts).toLocaleString("ru-RU")} ₽
                  </p>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                <Icon name="Info" size={13} />
                <span>Базовая ставка нормачаса: <strong>{ratePerHour.toLocaleString("ru-RU")} ₽</strong> · Расчёт выполнен и сохранён в истории</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalculatorPage;
