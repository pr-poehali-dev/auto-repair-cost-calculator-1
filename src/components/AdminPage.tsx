import { useState, useRef } from "react";
import Icon from "@/components/ui/icon";
import { useAppData } from "@/pages/Index";
import { CarBrand, SparePartWork } from "@/data/carDatabase";
import * as XLSX from "xlsx";

const ACCESS_CODE = "0170";

interface Props {
  ratePerHour: number;
  onRateChange: (rate: number) => void;
}

const AdminPage = ({ ratePerHour, onRateChange }: Props) => {
  const { carDatabase, spareParts, setExcelData } = useAppData();

  // Auth
  const [authenticated, setAuthenticated] = useState(false);
  const [codeInput, setCodeInput] = useState("");
  const [codeError, setCodeError] = useState(false);

  // Rate
  const [inputValue, setInputValue] = useState(ratePerHour.toString());
  const [rateSaved, setRateSaved] = useState(false);
  const [rateError, setRateError] = useState("");

  // Excel upload
  const fileInputCarsRef = useRef<HTMLInputElement>(null);
  const fileInputPartsRef = useRef<HTMLInputElement>(null);
  const [uploadStatus, setUploadStatus] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [uploading, setUploading] = useState(false);

  // Auth handler
  const handleAuth = () => {
    if (codeInput === ACCESS_CODE) {
      setAuthenticated(true);
      setCodeError(false);
    } else {
      setCodeError(true);
      setCodeInput("");
    }
  };

  // Rate handler
  const handleSaveRate = () => {
    const val = parseFloat(inputValue);
    if (isNaN(val) || val <= 0) { setRateError("Введите корректное число больше 0"); return; }
    if (val > 50000) { setRateError("Ставка не может превышать 50 000 ₽"); return; }
    setRateError("");
    onRateChange(val);
    setRateSaved(true);
    setTimeout(() => setRateSaved(false), 3000);
  };

  // Excel: parse spare parts (columns: name, hours)
  const handlePartsUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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

        const parts: SparePartWork[] = rows
          .filter((row) => {
            const keys = Object.keys(row);
            return keys.length >= 2;
          })
          .map((row, i) => {
            const keys = Object.keys(row);
            const name = String(row[keys[0]] || "").trim();
            const hoursRaw = row[keys[1]];
            const hours = parseFloat(String(hoursRaw).replace(",", ".")) || 0;
            return {
              id: `excel-part-${i}`,
              category: "Из Excel",
              name,
              hours,
            };
          })
          .filter((p) => p.name && p.hours > 0);

        if (parts.length === 0) {
          setUploadStatus({ type: "error", msg: "Не удалось извлечь данные. Убедитесь что первый столбец — название, второй — нормачасы." });
        } else {
          setExcelData({ cars: carDatabase, parts });
          setUploadStatus({ type: "success", msg: `Загружено ${parts.length} видов работ из файла «${file.name}»` });
        }
      } catch {
        setUploadStatus({ type: "error", msg: "Ошибка чтения файла. Убедитесь что файл в формате .xlsx или .xls" });
      }
      setUploading(false);
    };
    reader.readAsArrayBuffer(file);
    e.target.value = "";
  };

  // Excel: parse cars (columns: brand, model, generation, years, modification, engine, transmission, power)
  const handleCarsUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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
          setUploadStatus({ type: "error", msg: "Файл пустой." });
          setUploading(false);
          return;
        }

        // Build brand → model → generation → modification hierarchy
        const brandsMap = new Map<string, CarBrand>();

        rows.forEach((row, i) => {
          const keys = Object.keys(row);
          if (keys.length < 5) return;
          const brandName = String(row[keys[0]] || "").trim();
          const modelName = String(row[keys[1]] || "").trim();
          const genName = String(row[keys[2]] || "").trim();
          const years = String(row[keys[3]] || "").trim();
          const modName = String(row[keys[4]] || "").trim();
          const engine = String(row[keys[5]] || "").trim();
          const transmission = String(row[keys[6]] || "").trim();
          const power = String(row[keys[7]] || "").trim();

          if (!brandName || !modelName || !modName) return;

          const brandId = brandName.toLowerCase().replace(/\s+/g, "-");
          const modelId = `${brandId}-${modelName.toLowerCase().replace(/\s+/g, "-")}`;
          const genId = `${modelId}-${genName.toLowerCase().replace(/\s+/g, "-")}`;
          const modId = `mod-${i}`;

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
            gen = { id: genId, name: genName, years, modifications: [] };
            model.generations.push(gen);
          }

          gen.modifications.push({
            id: modId,
            name: modName,
            engine: engine || modName,
            transmission: transmission || "—",
            power: power || "—",
          });
        });

        const cars = Array.from(brandsMap.values());
        if (cars.length === 0) {
          setUploadStatus({ type: "error", msg: "Не удалось извлечь автомобили. Проверьте формат файла." });
        } else {
          setExcelData({ cars, parts: spareParts });
          setUploadStatus({ type: "success", msg: `Загружено ${cars.length} марок, данные автомобилей обновлены из «${file.name}»` });
        }
      } catch {
        setUploadStatus({ type: "error", msg: "Ошибка чтения файла." });
      }
      setUploading(false);
    };
    reader.readAsArrayBuffer(file);
    e.target.value = "";
  };

  // Auth screen
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

  const categories = [...new Set(spareParts.map((p) => p.category))];

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

          {/* Parts upload */}
          <div className="border border-border rounded-lg p-5">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="font-semibold text-sm text-foreground">Список работ (запчасти и нормачасы)</p>
                <p className="text-xs text-muted-foreground mt-0.5">Формат: столбец 1 — название работы, столбец 2 — нормачасы</p>
              </div>
              <Icon name="Wrench" size={18} className="text-muted-foreground shrink-0" />
            </div>
            <div className="bg-gray-50 border border-dashed border-border rounded p-3 mb-3 text-xs text-muted-foreground font-mono">
              <div className="grid grid-cols-2 gap-2 text-center mb-1">
                <span className="bg-[hsl(215,70%,22%)] text-white rounded px-2 py-0.5">Название работы</span>
                <span className="bg-[hsl(215,70%,22%)] text-white rounded px-2 py-0.5">Нормачасы</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-center">
                <span>Замена масла двигателя</span>
                <span>0.5</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-center">
                <span>Замена тормозных колодок</span>
                <span>1.5</span>
              </div>
            </div>
            <input ref={fileInputPartsRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={handlePartsUpload} />
            <button
              onClick={() => fileInputPartsRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-2 px-4 py-2 bg-[hsl(215,70%,22%)] text-white rounded text-sm font-semibold hover:bg-[hsl(215,70%,18%)] transition-all disabled:opacity-50"
            >
              <Icon name={uploading ? "Loader" : "Upload"} size={15} />
              Загрузить файл работ
            </button>
          </div>

          {/* Cars upload */}
          <div className="border border-border rounded-lg p-5">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="font-semibold text-sm text-foreground">База автомобилей</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Формат: Марка | Модель | Поколение | Годы | Модификация | Двигатель | КПП | Мощность
                </p>
              </div>
              <Icon name="Car" size={18} className="text-muted-foreground shrink-0" />
            </div>
            <div className="bg-gray-50 border border-dashed border-border rounded p-3 mb-3 overflow-x-auto">
              <div className="text-xs text-muted-foreground font-mono min-w-max">
                <div className="grid grid-cols-8 gap-2 text-center mb-1">
                  {["Марка","Модель","Поколение","Годы","Модификация","Двигатель","КПП","Мощность"].map((h) => (
                    <span key={h} className="bg-[hsl(215,70%,22%)] text-white rounded px-1 py-0.5">{h}</span>
                  ))}
                </div>
                <div className="grid grid-cols-8 gap-2 text-center text-gray-500">
                  <span>Toyota</span><span>Camry</span><span>V70</span><span>2017-н.в.</span>
                  <span>2.5 AT</span><span>2.5 бенз.</span><span>Автомат</span><span>181 л.с.</span>
                </div>
              </div>
            </div>
            <input ref={fileInputCarsRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={handleCarsUpload} />
            <button
              onClick={() => fileInputCarsRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-2 px-4 py-2 border border-[hsl(215,70%,22%)] text-[hsl(215,70%,22%)] rounded text-sm font-semibold hover:bg-blue-50 transition-all disabled:opacity-50"
            >
              <Icon name={uploading ? "Loader" : "Upload"} size={15} />
              Загрузить базу авто
            </button>
          </div>
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
              { label: "Видов работ", value: spareParts.length.toString(), icon: "Wrench" },
              { label: "Категорий", value: categories.length.toString(), icon: "Layers" },
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
            {categories.map((cat) => {
              const count = spareParts.filter((p) => p.category === cat).length;
              return (
                <div key={cat} className="flex items-center justify-between py-2 px-3 border border-border rounded hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-2">
                    <Icon name="ChevronRight" size={14} className="text-muted-foreground" />
                    <span className="text-sm font-medium">{cat}</span>
                  </div>
                  <span className="text-xs text-muted-foreground bg-gray-100 px-2 py-0.5 rounded-full">
                    {count} работ
                  </span>
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
