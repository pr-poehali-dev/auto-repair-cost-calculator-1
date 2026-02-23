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

/** Переносит works из oldCars в newCars по совпадению mod.id */
export function reapplyWorks(newCars: CarBrand[], oldCars: CarBrand[]): CarBrand[] {
  const worksMap = new Map<string, Work[]>();
  oldCars.forEach((b) => b.models.forEach((m) => m.generations.forEach((g) =>
    g.modifications.forEach((mod) => { if (mod.works.length > 0) worksMap.set(mod.id, mod.works); })
  )));
  if (worksMap.size === 0) return newCars;
  return newCars.map((b) => ({
    ...b,
    models: b.models.map((m) => ({
      ...m,
      generations: m.generations.map((g) => ({
        ...g,
        modifications: g.modifications.map((mod) => {
          const w = worksMap.get(mod.id);
          return w && w.length > 0 ? { ...mod, works: w } : mod;
        }),
      })),
    })),
  }));
}

export function mergeWorks(existing: WorkEntry[], incoming: WorkEntry[]): WorkEntry[] {
  const names = new Set(existing.map((w) => w.name.toLowerCase()));
  return [...existing, ...incoming.filter((w) => !names.has(w.name.toLowerCase()))];
}

export function parseCarBase(rows: Record<string, unknown>[]): CarBrand[] | null {
  if (rows.length === 0) return null;
  const keys = Object.keys(rows[0]);
  if (keys.length < 7) return null;
  // Читаем по названию колонки (если есть) или по позиции (fallback для старых файлов)
  const col = (row: Record<string, unknown>, name: string, fallbackIdx: number) => {
    if (Object.prototype.hasOwnProperty.call(row, name)) return String(row[name] ?? "").trim();
    return String(row[keys[fallbackIdx]] ?? "").trim();
  };
  const brandsMap = new Map<string, CarBrand>();
  rows.forEach((row) => {
    const brandName = col(row, "Марка", 0), modelName = col(row, "Модель", 1), genName = col(row, "Поколение", 2);
    const yearsFrom = col(row, "Год от (Поколение)", 3), yearsTo = col(row, "Год до (Поколение)", 4);
    const series = col(row, "Серия", 5), modName = col(row, "Модификация", 6);
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
    const bodyType = col(row, "Тип кузова", 7), seats = col(row, "Количество мест", 8);
    const lengthMm = col(row, "Длина [мм]", 9), widthMm = col(row, "Ширина [мм]", 10);
    const heightMm = col(row, "Высота [мм]", 11), wheelbaseMm = col(row, "Колёсная база [мм]", 12);
    const trackFrontMm = col(row, "Колея передняя [мм]", 13), trackRearMm = col(row, "Колея задняя [мм]", 14);
    const curbWeightKg = col(row, "Снаряженная масса [кг]", 15);
    const wheelSize = col(row, "Размер колёс", 16), groundClearanceMm = col(row, "Дорожный просвет [мм]", 17);
    const trunkMaxL = col(row, "Объем багажника максимальный [л]", 18), trunkMinL = col(row, "Объем багажника минимальный [л]", 19);
    const grossWeightKg = col(row, "Полная масса [кг]", 20);
    const diskSize = col(row, "Размер дисков", 21), clearanceMm = col(row, "Клиренс [мм]", 22);
    const trackFrontWidthMm = col(row, "Ширина передней колеи [мм]", 23), trackRearWidthMm = col(row, "Ширина задней колеи [мм]", 24);
    const payloadKg = col(row, "Грузоподъёмность [кг]", 25), trainWeightKg = col(row, "Разрешённая масса автопоезда [кг]", 26);
    const axleLoadKg = col(row, "Нагрузка на переднюю/заднюю ось [кг]", 27);
    const loadingHeightMm = col(row, "Погрузочная высота [мм]", 28);
    const cargoCompartmentDims = col(row, "Грузовой отсек (Длина x Ширина x Высота) [мм]", 29);
    const cargoVolumeM3 = col(row, "Объём грузового отсека [м3]", 30), boltPattern = col(row, "Сверловка [мм]", 31);
    const engineType = col(row, "Тип двигателя", 32), engineVolumeCC = col(row, "Объем двигателя [см3]", 33);
    const power = col(row, "Мощность двигателя [л.с.]", 34) || "—";
    const powerRpm = col(row, "Обороты максимальной мощности [об/мин]", 35);
    const torqueNm = col(row, "Максимальный крутящий момент [Н*м]", 36);
    const intakeType = col(row, "Тип впуска", 37), cylinderLayout = col(row, "Расположение цилиндров", 38);
    const cylinderCount = col(row, "Количество цилиндров", 39), compressionRatio = col(row, "Степень сжатия", 40);
    const valvesPerCylinder = col(row, "Количество клапанов на цилиндр", 41), turboType = col(row, "Тип наддува", 42);
    const boreMm = col(row, "Диаметр цилиндра [мм]", 43), strokeMm = col(row, "Ход поршня [мм]", 44);
    const engineModel = col(row, "Модель двигателя", 45), engineLocation = col(row, "Расположение двигателя", 46);
    const powerKw = col(row, "Максимальная мощность (кВт) [кВт]", 47);
    const torqueRpm = col(row, "Обороты максимального крутящего момента [об/мин]", 48);
    const intercooler = col(row, "Наличие интеркулера", 49), engineCode = col(row, "Код двигателя", 50);
    const timingSystem = col(row, "ГРМ", 51), fuelConsumptionMethod = col(row, "Методика расчета расхода", 52);
    const transmission = col(row, "Тип КПП", 53) || "—", gearCount = col(row, "Количество передач", 54);
    const driveType = col(row, "Привод", 55), turningDiameterM = col(row, "Диаметр разворота [м]", 56);
    const fuelType = col(row, "Марка топлива", 57), maxSpeedKmh = col(row, "Максимальная скорость [км/ч]", 58);
    const acceleration100 = col(row, "Разгон до 100 км/ч [сек]", 59), fuelTankL = col(row, "Объём топливного бака [л]", 60);
    const ecoStandard = col(row, "Экологический стандарт", 61);
    const fuelCityL = col(row, "Расход топлива в городе на 100 км [л]", 62);
    const fuelHighwayL = col(row, "Расход топлива на шоссе на 100 км [л]", 63);
    const fuelMixedL = col(row, "Расход топлива в смешанном цикле на 100 км [л]", 64);
    const rangeKm = col(row, "Запас хода [км]", 65), co2GKm = col(row, "Выбросы CO2 [г/км]", 66);
    const frontBrakes = col(row, "Передние тормоза", 67), rearBrakes = col(row, "Задние тормоза", 68);
    const frontSuspension = col(row, "Передняя подвеска", 69), rearSuspension = col(row, "Задняя подвеска", 70);
    const doorsCount = col(row, "Количество дверей", 71), countryOfOrigin = col(row, "Страна марки", 72);
    const vehicleClass = col(row, "Класс автомобиля", 73), steeringPosition = col(row, "Расположение руля", 74);
    const safetyRating = col(row, "Оценка безопасности", 75), safetyRatingName = col(row, "Название рейтинга", 76);
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