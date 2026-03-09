import { useState, useMemo } from "react";
import { useAppData, WorkFilterParam } from "@/pages/Index";
import { HistoryItem } from "@/pages/Index";
import { CartItem, CONSUMABLES_PCT, recalcCart, getApplicableLinks } from "@/components/calculator/calculatorUtils";
import CarSelector from "@/components/calculator/CarSelector";
import WorksCart from "@/components/calculator/WorksCart";
import CalculationResult from "@/components/calculator/CalculationResult";

interface Props {
  onAddToHistory: (item: Omit<HistoryItem, "id" | "date">) => void;
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
  const modification = useMemo(() => {
    const allMods = generation?.modifications ?? [];
    const modsA = filterEngineType ? allMods.filter((m) => m.engineType === filterEngineType) : allMods;
    const modsB = filterEngineCode ? modsA.filter((m) => m.engineCode === filterEngineCode) : modsA;
    const modsC = filterTransmission ? modsB.filter((m) => m.transmission === filterTransmission) : modsB;
    const modsD = filterDrive ? modsC.filter((m) => m.driveType === filterDrive) : modsC;
    return modsD.find((m) => m.id === modificationId);
  }, [generation, filterEngineType, filterEngineCode, filterTransmission, filterDrive, modificationId]);

  const works = useMemo(() => (modification?.works ?? []).filter((w) => w.hours > 0), [modification]);

  const blockedWorkNames = useMemo(() => {
    if (!modification || workFilters.length === 0) return new Set<string>();
    const blocked = new Set<string>();
    workFilters.forEach((wf) => {
      const activeRules = wf.rules.filter((r) => r.allowedValues.length > 0);
      if (activeRules.length === 0) return;
      const isBlocked = activeRules.some((r) => {
        const modVal = String((modification as Record<string, unknown>)[r.param as WorkFilterParam] ?? "").trim();
        if (!modVal || modVal === "—") return false;
        return !r.allowedValues.includes(modVal);
      });
      if (isBlocked) blocked.add(wf.workName);
    });
    return blocked;
  }, [modification, workFilters]);

  const applicableLinks = useMemo(
    () => getApplicableLinks(workLinks, brandId, modelId),
    [workLinks, brandId, modelId]
  );

  const cart = useMemo(() => recalcCart(rawCart, applicableLinks, works), [rawCart, applicableLinks, works]);

  const totalHours = cart.filter((c) => !c.isLinkedChild).reduce((s, c) => s + c.hours, 0);
  const totalCost = totalHours * ratePerHour;
  void totalCost;
  void CONSUMABLES_PCT;

  const resetFilters = () => { setFilterEngineType(""); setFilterEngineCode(""); setFilterTransmission(""); setFilterDrive(""); setModificationId(""); };

  const handleBranchChange = (v: string) => {
    setBranchId(v); setRawCart([]); setShowResult(false); setHiding(false);
  };
  const handleBrandChange = (v: string) => { setBrandId(v); setModelId(""); setGenerationId(""); resetFilters(); setWorkId(""); setRawCart([]); setShowResult(false); setHiding(false); };
  const handleModelChange = (v: string) => { setModelId(v); setGenerationId(""); resetFilters(); setWorkId(""); setRawCart([]); setShowResult(false); setHiding(false); };
  const handleGenerationChange = (v: string) => { setGenerationId(v); resetFilters(); setWorkId(""); setRawCart([]); setShowResult(false); setHiding(false); };
  const handleFilterEngineType = (v: string) => { setFilterEngineType(v); setFilterEngineCode(""); setFilterTransmission(""); setFilterDrive(""); setModificationId(""); setWorkId(""); setRawCart([]); setShowResult(false); setHiding(false); };
  const handleFilterEngineCode = (v: string) => { setFilterEngineCode(v); setFilterTransmission(""); setFilterDrive(""); setModificationId(""); setWorkId(""); setRawCart([]); setShowResult(false); setHiding(false); };
  const handleFilterTransmission = (v: string) => { setFilterTransmission(v); setFilterDrive(""); setModificationId(""); setWorkId(""); setRawCart([]); setShowResult(false); setHiding(false); };
  const handleFilterDrive = (v: string) => { setFilterDrive(v); setModificationId(""); setWorkId(""); setRawCart([]); setShowResult(false); setHiding(false); };
  const handleModChange = (v: string) => { setModificationId(v); setWorkId(""); setRawCart([]); setShowResult(false); setHiding(false); };

  const handleAddWork = () => {
    const selectedWork = works.find((w) => w.id === workId);
    if (!selectedWork || rawCart.some((c) => c.workId === workId)) return;
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

      {/* Форма */}
      <div className={hiding ? "animate-slide-up-out pointer-events-none" : showResult ? "hidden" : ""}>
        <div className="space-y-5">
          <CarSelector
            branchId={branchId}
            brandId={brandId}
            modelId={modelId}
            generationId={generationId}
            filterEngineType={filterEngineType}
            filterEngineCode={filterEngineCode}
            filterTransmission={filterTransmission}
            filterDrive={filterDrive}
            modificationId={modificationId}
            onBranchChange={handleBranchChange}
            onBrandChange={handleBrandChange}
            onModelChange={handleModelChange}
            onGenerationChange={handleGenerationChange}
            onFilterEngineType={handleFilterEngineType}
            onFilterEngineCode={handleFilterEngineCode}
            onFilterTransmission={handleFilterTransmission}
            onFilterDrive={handleFilterDrive}
            onModChange={handleModChange}
            ratePerHour={ratePerHour}
            activeBranches={activeBranches}
            selectedBranch={selectedBranch}
            modification={modification}
            works={works}
            blockedWorkNames={blockedWorkNames}
          />

          <WorksCart
            modificationId={modificationId}
            works={works}
            blockedWorkNames={blockedWorkNames}
            rawCart={rawCart}
            cart={cart}
            workId={workId}
            brandId={brandId}
            modelId={modelId}
            ratePerHour={ratePerHour}
            carReady={!!carReady}
            totalHours={totalHours}
            onWorkIdChange={(v) => { setWorkId(v); setShowResult(false); }}
            onAddWork={handleAddWork}
            onRemoveWork={handleRemoveWork}
            onCalculate={handleCalculate}
            onReset={handleReset}
          />
        </div>
      </div>

      {/* Результат */}
      {showResult && cart.length > 0 && (
        <CalculationResult
          cart={cart}
          works={works}
          ratePerHour={ratePerHour}
          brandId={brandId}
          modelId={modelId}
          brandName={brand?.name ?? ""}
          modelName={model?.name ?? ""}
          generationName={generation?.name ?? ""}
          modification={modification}
          branchName={selectedBranch?.name ?? ""}
          onBackToEdit={handleBackToEdit}
          onReset={handleReset}
        />
      )}
    </div>
  );
};

export default CalculatorPage;
