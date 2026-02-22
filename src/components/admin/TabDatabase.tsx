import { useState, useRef } from "react";
import * as XLSX from "xlsx";
import Icon from "@/components/ui/icon";
import { useAppData, WorkEntry } from "@/pages/Index";
import { UploadBlock, StepBadge } from "@/components/admin/AdminUploadBlocks";
import {
  FUNC_UPLOAD_CARS_CHUNK, CAR_COLUMNS,
  downloadCarsTemplate, downloadWorksTemplate,
  mergeWorks, parseWorksList, generateNormsTemplate, parseFilledTemplate,
} from "@/components/admin/adminHelpers";

const TabDatabase = () => {
  const { carDatabase, setCarDatabase, carDbLoading, carDbCount, reloadCarDb, worksDatabase, setWorksDatabase } = useAppData();

  const [carsStatus, setCarsStatus] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [worksStatus, setWorksStatus] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [filledStatus, setFilledStatus] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [pendingWorks, setPendingWorks] = useState<WorkEntry[] | null>(null);
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
      <div className="flex flex-wrap gap-4 items-center">
        <StepBadge n={1} active={!step1Done} done={step1Done} label="База автомобилей" />
        <Icon name="ChevronRight" size={16} className="text-muted-foreground hidden sm:block" />
        <StepBadge n={2} active={step1Done && !step2Done} done={step2Done} label="Список работ" />
        <Icon name="ChevronRight" size={16} className="text-muted-foreground hidden sm:block" />
        <StepBadge n={3} active={step2Done && !step3Done} done={step3Done} label="Нормативы" />
      </div>

      <div className="border-t border-border pt-5 space-y-4">
        {/* Step 1 */}
        <UploadBlock title="Шаг 1 — Загрузите базу автомобилей"
          description="Файлы до 200мб+. Каждая строка — одна модификация. Поддерживается 89 колонок: кузов, двигатель, трансмиссия, подвеска, электро-данные."
          buttonLabel="Загрузить базу авто (.xlsx)"
          accept=".xlsx,.xls"
          onFile={handleCarsFile} onUpdate={handleCarsUpdate} hasData={hasCars || carDbCount > 0}
          onDownloadTemplate={downloadCarsTemplate} status={carsStatus} uploading={uploadProgress !== null}>
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