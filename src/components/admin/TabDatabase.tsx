import { useState } from "react";
import * as XLSX from "xlsx";
import Icon from "@/components/ui/icon";
import { useAppData } from "@/pages/Index";
import type { AutoSyncStatus } from "@/pages/Index";
import {
  FUNC_UPLOAD_CARS_CHUNK, FUNC_FETCH_YANDEX_FILE, FUNC_PARSE_YANDEX_FILE,
  downloadCarsTemplate,
} from "@/components/admin/adminHelpers";
import { CarBrand } from "@/data/carDatabase";

const FUNC_GET_CARS = "https://functions.poehali.dev/135a6c4a-9149-40f9-a7a8-cf2ce637fdb2";

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

async function loadFullCarDatabase(): Promise<CarBrand[]> {
  const res = await fetch(FUNC_GET_CARS);
  const raw = await res.json();
  const data = typeof raw === "string" ? JSON.parse(raw) : raw;
  if (Array.isArray(data)) return data as CarBrand[];
  if (data?.brands && Array.isArray(data.brands)) return data.brands as CarBrand[];
  return [];
}

const TabDatabase = () => {
  const {
    carDatabase, setCarDatabase, carDbLoading, carDbCount, reloadCarDb,
    carsUrl, setCarsUrl, carsUrlEnabled, setCarsUrlEnabled,
    autoSyncStatus, autoSyncMsg, triggerAutoSync,
  } = useAppData();

  const [urlInput, setUrlInput] = useState(carsUrl);
  const [urlStatus, setUrlStatus] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [urlLoading, setUrlLoading] = useState(false);

  const [carsStatus, setCarsStatus] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [syncing, setSyncing] = useState(false);

  const hasCars = carDatabase.length > 0 || carDbCount > 0;

  // После успешной загрузки в БД — сразу подгружаем полное дерево в контекст
  const syncToContext = async () => {
    setSyncing(true);
    try {
      const brands = await loadFullCarDatabase();
      if (brands.length > 0) {
        setCarDatabase(brands);
      }
    } catch {
      // ignore — данные в БД есть, просто не синхронизировались в localStorage
    } finally {
      setSyncing(false);
    }
  };

  const uploadCarsToBackend = async (file: File, mode: "replace" | "merge") => {
    setUploadProgress(0);
    setCarsStatus(null);
    try {
      setUploadProgress(5);
      const arrayBuffer = await file.arrayBuffer();
      const wb = XLSX.read(new Uint8Array(arrayBuffer), { type: "array" });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const allRows: unknown[][] = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" });

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

      const CHUNK_SIZE = 100;
      const chunks: unknown[][][] = [];
      for (let i = 0; i < dataRows.length; i += CHUNK_SIZE) {
        chunks.push(dataRows.slice(i, i + CHUNK_SIZE));
      }

      setUploadProgress(10);
      let totalInserted = 0;
      let totalSkipped = 0;

      for (let ci = 0; ci < chunks.length; ci++) {
        const res = await fetch(FUNC_UPLOAD_CARS_CHUNK, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ header: headerRow, rows: chunks[ci], chunk: ci, total_chunks: chunks.length, mode }),
        });
        const data = await res.json();
        const parsed = typeof data === "string" ? JSON.parse(data) : data;
        if (!res.ok || parsed.error) {
          setCarsStatus({ type: "error", msg: parsed.error || `Ошибка на чанке ${ci + 1}/${chunks.length}` });
          return;
        }
        totalInserted += parsed.inserted ?? 0;
        totalSkipped += parsed.skipped ?? 0;
        setUploadProgress(10 + Math.round(((ci + 1) / chunks.length) * 80));
        // Пауза между чанками чтобы не перегружать БД
        if (ci < chunks.length - 1) await new Promise((r) => setTimeout(r, 300));
      }

      setUploadProgress(95);
      await reloadCarDb();
      await syncToContext();
      setUploadProgress(100);
      setCarsStatus({
        type: "success",
        msg: `Готово! Загружено ${totalInserted.toLocaleString("ru-RU")} модификаций из «${file.name}». Пропущено строк: ${totalSkipped}.`,
      });
    } catch (e) {
      setCarsStatus({ type: "error", msg: `Ошибка: ${e instanceof Error ? e.message : "неизвестная ошибка"}` });
    } finally {
      setUploadProgress(null);
    }
  };

  const handleFetchFromDisk = async (urlOverride?: string) => {
    const url = (urlOverride ?? urlInput).trim();
    if (!url) { setUrlStatus({ type: "error", msg: "Введите ссылку на файл Яндекс.Диска" }); return; }
    setUrlLoading(true);
    setUrlStatus(null);
    setCarsStatus(null);
    try {
      setUrlStatus({ type: "success", msg: "Шаг 1/2: скачиваю файл с Яндекс.Диска…" });
      const res1 = await fetch(FUNC_FETCH_YANDEX_FILE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const d1 = await res1.json().then((r: unknown) => typeof r === "string" ? JSON.parse(r) : r) as { ok?: boolean; error?: string };
      if (!res1.ok || d1.error) throw new Error(d1.error || "Ошибка скачивания файла");

      setUrlStatus({ type: "success", msg: "Шаг 2/2: считаю строки в файле…" });
      const resInit = await fetch(FUNC_PARSE_YANDEX_FILE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ init: true }),
      });
      const dInit = await resInit.json().then((r: unknown) => typeof r === "string" ? JSON.parse(r) : r) as { ok?: boolean; total_chunks?: number; error?: string };
      if (!resInit.ok || dInit.error) throw new Error(dInit.error || "Ошибка чтения файла");

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
      await syncToContext();
      setUrlStatus({
        type: "success",
        msg: `Готово! Загружено ${totalInserted.toLocaleString("ru-RU")} модификаций с Яндекс.Диска. Пропущено: ${totalSkipped}.`,
      });
    } catch (e) {
      setUrlStatus({ type: "error", msg: e instanceof Error ? e.message : "Неизвестная ошибка" });
    } finally {
      setUrlLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Автосинхронизация */}
      {autoSyncStatus !== "idle" && (
        <div className={`flex items-center gap-2.5 px-4 py-3 rounded-lg border text-sm font-medium ${autoSyncColors[autoSyncStatus]}`}>
          <Icon name={autoSyncIcon[autoSyncStatus]} size={16} className={`shrink-0 ${autoSyncStatus === "syncing" ? "animate-spin" : ""}`} />
          <span className="flex-1">{autoSyncMsg}</span>
          {autoSyncStatus === "error" && (
            <button onClick={triggerAutoSync} className="text-xs underline opacity-70 hover:opacity-100">Повторить</button>
          )}
        </div>
      )}

      {/* Статус базы */}
      <div className="flex items-center gap-4 p-4 bg-gray-50 border rounded-xl">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${hasCars ? "bg-green-100" : "bg-gray-200"}`}>
          <Icon name={hasCars ? "Database" : "DatabaseZap"} size={20} className={hasCars ? "text-green-600" : "text-muted-foreground"} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-foreground">
            {hasCars ? "База автомобилей загружена" : "База автомобилей пуста"}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {carDbLoading
              ? "Проверяю базу…"
              : hasCars
              ? `${carDbCount.toLocaleString("ru-RU")} модификаций в базе · ${carDatabase.length} марок в калькуляторе`
              : "Загрузите Excel файл с базой авто ниже"}
          </p>
        </div>
        {syncing && (
          <div className="flex items-center gap-1.5 text-xs text-blue-600">
            <Icon name="Loader" size={13} className="animate-spin" />
            Синхронизирую…
          </div>
        )}
        {hasCars && !syncing && (
          <button
            onClick={async () => { setSyncing(true); await reloadCarDb(); await syncToContext(); }}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground border rounded-lg px-3 py-1.5 hover:bg-white transition-colors"
          >
            <Icon name="RefreshCw" size={13} />
            Обновить
          </button>
        )}
      </div>

      {/* Загрузка из Excel */}
      <div className="border rounded-xl bg-white p-5 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-semibold text-sm text-foreground">Загрузка базы из Excel</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Файл с колонками: Марка, Модель, Поколение, Модификация, тип двигателя, КПП, тормоза и др.
            </p>
          </div>
          <button
            onClick={() => downloadCarsTemplate()}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-[hsl(215,70%,22%)] text-[hsl(215,70%,22%)] rounded text-xs font-semibold hover:bg-blue-50 transition-all shrink-0"
          >
            <Icon name="Download" size={13} />
            Шаблон
          </button>
        </div>

        {carsStatus && (
          <div className={`flex items-start gap-2 p-3 rounded-lg border text-xs ${carsStatus.type === "success" ? "bg-green-50 border-green-200 text-green-700" : "bg-red-50 border-red-200 text-red-700"}`}>
            <Icon name={carsStatus.type === "success" ? "CheckCircle" : "XCircle"} size={14} className="shrink-0 mt-0.5" />
            {carsStatus.msg}
          </div>
        )}

        {uploadProgress !== null && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Загрузка…</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-[hsl(215,70%,22%)] transition-all duration-300 rounded-full"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          <label className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${uploadProgress !== null ? "opacity-40 pointer-events-none" : "bg-[hsl(215,70%,22%)] text-white hover:bg-[hsl(215,70%,18%)]"}`}>
            <Icon name="Upload" size={15} />
            Загрузить файл
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) { uploadCarsToBackend(f, hasCars ? "merge" : "replace"); e.target.value = ""; } }}
            />
          </label>
          {hasCars && (
            <label className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border transition-all cursor-pointer ${uploadProgress !== null ? "opacity-40 pointer-events-none" : "border-border text-foreground hover:bg-gray-50"}`}>
              <Icon name="RefreshCw" size={15} />
              Перезаписать базу
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) { uploadCarsToBackend(f, "replace"); e.target.value = ""; } }}
              />
            </label>
          )}
        </div>
      </div>

      {/* Яндекс.Диск */}
      <div className="border rounded-xl bg-white p-5 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-semibold text-sm text-foreground">Автообновление с Яндекс.Диска</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Файл будет автоматически загружаться при каждом открытии сайта
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer shrink-0">
            <input
              type="checkbox"
              checked={carsUrlEnabled}
              onChange={(e) => setCarsUrlEnabled(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-5 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[hsl(215,70%,22%)]" />
          </label>
        </div>

        {urlStatus && (
          <div className={`flex items-start gap-2 p-3 rounded-lg border text-xs ${urlStatus.type === "success" ? "bg-green-50 border-green-200 text-green-700" : "bg-red-50 border-red-200 text-red-700"}`}>
            <Icon name={urlStatus.type === "success" ? "CheckCircle" : "XCircle"} size={14} className="shrink-0 mt-0.5" />
            {urlStatus.msg}
          </div>
        )}

        <div className="flex gap-2">
          <input
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="https://disk.yandex.ru/d/..."
            className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(215,70%,22%)]/30"
            disabled={urlLoading}
          />
          <button
            onClick={() => handleFetchFromDisk()}
            disabled={urlLoading || !urlInput.trim()}
            className="flex items-center gap-2 px-4 py-2 bg-[hsl(215,70%,22%)] text-white rounded-lg text-sm font-semibold hover:bg-[hsl(215,70%,18%)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
          >
            {urlLoading ? <Icon name="Loader" size={15} className="animate-spin" /> : <Icon name="Download" size={15} />}
            {urlLoading ? "Загружаю…" : "Загрузить"}
          </button>
        </div>
        {carsUrl && (
          <p className="text-xs text-muted-foreground truncate">
            Сохранённая ссылка: <span className="text-foreground">{carsUrl}</span>
          </p>
        )}
      </div>
    </div>
  );
};

export default TabDatabase;