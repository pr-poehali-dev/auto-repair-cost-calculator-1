import { useState, useMemo, useEffect } from "react";
import Icon from "@/components/ui/icon";
import { useAppData, WorkEntry, WorkFilterParam } from "@/pages/Index";
import { UploadBlock } from "@/components/admin/AdminPageUIBlocks";
import { downloadWorksTemplate, mergeWorks, parseWorksList } from "@/components/admin/adminPageHelpers";
import * as XLSX from "xlsx";

const FUNC_SAVE_NORM_HOURS = "https://functions.poehali.dev/be016d37-3b69-438d-a889-6e92b1da9882";

const SelectBox = ({
  label, value, onChange, options, placeholder, disabled,
}: {
  label: string; value: string; onChange: (v: string) => void;
  options: { id: string; label: string }[]; placeholder: string; disabled?: boolean;
}) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</label>
    <select value={value} onChange={(e) => onChange(e.target.value)} disabled={disabled}
      className={`w-full border border-border rounded px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[hsl(215,70%,22%)] transition-all ${disabled ? "opacity-40 cursor-not-allowed bg-gray-50" : "cursor-pointer hover:border-[hsl(215,70%,40%)]"}`}>
      <option value="">{placeholder}</option>
      {options.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
    </select>
  </div>
);

const TabEditor = () => {
  const { carDatabase, setCarDatabase, worksDatabase, setWorksDatabase, loadModifications, modsLoading, workFilters } = useAppData();

  // ── Загрузка списка работ из Excel ─────────────────────────────────────────
  const [worksStatus, setWorksStatus] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const parseWorksFile = (file: File, onResult: (w: WorkEntry[]) => void, onError: (m: string) => void) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = new Uint8Array(ev.target!.result as ArrayBuffer);
        const wb = XLSX.read(data, { type: "array" });
        const rows: Record<string, unknown>[] = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { defval: "" });
        const works = parseWorksList(rows);
        if (!works) onError("Файл пустой или не содержит работ.");
        else onResult(works);
      } catch { onError("Ошибка чтения файла."); }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleWorksFile = (file: File) => parseWorksFile(file, (works) => {
    setWorksDatabase(works);
    setWorksStatus({ type: "success", msg: `Загружено ${works.length} видов работ из «${file.name}»` });
  }, (msg) => setWorksStatus({ type: "error", msg }));

  const handleWorksUpdate = (file: File) => parseWorksFile(file, (incoming) => {
    const merged = mergeWorks(worksDatabase, incoming);
    const added = merged.length - worksDatabase.length;
    setWorksDatabase(merged);
    setWorksStatus({ type: "success", msg: `Добавлено ${added} новых работ, итого ${merged.length}.` });
  }, (msg) => setWorksStatus({ type: "error", msg }));

  const handleExportWorksCsv = () => {
    if (worksDatabase.length === 0) return;
    const lines = ["Наименование работы", ...worksDatabase.map((w) => w.name)];
    const csv = "\uFEFF" + lines.join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "список_работ.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  // ── Норма-часы по модификации ──────────────────────────────────────────────
  const [brandId, setBrandId] = useState("");
  const [modelId, setModelId] = useState("");
  const [genId, setGenId] = useState("");
  const [modId, setModId] = useState("");
  const [saved, setSaved] = useState(false);
  const [hoursMap, setHoursMap] = useState<Record<string, string>>({});

  const [filterEngineType, setFilterEngineType] = useState("");
  const [filterEngineCode, setFilterEngineCode] = useState("");
  const [filterTransmission, setFilterTransmission] = useState("");
  const [filterDrive, setFilterDrive] = useState("");
  const [loadingHours, setLoadingHours] = useState(false);
  const [savingHours, setSavingHours] = useState(false);

  const brand = useMemo(() => carDatabase.find((b) => b.id === brandId), [carDatabase, brandId]);
  const model = useMemo(() => brand?.models.find((m) => m.id === modelId), [brand, modelId]);
  const gen = useMemo(() => model?.generations.find((g) => g.id === genId), [model, genId]);

  useEffect(() => {
    if (genId) loadModifications(genId);
  }, [genId, loadModifications]);

  useEffect(() => {
    if (brandId && !carDatabase.find((b) => b.id === brandId)) { setBrandId(""); return; }
    if (carDatabase.length === 1 && !brandId) setBrandId(carDatabase[0].id);
  }, [carDatabase, brandId]);

  useEffect(() => {
    if (modelId && brand && !brand.models.find((m) => m.id === modelId)) { setModelId(""); return; }
    if (brand && brand.models.length === 1 && !modelId) setModelId(brand.models[0].id);
  }, [brand, modelId]);

  useEffect(() => {
    if (genId && model && !model.generations.find((g) => g.id === genId)) { setGenId(""); return; }
    if (model && model.generations.length === 1 && !genId) setGenId(model.generations[0].id);
  }, [model, genId]);

  // Cascading filter logic (same as CalculatorPage)
  const allMods = useMemo(() => gen?.modifications ?? [], [gen]);

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
    const vals = [...new Set(modsAfterEngineCode.map((m) => m.transmission).filter((v) => v && v !== "\u2014"))] as string[];
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
    if (!genId || modsLoading) return;
    if (filterEngineType && !engineTypeOptions.find((o) => o.id === filterEngineType)) { setFilterEngineType(""); return; }
    if (engineTypeOptions.length === 1 && !filterEngineType) setFilterEngineType(engineTypeOptions[0].id);
  }, [engineTypeOptions, filterEngineType, genId, modsLoading]);

  useEffect(() => {
    if (!genId || modsLoading) return;
    if (filterEngineCode && !engineCodeOptions.find((o) => o.id === filterEngineCode)) { setFilterEngineCode(""); return; }
    if (engineCodeOptions.length === 1 && !filterEngineCode) setFilterEngineCode(engineCodeOptions[0].id);
  }, [engineCodeOptions, filterEngineCode, genId, modsLoading]);

  useEffect(() => {
    if (!genId || modsLoading) return;
    if (filterTransmission && !transmissionOptions.find((o) => o.id === filterTransmission)) { setFilterTransmission(""); return; }
    if (transmissionOptions.length === 1 && !filterTransmission) setFilterTransmission(transmissionOptions[0].id);
  }, [transmissionOptions, filterTransmission, genId, modsLoading]);

  useEffect(() => {
    if (!genId || modsLoading) return;
    if (filterDrive && !driveOptions.find((o) => o.id === filterDrive)) { setFilterDrive(""); return; }
    if (driveOptions.length === 1 && !filterDrive) setFilterDrive(driveOptions[0].id);
  }, [driveOptions, filterDrive, genId, modsLoading]);

  useEffect(() => {
    if (!genId || modsLoading) return;
    if (modId && !filteredMods.find((m) => m.id === modId)) { setModId(""); setHoursMap({}); return; }
    if (filteredMods.length === 1 && !modId) handleModChange(filteredMods[0].id);
  }, [filteredMods, modId, genId, modsLoading]);

  const mod = useMemo(() => filteredMods.find((m) => m.id === modId), [filteredMods, modId]);

  const blockedWorkNames = useMemo(() => {
    if (!mod || workFilters.length === 0) return new Set<string>();
    const blocked = new Set<string>();
    workFilters.forEach((wf) => {
      const activeRules = wf.rules.filter((r) => r.allowedValues.length > 0);
      if (activeRules.length === 0) return;
      const isBlocked = activeRules.some((r) => {
        const modVal = String((mod as Record<string, unknown>)[r.param as WorkFilterParam] ?? "").trim();
        if (!modVal || modVal === "—") return false;
        return !r.allowedValues.includes(modVal);
      });
      if (isBlocked) blocked.add(wf.workName);
    });
    return blocked;
  }, [mod, workFilters]);

  const availableWorks = useMemo(
    () => worksDatabase.filter((w) => !blockedWorkNames.has(w.name)),
    [worksDatabase, blockedWorkNames]
  );

  // Reset helpers
  const resetFilters = () => {
    setFilterEngineType("");
    setFilterEngineCode("");
    setFilterTransmission("");
    setFilterDrive("");
  };

  const handleBrandChange = (v: string) => {
    setBrandId(v); setModelId(""); setGenId(""); setModId("");
    resetFilters(); setHoursMap({}); setSaved(false);
  };
  const handleModelChange = (v: string) => {
    setModelId(v); setGenId(""); setModId("");
    resetFilters(); setHoursMap({}); setSaved(false);
  };
  const handleGenChange = (v: string) => {
    setGenId(v); setModId("");
    resetFilters(); setHoursMap({}); setSaved(false);
  };
  const handleFilterEngineType = (v: string) => {
    setFilterEngineType(v); setFilterEngineCode(""); setFilterTransmission(""); setFilterDrive("");
    setModId(""); setHoursMap({}); setSaved(false);
  };
  const handleFilterEngineCode = (v: string) => {
    setFilterEngineCode(v); setFilterTransmission(""); setFilterDrive("");
    setModId(""); setHoursMap({}); setSaved(false);
  };
  const handleFilterTransmission = (v: string) => {
    setFilterTransmission(v); setFilterDrive("");
    setModId(""); setHoursMap({}); setSaved(false);
  };
  const handleFilterDrive = (v: string) => {
    setFilterDrive(v);
    setModId(""); setHoursMap({}); setSaved(false);
  };

  const handleModChange = async (v: string) => {
    setModId(v); setSaved(false); setHoursMap({});
    if (!v) return;
    setLoadingHours(true);
    try {
      const res = await fetch(`${FUNC_SAVE_NORM_HOURS}?modification_id=${encodeURIComponent(v)}`);
      if (res.ok) {
        const raw = await res.json();
        const data = typeof raw === "string" ? JSON.parse(raw) : raw;
        if (Array.isArray(data)) {
          const map: Record<string, string> = {};
          data.forEach((item: { name: string; hours: number }) => {
            if (item.hours > 0) map[item.name] = String(item.hours);
          });
          setHoursMap(map);
        }
      }
    } catch {
      // ignore fetch errors, just leave hoursMap empty
    } finally {
      setLoadingHours(false);
    }
  };

  const handleHoursChange = (workName: string, val: string) => {
    setHoursMap((prev) => ({ ...prev, [workName]: val }));
    setSaved(false);
  };

  const handleSaveHours = async () => {
    if (!modId || !mod) return;

    const works = availableWorks
      .map((w) => {
        const hours = parseFloat(String(hoursMap[w.name]).replace(",", "."));
        if (!isNaN(hours) && hours > 0) return { name: w.name, hours };
        return null;
      })
      .filter(Boolean) as { name: string; hours: number }[];

    setSavingHours(true);
    try {
      const res = await fetch(FUNC_SAVE_NORM_HOURS, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ modification_id: modId, works }),
      });
      if (res.ok) {
        // Also update local carDatabase so it reflects the changes
        const worksList = availableWorks.map((w) => {
          const existingWork = mod.works.find((ew) => ew.name === w.name);
          const hours = parseFloat(String(hoursMap[w.name]).replace(",", "."));
          if (!isNaN(hours) && hours > 0) return { id: existingWork?.id ?? `w-${modId}-${w.id}`, name: w.name, hours };
          if (existingWork) return existingWork;
          return null;
        }).filter(Boolean) as typeof mod.works;

        setCarDatabase(carDatabase.map((b) => ({
          ...b,
          models: b.models.map((m) => ({
            ...m,
            generations: m.generations.map((g) => ({
              ...g,
              modifications: g.modifications.map((mod_) => mod_.id === modId ? { ...mod_, works: worksList } : mod_),
            })),
          })),
        })));

        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch {
      // ignore
    } finally {
      setSavingHours(false);
    }
  };

  const filledCount = availableWorks.filter((w) => {
    const v = parseFloat(String(hoursMap[w.name]).replace(",", "."));
    return !isNaN(v) && v > 0;
  }).length;

  // ── Управление списком работ ───────────────────────────────────────────────
  const [newWorkName, setNewWorkName] = useState("");
  const [addError, setAddError] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editError, setEditError] = useState("");
  const [worksSaved, setWorksSaved] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const handleAddWork = () => {
    const name = newWorkName.trim();
    if (!name) { setAddError("Введите название работы"); return; }
    if (worksDatabase.some((w) => w.name.toLowerCase() === name.toLowerCase())) {
      setAddError("Такая работа уже есть в списке"); return;
    }
    const newWork: WorkEntry = { id: `work-manual-${Date.now()}`, name };
    setWorksDatabase([...worksDatabase, newWork]);
    setNewWorkName(""); setAddError("");
    setWorksSaved(true); setTimeout(() => setWorksSaved(false), 2000);
  };

  const startEdit = (w: WorkEntry) => {
    setEditingId(w.id); setEditName(w.name); setEditError("");
  };

  const handleSaveEdit = (oldName: string) => {
    const name = editName.trim();
    if (!name) { setEditError("Название не может быть пустым"); return; }
    if (worksDatabase.some((w) => w.id !== editingId && w.name.toLowerCase() === name.toLowerCase())) {
      setEditError("Такое название уже существует"); return;
    }
    // Переименовываем в worksDatabase
    setWorksDatabase(worksDatabase.map((w) => w.id === editingId ? { ...w, name } : w));
    // Переименовываем в нормативах всех модификаций
    setCarDatabase(carDatabase.map((b) => ({
      ...b,
      models: b.models.map((m) => ({
        ...m,
        generations: m.generations.map((g) => ({
          ...g,
          modifications: g.modifications.map((mod_) => ({
            ...mod_,
            works: mod_.works.map((work) => work.name === oldName ? { ...work, name } : work),
          })),
        })),
      })),
    })));
    // Обновляем hoursMap если открыта модификация
    if (hoursMap[oldName] !== undefined) {
      setHoursMap((prev) => {
        const next = { ...prev };
        next[name] = next[oldName];
        delete next[oldName];
        return next;
      });
    }
    setEditingId(null); setEditError("");
    setWorksSaved(true); setTimeout(() => setWorksSaved(false), 2000);
  };

  const handleDeleteWork = (w: WorkEntry) => {
    if (deleteConfirm !== w.id) { setDeleteConfirm(w.id); return; }
    setWorksDatabase(worksDatabase.filter((x) => x.id !== w.id));
    // Удаляем работу из всех модификаций
    setCarDatabase(carDatabase.map((b) => ({
      ...b,
      models: b.models.map((m) => ({
        ...m,
        generations: m.generations.map((g) => ({
          ...g,
          modifications: g.modifications.map((mod_) => ({
            ...mod_,
            works: mod_.works.filter((work) => work.name !== w.name),
          })),
        })),
      })),
    })));
    setDeleteConfirm(null);
    if (editingId === w.id) { setEditingId(null); }
  };

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">Управляйте списком работ и проставляйте нормачасы для каждой модификации автомобиля.</p>

      {/* ── Загрузка списка работ из Excel ─────────────────────────────────── */}
      <UploadBlock
        title="Загрузите список работ из Excel"
        description="Один столбец — все виды работ. После загрузки работы появятся в списке ниже."
        buttonLabel="Загрузить список работ (.xlsx)"
        accept=".xlsx,.xls"
        onFile={handleWorksFile}
        onUpdate={handleWorksUpdate}
        hasData={worksDatabase.length > 0}
        onDownloadTemplate={downloadWorksTemplate}
        status={worksStatus}
      >
        <div className="flex flex-wrap gap-2 mb-3">
          <button
            onClick={handleExportWorksCsv}
            disabled={worksDatabase.length === 0}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-blue-800 bg-blue-50 border border-blue-200 hover:bg-blue-100 rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Icon name="Download" size={13} />
            Экспорт работ в CSV
          </button>
        </div>
      </UploadBlock>

      {/* ── Список работ ──────────────────────────────────────────────────── */}
      <div className="bg-white rounded-lg border border-border shadow-sm">
        <div className="px-5 py-3.5 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon name="ListChecks" size={16} className="text-[hsl(215,70%,22%)]" />
            <h3 className="font-semibold text-sm uppercase tracking-wider">Список работ</h3>
            <span className="text-xs text-muted-foreground bg-gray-100 px-2 py-0.5 rounded-full">{worksDatabase.length}</span>
          </div>
          {worksSaved && (
            <span className="flex items-center gap-1.5 text-xs text-green-600 animate-fade-in">
              <Icon name="CheckCircle" size={13} />Сохранено
            </span>
          )}
        </div>

        {/* Add new */}
        <div className="px-5 py-4 border-b border-border bg-blue-50/40">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Добавить новую работу</p>
          <div className="flex gap-3">
            <div className="flex-1">
              <input
                type="text"
                value={newWorkName}
                onChange={(e) => { setNewWorkName(e.target.value); setAddError(""); }}
                onKeyDown={(e) => { if (e.key === "Enter") handleAddWork(); }}
                placeholder="Название работы, например: Замена масла двигателя"
                className="w-full border border-border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(215,70%,22%)]"
              />
              {addError && <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><Icon name="AlertCircle" size={11} />{addError}</p>}
            </div>
            <button onClick={handleAddWork}
              className="flex items-center gap-2 px-4 py-2 bg-[hsl(215,70%,22%)] text-white rounded text-sm font-semibold hover:bg-[hsl(215,70%,18%)] transition-all shrink-0">
              <Icon name="Plus" size={15} />Добавить
            </button>
          </div>
        </div>

        {/* Works list */}
        {worksDatabase.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <Icon name="ListX" size={32} className="mx-auto mb-2 opacity-30" />
            <p className="text-sm">Список работ пуст. Добавьте работы вручную или загрузите через «Базы данных».</p>
          </div>
        ) : (
          <div className="divide-y divide-border max-h-96 overflow-y-auto">
            {worksDatabase.map((w, i) => (
              <div key={w.id} className={`flex items-center gap-3 px-5 py-3 transition-colors ${i % 2 === 0 ? "bg-white" : "bg-gray-50/50"} hover:bg-blue-50/30`}>
                {editingId === w.id ? (
                  <>
                    <div className="flex-1">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => { setEditName(e.target.value); setEditError(""); }}
                        onKeyDown={(e) => { if (e.key === "Enter") handleSaveEdit(w.name); if (e.key === "Escape") setEditingId(null); }}
                        autoFocus
                        className="w-full border border-[hsl(215,70%,22%)] rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(215,70%,22%)]"
                      />
                      {editError && <p className="mt-1 text-xs text-red-500">{editError}</p>}
                    </div>
                    <button onClick={() => handleSaveEdit(w.name)}
                      className="p-1.5 text-green-600 hover:bg-green-50 rounded transition-colors" title="Сохранить">
                      <Icon name="Check" size={14} />
                    </button>
                    <button onClick={() => setEditingId(null)}
                      className="p-1.5 text-muted-foreground hover:bg-gray-100 rounded transition-colors" title="Отмена">
                      <Icon name="X" size={14} />
                    </button>
                  </>
                ) : (
                  <>
                    <span className="flex-1 text-sm text-foreground">{w.name}</span>
                    <button onClick={() => startEdit(w)}
                      className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-gray-100 rounded transition-colors" title="Переименовать">
                      <Icon name="Pencil" size={13} />
                    </button>
                    <button
                      onClick={() => handleDeleteWork(w)}
                      className={`p-1.5 rounded transition-colors text-xs font-medium ${
                        deleteConfirm === w.id
                          ? "bg-red-500 text-white hover:bg-red-600 px-2"
                          : "text-red-400 hover:text-red-600 hover:bg-red-50"
                      }`}
                      title={deleteConfirm === w.id ? "Нажмите ещё раз для подтверждения" : "Удалить"}
                    >
                      {deleteConfirm === w.id
                        ? <span className="flex items-center gap-1"><Icon name="Trash2" size={13} />Удалить?</span>
                        : <Icon name="Trash2" size={13} />
                      }
                    </button>
                    {deleteConfirm === w.id && (
                      <button onClick={() => setDeleteConfirm(null)}
                        className="p-1.5 text-muted-foreground hover:bg-gray-100 rounded transition-colors text-xs">
                        <Icon name="X" size={13} />
                      </button>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Нормачасы по модификации ──────────────────────────────────────── */}
      <div className="bg-white rounded-lg border border-border shadow-sm">
        <div className="px-5 py-3.5 border-b border-border flex items-center gap-2">
          <Icon name="Car" size={16} className="text-[hsl(215,70%,22%)]" />
          <h3 className="font-semibold text-sm uppercase tracking-wider">Нормачасы по модификации</h3>
        </div>
        <div className="p-5 space-y-4">
          {/* Row 1: Марка, Модель, Поколение */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <SelectBox label="Марка" value={brandId} onChange={handleBrandChange}
              options={carDatabase.map((b) => ({ id: b.id, label: b.name }))} placeholder="-- Марка --" />
            <SelectBox label="Модель" value={modelId} onChange={handleModelChange}
              options={brand?.models.map((m) => ({ id: m.id, label: m.name })) || []} placeholder="-- Модель --" disabled={!brandId} />
            <SelectBox label="Поколение" value={genId} onChange={handleGenChange}
              options={model?.generations.map((g) => ({ id: g.id, label: `${g.name} (${g.years})` })) || []} placeholder="-- Поколение --" disabled={!modelId} />
          </div>

          {/* Loading mods indicator */}
          {modsLoading && genId && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Icon name="Loader2" size={14} className="animate-spin" />
              Загрузка модификаций...
            </div>
          )}

          {/* Row 2: Filter dropdowns (visible when generation is selected and mods loaded) */}
          {genId && !modsLoading && allMods.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <SelectBox label="Тип двигателя" value={filterEngineType} onChange={handleFilterEngineType}
                options={engineTypeOptions} placeholder="-- Все --" disabled={!genId} />
              <SelectBox label="Код двигателя" value={filterEngineCode} onChange={handleFilterEngineCode}
                options={engineCodeOptions} placeholder="-- Все --" disabled={!genId} />
              <SelectBox label="КПП" value={filterTransmission} onChange={handleFilterTransmission}
                options={transmissionOptions} placeholder="-- Все --" disabled={!genId} />
              <SelectBox label="Привод" value={filterDrive} onChange={handleFilterDrive}
                options={driveOptions} placeholder="-- Все --" disabled={!genId} />
            </div>
          )}

          {/* Row 3: Modification select */}
          {genId && !modsLoading && allMods.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <SelectBox label="Модификация" value={modId} onChange={handleModChange}
                options={filteredMods.map((m) => ({ id: m.id, label: m.name }))} placeholder="-- Модификация --" disabled={!genId || filteredMods.length === 0} />
            </div>
          )}
        </div>

        {/* Modification info block */}
        {mod && (
          <div className="mx-5 mb-5 p-3 bg-blue-50 border border-blue-100 rounded-md flex flex-wrap gap-5 text-xs">
            {mod.engine && <span><span className="text-muted-foreground">Двигатель: </span><strong>{mod.engine}</strong></span>}
            {mod.engineType && <span><span className="text-muted-foreground">Тип: </span><strong>{mod.engineType}</strong></span>}
            {mod.transmission && <span><span className="text-muted-foreground">КПП: </span><strong>{mod.transmission}</strong></span>}
            {mod.power && <span><span className="text-muted-foreground">Мощность: </span><strong>{mod.power}</strong></span>}
            {mod.driveType && <span><span className="text-muted-foreground">Привод: </span><strong>{mod.driveType}</strong></span>}
          </div>
        )}
      </div>

      {!modId ? (
        <div className="flex items-center gap-3 p-5 bg-gray-50 border border-border rounded-lg text-muted-foreground text-sm">
          <Icon name="Info" size={16} className="shrink-0" />
          Выберите автомобиль и модификацию для редактирования нормачасов
        </div>
      ) : availableWorks.length === 0 ? (
        <div className="flex items-center gap-3 p-5 bg-amber-50 border border-amber-200 rounded-lg text-amber-700 text-sm">
          <Icon name="AlertTriangle" size={16} className="shrink-0" />
          Список работ пуст. Добавьте работы в блоке выше или загрузите в разделе «Базы данных».
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-border shadow-sm">
          <div className="px-5 py-3.5 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon name="Wrench" size={16} className="text-[hsl(215,70%,22%)]" />
              <h3 className="font-semibold text-sm uppercase tracking-wider">Нормачасы</h3>
            </div>
            <span className="text-xs text-muted-foreground">
              Заполнено: <strong className="text-[hsl(215,70%,22%)]">{filledCount}</strong> / {availableWorks.length}
              {blockedWorkNames.size > 0 && <span className="ml-2 text-orange-500">({blockedWorkNames.size} скрыто по фильтрам)</span>}
            </span>
          </div>

          {loadingHours ? (
            <div className="flex items-center justify-center gap-2 p-8 text-muted-foreground text-sm">
              <Icon name="Loader2" size={16} className="animate-spin" />
              Загрузка нормачасов...
            </div>
          ) : (
            <div className="divide-y divide-border">
              {availableWorks.map((work) => {
                const val = hoursMap[work.name] ?? "";
                const existing = mod?.works.find((w) => w.name === work.name);
                const isFilled = val !== "" && !isNaN(parseFloat(String(val).replace(",", "."))) && parseFloat(String(val).replace(",", ".")) > 0;
                return (
                  <div key={work.id} className="flex items-center gap-4 px-5 py-3 hover:bg-gray-50 transition-colors">
                    <div className="flex-1">
                      <span className="text-sm text-foreground">{work.name}</span>
                      {existing && !val && (
                        <span className="text-xs text-muted-foreground ml-2">(сейчас: {existing.hours} н/ч)</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <input type="number" value={val}
                        onChange={(e) => handleHoursChange(work.name, e.target.value)}
                        placeholder={existing ? String(existing.hours) : "0.0"}
                        step="0.1" min="0"
                        className={`w-24 border rounded px-3 py-1.5 text-sm text-center focus:outline-none focus:ring-2 focus:ring-[hsl(215,70%,22%)] transition-all ${isFilled ? "border-green-300 bg-green-50" : "border-border"}`}
                      />
                      <span className="text-xs text-muted-foreground w-8">н/ч</span>
                      {isFilled && <Icon name="Check" size={14} className="text-green-500" />}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="px-5 py-4 border-t border-border flex items-center gap-3">
            <button onClick={handleSaveHours} disabled={savingHours}
              className={`flex items-center gap-2 px-6 py-2.5 bg-[hsl(215,70%,22%)] text-white rounded text-sm font-semibold hover:bg-[hsl(215,70%,18%)] transition-all shadow-sm ${savingHours ? "opacity-60 cursor-not-allowed" : ""}`}>
              {savingHours ? (
                <Icon name="Loader2" size={15} className="animate-spin" />
              ) : (
                <Icon name="Save" size={15} />
              )}
              {savingHours ? "Сохранение..." : "Сохранить нормачасы"}
            </button>
            {saved && (
              <span className="flex items-center gap-1.5 text-sm text-green-600 animate-fade-in">
                <Icon name="CheckCircle" size={15} />Нормачасы сохранены!
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TabEditor;