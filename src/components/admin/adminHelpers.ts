import * as XLSX from "xlsx";
import { CarBrand, Work } from "@/data/carDatabase";
import { WorkEntry } from "@/pages/Index";

export const FUNC_UPLOAD_CARS = "https://functions.poehali.dev/0f36901b-d880-4d5e-aa33-e9e1b64c0586";
export const FUNC_UPLOAD_CARS_CHUNK = "https://functions.poehali.dev/3d38a075-03d1-4f23-864a-7c175df1cf24";

export const CAR_COLUMNS = [
  "Марка", "Модель", "Поколение", "Год от (Поколение)", "Год до (Поколение)", "Серия", "Модификация",
  "Тип кузова", "Количество мест", "Длина [мм]", "Ширина [мм]", "Высота [мм]", "Колёсная база [мм]",
  "Колея передняя [мм]", "Колея задняя [мм]", "Снаряженная масса [кг]", "Размер колёс", "Дорожный просвет [мм]",
  "Объем багажника максимальный [л]", "Объем багажника минимальный [л]", "Полная масса [кг]", "Размер дисков",
  "Клиренс [мм]", "Ширина передней колеи [мм]", "Ширина задней колеи [мм]", "Грузоподъёмность [кг]",
  "Разрешённая масса автопоезда [кг]", "Нагрузка на переднюю/заднюю ось [кг]", "Погрузочная высота [мм]",
  "Грузовой отсек (Длина x Ширина x Высота) [мм]", "Объём грузового отсека [м3]", "Сверловка [мм]",
  "Тип двигателя", "Объем двигателя [см3]", "Мощность двигателя [л.с.]", "Обороты максимальной мощности [об/мин]",
  "Максимальный крутящий момент [Н*м]", "Тип впуска", "Расположение цилиндров", "Количество цилиндров",
  "Степень сжатия", "Количество клапанов на цилиндр", "Тип наддува", "Диаметр цилиндра [мм]", "Ход поршня [мм]",
  "Модель двигателя", "Расположение двигателя", "Максимальная мощность (кВт) [кВт]",
  "Обороты максимального крутящего момента [об/мин]", "Наличие интеркулера", "Код двигателя", "ГРМ",
  "Методика расчета расхода", "Тип КПП", "Количество передач", "Привод", "Диаметр разворота [м]",
  "Марка топлива", "Максимальная скорость [км/ч]", "Разгон до 100 км/ч [сек]", "Объём топливного бака [л]",
  "Экологический стандарт", "Расход топлива в городе на 100 км [л]", "Расход топлива на шоссе на 100 км [л]",
  "Расход топлива в смешанном цикле на 100 км [л]", "Запас хода [км]", "Выбросы CO2 [г/км]",
  "Передние тормоза", "Задние тормоза", "Передняя подвеска", "Задняя подвеска",
  "Количество дверей", "Страна марки", "Класс автомобиля", "Расположение руля",
  "Оценка безопасности", "Название рейтинга",
  "Емкость батареи [КВт⋅ч]", "Запас хода на электричестве [км]", "Время зарядки [ч]", "Тип батареи",
  "Температурный режим батареи [C]", "Время быстрой зарядки [ч]", "Описание быстрой зарядки",
  "Тип разъема для зарядки", "Расход [КВт⋅ч/100 км]", "Максимальная мощность зарядки [КВт]",
  "Ёмкость батареи (доступная) [КВт⋅ч]", "Количество циклов зарядки",
];

export function downloadCarsTemplate() {
  const example = [
    [
      "Toyota", "Camry", "VII (V70)", "2017", "н.в.", "SE", "2.5 AT",
      "Седан", "5", "4885", "1840", "1455", "2825", "1570", "1580", "1545",
      "235/45 R18", "160", "490", "390", "1965", "7Jx18", "160", "1570", "1580",
      "", "", "", "", "", "", "5x114.3",
      "Бензин", "2494", "181", "6000", "235", "Атмосферный", "Рядный", "4",
      "10.4", "4", "—", "87.5", "96.9", "2AR-FE", "Спереди, поперечно", "133",
      "4200", "Нет", "2AR-FE", "Цепь", "Комбинированный",
      "Автомат", "6", "Передний", "11.4",
      "АИ-95", "210", "8.2", "70",
      "Евро-5", "9.8", "6.2", "7.5", "", "162",
      "Дисковые вентилируемые", "Дисковые", "Стойки МакФерсон", "Многорычажная",
      "4", "Япония", "E", "Левый", "5", "Euro NCAP",
      "", "", "", "", "", "", "", "", "", "", "", "",
    ],
  ];
  const ws = XLSX.utils.aoa_to_sheet([CAR_COLUMNS, ...example]);
  ws["!cols"] = CAR_COLUMNS.map(() => ({ wch: 18 }));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "База авто");
  XLSX.writeFile(wb, "шаблон_база_авто.xlsx");
}

export function filterAndDownloadOldCars(file: File, onDone: (removed: number, total: number, fileName: string) => void, onError: (msg: string) => void) {
  const reader = new FileReader();
  reader.onload = (ev) => {
    try {
      const data = new Uint8Array(ev.target!.result as ArrayBuffer);
      const wb = XLSX.read(data, { type: "array" });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const allRows: unknown[][] = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" });
      if (allRows.length < 2) { onError("Файл пустой."); return; }

      let headerIdx = 0;
      for (let i = 0; i < Math.min(5, allRows.length); i++) {
        const first = String(allRows[i][0] ?? "").trim().toLowerCase();
        if (first === "марка" || first === "brand") { headerIdx = i; break; }
      }

      const header = allRows[headerIdx] as unknown[];
      const dataRows = allRows.slice(headerIdx + 1).filter(r => (r as unknown[]).some(c => c !== ""));
      const cutoffYear = new Date().getFullYear() - 30;

      const filtered = dataRows.filter((row) => {
        const yearTo = String((row as unknown[])[4] ?? "").trim();
        if (!yearTo || yearTo === "" || yearTo === "н.в." || yearTo === "по н.в." || yearTo === "—") return true;
        const y = parseInt(yearTo, 10);
        if (isNaN(y)) return true;
        return y >= cutoffYear;
      });

      const removed = dataRows.length - filtered.length;
      const newWs = XLSX.utils.aoa_to_sheet([header, ...filtered]);
      newWs["!cols"] = CAR_COLUMNS.map(() => ({ wch: 18 }));
      const newWb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(newWb, newWs, wb.SheetNames[0]);
      const outName = file.name.replace(/\.xlsx?$/i, "") + `_без_старых.xlsx`;
      XLSX.writeFile(newWb, outName);
      onDone(removed, dataRows.length, outName);
    } catch {
      onError("Ошибка чтения файла.");
    }
  };
  reader.readAsArrayBuffer(file);
}

export function downloadWorksTemplate() {
  const headers = ["Наименование работы"];
  const example = [
    ["Замена масла двигателя"], ["Замена тормозных колодок передних"], ["Замена тормозных колодок задних"],
    ["Замена воздушного фильтра"], ["Замена салонного фильтра"], ["Замена свечей зажигания"],
    ["Замена ремня / цепи ГРМ"], ["Замена амортизаторов передних"], ["Замена рычага подвески"], ["Замена сцепления"],
  ];
  const ws = XLSX.utils.aoa_to_sheet([headers, ...example]);
  ws["!cols"] = [{ wch: 40 }];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Список работ");
  XLSX.writeFile(wb, "шаблон_список_работ.xlsx");
}

export function mergeWorks(existing: WorkEntry[], incoming: WorkEntry[]): WorkEntry[] {
  const names = new Set(existing.map((w) => w.name.toLowerCase()));
  return [...existing, ...incoming.filter((w) => !names.has(w.name.toLowerCase()))];
}

export function parseCarBase(rows: Record<string, unknown>[]): CarBrand[] | null {
  if (rows.length === 0) return null;
  const keys = Object.keys(rows[0]);
  if (keys.length < 7) return null;
  const get = (row: Record<string, unknown>, i: number) => String(row[keys[i]] ?? "").trim();
  const brandsMap = new Map<string, CarBrand>();
  rows.forEach((row) => {
    const brandName = get(row, 0), modelName = get(row, 1), genName = get(row, 2);
    const yearsFrom = get(row, 3), yearsTo = get(row, 4), series = get(row, 5);
    const modName = get(row, 6);
    if (!brandName || !modelName || !modName) return;
    const years = yearsTo ? `${yearsFrom} — ${yearsTo}` : yearsFrom;
    const genLabel = series ? `${genName} ${series}`.trim() : genName;
    const brandId = brandName.toLowerCase().replace(/\s+/g, "-");
    const modelId = `${brandId}__${modelName.toLowerCase().replace(/\s+/g, "-")}`;
    const genId = `${modelId}__${genLabel.toLowerCase().replace(/[\s()]/g, "-")}`;
    const modId = `${genId}__${modName.toLowerCase().replace(/\s+/g, "-")}`;
    if (!brandsMap.has(brandId)) brandsMap.set(brandId, { id: brandId, name: brandName, models: [] });
    const brand = brandsMap.get(brandId)!;
    let model = brand.models.find((m) => m.id === modelId);
    if (!model) { model = { id: modelId, name: modelName, generations: [] }; brand.models.push(model); }
    let gen = model.generations.find((g) => g.id === genId);
    if (!gen) { gen = { id: genId, name: genLabel || modName, years, modifications: [] }; model.generations.push(gen); }
    if (gen.modifications.find((m) => m.id === modId)) return;
    const bodyType = get(row, 7), seats = get(row, 8);
    const lengthMm = get(row, 9), widthMm = get(row, 10), heightMm = get(row, 11), wheelbaseMm = get(row, 12);
    const trackFrontMm = get(row, 13), trackRearMm = get(row, 14), curbWeightKg = get(row, 15);
    const wheelSize = get(row, 16), groundClearanceMm = get(row, 17);
    const trunkMaxL = get(row, 18), trunkMinL = get(row, 19), grossWeightKg = get(row, 20);
    const diskSize = get(row, 21), clearanceMm = get(row, 22);
    const trackFrontWidthMm = get(row, 23), trackRearWidthMm = get(row, 24);
    const payloadKg = get(row, 25), trainWeightKg = get(row, 26), axleLoadKg = get(row, 27);
    const loadingHeightMm = get(row, 28), cargoCompartmentDims = get(row, 29), cargoVolumeM3 = get(row, 30);
    const boltPattern = get(row, 31);
    const engineType = get(row, 32), engineVolumeCC = get(row, 33);
    const power = get(row, 34) || "—", powerRpm = get(row, 35), torqueNm = get(row, 36);
    const intakeType = get(row, 37), cylinderLayout = get(row, 38), cylinderCount = get(row, 39);
    const compressionRatio = get(row, 40), valvesPerCylinder = get(row, 41), turboType = get(row, 42);
    const boreMm = get(row, 43), strokeMm = get(row, 44), engineModel = get(row, 45);
    const engineLocation = get(row, 46), powerKw = get(row, 47), torqueRpm = get(row, 48);
    const intercooler = get(row, 49), engineCode = get(row, 50), timingSystem = get(row, 51);
    const fuelConsumptionMethod = get(row, 52);
    const transmission = get(row, 53) || "—", gearCount = get(row, 54);
    const driveType = get(row, 55), turningDiameterM = get(row, 56);
    const fuelType = get(row, 57), maxSpeedKmh = get(row, 58), acceleration100 = get(row, 59);
    const fuelTankL = get(row, 60), ecoStandard = get(row, 61);
    const fuelCityL = get(row, 62), fuelHighwayL = get(row, 63), fuelMixedL = get(row, 64);
    const rangeKm = get(row, 65), co2GKm = get(row, 66);
    const frontBrakes = get(row, 67), rearBrakes = get(row, 68);
    const frontSuspension = get(row, 69), rearSuspension = get(row, 70);
    const doorsCount = get(row, 71), countryOfOrigin = get(row, 72);
    const vehicleClass = get(row, 73), steeringPosition = get(row, 74);
    const safetyRating = get(row, 75), safetyRatingName = get(row, 76);
    const engineParts = [engineType, engineVolumeCC ? `${engineVolumeCC} см³` : "", power ? `${power} л.с.` : ""].filter(Boolean);
    const engine = engineParts.join(" ") || modName;
    gen.modifications.push({
      id: modId, name: modName, engine, transmission, power,
      engineType, engineVolumeCC, powerRpm, torqueNm, intakeType, cylinderLayout,
      cylinderCount, compressionRatio, valvesPerCylinder, turboType, boreMm, strokeMm,
      engineModel, engineLocation, powerKw, torqueRpm, intercooler, engineCode,
      timingSystem, fuelConsumptionMethod,
      bodyType, seats, lengthMm, widthMm, heightMm, wheelbaseMm,
      trackFrontMm, trackRearMm, curbWeightKg, wheelSize, groundClearanceMm,
      trunkMaxL, trunkMinL, grossWeightKg, diskSize, clearanceMm,
      trackFrontWidthMm, trackRearWidthMm, payloadKg, trainWeightKg, axleLoadKg,
      loadingHeightMm, cargoCompartmentDims, cargoVolumeM3, boltPattern,
      gearCount, driveType, turningDiameterM,
      fuelType, maxSpeedKmh, acceleration100, fuelTankL, ecoStandard,
      fuelCityL, fuelHighwayL, fuelMixedL, rangeKm, co2GKm,
      frontBrakes, rearBrakes, frontSuspension, rearSuspension,
      doorsCount, countryOfOrigin, vehicleClass, steeringPosition,
      safetyRating, safetyRatingName,
      works: [],
    });
  });
  return Array.from(brandsMap.values());
}

export function parseWorksList(rows: Record<string, unknown>[]): WorkEntry[] | null {
  if (rows.length === 0) return null;
  const keys = Object.keys(rows[0]);
  const works = rows.map((row, i) => ({ id: `work-${i}`, name: String(row[keys[0]] ?? "").trim() })).filter((w) => w.name.length > 0);
  return works.length > 0 ? works : null;
}

export function generateNormsTemplate(cars: CarBrand[], works: WorkEntry[]): void {
  const headers = ["Марка", "Модель", "Поколение", "Годы", "Модификация", "Двигатель", "КПП", "Мощность", "Работа", "Нормачасы"];
  const rows: (string | number)[][] = [];
  cars.forEach((brand) => {
    brand.models.forEach((model) => {
      model.generations.forEach((gen) => {
        gen.modifications.forEach((mod, mIdx) => {
          const worksArr: WorkEntry[] = works.length > 0 ? works : (mod.works as unknown as WorkEntry[]);
          if (worksArr.length === 0) return;
          worksArr.forEach((work, wIdx) => {
            rows.push([
              mIdx === 0 && wIdx === 0 ? brand.name : "",
              mIdx === 0 && wIdx === 0 ? model.name : "",
              wIdx === 0 ? gen.name : "",
              wIdx === 0 ? gen.years : "",
              wIdx === 0 ? mod.name : "",
              wIdx === 0 ? mod.engine : "",
              wIdx === 0 ? mod.transmission : "",
              wIdx === 0 ? mod.power : "",
              work.name,
              "",
            ]);
          });
        });
      });
    });
  });
  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  ws["!cols"] = [14, 14, 14, 14, 16, 22, 14, 12, 36, 12].map((w) => ({ wch: w }));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Нормачасы");
  XLSX.writeFile(wb, "шаблон_нормачасов_заполнить.xlsx");
}

export function parseFilledTemplate(rows: Record<string, unknown>[], cars: CarBrand[]): { updatedCars: CarBrand[]; totalFilled: number } {
  const keys = Object.keys(rows[0] ?? {});
  if (keys.length < 10) return { updatedCars: cars, totalFilled: 0 };
  const get = (row: Record<string, unknown>, i: number) => String(row[keys[i]] ?? "").trim();
  interface WA { modId: string; works: Work[] }
  const modMap = new Map<string, WA>();
  let curBrand = "", curModel = "", curGen = "", curMod = "", curEngine = "", curTrans = "", curPower = "";
  rows.forEach((row, i) => {
    const brandName = get(row, 0) || curBrand, modelName = get(row, 1) || curModel;
    const genName = get(row, 2) || curGen, modName = get(row, 4) || curMod;
    const engine = get(row, 5) || curEngine, transmission = get(row, 6) || curTrans, power = get(row, 7) || curPower;
    const workName = get(row, 8), hours = parseFloat(get(row, 9).replace(",", "."));
    curBrand = brandName; curModel = modelName; curGen = genName; curMod = modName;
    curEngine = engine; curTrans = transmission; curPower = power;
    if (!brandName || !modelName || !modName || !workName || isNaN(hours) || hours <= 0) return;
    const brandId = brandName.toLowerCase().replace(/\s+/g, "-");
    const modelId = `${brandId}__${modelName.toLowerCase().replace(/\s+/g, "-")}`;
    const genId = `${modelId}__${genName.toLowerCase().replace(/[\s()]/g, "-")}`;
    const modId = `${genId}__${modName.toLowerCase().replace(/\s+/g, "-")}`;
    if (!modMap.has(modId)) modMap.set(modId, { modId, works: [] });
    modMap.get(modId)!.works.push({ id: `w-${modId}-${i}`, name: workName, hours });
  });
  let totalFilled = 0;
  const updatedCars = cars.map((b) => ({
    ...b,
    models: b.models.map((m) => ({
      ...m,
      generations: m.generations.map((g) => ({
        ...g,
        modifications: g.modifications.map((mod) => {
          const entry = modMap.get(mod.id);
          if (entry && entry.works.length > 0) { totalFilled += entry.works.length; return { ...mod, works: entry.works }; }
          return mod;
        }),
      })),
    })),
  }));
  return { updatedCars, totalFilled };
}