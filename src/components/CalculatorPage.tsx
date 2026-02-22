import { useState, useMemo } from "react";
import { Work } from "@/data/carDatabase";
import { useAppData } from "@/pages/Index";
import Icon from "@/components/ui/icon";
import { HistoryItem } from "@/pages/Index";

interface Props {
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

const CalculatorPage = ({ onAddToHistory }: Props) => {
  const { carDatabase, branches, defaultRate } = useAppData();

  const [branchId, setBranchId] = useState("");
  const [brandId, setBrandId] = useState("");
  const [modelId, setModelId] = useState("");
  const [generationId, setGenerationId] = useState("");
  const [modificationId, setModificationId] = useState("");
  const [workId, setWorkId] = useState("");
  const [result, setResult] = useState<Work | null>(null);
  const [calculated, setCalculated] = useState(false);

  const activeBranches = useMemo(() => branches.filter((b) => b.active), [branches]);
  const selectedBranch = useMemo(() => branches.find((b) => b.id === branchId), [branches, branchId]);
  const ratePerHour = selectedBranch?.rate ?? defaultRate;

  const brand = useMemo(() => carDatabase.find((b) => b.id === brandId), [carDatabase, brandId]);
  const model = useMemo(() => brand?.models.find((m) => m.id === modelId), [brand, modelId]);
  const generation = useMemo(() => model?.generations.find((g) => g.id === generationId), [model, generationId]);
  const modification = useMemo(() => generation?.modifications.find((m) => m.id === modificationId), [generation, modificationId]);
  const works = useMemo(() => modification?.works ?? [], [modification]);

  const reset = () => {
    setBranchId(""); setBrandId(""); setModelId(""); setGenerationId(""); setModificationId("");
    setWorkId(""); setResult(null); setCalculated(false);
  };

  const handleBranchChange = (v: string) => { setBranchId(v); setBrandId(""); setModelId(""); setGenerationId(""); setModificationId(""); setWorkId(""); setCalculated(false); setResult(null); };
  const handleBrandChange = (v: string) => { setBrandId(v); setModelId(""); setGenerationId(""); setModificationId(""); setWorkId(""); setCalculated(false); setResult(null); };
  const handleModelChange = (v: string) => { setModelId(v); setGenerationId(""); setModificationId(""); setWorkId(""); setCalculated(false); setResult(null); };
  const handleGenerationChange = (v: string) => { setGenerationId(v); setModificationId(""); setWorkId(""); setCalculated(false); setResult(null); };
  const handleModChange = (v: string) => { setModificationId(v); setWorkId(""); setCalculated(false); setResult(null); };

  const canCalculate = branchId && brandId && modelId && generationId && modificationId && workId;

  const handleCalculate = () => {
    const work = works.find((w) => w.id === workId);
    if (!work || !brand || !model || !generation || !modification) return;
    setResult(work);
    setCalculated(true);

    const carStr = `${brand.name} ${model.name} ${generation.name} ${modification.name}`;
    const costWithParts = work.hours * ratePerHour;
    const costWithMarkup = work.hours * ratePerHour * 1.2;

    onAddToHistory({ car: carStr, part: work.name, hours: work.hours, ratePerHour, costWithParts, costWithMarkup });
  };

  const costWithParts = result ? result.hours * ratePerHour : 0;
  const costWithMarkup = result ? result.hours * ratePerHour * 1.2 : 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-montserrat font-bold text-2xl text-foreground">Калькулятор стоимости работ</h2>
        <p className="text-muted-foreground text-sm mt-1">Выберите филиал, автомобиль и работу — нормачасы подставятся автоматически</p>
      </div>

      {/* Branch selection */}
      <div className="bg-white rounded-lg border border-border shadow-sm">
        <div className="px-6 py-4 border-b border-border flex items-center gap-2">
          <Icon name="Building2" size={18} className="text-[hsl(215,70%,22%)]" />
          <h3 className="font-semibold text-sm uppercase tracking-wider text-foreground">Выбор филиала обслуживания</h3>
        </div>
        <div className="p-6">
          {activeBranches.length === 0 ? (
            <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-700 text-sm">
              <Icon name="AlertTriangle" size={16} className="shrink-0" />
              Нет активных филиалов. Добавьте их в панели администратора.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {activeBranches.map((b) => (
                <button
                  key={b.id}
                  onClick={() => handleBranchChange(b.id)}
                  className={`text-left p-4 rounded-lg border-2 transition-all ${
                    branchId === b.id
                      ? "border-[hsl(215,70%,22%)] bg-blue-50"
                      : "border-border hover:border-[hsl(215,70%,40%)] hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 mb-1">
                      <div className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 ${branchId === b.id ? "bg-[hsl(215,70%,22%)]" : "bg-gray-200"}`}>
                        <Icon name="Building2" size={14} className={branchId === b.id ? "text-white" : "text-gray-500"} />
                      </div>
                      <span className={`font-semibold text-sm ${branchId === b.id ? "text-[hsl(215,70%,22%)]" : "text-foreground"}`}>{b.name}</span>
                    </div>
                    {branchId === b.id && <Icon name="CheckCircle" size={16} className="text-[hsl(215,70%,22%)] shrink-0 mt-0.5" />}
                  </div>
                  {b.address && <p className="text-xs text-muted-foreground mt-1">{b.address}</p>}
                  <p className="text-xs font-semibold text-[hsl(25,95%,50%)] mt-2">{b.rate.toLocaleString("ru-RU")} ₽/н.ч.</p>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Car selection */}
      <div className={`bg-white rounded-lg border border-border shadow-sm ${!branchId ? "opacity-50 pointer-events-none" : ""}`}>
        <div className="px-6 py-4 border-b border-border flex items-center gap-2">
          <Icon name="Car" size={18} className="text-[hsl(215,70%,22%)]" />
          <h3 className="font-semibold text-sm uppercase tracking-wider text-foreground">Выбор автомобиля</h3>
        </div>
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <SelectBox
            label="Марка"
            value={brandId}
            onChange={handleBrandChange}
            options={carDatabase.map((b) => ({ id: b.id, label: b.name }))}
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
            onChange={handleModChange}
            options={generation?.modifications.map((m) => ({ id: m.id, label: m.name })) || []}
            placeholder="— Выберите модификацию —"
            disabled={!generationId}
          />
        </div>

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
            <div className="flex items-center gap-2">
              <Icon name="Wrench" size={14} className="text-[hsl(215,70%,22%)]" />
              <span className="text-xs text-muted-foreground">Работ в базе:</span>
              <span className="text-xs font-semibold">{works.length}</span>
            </div>
          </div>
        )}
      </div>

      {/* Work selection */}
      <div className={`bg-white rounded-lg border border-border shadow-sm ${!branchId ? "opacity-50 pointer-events-none" : ""}`}>
        <div className="px-6 py-4 border-b border-border flex items-center gap-2">
          <Icon name="Wrench" size={18} className="text-[hsl(215,70%,22%)]" />
          <h3 className="font-semibold text-sm uppercase tracking-wider text-foreground">Выбор работы</h3>
        </div>
        <div className="p-6">
          {!modificationId ? (
            <div className="flex items-center gap-3 p-4 bg-gray-50 border border-border rounded-lg text-muted-foreground text-sm">
              <Icon name="Info" size={16} className="shrink-0" />
              <span>Сначала выберите марку, модель, поколение и модификацию автомобиля</span>
            </div>
          ) : works.length === 0 ? (
            <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-700 text-sm">
              <Icon name="AlertTriangle" size={16} className="shrink-0" />
              <span>Для этой модификации нет работ в базе. Загрузите данные в панели администратора.</span>
            </div>
          ) : (
            <SelectBox
              label="Наименование работы"
              value={workId}
              onChange={(v) => { setWorkId(v); setCalculated(false); setResult(null); }}
              options={works.map((w) => ({ id: w.id, label: `${w.name} (${w.hours} н/ч)` }))}
              placeholder="— Выберите работу —"
            />
          )}
        </div>

        <div className="px-6 pb-6 flex gap-3">
          <button
            onClick={handleCalculate}
            disabled={!canCalculate}
            className={`flex items-center gap-2 px-6 py-2.5 rounded text-sm font-semibold transition-all ${
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
              onClick={reset}
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
              <div className="mb-5 pb-5 border-b border-border flex flex-wrap gap-6">
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
              </div>
              <div className="mb-5 pb-5 border-b border-border">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Вид работы</p>
                <p className="font-semibold text-foreground">{result.name}</p>
              </div>

              <div className="mb-6 inline-flex items-center gap-3 bg-blue-50 border border-blue-100 rounded-md px-5 py-3">
                <Icon name="Clock" size={20} className="text-[hsl(215,70%,22%)]" />
                <div>
                  <p className="text-xs text-muted-foreground">Нормачасов (норматив для данной модификации)</p>
                  <p className="text-2xl font-bold font-montserrat text-[hsl(215,70%,22%)]">{result.hours} н/ч</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-5">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-orange-700 mb-1">Запчасти клиента</p>
                      <p className="text-xs text-orange-600">С наценкой +20%. Сокращённая гарантия на работы до 3 месяцев и без гарантии на запчасти клиента!</p>
                    </div>
                    <Icon name="TrendingUp" size={18} className="text-orange-600 mt-0.5 shrink-0" />
                  </div>
                  <p className="text-3xl font-bold font-montserrat text-orange-700 mt-3">
                    {costWithMarkup.toLocaleString("ru-RU")} ₽
                  </p>
                  <p className="text-xs text-orange-600 mt-1">
                    {costWithParts.toLocaleString("ru-RU")} ₽ + 20% = {(costWithMarkup - costWithParts).toLocaleString("ru-RU")} ₽
                  </p>
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
                    {costWithParts.toLocaleString("ru-RU")} ₽
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    {result.hours} н/ч × {ratePerHour.toLocaleString("ru-RU")} ₽
                  </p>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                <Icon name="Info" size={13} />
                <span>
                  Ставка филиала «{selectedBranch?.name}»: <strong>{ratePerHour.toLocaleString("ru-RU")} ₽/н.ч</strong> · Расчёт сохранён в истории
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalculatorPage;
