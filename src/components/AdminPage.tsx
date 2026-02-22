import { useState, useRef } from "react";
import Icon from "@/components/ui/icon";
import { useAppData } from "@/pages/Index";
import { CarBrand, Work } from "@/data/carDatabase";
import * as XLSX from "xlsx";

const ACCESS_CODE = "0170";

interface Props {
  ratePerHour: number;
  onRateChange: (rate: number) => void;
}

const AdminPage = ({ ratePerHour, onRateChange }: Props) => {
  const { carDatabase, setCarDatabase } = useAppData();

  // Auth
  const [authenticated, setAuthenticated] = useState(false);
  const [codeInput, setCodeInput] = useState("");
  const [codeError, setCodeError] = useState(false);

  // Rate
  const [inputValue, setInputValue] = useState(ratePerHour.toString());
  const [rateSaved, setRateSaved] = useState(false);
  const [rateError, setRateError] = useState("");

  // Excel upload
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadStatus, setUploadStatus] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleAuth = () => {
    if (codeInput === ACCESS_CODE) {
      setAuthenticated(true);
      setCodeError(false);
    } else {
      setCodeError(true);
      setCodeInput("");
    }
  };

  const handleSaveRate = () => {
    const val = parseFloat(inputValue);
    if (isNaN(val) || val <= 0) { setRateError("Введите корректное число больше 0"); return; }
    if (val > 50000) { setRateError("Ставка не может превышать 50 000 ₽"); return; }
    setRateError("");
    onRateChange(val);
    setRateSaved(true);
    setTimeout(() => setRateSaved(false), 3000);
  };

  /**
   * Парсинг Excel.
   * Ожидаемые столбцы (1-я строка — шапка, игнорируется):
   * A: Марка | B: Модель | C: Поколение | D: Годы | E: Модификация
   * F: Двигатель | G: КПП | H: Мощность | I: Работа | J: Нормачасы
   *
   * Каждая строка = одна работа для конкретной модификации.
   */
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadStatus(null);

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = new Uint8Array(ev.target!.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows: Record<string, unknown>[] = XLSX.utils.sheet_to_json(sheet, { defval: "" });

        if (rows.length === 0) {
          setUploadStatus({ type: "error", msg: "Файл пустой или не содержит данных." });
          setUploading(false);
          return;
        }

        const keys = Object.keys(rows[0]);
        if (keys.length < 10) {
          setUploadStatus({
            type: "error",
            msg: `Недостаточно столбцов (найдено ${keys.length}, ожидается минимум 10). Проверьте формат файла.`,
          });
          setUploading(false);
          return;
        }

        const get = (row: Record<string, unknown>, idx: number) =>
          String(row[keys[idx]] ?? "").trim();

        const brandsMap = new Map<string, CarBrand>();

        rows.forEach((row, i) => {
          const brandName = get(row, 0);
          const modelName = get(row, 1);
          const genName = get(row, 2);
          const years = get(row, 3);
          const modName = get(row, 4);
          const engine = get(row, 5);
          const transmission = get(row, 6);
          const power = get(row, 7);
          const workName = get(row, 8);
          const hoursRaw = get(row, 9);
          const hours = parseFloat(hoursRaw.replace(",", "."));

          if (!brandName || !modelName || !modName || !workName || isNaN(hours) || hours <= 0) return;

          const brandId = brandName.toLowerCase().replace(/\s+/g, "-");
          const modelId = `${brandId}__${modelName.toLowerCase().replace(/\s+/g, "-")}`;
          const genId = `${modelId}__${genName.toLowerCase().replace(/\s+/g, "-")}`;
          const modId = `${genId}__${modName.toLowerCase().replace(/\s+/g, "-")}`;

          if (!brandsMap.has(brandId)) {
            brandsMap.set(brandId, { id: brandId, name: brandName, models: [] });
          }
          const brand = brandsMap.get(brandId)!;

          let model = brand.models.find((m) => m.id === modelId);
          if (!model) {
            model = { id: modelId, name: modelName, generations: [] };
            brand.models.push(model);
          }

          let gen = model.generations.find((g) => g.id === genId);
          if (!gen) {
            gen = { id: genId, name: genName || modName, years, modifications: [] };
            model.generations.push(gen);
          }

          let mod = gen.modifications.find((m) => m.id === modId);
          if (!mod) {
            mod = {
              id: modId, name: modName,
              engine: engine || modName, transmission: transmission || "—", power: power || "—",
              works: [],
            };
            gen.modifications.push(mod);
          }

          const work: Work = { id: `w-${i}`, name: workName, hours };
          mod.works.push(work);
        });

        const cars = Array.from(brandsMap.values());
        const totalWorksCount = cars.reduce(
          (sum, b) => sum + b.models.reduce(
            (s2, m) => s2 + m.generations.reduce(
              (s3, g) => s3 + g.modifications.reduce((s4, mod) => s4 + mod.works.length, 0), 0), 0), 0);

        if (cars.length === 0) {
          setUploadStatus({ type: "error", msg: "Не удалось распознать данные. Проверьте формат файла." });
        } else {
          setCarDatabase(cars);
          setUploadStatus({
            type: "success",
            msg: `Загружено: ${cars.length} марок, ${totalWorksCount} работ из файла «${file.name}»`,
          });
        }
      } catch {
        setUploadStatus({ type: "error", msg: "Ошибка чтения файла. Убедитесь что файл в формате .xlsx или .xls" });
      }
      setUploading(false);
    };
    reader.readAsArrayBuffer(file);
    e.target.value = "";
  };

  const totalModifications = carDatabase.reduce(
    (sum, b) => sum + b.models.reduce(
      (s2, m) => s2 + m.generations.reduce((s3, g) => s3 + g.modifications.length, 0), 0), 0);
  const totalWorks = carDatabase.reduce(
    (sum, b) => sum + b.models.reduce(
      (s2, m) => s2 + m.generations.reduce(
        (s3, g) => s3 + g.modifications.reduce((s4, mod) => s4 + mod.works.length, 0), 0), 0), 0);

  if (!authenticated) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="bg-white border border-border rounded-xl shadow-md p-8 w-full max-w-sm">
          <div className="flex flex-col items-center mb-6">
            <div className="w-14 h-14 rounded-full bg-[hsl(215,70%,22%)] flex items-center justify-center mb-4">
              <Icon name="Lock" size={26} className="text-white" />
            </div>
            <h2 className="font-montserrat font-bold text-xl text-foreground">Панель администратора</h2>
            <p className="text-sm text-muted-foreground mt-1 text-center">Введите код доступа для входа</p>
          </div>
          <div className="space-y-3">
            <input
              type="password"
              value={codeInput}
              onChange={(e) => { setCodeInput(e.target.value); setCodeError(false); }}
              onKeyDown={(e) => e.key === "Enter" && handleAuth()}
              placeholder="• • • •"
              maxLength={10}
              className={`w-full border rounded px-4 py-3 text-center text-xl tracking-widest focus:outline-none focus:ring-2 focus:ring-[hsl(215,70%,22%)] transition-all ${
                codeError ? "border-red-400 bg-red-50" : "border-border"
              }`}
            />
            {codeError && (
              <p className="text-xs text-red-500 text-center flex items-center justify-center gap-1">
                <Icon name="AlertCircle" size={12} />
                Неверный код доступа
              </p>
            )}
            <button
              onClick={handleAuth}
              className="w-full py-2.5 bg-[hsl(215,70%,22%)] text-white rounded font-semibold text-sm hover:bg-[hsl(215,70%,18%)] transition-all shadow-sm"
            >
              Войти
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-montserrat font-bold text-2xl text-foreground">Панель администратора</h2>
          <p className="text-muted-foreground text-sm mt-1">Управление тарифами и базой данных</p>
        </div>
        <button
          onClick={() => setAuthenticated(false)}
          className="flex items-center gap-2 text-xs text-muted-foreground border border-border rounded px-3 py-1.5 hover:bg-gray-50 transition-all"
        >
          <Icon name="LogOut" size={13} />
          Выйти
        </button>
      </div>

      {/* Rate */}
      <div className="bg-white rounded-lg border border-border shadow-sm">
        <div className="px-6 py-4 border-b border-border flex items-center gap-2">
          <Icon name="DollarSign" size={18} className="text-[hsl(215,70%,22%)]" />
          <h3 className="font-semibold text-sm uppercase tracking-wider">Ставка нормачаса</h3>
        </div>
        <div className="p-6">
          <div className="max-w-sm">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-2">
              Базовая ставка нормачаса (₽)
            </label>
            <div className="flex gap-3">
              <div className="relative flex-1">
                <input
                  type="number"
                  value={inputValue}
                  onChange={(e) => { setInputValue(e.target.value); setRateSaved(false); setRateError(""); }}
                  className="w-full border border-border rounded px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(215,70%,22%)] pr-8"
                  placeholder="2500"
                  min="1"
                  max="50000"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">₽</span>
              </div>
              <button
                onClick={handleSaveRate}
                className="flex items-center gap-2 px-5 py-2.5 bg-[hsl(215,70%,22%)] text-white rounded text-sm font-semibold hover:bg-[hsl(215,70%,18%)] transition-all shadow-sm"
              >
                <Icon name="Save" size={15} />
                Сохранить
              </button>
            </div>
            {rateError && (
              <p className="mt-2 text-xs text-red-500 flex items-center gap-1">
                <Icon name="AlertCircle" size={12} />
                {rateError}
              </p>
            )}
            {rateSaved && (
              <p className="mt-2 text-xs text-green-600 flex items-center gap-1 animate-fade-in">
                <Icon name="CheckCircle" size={12} />
                Ставка успешно обновлена
              </p>
            )}
          </div>
          <div className="mt-6 p-4 bg-gray-50 border border-border rounded-md">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">Примеры расчёта</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[0.5, 1, 2, 4].map((h) => (
                <div key={h} className="bg-white border border-border rounded p-3 text-center">
                  <p className="text-xs text-muted-foreground">{h} н/ч</p>
                  <p className="font-bold text-sm text-[hsl(215,70%,22%)] mt-1">
                    {(h * ratePerHour).toLocaleString("ru-RU")} ₽
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Excel Upload */}
      <div className="bg-white rounded-lg border border-border shadow-sm">
        <div className="px-6 py-4 border-b border-border flex items-center gap-2">
          <Icon name="FileSpreadsheet" size={18} className="text-[hsl(215,70%,22%)]" />
          <h3 className="font-semibold text-sm uppercase tracking-wider">Загрузка базы из Excel</h3>
        </div>
        <div className="p-6 space-y-5">
          {uploadStatus && (
            <div className={`flex items-start gap-3 p-4 rounded-lg border animate-fade-in ${
              uploadStatus.type === "success"
                ? "bg-green-50 border-green-200 text-green-700"
                : "bg-red-50 border-red-200 text-red-700"
            }`}>
              <Icon name={uploadStatus.type === "success" ? "CheckCircle" : "XCircle"} size={16} className="mt-0.5 shrink-0" />
              <p className="text-sm">{uploadStatus.msg}</p>
            </div>
          )}

          <div className="border border-border rounded-lg p-5">
            <p className="font-semibold text-sm text-foreground mb-1">Формат файла</p>
            <p className="text-xs text-muted-foreground mb-4">
              Каждая строка — одна работа для конкретной модификации. Строки с одинаковой модификацией объединяются автоматически.
              Нормачасы у одной и той же работы могут различаться для разных модификаций.
            </p>
            <div className="overflow-x-auto rounded border border-border">
              <table className="text-xs w-full border-collapse">
                <thead>
                  <tr className="bg-[hsl(215,70%,22%)] text-white">
                    {["A\nМарка","B\nМодель","C\nПоколение","D\nГоды","E\nМодификация","F\nДвигатель","G\nКПП","H\nМощность","I\nРабота","J\nНормачасы"].map((h) => (
                      <th key={h} className="px-2 py-2 text-center font-semibold whitespace-pre border-r border-blue-800 last:border-0">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["Toyota","Camry","V70","2017-н.в.","2.5 AT","2.5 бенз.","Автомат","181 л.с.","Замена масла","0.5"],
                    ["Toyota","Camry","V70","2017-н.в.","2.5 AT","","","","Замена колодок","1.0"],
                    ["Toyota","Camry","V70","2017-н.в.","3.5 AT","3.5 бенз.","Автомат","249 л.с.","Замена масла","0.5"],
                    ["Toyota","Camry","V70","2017-н.в.","3.5 AT","","","","Замена колодок","1.2"],
                  ].map((row, i) => (
                    <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      {row.map((cell, j) => (
                        <td key={j} className="px-2 py-1.5 border-r border-b border-border text-center text-gray-600 last:border-r-0">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-xs text-muted-foreground flex items-start gap-1.5">
              <Icon name="Info" size={13} className="shrink-0 mt-0.5 text-[hsl(215,70%,22%)]" />
              Первая строка файла — заголовки (будут проигнорированы). Столбцы F, G, H необязательны.
            </p>
          </div>

          <input ref={fileInputRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={handleFileUpload} />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-2 px-6 py-3 bg-[hsl(215,70%,22%)] text-white rounded text-sm font-semibold hover:bg-[hsl(215,70%,18%)] transition-all shadow-sm disabled:opacity-50"
          >
            <Icon name={uploading ? "Loader" : "Upload"} size={16} />
            {uploading ? "Загружаю..." : "Загрузить Excel-файл"}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-white rounded-lg border border-border shadow-sm">
        <div className="px-6 py-4 border-b border-border flex items-center gap-2">
          <Icon name="BarChart2" size={18} className="text-[hsl(215,70%,22%)]" />
          <h3 className="font-semibold text-sm uppercase tracking-wider">Текущая база данных</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
            {[
              { label: "Марок авто", value: carDatabase.length.toString(), icon: "Car" },
              { label: "Модификаций", value: totalModifications.toString(), icon: "Settings2" },
              { label: "Работ в базе", value: totalWorks.toString(), icon: "Wrench" },
              { label: "Текущая ставка", value: `${ratePerHour.toLocaleString("ru-RU")} ₽`, icon: "DollarSign" },
            ].map((s) => (
              <div key={s.label} className="bg-blue-50 border border-blue-100 rounded-lg p-4 text-center">
                <Icon name={s.icon} size={20} className="text-[hsl(215,70%,22%)] mx-auto mb-2" />
                <p className="text-xl font-bold font-montserrat text-[hsl(215,70%,22%)]">{s.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
              </div>
            ))}
          </div>
          <div className="space-y-2">
            {carDatabase.map((brand) => {
              const bWorks = brand.models.reduce(
                (s, m) => s + m.generations.reduce(
                  (s2, g) => s2 + g.modifications.reduce((s3, mod) => s3 + mod.works.length, 0), 0), 0);
              const bMods = brand.models.reduce(
                (s, m) => s + m.generations.reduce((s2, g) => s2 + g.modifications.length, 0), 0);
              return (
                <div key={brand.id} className="flex items-center justify-between py-2 px-3 border border-border rounded hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-2">
                    <Icon name="Car" size={14} className="text-muted-foreground" />
                    <span className="text-sm font-medium">{brand.name}</span>
                    <span className="text-xs text-muted-foreground">({brand.models.length} мод.)</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground bg-gray-100 px-2 py-0.5 rounded-full">
                      {bMods} модиф.
                    </span>
                    <span className="text-xs text-muted-foreground bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full">
                      {bWorks} работ
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
