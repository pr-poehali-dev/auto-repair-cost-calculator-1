import { useMemo, useEffect } from "react";
import Icon from "@/components/ui/icon";
import { useAppData, WorkFilterParam } from "@/pages/Index";
import { SelectBox } from "@/components/calculator/calculatorUtils";
import type { Modification } from "@/data/carDatabase";

interface Branch {
  id: string;
  name: string;
  rate: number;
  active: boolean;
}

interface CarSelectorProps {
  branchId: string;
  brandId: string;
  modelId: string;
  generationId: string;
  filterEngineType: string;
  filterEngineCode: string;
  filterTransmission: string;
  filterDrive: string;
  modificationId: string;
  onBranchChange: (v: string) => void;
  onBrandChange: (v: string) => void;
  onModelChange: (v: string) => void;
  onGenerationChange: (v: string) => void;
  onFilterEngineType: (v: string) => void;
  onFilterEngineCode: (v: string) => void;
  onFilterTransmission: (v: string) => void;
  onFilterDrive: (v: string) => void;
  onModChange: (v: string) => void;
  ratePerHour: number;
  activeBranches: Branch[];
  selectedBranch: Branch | undefined;
  modification: Modification | undefined;
  works: { id: string; name: string; hours: number }[];
  blockedWorkNames: Set<string>;
}

export default function CarSelector({
  branchId, brandId, modelId, generationId,
  filterEngineType, filterEngineCode, filterTransmission, filterDrive,
  modificationId,
  onBranchChange, onBrandChange, onModelChange, onGenerationChange,
  onFilterEngineType, onFilterEngineCode, onFilterTransmission, onFilterDrive,
  onModChange,
  ratePerHour, activeBranches, selectedBranch,
  modification, works, blockedWorkNames,
}: CarSelectorProps) {
  const { carDatabase, loadModifications, modsLoading } = useAppData();

  const brand = useMemo(() => carDatabase.find((b) => b.id === brandId), [carDatabase, brandId]);
  const model = useMemo(() => brand?.models.find((m) => m.id === modelId), [brand, modelId]);
  const generation = useMemo(() => model?.generations.find((g) => g.id === generationId), [model, generationId]);

  useEffect(() => {
    if (generationId) loadModifications(generationId);
  }, [generationId, loadModifications]);

  useEffect(() => {
    if (brandId && !carDatabase.find((b) => b.id === brandId)) { onBrandChange(""); return; }
    if (carDatabase.length === 1 && !brandId) onBrandChange(carDatabase[0].id);
  }, [carDatabase, brandId]);

  useEffect(() => {
    if (modelId && brand && !brand.models.find((m) => m.id === modelId)) { onModelChange(""); return; }
    if (brand && brand.models.length === 1 && !modelId) onModelChange(brand.models[0].id);
  }, [brand, modelId]);

  useEffect(() => {
    if (generationId && model && !model.generations.find((g) => g.id === generationId)) { onGenerationChange(""); return; }
    if (model && model.generations.length === 1 && !generationId) onGenerationChange(model.generations[0].id);
  }, [model, generationId]);

  const allMods = useMemo(() => generation?.modifications ?? [], [generation]);

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

  useEffect(() => {
    if (!generationId || modsLoading) return;
    if (filterEngineType && !engineTypeOptions.find((o) => o.id === filterEngineType)) { onFilterEngineType(""); return; }
    if (engineTypeOptions.length === 1 && !filterEngineType) onFilterEngineType(engineTypeOptions[0].id);
  }, [engineTypeOptions, filterEngineType, generationId, modsLoading]);

  useEffect(() => {
    if (!generationId || modsLoading) return;
    if (filterEngineCode && !engineCodeOptions.find((o) => o.id === filterEngineCode)) { onFilterEngineCode(""); return; }
    if (engineCodeOptions.length === 1 && !filterEngineCode) onFilterEngineCode(engineCodeOptions[0].id);
  }, [engineCodeOptions, filterEngineCode, generationId, modsLoading]);

  useEffect(() => {
    if (!generationId || modsLoading) return;
    if (filterTransmission && !transmissionOptions.find((o) => o.id === filterTransmission)) { onFilterTransmission(""); return; }
    if (transmissionOptions.length === 1 && !filterTransmission) onFilterTransmission(transmissionOptions[0].id);
  }, [transmissionOptions, filterTransmission, generationId, modsLoading]);

  useEffect(() => {
    if (!generationId || modsLoading) return;
    if (filterDrive && !driveOptions.find((o) => o.id === filterDrive)) { onFilterDrive(""); return; }
    if (driveOptions.length === 1 && !filterDrive) onFilterDrive(driveOptions[0].id);
  }, [driveOptions, filterDrive, generationId, modsLoading]);

  useEffect(() => {
    if (!generationId || modsLoading) return;
    if (modificationId && !filteredMods.find((m) => m.id === modificationId)) { onModChange(""); return; }
    if (filteredMods.length === 1 && !modificationId) onModChange(filteredMods[0].id);
  }, [filteredMods, modificationId, generationId, modsLoading]);

  return (
    <>
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
                <button key={b.id} onClick={() => onBranchChange(b.id)}
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
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <SelectBox label="Марка" value={brandId} onChange={onBrandChange}
              options={carDatabase.map((b) => ({ id: b.id, label: b.name }))} placeholder="— Марка —" />
            <SelectBox label="Модель" value={modelId} onChange={onModelChange}
              options={brand?.models.map((m) => ({ id: m.id, label: m.name })) || []}
              placeholder="— Модель —" disabled={!brandId} />
            <SelectBox label="Поколение" value={generationId} onChange={onGenerationChange}
              options={model?.generations.map((g) => ({ id: g.id, label: `${g.name} (${g.years})` })) || []}
              placeholder="— Поколение —" disabled={!modelId} />
          </div>

          {generationId && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <SelectBox label="Тип двигателя" value={filterEngineType} onChange={onFilterEngineType}
                options={engineTypeOptions} placeholder="— Любой —"
                disabled={engineTypeOptions.length === 0} />
              <SelectBox label="Номер двигателя" value={filterEngineCode} onChange={onFilterEngineCode}
                options={engineCodeOptions} placeholder="— Любой —"
                disabled={engineCodeOptions.length === 0} />
              <SelectBox label="КПП" value={filterTransmission} onChange={onFilterTransmission}
                options={transmissionOptions} placeholder="— Любая —"
                disabled={transmissionOptions.length === 0} />
              <SelectBox label="Привод" value={filterDrive} onChange={onFilterDrive}
                options={driveOptions} placeholder="— Любой —"
                disabled={driveOptions.length === 0} />
            </div>
          )}

          {generationId && modsLoading && allMods.length === 0 && (
            <div className="flex items-center gap-2 py-2 text-sm text-muted-foreground">
              <div className="w-4 h-4 border-2 border-[hsl(25,95%,50%)] border-t-transparent rounded-full animate-spin" />
              Загружаю модификации...
            </div>
          )}
          {generationId && !modsLoading && allMods.length === 0 && (
            <p className="text-sm text-muted-foreground py-2">Модификации не найдены</p>
          )}
          {generationId && allMods.length > 0 && (
            <SelectBox label="Модификация" value={modificationId} onChange={onModChange}
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
    </>
  );
}
