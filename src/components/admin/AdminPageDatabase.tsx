import { useState, useRef } from "react";
import Icon from "@/components/ui/icon";
import { useAppData, WorkEntry } from "@/pages/Index";
import { CarBrand } from "@/data/carDatabase";
import { reapplyWorks, parseCarBase, downloadCarsTemplate as downloadCarsTemplateHelper, FUNC_FETCH_YANDEX_FILE, FUNC_PARSE_YANDEX_FILE } from "@/components/admin/adminHelpers";
import * as XLSX from "xlsx";
import { FUNC_SAVE_CARS_TREE, FUNC_IMPORT_CSV, downloadWorksTemplate, mergeCars, mergeWorks, parseWorksList, generateNormsTemplate, parseFilledTemplate } from "@/components/admin/adminPageHelpers";
import { UploadBlock, StepBadge } from "@/components/admin/AdminPageUIBlocks";

const AdminPageDatabase = () => {
  const { carDatabase, setCarDatabase, worksDatabase, setWorksDatabase, carsUrl, setCarsUrl, carsUrlEnabled, setCarsUrlEnabled, reloadCarDb, dbSyncStatus } = useAppData();
  const [reloadLoading, setReloadLoading] = useState(false);
  const [reloadStatus, setReloadStatus] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const handleReloadDb = async () => {
    const source = pendingCars ?? carDatabase;
    if (!source || source.length === 0) {
      setReloadStatus({ type: "error", msg: "Сначала загрузите Excel-файл с базой автомобилей." });
      return;
    }
    setReloadLoading(true);
    setReloadStatus(null);

    type Chunk = CarBrand[];
    const chunks: Chunk[] = [];

    for (const brand of source) {
      const modCount = brand.models.reduce((s, m) => s + m.generations.reduce((s2, g) => s2 + g.modifications.length, 0), 0);
      if (modCount <= 300) {
        chunks.push([brand]);
      } else {
        for (const model of brand.models) {
          chunks.push([{ ...brand, models: [model] }]);
        }
      }
    }

    let savedMods = 0;
    const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));
    const MAX_RETRIES = 3;
    const CONCURRENCY = 3;

    const sendChunk = async (i: number): Promise<number> => {
      let lastErr: Error | null = null;
      for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
        try {
          const res = await fetch(FUNC_SAVE_CARS_TREE, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ brands: chunks[i], chunk: i, total_chunks: chunks.length, mode: "merge" }),
          });
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const d = await res.json();
          const parsed = typeof d === "string" ? JSON.parse(d) : d;
          return parsed.modifications ?? 0;
        } catch (e) {
          lastErr = e instanceof Error ? e : new Error(String(e));
          if (attempt < MAX_RETRIES - 1) await delay(1000 * (attempt + 1));
        }
      }
      throw new Error(`${lastErr!.message} на марке ${chunks[i][0]?.name ?? i}`);
    };

    try {
      const firstRes = await fetch(FUNC_SAVE_CARS_TREE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brands: chunks[0], chunk: 0, total_chunks: chunks.length, mode: "replace" }),
      });
      if (!firstRes.ok) throw new Error(`HTTP ${firstRes.status}`);
      const fd = await firstRes.json();
      const fp = typeof fd === "string" ? JSON.parse(fd) : fd;
      savedMods += fp.modifications ?? 0;
      let completed = 1;
      setReloadStatus({ type: "success", msg: `Сохраняю на сервер… ${completed}/${chunks.length}` });

      for (let i = 1; i < chunks.length; i += CONCURRENCY) {
        const batch = [];
        for (let j = i; j < Math.min(i + CONCURRENCY, chunks.length); j++) {
          batch.push(sendChunk(j));
        }
        const results = await Promise.all(batch);
        for (const mods of results) savedMods += mods;
        completed += results.length;
        setReloadStatus({ type: "success", msg: `Сохраняю на сервер… ${completed}/${chunks.length}` });
      }
      setCarDatabase(source);
      setDbReady(true);
      setReloadStatus({ type: "success", msg: `База сохранена на сервер! ${source.length} марок, ${savedMods.toLocaleString("ru-RU")} модификаций. Данные доступны всем пользователям.` });
    } catch (e) {
      setCarDatabase(source);
      setDbReady(true);
      setReloadStatus({ type: "error", msg: `Сохранено ${savedMods.toLocaleString("ru-RU")} мод., но ошибка: ${e instanceof Error ? e.message : "неизвестная ошибка"}` });
    } finally {
      setReloadLoading(false);
    }
  };

  // Яндекс.Диск
  const [urlInput, setUrlInput] = useState(carsUrl);
  const [urlStatus, setUrlStatus] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [urlLoading, setUrlLoading] = useState(false);

  // DB wizard
  const [carsStatus, setCarsStatus] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [worksStatus, setWorksStatus] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [filledStatus, setFilledStatus] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [pendingCars, setPendingCars] = useState<CarBrand[] | null>(null);
  const [pendingWorks, setPendingWorks] = useState<WorkEntry[] | null>(() => worksDatabase.length > 0 ? worksDatabase : null);
  const [dbReady, setDbReady] = useState(false);
  const filledFileRef = useRef<HTMLInputElement>(null);
  const [exportLoading, setExportLoading] = useState(false);
  const [exportStatus, setExportStatus] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [importLoading, setImportLoading] = useState(false);
  const [importStatus, setImportStatus] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [importProgress, setImportProgress] = useState<number | null>(null);
  const importFileRef = useRef<HTMLInputElement>(null);

  const handleImportCsvFiles = async (files: FileList) => {
    setImportLoading(true);
    setImportStatus({ type: "success", msg: "Читаю CSV файлы…" });
    setImportProgress(0);
    try {
      const TABLE_ORDER = ["car_brands", "car_models", "car_generations", "car_modifications"];
      const tableFiles: Record<string, { header: string[]; rows: string[][] }> = {};

      for (const file of Array.from(files)) {
        const text = await file.text();
        const bom = text.startsWith("\uFEFF") ? text.slice(1) : text;
        const lines = bom.split("\n").filter(l => l.trim());
        if (lines.length < 2) continue;

        const parseCsvLine = (line: string) => {
          const result: string[] = [];
          let current = "";
          let inQuotes = false;
          for (let i = 0; i < line.length; i++) {
            const ch = line[i];
            if (inQuotes) {
              if (ch === '"' && line[i + 1] === '"') { current += '"'; i++; }
              else if (ch === '"') { inQuotes = false; }
              else { current += ch; }
            } else {
              if (ch === '"') { inQuotes = true; }
              else if (ch === ";") { result.push(current); current = ""; }
              else { current += ch; }
            }
          }
          result.push(current);
          return result;
        };

        const header = parseCsvLine(lines[0]);
        const rows = lines.slice(1).map(parseCsvLine);

        let tableName = "";
        for (const t of TABLE_ORDER) {
          if (file.name.startsWith(t)) { tableName = t; break; }
        }
        if (!tableName) continue;

        if (!tableFiles[tableName]) {
          tableFiles[tableName] = { header, rows: [] };
        }
        tableFiles[tableName].rows.push(...rows);
      }

      const tablesToImport = TABLE_ORDER.filter(t => tableFiles[t]);
      if (tablesToImport.length === 0) {
        setImportStatus({ type: "error", msg: "Не найдены CSV файлы с именами car_brands, car_models, car_generations или car_modifications" });
        setImportProgress(null);
        setImportLoading(false);
        return;
      }

      let totalRows = 0;
      let processedRows = 0;
      for (const t of tablesToImport) totalRows += tableFiles[t].rows.length;

      const CHUNK_SIZE = 200;
      let isFirst = true;

      for (const tableName of tablesToImport) {
        const { header, rows } = tableFiles[tableName];
        const totalChunks = Math.ceil(rows.length / CHUNK_SIZE);

        for (let ci = 0; ci < totalChunks; ci++) {
          const chunk = rows.slice(ci * CHUNK_SIZE, (ci + 1) * CHUNK_SIZE);
          setImportStatus({ type: "success", msg: `Импорт ${tableName}… (${processedRows}/${totalRows})` });

          const res = await fetch(FUNC_IMPORT_CSV, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              table: tableName,
              header,
              rows: chunk,
              mode: isFirst ? "replace" : "merge",
              chunk: ci,
              total_chunks: totalChunks,
            }),
          });
          isFirst = false;

          if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error((typeof err === "string" ? JSON.parse(err) : err).error || `Ошибка HTTP ${res.status}`);
          }
          processedRows += chunk.length;
          setImportProgress(Math.round((processedRows / totalRows) * 100));
        }
      }

      setImportProgress(100);
      setImportStatus({ type: "success", msg: `Импортировано ${processedRows.toLocaleString("ru-RU")} строк в ${tablesToImport.length} таблиц!` });
      setTimeout(() => { setImportStatus(null); setImportProgress(null); }, 5000);
    } catch (e) {
      setImportStatus({ type: "error", msg: e instanceof Error ? e.message : "Ошибка импорта" });
      setImportProgress(null);
    } finally {
      setImportLoading(false);
    }
  };

  const handleExportDbTables = () => {
    const source = pendingCars ?? carDatabase;
    if (!source || source.length === 0) {
      setExportStatus({ type: "error", msg: "Сначала загрузите файл в Шаге 1" });
      return;
    }
    setExportLoading(true);
    setExportStatus({ type: "success", msg: "Формирую таблицы…" });
    try {
      const brandsRows: string[][] = [];
      const modelsRows: string[][] = [];
      const gensRows: string[][] = [];
      const modsRows: string[][] = [];
      const slug = (s: string) => s.toLowerCase().replace(/[\s()/\\]+/g, "-").replace(/^-|-$/g, "");
      const makeId = (...parts: string[]) => parts.filter(Boolean).map(slug).join("__");
      for (const brand of source) {
        const brandId = slug(brand.name);
        brandsRows.push([brandId, brand.name]);
        for (const model of brand.models) {
          const modelId = makeId(brandId, model.name);
          modelsRows.push([modelId, brandId, model.name]);
          for (const gen of model.generations) {
            const genId = makeId(modelId, gen.name || "default");
            gensRows.push([genId, modelId, gen.name, gen.years || ""]);
            for (const mod of gen.modifications) {
              const modId = makeId(genId, mod.name);
              const m = mod as Record<string, unknown>;
              const v = (k: string) => String(m[k] ?? "");
              modsRows.push([
                modId, genId, mod.name, v("engine"), v("transmission"), v("power"),
                v("bodyType"), v("seats"), v("lengthMm"), v("widthMm"), v("heightMm"), v("wheelbaseMm"),
                v("trackFrontMm"), v("trackRearMm"), v("curbWeightKg"), v("wheelSize"), v("groundClearanceMm"),
                v("trunkMaxL"), v("trunkMinL"), v("grossWeightKg"), v("diskSize"), v("clearanceMm"),
                v("trackFrontWidthMm"), v("trackRearWidthMm"), v("payloadKg"), v("trainWeightKg"),
                v("axleLoadKg"), v("loadingHeightMm"), v("cargoCompartmentDims"), v("cargoVolumeM3"), v("boltPattern"),
                v("engineType"), v("engineVolumeCC"), v("powerRpm"), v("torqueNm"), v("intakeType"),
                v("cylinderLayout"), v("cylinderCount"), v("compressionRatio"), v("valvesPerCylinder"), v("turboType"),
                v("boreMm"), v("strokeMm"), v("engineModel"), v("engineLocation"), v("powerKw"),
                v("torqueRpm"), v("intercooler"), v("engineCode"), v("timingSystem"), v("fuelConsumptionMethod"),
                v("gearCount"), v("driveType"), v("turningDiameterM"),
                v("fuelType"), v("maxSpeedKmh"), v("acceleration100"), v("fuelTankL"), v("ecoStandard"),
                v("fuelCityL"), v("fuelHighwayL"), v("fuelMixedL"), v("rangeKm"), v("co2GKm"),
                v("frontBrakes"), v("rearBrakes"), v("frontSuspension"), v("rearSuspension"),
                v("doorsCount"), v("countryOfOrigin"), v("vehicleClass"), v("steeringPosition"),
                v("safetyRating"), v("safetyRatingName"),
                v("batteryCapacityKwh"), v("electricRangeKm"), v("chargeTimeH"), v("batteryType"),
                v("batteryTempRangeC"), v("fastChargeTimeH"), v("fastChargeDesc"),
                v("chargeConnectorType"), v("consumptionKwhPer100km"), v("maxChargePowerKw"),
                v("batteryAvailableKwh"), v("chargeCycles"),
              ]);
            }
          }
        }
      }
      const MAX_CSV_BYTES = 4 * 1024 * 1024;
      const esc = (v: string) => {
        if (v.includes(";") || v.includes('"') || v.includes("\n")) return '"' + v.replace(/"/g, '""') + '"';
        return v;
      };
      const buildCsv = (headers: string[], rows: string[][]) => {
        const lines = [headers.map(esc).join(";")];
        for (const row of rows) lines.push(row.map(esc).join(";"));
        return "\uFEFF" + lines.join("\n");
      };
      const downloadBlob = (name: string, content: string) => {
        const blob = new Blob([content], { type: "text/csv;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url; a.download = name; a.click();
        URL.revokeObjectURL(url);
      };
      const saveCsvSplit = (name: string, headers: string[], rows: string[][]) => {
        const fullCsv = buildCsv(headers, rows);
        const fullSize = new Blob([fullCsv]).size;
        if (fullSize <= MAX_CSV_BYTES) {
          downloadBlob(`${name}.csv`, fullCsv);
          return 1;
        }
        const avgRowSize = fullSize / rows.length;
        const rowsPerFile = Math.max(10, Math.floor(MAX_CSV_BYTES / avgRowSize));
        let partNum = 1;
        for (let i = 0; i < rows.length; i += rowsPerFile) {
          const chunk = rows.slice(i, i + rowsPerFile);
          const csv = buildCsv(headers, chunk);
          downloadBlob(`${name}_${partNum}.csv`, csv);
          partNum++;
        }
        return partNum - 1;
      };
      const modsHeaders = [
        "id", "generation_id", "name", "engine", "transmission", "power",
        "body_type", "seats", "length_mm", "width_mm", "height_mm", "wheelbase_mm",
        "track_front_mm", "track_rear_mm", "curb_weight_kg", "wheel_size", "ground_clearance_mm",
        "trunk_max_l", "trunk_min_l", "gross_weight_kg", "disk_size", "clearance_mm",
        "track_front_width_mm", "track_rear_width_mm", "payload_kg", "train_weight_kg",
        "axle_load_kg", "loading_height_mm", "cargo_compartment_dims", "cargo_volume_m3", "bolt_pattern",
        "engine_type", "engine_volume_cc", "power_rpm", "torque_nm", "intake_type",
        "cylinder_layout", "cylinder_count", "compression_ratio", "valves_per_cylinder", "turbo_type",
        "bore_mm", "stroke_mm", "engine_model", "engine_location", "power_kw",
        "torque_rpm", "intercooler", "engine_code", "timing_system", "fuel_consumption_method",
        "gear_count", "drive_type", "turning_diameter_m",
        "fuel_type", "max_speed_kmh", "acceleration_100", "fuel_tank_l", "eco_standard",
        "fuel_city_l", "fuel_highway_l", "fuel_mixed_l", "range_km", "co2_g_km",
        "front_brakes", "rear_brakes", "front_suspension", "rear_suspension",
        "doors_count", "country_of_origin", "vehicle_class", "steering_position",
        "safety_rating", "safety_rating_name",
        "battery_capacity_kwh", "electric_range_km", "charge_time_h", "battery_type",
        "battery_temp_range_c", "fast_charge_time_h", "fast_charge_desc",
        "charge_connector_type", "consumption_kwh_per_100km", "max_charge_power_kw",
        "battery_available_kwh", "charge_cycles",
      ];
      let totalFiles = 0;
      totalFiles += saveCsvSplit("car_brands", ["id", "name"], brandsRows);
      setTimeout(() => {
        totalFiles += saveCsvSplit("car_models", ["id", "brand_id", "name"], modelsRows);
        setTimeout(() => {
          totalFiles += saveCsvSplit("car_generations", ["id", "model_id", "name", "years"], gensRows);
          setTimeout(() => {
            const modsParts = saveCsvSplit("car_modifications", modsHeaders, modsRows);
            totalFiles += modsParts;
            setExportStatus({ type: "success", msg: `Готово! ${totalFiles} CSV файлов: ${brandsRows.length} марок, ${modsRows.length} модификаций` });
            setTimeout(() => setExportStatus(null), 4000);
          }, 500);
        }, 500);
      }, 500);
    } catch (e) {
      setExportStatus({ type: "error", msg: e instanceof Error ? e.message : "Ошибка экспорта" });
    } finally {
      setExportLoading(false);
    }
  };

  const parseCarsFile = (file: File, onResult: (cars: CarBrand[]) => void, onError: (m: string) => void) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = new Uint8Array(ev.target!.result as ArrayBuffer);
        const wb = XLSX.read(data, { type: "array" });
        const rows: Record<string, unknown>[] = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { defval: "" });
        const cars = parseCarBase(rows);
        if (!cars || cars.length === 0) onError("Не удалось распознать автомобили. Скачайте шаблон и проверьте формат.");
        else onResult(cars);
      } catch { onError("Ошибка чтения файла."); }
    };
    reader.readAsArrayBuffer(file);
  };

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

  const handleCarsFile = (file: File) => parseCarsFile(file, (cars) => {
    const withWorks = reapplyWorks(cars, pendingCars ?? carDatabase);
    const total = withWorks.reduce((s, b) => s + b.models.reduce((s2, m) => s2 + m.generations.reduce((s3, g) => s3 + g.modifications.length, 0), 0), 0);
    const restored = withWorks.reduce((s, b) => s + b.models.reduce((s2, m) => s2 + m.generations.reduce((s3, g) => s3 + g.modifications.reduce((s4, mod) => s4 + (mod.works.length > 0 ? 1 : 0), 0), 0), 0), 0);
    setPendingCars(withWorks);
    if (worksDatabase.length > 0) setPendingWorks(worksDatabase);
    setCarsStatus({ type: "success", msg: `Загружено: ${cars.length} марок, ${total} модификаций из «${file.name}»${restored > 0 ? `. Восстановлены нормативы для ${restored} модификаций.` : ""}` });
  }, (msg) => setCarsStatus({ type: "error", msg }));

  const handleCarsUpdate = (file: File) => parseCarsFile(file, (incoming) => {
    const base = pendingCars ?? carDatabase;
    const merged = mergeCars(base, incoming);
    const withWorks = reapplyWorks(merged, base);
    setPendingCars(withWorks);
    if (worksDatabase.length > 0) setPendingWorks(worksDatabase);
    setCarsStatus({ type: "success", msg: `Обновлено. Нормативы существующих моделей сохранены.` });
  }, (msg) => setCarsStatus({ type: "error", msg }));

  const handleFetchFromDisk = async (urlOverride?: string) => {
    const url = (urlOverride ?? urlInput).trim();
    if (!url) { setUrlStatus({ type: "error", msg: "Введите ссылку на файл Яндекс.Диска" }); return; }
    setUrlLoading(true);
    setUrlStatus(null);
    setCarsStatus(null);
    try {
      // Шаг 1: скачиваем файл с Яндекс.Диска в S3
      setUrlStatus({ type: "success", msg: "Шаг 1/2: скачиваю файл с Яндекс.Диска…" });
      const res1 = await fetch(FUNC_FETCH_YANDEX_FILE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const d1 = await res1.json().then((r: unknown) => typeof r === "string" ? JSON.parse(r) : r);
      if (!res1.ok || (d1 as { error?: string }).error) throw new Error((d1 as { error?: string }).error || "Ошибка скачивания файла");

      // Шаг 2: инициализируем мету (считаем строки) 
      setUrlStatus({ type: "success", msg: "Шаг 2/2: считаю строки в файле…" });
      const resInit = await fetch(FUNC_PARSE_YANDEX_FILE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ init: true }),
      });
      const dInit = await resInit.json().then((r: unknown) => typeof r === "string" ? JSON.parse(r) : r) as { ok?: boolean; total_rows?: number; total_chunks?: number; error?: string };
      if (!resInit.ok || dInit.error) throw new Error(dInit.error || "Ошибка чтения файла");

      // Загружаем чанки в БД
      let chunkIndex = 0;
      let totalInserted = 0;
      let totalSkipped = 0;
      let totalChunks = dInit.total_chunks ?? 1;

      do {
        setUrlStatus({ type: "success", msg: `Загружаю в базу… чанк ${chunkIndex + 1}/${totalChunks}` });
        const res3 = await fetch(FUNC_PARSE_YANDEX_FILE, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ chunk: chunkIndex, mode: "replace" }),
        });
        const d3 = await res3.json().then((r: unknown) => typeof r === "string" ? JSON.parse(r) : r) as { inserted?: number; skipped?: number; total_chunks?: number; done?: boolean; error?: string };
        if (!res3.ok || d3.error) throw new Error(d3.error || "Ошибка загрузки в базу");
        totalInserted += d3.inserted ?? 0;
        totalSkipped += d3.skipped ?? 0;
        totalChunks = d3.total_chunks ?? totalChunks;
        if (d3.done) break;
        chunkIndex++;
      } while (chunkIndex < totalChunks);

      setCarsUrl(url);
      await reloadCarDb();
      setUrlStatus({ type: "success", msg: `Готово! Загружено ${totalInserted.toLocaleString("ru-RU")} модификаций с Яндекс.Диска` });
      setCarsStatus({ type: "success", msg: `Загружено ${totalInserted.toLocaleString("ru-RU")} модификаций. Пропущено: ${totalSkipped}.` });
    } catch (e) {
      setUrlStatus({ type: "error", msg: e instanceof Error ? e.message : "Неизвестная ошибка" });
    } finally {
      setUrlLoading(false);
    }
  };

  const handleWorksFile = (file: File) => parseWorksFile(file, (works) => {
    setPendingWorks(works); setWorksDatabase(works); setWorksStatus({ type: "success", msg: `Загружено ${works.length} видов работ из «${file.name}»` });
  }, (msg) => setWorksStatus({ type: "error", msg }));

  const handleWorksUpdate = (file: File) => parseWorksFile(file, (incoming) => {
    const merged = mergeWorks(pendingWorks ?? worksDatabase, incoming);
    const added = merged.length - (pendingWorks ?? worksDatabase).length;
    setPendingWorks(merged); setWorksDatabase(merged);
    setWorksStatus({ type: "success", msg: `Добавлено ${added} новых работ, итого ${merged.length}.` });
  }, (msg) => setWorksStatus({ type: "error", msg }));

  const handleFilledFile = (file: File) => {
    const cars = pendingCars ?? carDatabase;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = new Uint8Array(ev.target!.result as ArrayBuffer);
        const wb = XLSX.read(data, { type: "array" });
        const rows: Record<string, unknown>[] = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { defval: "" });
        if (rows.length === 0) { setFilledStatus({ type: "error", msg: "Файл пустой." }); return; }
        const { updatedCars, totalFilled } = parseFilledTemplate(rows, cars);
        if (totalFilled === 0) {
          setFilledStatus({ type: "error", msg: "Нормачасы не найдены. Убедитесь что столбец J заполнен числами." });
        } else {
          setCarDatabase(updatedCars); if (pendingCars) setPendingCars(updatedCars);
          setDbReady(true); setFilledStatus({ type: "success", msg: `База знаний готова! Заполнено ${totalFilled} нормативов из «${file.name}»` });
        }
      } catch { setFilledStatus({ type: "error", msg: "Ошибка чтения файла." }); }
    };
    reader.readAsArrayBuffer(file);
  };

  const totalWorks = carDatabase.reduce((s, b) => s + b.models.reduce((s2, m) => s2 + m.generations.reduce((s3, g) => s3 + g.modifications.reduce((s4, mod) => s4 + mod.works.length, 0), 0), 0), 0);
  const hasCars = carDatabase.length > 0;
  const hasWorks = worksDatabase.length > 0;
  const step1Done = !!pendingCars || hasCars;
  const step2Done = !!pendingWorks || hasWorks;
  const step3Done = dbReady || (hasCars && hasWorks && totalWorks > 0);
  const templateReady = step1Done && step2Done;

  return (
    <div className="space-y-6">
      {/* Step indicators */}
      <div className="flex flex-wrap gap-4 items-center">
        <StepBadge n={1} active={!step1Done} done={step1Done} label="База автомобилей" />
        <Icon name="ChevronRight" size={16} className="text-muted-foreground hidden sm:block" />
        <StepBadge n={2} active={step1Done && !step2Done} done={step2Done} label="Список работ" />
        <Icon name="ChevronRight" size={16} className="text-muted-foreground hidden sm:block" />
        <StepBadge n={3} active={step2Done && !step3Done} done={step3Done} label="Нормативы" />
      </div>

      {/* Блок Яндекс.Диска */}
      <div className="border border-blue-200 rounded-lg p-5 bg-blue-50 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <Icon name="Link" size={20} className="text-blue-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-sm text-blue-900">Автообновление с Яндекс.Диска</p>
              <p className="text-xs text-blue-700 mt-1">
                Укажите постоянную публичную ссылку на xlsx-файл. Включите тогл — кнопка «Загрузить» в Шаге 1 будет брать файл с диска. При выключенном тогле — загрузка файлом вручную.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setCarsUrlEnabled(!carsUrlEnabled)}
            className={`relative shrink-0 w-11 h-6 rounded-full transition-colors ${carsUrlEnabled ? "bg-blue-600" : "bg-gray-300"}`}
          >
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${carsUrlEnabled ? "translate-x-5" : "translate-x-0"}`} />
          </button>
        </div>
        <div className="flex gap-2">
          <input
            type="url"
            value={urlInput}
            onChange={e => setUrlInput(e.target.value)}
            placeholder="https://disk.yandex.ru/d/..."
            className="flex-1 text-sm px-3 py-2 border border-blue-300 rounded-lg bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
          />
          <button
            type="button"
            onClick={() => { setCarsUrl(urlInput.trim()); setUrlStatus({ type: "success", msg: "Ссылка сохранена" }); }}
            disabled={!urlInput.trim() || urlInput.trim() === carsUrl}
            className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-all disabled:opacity-40 disabled:pointer-events-none whitespace-nowrap"
          >
            Сохранить
          </button>
        </div>
        {urlStatus && (
          <div className={`flex items-center gap-2 p-2.5 rounded-lg border text-xs ${urlStatus.type === "success" ? "bg-green-50 border-green-200 text-green-700" : "bg-red-50 border-red-200 text-red-700"}`}>
            <Icon name={urlStatus.type === "success" ? "CheckCircle" : "XCircle"} size={13} className="shrink-0" />
            {urlStatus.msg}
          </div>
        )}
        {carsUrlEnabled && carsUrl && (
          <button
            type="button"
            onClick={() => handleFetchFromDisk(carsUrl)}
            disabled={urlLoading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-700 text-white rounded-lg text-sm font-semibold hover:bg-blue-800 transition-all disabled:opacity-60 disabled:pointer-events-none"
          >
            {urlLoading
              ? <><Icon name="Loader" size={14} className="animate-spin" />Загружаю с Яндекс.Диска…</>
              : <><Icon name="RefreshCw" size={14} />Обновить базу с Яндекс.Диска</>
            }
          </button>
        )}
      </div>

      <div className="border-t border-border pt-5 space-y-4">
        {/* Step 1 */}
        <UploadBlock title="Шаг 1 — Загрузите базу автомобилей"
          description="Файл должен содержать все 89 колонок с точными названиями. Структура шаблона:"
          buttonLabel="Загрузить базу авто (.xlsx)" accept=".xlsx,.xls"
          onFile={handleCarsFile} onUpdate={handleCarsUpdate} hasData={hasCars}
          onDownloadTemplate={downloadCarsTemplateHelper} status={carsStatus}>
          <div className="overflow-x-auto rounded border border-border mb-4" style={{maxHeight: 180}}>
            <table className="text-xs border-collapse" style={{minWidth: "max-content"}}>
              <thead className="sticky top-0 z-10">
                <tr className="bg-[hsl(215,70%,22%)] text-white">
                  {[
                    "Марка","Модель","Поколение","Год от (Поколение)","Год до (Поколение)","Серия","Модификация",
                    "Тип кузова","Количество мест","Длина [мм]","Ширина [мм]","Высота [мм]","Колёсная база [мм]",
                    "Колея передняя [мм]","Колея задняя [мм]","Снаряженная масса [кг]","Размер колёс","Дорожный просвет [мм]",
                    "Объем багажника максимальный [л]","Объем багажника минимальный [л]","Полная масса [кг]","Размер дисков",
                    "Клиренс [мм]","Ширина передней колеи [мм]","Ширина задней колеи [мм]","Грузоподъёмность [кг]",
                    "Разрешённая масса автопоезда [кг]","Нагрузка на переднюю/заднюю ось [кг]","Погрузочная высота [мм]",
                    "Грузовой отсек (Длина x Ширина x Высота) [мм]","Объём грузового отсека [м3]","Сверловка [мм]",
                    "Тип двигателя","Объем двигателя [см3]","Мощность двигателя [л.с.]","Обороты максимальной мощности [об/мин]",
                    "Максимальный крутящий момент [Н*м]","Тип впуска","Расположение цилиндров","Количество цилиндров",
                    "Степень сжатия","Количество клапанов на цилиндр","Тип наддува","Диаметр цилиндра [мм]","Ход поршня [мм]",
                    "Модель двигателя","Расположение двигателя","Максимальная мощность (кВт) [кВт]",
                    "Обороты максимального крутящего момента [об/мин]","Наличие интеркулера","Код двигателя","ГРМ",
                    "Методика расчета расхода","Тип КПП","Количество передач","Привод","Диаметр разворота [м]",
                    "Марка топлива","Максимальная скорость [км/ч]","Разгон до 100 км/ч [сек]","Объём топливного бака [л]",
                    "Экологический стандарт","Расход топлива в городе на 100 км [л]","Расход топлива на шоссе на 100 км [л]",
                    "Расход топлива в смешанном цикле на 100 км [л]","Запас хода [км]","Выбросы CO2 [г/км]",
                    "Передние тормоза","Задние тормоза","Передняя подвеска","Задняя подвеска",
                    "Количество дверей","Страна марки","Класс автомобиля","Расположение руля",
                    "Оценка безопасности","Название рейтинга",
                    "Емкость батареи [КВт⋅ч]","Запас хода на электричестве [км]","Время зарядки [ч]","Тип батареи",
                    "Температурный режим батареи [C]","Время быстрой зарядки [ч]","Описание быстрой зарядки",
                    "Тип разъема для зарядки","Расход [КВт⋅ч/100 км]","Максимальная мощность зарядки [КВт]",
                    "Ёмкость батареи (доступная) [КВт⋅ч]","Количество циклов зарядки",
                  ].map((h) => (
                    <th key={h} className="px-2 py-1.5 text-center whitespace-nowrap border-r border-blue-800 last:border-0 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  [
                    "Toyota","Camry","VII (V70)","2017","н.в.","SE","2.5 AT",
                    "Седан","5","4885","1840","1455","2825","1570","1580","1545",
                    "235/45 R18","160","490","390","1965","7Jx18","160","1570","1580",
                    "","","","","","","5x114.3",
                    "Бензин","2494","181","6000","235","Атмосферный","Рядный","4",
                    "10.4","4","—","87.5","96.9","2AR-FE","Спереди, поперечно","133",
                    "4200","Нет","2AR-FE","Цепь","Комбинированный",
                    "Автомат","6","Передний","11.4",
                    "АИ-95","210","8.2","70",
                    "Евро-5","9.8","6.2","7.5","","162",
                    "Дисковые вентилируемые","Дисковые","Стойки МакФерсон","Многорычажная",
                    "4","Япония","E","Левый","5","Euro NCAP",
                    "","","","","","","","","","","","",
                  ],
                  [
                    "Toyota","Camry","VII (V70)","2017","н.в.","SE","3.5 AT",
                    "Седан","5","4885","1840","1455","2825","1570","1580","1580",
                    "235/45 R18","160","490","390","2045","7Jx18","160","1570","1580",
                    "","","","","","","5x114.3",
                    "Бензин","3456","249","6200","317","Атмосферный","V-образный","6",
                    "10.4","4","—","94","86","2GR-FKS","Спереди, поперечно","183",
                    "4700","Нет","2GR-FKS","Цепь","Комбинированный",
                    "Автомат","8","Передний","11.4",
                    "АИ-95","250","6.1","70",
                    "Евро-5","12.3","6.7","8.8","","199",
                    "Дисковые вентилируемые","Дисковые","Стойки МакФерсон","Многорычажная",
                    "4","Япония","E","Левый","5","Euro NCAP",
                    "","","","","","","","","","","","",
                  ],
                ].map((row, i) => (
                  <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    {row.map((c, j) => <td key={j} className="px-2 py-1.5 border-r border-b border-border text-center whitespace-nowrap text-gray-600 last:border-r-0">{c}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </UploadBlock>

        {/* Кнопки экспорта/импорта таблиц БД */}
        <div className="mt-2 space-y-2">
          <button
            onClick={handleExportDbTables}
            disabled={exportLoading || (!pendingCars && carDatabase.length === 0)}
            className="flex items-center gap-2 w-full px-3 py-2.5 text-xs font-medium text-blue-800 bg-blue-50 border border-blue-200 hover:bg-blue-100 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Icon name={exportLoading ? "Loader" : "Database"} size={14} className={exportLoading ? "animate-spin" : ""} />
            Скачать таблицы базы данных для сервера
          </button>
          {exportStatus && (
            <p className={`text-xs px-2 mt-1 ${exportStatus.type === "error" ? "text-red-600" : "text-blue-600"}`}>
              {exportStatus.msg}
            </p>
          )}
          <input
            ref={importFileRef}
            type="file"
            accept=".csv"
            multiple
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                handleImportCsvFiles(e.target.files);
              }
              e.target.value = "";
            }}
          />
          <button
            onClick={() => importFileRef.current?.click()}
            disabled={importLoading}
            className="flex items-center gap-2 w-full px-3 py-2.5 text-xs font-medium text-green-800 bg-green-50 border border-green-200 hover:bg-green-100 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Icon name={importLoading ? "Loader" : "Upload"} size={14} className={importLoading ? "animate-spin" : ""} />
            {importLoading ? "Импортирую…" : "Загрузить CSV таблицы в серверную БД"}
          </button>
          {importProgress !== null && (
            <div className="h-2 bg-green-100 rounded-full overflow-hidden">
              <div className="h-full bg-green-500 rounded-full" style={{ width: `${importProgress}%`, transition: "width 0.3s ease" }} />
            </div>
          )}
          {importStatus && (
            <p className={`text-xs px-2 ${importStatus.type === "error" ? "text-red-600" : "text-green-600"}`}>
              {importStatus.msg}
            </p>
          )}
        </div>

        {/* Кнопка обновления базы */}
        <div className="p-4 border-2 border-dashed border-blue-400 rounded-lg bg-blue-50">
          <p className="text-xs text-blue-700 mb-2">После загрузки Excel-файла нажмите, чтобы обновить все справочники:</p>
          <button
            type="button"
            onClick={handleReloadDb}
            disabled={reloadLoading || (!pendingCars && !hasCars)}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Icon name={reloadLoading ? "Loader" : "CloudUpload"} size={14} className={reloadLoading ? "animate-spin" : ""} fallback="RefreshCw" />
            {reloadLoading ? "Сохраняю на сервер…" : "Сохранить базу на сервер"}
          </button>
          {reloadStatus && (
            <div className={`mt-2 flex items-center gap-2 p-2.5 rounded border text-xs ${reloadStatus.type === "success" ? "bg-green-50 border-green-200 text-green-700" : "bg-red-50 border-red-200 text-red-700"}`}>
              <Icon name={reloadStatus.type === "success" ? "CheckCircle" : "XCircle"} size={13} className="shrink-0" />
              {reloadStatus.msg}
            </div>
          )}
        </div>

        {/* Step 2 */}
        <UploadBlock title="Шаг 2 — Загрузите список работ"
          description="Один столбец — все виды работ. Нормачасы проставляются на шаге 3 или через «Консоль редактирования»."
          buttonLabel="Загрузить список работ (.xlsx)" accept=".xlsx,.xls"
          onFile={handleWorksFile} onUpdate={handleWorksUpdate} hasData={hasWorks}
          onDownloadTemplate={downloadWorksTemplate} status={worksStatus}
          disabled={!step1Done && !hasCars}>
          {hasWorks && step1Done && (
            <div className="mb-3 flex items-start gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-xs text-green-700">
              <Icon name="CheckCircle" size={14} className="shrink-0 mt-0.5" />
              <span>Ранее загруженные <strong>{worksDatabase.length} работ</strong> автоматически привязаны. Этот шаг можно пропустить.</span>
            </div>
          )}
          <div className="overflow-x-auto rounded border border-border mb-4 max-w-xs">
            <table className="text-xs w-full border-collapse">
              <thead><tr className="bg-[hsl(215,70%,22%)] text-white"><th className="px-3 py-1.5 text-left">Наименование работы</th></tr></thead>
              <tbody>
                {["Замена масла двигателя","Замена тормозных колодок передних","Замена воздушного фильтра","Замена свечей","Замена ремня ГРМ"].map((w, i) => (
                  <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td className="px-3 py-1.5 border-b border-border text-gray-600">{w}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </UploadBlock>

        {/* Step 3 */}
        <div className={`border rounded-lg p-5 space-y-4 ${!templateReady ? "opacity-50 pointer-events-none bg-gray-50" : "bg-white border-border"}`}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-semibold text-sm">Шаг 3 — Скачайте шаблон, заполните нормачасы и загрузите обратно</p>
              <p className="text-xs text-muted-foreground mt-1">Каждая строка = автомобиль × работа. Заполните столбец <strong>J «Нормачасы»</strong>.</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <Icon name="FileSpreadsheet" size={20} className="text-[hsl(215,70%,22%)] shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold">Шаблон нормативов</p>
              <p className="text-xs text-muted-foreground">
                {pendingCars && pendingWorks ? `${pendingCars.length} марок × ${pendingWorks.length} работ` : "Загрузите шаги 1 и 2"}
              </p>
            </div>
            <button onClick={() => generateNormsTemplate(pendingCars ?? carDatabase, pendingWorks ?? worksDatabase)} disabled={!templateReady}
              className="flex items-center gap-2 px-4 py-2 bg-[hsl(215,70%,22%)] text-white rounded text-sm font-semibold hover:bg-[hsl(215,70%,18%)] transition-all disabled:opacity-50 shrink-0">
              <Icon name="Download" size={15} />Скачать шаблон
            </button>
          </div>
          {filledStatus && (
            <div className={`flex items-start gap-2 p-3 rounded-lg border text-xs animate-fade-in ${filledStatus.type === "success" ? "bg-green-50 border-green-200 text-green-700" : "bg-red-50 border-red-200 text-red-700"}`}>
              <Icon name={filledStatus.type === "success" ? "CheckCircle" : "XCircle"} size={14} className="shrink-0 mt-0.5" />
              {filledStatus.msg}
            </div>
          )}
          <input ref={filledFileRef} type="file" accept=".xlsx,.xls" className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFilledFile(f); e.target.value = ""; }} />
          <button onClick={() => filledFileRef.current?.click()} disabled={!templateReady}
            className="flex items-center gap-2 px-4 py-2 border border-[hsl(215,70%,22%)] text-[hsl(215,70%,22%)] rounded text-sm font-semibold hover:bg-blue-50 transition-all disabled:opacity-50">
            <Icon name="Upload" size={14} />Загрузить заполненный шаблон
          </button>
        </div>

        {step3Done && (
          <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-300 rounded-lg animate-fade-in">
            <Icon name="CheckCircle" size={22} className="text-green-600 shrink-0" />
            <div>
              <p className="font-semibold text-green-800 text-sm">База знаний загружена и готова к работе!</p>
              <p className="text-xs text-green-700 mt-0.5">Перейдите в «Калькулятор» или используйте «Консоль редактирования» для точечных правок.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPageDatabase;
