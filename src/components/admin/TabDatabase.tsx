import { useState, useRef } from "react";
import * as XLSX from "xlsx";
import Icon from "@/components/ui/icon";
import { useAppData, WorkEntry } from "@/pages/Index";
import { UploadBlock, StepBadge } from "@/components/admin/AdminUploadBlocks";
import type { AutoSyncStatus } from "@/pages/Index";
import {
  FUNC_UPLOAD_CARS_CHUNK, FUNC_FETCH_YANDEX_FILE, FUNC_PARSE_YANDEX_FILE, CAR_COLUMNS,
  downloadCarsTemplate, downloadWorksTemplate,
  mergeWorks, parseWorksList, generateNormsTemplate, parseFilledTemplate,
  filterAndDownloadOldCars,
} from "@/components/admin/adminHelpers";

const autoSyncColors: Record<AutoSyncStatus, string> = {
  idle: "",
  syncing: "bg-blue-50 border-blue-200 text-blue-700",
  done: "bg-green-50 border-green-200 text-green-700",
  error: "bg-red-50 border-red-200 text-red-700",
};
const autoSyncIcon: Record<AutoSyncStatus, string> = {
  idle: "",
  syncing: "Loader",
  done: "CheckCircle",
  error: "XCircle",
};

const TabDatabase = () => {
  const { carDatabase, setCarDatabase, carDbLoading, carDbCount, reloadCarDb, worksDatabase, setWorksDatabase, carsUrl, setCarsUrl, carsUrlEnabled, setCarsUrlEnabled, autoSyncStatus, autoSyncMsg, triggerAutoSync } = useAppData();

  const [urlInput, setUrlInput] = useState(carsUrl);
  const [urlStatus, setUrlStatus] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [urlLoading, setUrlLoading] = useState(false);

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
      const d1 = await res1.json().then((r: unknown) => typeof r === "string" ? JSON.parse(r) : r) as { ok?: boolean; error?: string };
      if (!res1.ok || d1.error) throw new Error(d1.error || "Ошибка скачивания файла");

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

  const [filterStatus, setFilterStatus] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [filterLoading, setFilterLoading] = useState(false);
  const filterFileRef = useRef<HTMLInputElement>(null);

  const [reloadStatus, setReloadStatus] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [reloadLoading, setReloadLoading] = useState(false);

  const handleReloadDb = async () => {
    setReloadLoading(true);
    setReloadStatus(null);
    try {
      await reloadCarDb();
      setReloadStatus({ type: "success", msg: "База данных успешно обновлена!" });
    } catch {
      setReloadStatus({ type: "error", msg: "Ошибка при обновлении базы данных." });
    } finally {
      setReloadLoading(false);
    }
  };

  const [carsStatus, setCarsStatus] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [worksStatus, setWorksStatus] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [filledStatus, setFilledStatus] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [pendingWorks, setPendingWorks] = useState<WorkEntry[] | null>(() => worksDatabase.length > 0 ? worksDatabase : null);
  const [dbReady, setDbReady] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const filledFileRef = useRef<HTMLInputElement>(null);

  const uploadCarsToBackend = async (file: File, mode: "replace" | "merge") => {
    setUploadProgress(0);
    setCarsStatus(null);
    try {
      // 1. Читаем Excel на фронте
      setUploadProgress(5);
      const arrayBuffer = await file.arrayBuffer();
      const wb = XLSX.read(new Uint8Array(arrayBuffer), { type: "array" });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const allRows: unknown[][] = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" });

      // Найти строку с заголовком
      let headerIdx = 0;
      for (let i = 0; i < Math.min(5, allRows.length); i++) {
        const first = String(allRows[i][0] ?? "").trim().toLowerCase();
        if (first === "марка" || first === "brand") { headerIdx = i; break; }
      }
      const headerRow = allRows[headerIdx] as string[];
      const dataRows = allRows.slice(headerIdx + 1).filter(r => r.some(c => c !== ""));

      if (dataRows.length === 0) {
        setCarsStatus({ type: "error", msg: "Файл пустой или не содержит данных." });
        return;
      }

      // 2. Нарезаем на чанки по 500 строк
      const CHUNK_SIZE = 500;
      const chunks: unknown[][][] = [];
      for (let i = 0; i < dataRows.length; i += CHUNK_SIZE) {
        chunks.push(dataRows.slice(i, i + CHUNK_SIZE));
      }

      setUploadProgress(10);

      let totalInserted = 0;
      let totalSkipped = 0;

      // 3. Отправляем чанки последовательно
      for (let ci = 0; ci < chunks.length; ci++) {
        const res = await fetch(FUNC_UPLOAD_CARS_CHUNK, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            header: headerRow,
            rows: chunks[ci],
            chunk: ci,
            total_chunks: chunks.length,
            mode,
          }),
        });
        const data = await res.json();
        const parsed = typeof data === "string" ? JSON.parse(data) : data;

        if (!res.ok || parsed.error) {
          setCarsStatus({ type: "error", msg: parsed.error || `Ошибка на чанке ${ci + 1}/${chunks.length}` });
          return;
        }

        totalInserted += parsed.inserted ?? 0;
        totalSkipped += parsed.skipped ?? 0;

        // Прогресс: 10% до 95% — по чанкам
        setUploadProgress(10 + Math.round(((ci + 1) / chunks.length) * 85));
      }

      setUploadProgress(100);
      setCarsStatus({
        type: "success",
        msg: `Загружено ${totalInserted.toLocaleString("ru-RU")} модификаций из «${file.name}». Пропущено строк: ${totalSkipped}.`,
      });
      setDbReady(true);
      await reloadCarDb();
      // Автоматически восстанавливаем ранее загруженные работы
      if (worksDatabase.length > 0) {
        setPendingWorks(worksDatabase);
      }
    } catch (e) {
      setCarsStatus({ type: "error", msg: `Ошибка: ${e instanceof Error ? e.message : "неизвестная ошибка"}` });
    } finally {
      setUploadProgress(null);
    }
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

  const handleCarsFile = (file: File) => uploadCarsToBackend(file, "replace");
  const handleCarsUpdate = (file: File) => uploadCarsToBackend(file, "merge");

  const handleWorksFile = (file: File) => parseWorksFile(file, (works) => {
    setPendingWorks(works); setWorksDatabase(works);
    setWorksStatus({ type: "success", msg: `Загружено ${works.length} видов работ из «${file.name}»` });
  }, (msg) => setWorksStatus({ type: "error", msg }));

  const handleWorksUpdate = (file: File) => parseWorksFile(file, (incoming) => {
    const merged = mergeWorks(pendingWorks ?? worksDatabase, incoming);
    const added = merged.length - (pendingWorks ?? worksDatabase).length;
    setPendingWorks(merged); setWorksDatabase(merged);
    setWorksStatus({ type: "success", msg: `Добавлено ${added} новых работ, итого ${merged.length}.` });
  }, (msg) => setWorksStatus({ type: "error", msg }));

  const handleFilledFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = new Uint8Array(ev.target!.result as ArrayBuffer);
        const wb = XLSX.read(data, { type: "array" });
        const rows: Record<string, unknown>[] = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { defval: "" });
        if (rows.length === 0) { setFilledStatus({ type: "error", msg: "Файл пустой." }); return; }
        const { updatedCars, totalFilled } = parseFilledTemplate(rows, carDatabase);
        if (totalFilled === 0) {
          setFilledStatus({ type: "error", msg: "Нормачасы не найдены. Убедитесь что столбец J заполнен числами." });
        } else {
          setCarDatabase(updatedCars);
          setDbReady(true);
          setFilledStatus({ type: "success", msg: `База знаний готова! Заполнено ${totalFilled} нормативов из «${file.name}»` });
        }
      } catch { setFilledStatus({ type: "error", msg: "Ошибка чтения файла." }); }
    };
    reader.readAsArrayBuffer(file);
  };

  const totalWorks = carDatabase.reduce((s, b) => s + b.models.reduce((s2, m) => s2 + m.generations.reduce((s3, g) => s3 + g.modifications.reduce((s4, mod) => s4 + mod.works.length, 0), 0), 0), 0);
  const hasCars = carDatabase.length > 0 || carDbCount > 0;
  const hasWorks = worksDatabase.length > 0;
  const step1Done = hasCars;
  const step2Done = !!pendingWorks || hasWorks;
  const step3Done = dbReady || (hasCars && hasWorks && totalWorks > 0);
  const templateReady = step1Done && step2Done;

  return (
    <div className="space-y-6">
      {autoSyncStatus !== "idle" && (
        <div className={`flex items-center gap-2.5 px-4 py-3 rounded-lg border text-sm font-medium ${autoSyncColors[autoSyncStatus]}`}>
          <Icon name={autoSyncIcon[autoSyncStatus]} size={16} className={`shrink-0 ${autoSyncStatus === "syncing" ? "animate-spin" : ""}`} />
          <span className="flex-1">{autoSyncMsg}</span>
          {autoSyncStatus === "error" && (
            <button onClick={triggerAutoSync} className="text-xs underline opacity-70 hover:opacity-100">Повторить</button>
          )}
        </div>
      )}

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
                Укажите постоянную публичную ссылку на xlsx-файл. Включите тогл — кнопка «Обновить» скачает файл напрямую с диска. При выключенном тогле — загрузка файлом как обычно.
              </p>
            </div>
          </div>
          {/* Тогл */}
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

      {/* Блок очистки базы */}
      <div className="border border-amber-200 rounded-lg p-5 bg-amber-50 space-y-3">
        <div className="flex items-start gap-3">
          <Icon name="FilterX" size={20} className="text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-sm text-amber-900">Очистка базы от устаревших моделей</p>
            <p className="text-xs text-amber-700 mt-1">
              Загрузите xlsx-файл базы авто — скрипт удалит все строки, у которых год окончания выпуска старше 30 лет
              (до {new Date().getFullYear() - 30} года включительно), и скачает готовый очищенный файл.
            </p>
          </div>
        </div>

        {filterStatus && (
          <div className={`flex items-start gap-2 p-3 rounded-lg border text-xs ${filterStatus.type === "success" ? "bg-green-50 border-green-200 text-green-700" : "bg-red-50 border-red-200 text-red-700"}`}>
            <Icon name={filterStatus.type === "success" ? "CheckCircle" : "XCircle"} size={14} className="shrink-0 mt-0.5" />
            {filterStatus.msg}
          </div>
        )}

        <input ref={filterFileRef} type="file" accept=".xlsx,.xls" className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (!f) return;
            e.target.value = "";
            setFilterLoading(true);
            setFilterStatus(null);
            filterAndDownloadOldCars(
              f,
              (removed, total, fileName) => {
                setFilterLoading(false);
                setFilterStatus({
                  type: "success",
                  msg: `Готово! Удалено ${removed.toLocaleString("ru-RU")} строк из ${total.toLocaleString("ru-RU")}. Файл «${fileName}» скачан.`,
                });
              },
              (msg) => {
                setFilterLoading(false);
                setFilterStatus({ type: "error", msg });
              }
            );
          }}
        />
        <button
          type="button"
          onClick={() => filterFileRef.current?.click()}
          disabled={filterLoading}
          className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded text-sm font-semibold hover:bg-amber-700 transition-all disabled:opacity-60 disabled:pointer-events-none"
        >
          {filterLoading
            ? <><Icon name="Loader" size={14} className="animate-spin" />Обрабатываю…</>
            : <><Icon name="Upload" size={14} />Загрузить файл и скачать очищенный</>
          }
        </button>
      </div>

      {/* Кнопка обновления базы — всегда видна */}
      <div className="p-4 border-2 border-dashed border-blue-400 rounded-lg bg-blue-50">
        <p className="text-xs text-blue-700 mb-2">После загрузки Excel-файла нажмите, чтобы обновить все справочники:</p>
        <button
          type="button"
          onClick={handleReloadDb}
          disabled={reloadLoading || (!hasCars && carsStatus?.type !== "success")}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Icon name={reloadLoading ? "Loader" : "RefreshCw"} size={14} className={reloadLoading ? "animate-spin" : ""} />
          {reloadLoading ? "Обновляю базу…" : "Обновить загруженную базу данных"}
        </button>
        {reloadStatus && (
          <div className={`mt-2 flex items-center gap-2 p-2.5 rounded border text-xs ${reloadStatus.type === "success" ? "bg-green-50 border-green-200 text-green-700" : "bg-red-50 border-red-200 text-red-700"}`}>
            <Icon name={reloadStatus.type === "success" ? "CheckCircle" : "XCircle"} size={13} className="shrink-0" />
            {reloadStatus.msg}
          </div>
        )}
      </div>

      <div className="border-t border-border pt-5 space-y-4">
        {/* Step 1 */}
        <UploadBlock title="Шаг 1 — Загрузите базу автомобилей"
          description="Файлы до 200мб+. Каждая строка — одна модификация. Поддерживается 89 колонок: кузов, двигатель, трансмиссия, подвеска, электро-данные."
          buttonLabel={carsUrlEnabled && carsUrl ? "Обновить с Яндекс.Диска" : "Загрузить базу авто (.xlsx)"}
          accept=".xlsx,.xls"
          onFile={handleCarsFile} onUpdate={handleCarsUpdate} hasData={hasCars || carDbCount > 0}
          onDownloadTemplate={downloadCarsTemplate} status={carsStatus} uploading={uploadProgress !== null || urlLoading}
          onButtonClick={carsUrlEnabled && carsUrl ? () => handleFetchFromDisk(carsUrl) : undefined}>
          {uploadProgress !== null && (
            <div className="mb-4 space-y-2 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-xs font-medium text-blue-800">
                  {uploadProgress < 10
                    ? "⏳ Читаю файл…"
                    : uploadProgress < 95
                    ? "📤 Загружаю в базу данных…"
                    : uploadProgress < 100
                    ? "⚙️ Финальная обработка…"
                    : "✅ Готово!"}
                </span>
                <span className="text-sm font-bold text-blue-900">{uploadProgress}%</span>
              </div>
              <div className="h-3 bg-blue-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[hsl(215,70%,22%)] rounded-full shadow-sm"
                  style={{ width: `${uploadProgress}%`, transition: "width 0.4s ease" }}
                />
              </div>
              <p className="text-xs text-blue-600">Не закрывайте страницу до завершения загрузки</p>
            </div>
          )}
          {carDbLoading && uploadProgress === null && (
            <div className="mb-3 flex items-center gap-2 text-xs text-muted-foreground animate-pulse">
              <Icon name="Loader" size={13} />Загрузка базы из сервера…
            </div>
          )}
          {carDbCount > 0 && uploadProgress === null && (
            <div className="mb-3 flex items-center gap-2 text-xs text-green-700 bg-green-50 border border-green-200 rounded px-3 py-2">
              <Icon name="CheckCircle" size={13} />В базе: {carDbCount.toLocaleString("ru-RU")} модификаций
            </div>
          )}
          <div className="overflow-x-auto rounded border border-border mb-4">
            <table className="text-xs border-collapse">
              <thead>
                <tr className="bg-[hsl(215,70%,22%)] text-white">
                  {CAR_COLUMNS.slice(0, 10).map((h) => (
                    <th key={h} className="px-2 py-1.5 text-center whitespace-nowrap border-r border-blue-800 last:border-0">{h}</th>
                  ))}
                  <th className="px-2 py-1.5 text-center whitespace-nowrap text-blue-200">… ещё {CAR_COLUMNS.length - 10} колонок</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Toyota","Camry","VII (V70)","2017","н.в.","SE","2.5 AT","Седан","5","4885"],
                  ["Toyota","Camry","VII (V70)","2017","н.в.","SE","3.5 AT","Седан","5","4885"],
                  ["BMW","3 Series","G20","2018","н.в.","","320i AT","Седан","5","4709"],
                ].map((row, i) => (
                  <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    {row.map((c, j) => <td key={j} className="px-2 py-1.5 border-r border-b border-border text-center text-gray-600 last:border-r-0">{c}</td>)}
                    <td className="px-2 py-1.5 text-muted-foreground/40 text-center">…</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </UploadBlock>

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
              <span>
                Ранее загруженные <strong>{worksDatabase.length} работ</strong> автоматически привязаны к новой базе авто. Этот шаг можно пропустить или обновить список работ.
              </span>
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
                {hasCars && pendingWorks ? `${carDatabase.length} марок × ${pendingWorks.length} работ` : "Загрузите шаги 1 и 2"}
              </p>
            </div>
            <button onClick={() => generateNormsTemplate(carDatabase, pendingWorks ?? worksDatabase)} disabled={!templateReady}
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

export default TabDatabase;