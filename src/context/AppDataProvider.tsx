import { useState, useEffect, useCallback, useRef, ReactNode } from "react";
import { FUNC_FETCH_YANDEX_FILE, FUNC_PARSE_YANDEX_FILE } from "@/components/admin/adminHelpers";
import { Branch } from "@/components/admin/TabBranches";
import { CarBrand } from "@/data/carDatabase";
import { AppDataContext } from "@/context/AppDataContext";
import {
  WorkEntry, WorkLinkGroup, WorkFilter,
  AutoSyncStatus, DbSyncStatus, DEFAULT_BRANCHES,
} from "@/types/appTypes";

const FUNC_GET_CARS = "https://functions.poehali.dev/135a6c4a-9149-40f9-a7a8-cf2ce637fdb2";
const FUNC_LOAD_ADMIN = "https://functions.poehali.dev/29e28049-1517-455f-9455-fb5b931d0ba4";
const FUNC_SAVE_ADMIN = "https://functions.poehali.dev/1a0f5a3e-6b5e-4087-8f32-7dac070e3112";

const LS_CARS = "remtech_cars_v1";
const LS_WORKS = "remtech_works_v1";
const LS_BRANCHES = "remtech_branches_v1";
const LS_LINKS = "remtech_links_v1";
const LS_CARS_URL = "remtech_cars_url_v1";
const LS_CARS_URL_ENABLED = "remtech_cars_url_enabled_v1";
const LS_WORK_FILTERS = "remtech_work_filters_v1";

function loadLS<T>(key: string, fallback: T): T {
  try {
    const r = localStorage.getItem(key);
    return r ? (JSON.parse(r) as T) : fallback;
  } catch {
    return fallback;
  }
}

function saveLS(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // quota exceeded
  }
}

const DB_KEY_MAP: Record<string, string> = {
  [LS_WORKS]: "works",
  [LS_LINKS]: "work_links",
  [LS_WORK_FILTERS]: "work_filters",
  [LS_BRANCHES]: "branches",
};

const dbSyncState = {
  setter: null as ((s: DbSyncStatus) => void) | null,
  timer: null as ReturnType<typeof setTimeout> | null,
};

function saveToDb(lsKey: string, value: unknown) {
  const dbKey = DB_KEY_MAP[lsKey];
  if (!dbKey) return;
  dbSyncState.setter?.("saving");
  if (dbSyncState.timer) clearTimeout(dbSyncState.timer);
  fetch(FUNC_SAVE_ADMIN, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ key: dbKey, value }),
  })
    .then((r) => {
      dbSyncState.setter?.(r.ok ? "saved" : "error");
      dbSyncState.timer = setTimeout(() => dbSyncState.setter?.("idle"), 3000);
    })
    .catch(() => {
      dbSyncState.setter?.("error");
      dbSyncState.timer = setTimeout(() => dbSyncState.setter?.("idle"), 5000);
    });
}

export { FUNC_SAVE_ADMIN };

interface AppDataProviderProps {
  children: ReactNode;
  ratePerHour: number;
  setRatePerHour: (v: number) => void;
  dbReady: boolean;
  setDbReady: (v: boolean) => void;
  dbSyncStatus: DbSyncStatus;
  setDbSyncStatus: (v: DbSyncStatus) => void;
}

export default function AppDataProvider({
  children,
  ratePerHour,
  setRatePerHour,
  dbReady,
  setDbReady,
  dbSyncStatus,
  setDbSyncStatus,
}: AppDataProviderProps) {
  const [carDatabase, setCarDatabaseRaw] = useState<CarBrand[]>([]);
  const [worksDatabase, setWorksDatabaseRaw] = useState<WorkEntry[]>([]);
  const [branches, setBranchesRaw] = useState<Branch[]>(DEFAULT_BRANCHES);
  const [workLinks, setWorkLinksRaw] = useState<WorkLinkGroup[]>([]);
  const [workFilters, setWorkFiltersRaw] = useState<WorkFilter[]>([]);
  const [carDbCount, setCarDbCount] = useState<number>(0);
  const [carDbLoading, setCarDbLoading] = useState<boolean>(false);
  const [modsLoading, setModsLoading] = useState<boolean>(false);
  const modsCache = useRef<Record<string, boolean>>({});
  const [carsUrl, setCarsUrlRaw] = useState<string>(() => loadLS<string>(LS_CARS_URL, ""));
  const [carsUrlEnabled, setCarsUrlEnabledRaw] = useState<boolean>(() => loadLS<boolean>(LS_CARS_URL_ENABLED, false));
  const [autoSyncStatus, setAutoSyncStatus] = useState<AutoSyncStatus>("idle");
  const [autoSyncMsg, setAutoSyncMsg] = useState<string>("");
  const autoSyncRanRef = useRef(false);

  useEffect(() => {
    dbSyncState.setter = setDbSyncStatus;
    return () => { dbSyncState.setter = null; };
  }, [setDbSyncStatus]);

  const setCarDatabase = (data: CarBrand[]) => { setCarDatabaseRaw(data); saveLS(LS_CARS, data); };
  const setWorksDatabase = (data: WorkEntry[]) => { setWorksDatabaseRaw(data); saveLS(LS_WORKS, data); saveToDb(LS_WORKS, data); };
  const setWorkLinks = (data: WorkLinkGroup[]) => { setWorkLinksRaw(data); saveLS(LS_LINKS, data); saveToDb(LS_LINKS, data); };
  const setWorkFilters = (data: WorkFilter[]) => { setWorkFiltersRaw(data); saveLS(LS_WORK_FILTERS, data); saveToDb(LS_WORK_FILTERS, data); };
  const setCarsUrl = (url: string) => { setCarsUrlRaw(url); saveLS(LS_CARS_URL, url); };
  const setCarsUrlEnabled = (v: boolean) => { setCarsUrlEnabledRaw(v); saveLS(LS_CARS_URL_ENABLED, v); };

  const reloadCarDb = useCallback(async () => {
    setCarDbLoading(true);
    try {
      const res = await fetch(`${FUNC_GET_CARS}?count=1`);
      const raw = await res.json();
      const data = typeof raw === "string" ? JSON.parse(raw) : raw;
      setCarDbCount(data.modifications ?? 0);
    } catch {
      // ignore
    } finally {
      setCarDbLoading(false);
    }
  }, []);

  const loadModifications = useCallback(async (genId: string) => {
    if (modsCache.current[genId]) return;
    setModsLoading(true);
    try {
      const res = await fetch(`${FUNC_GET_CARS}?gen_id=${encodeURIComponent(genId)}`);
      const raw = await res.json();
      const mods = typeof raw === "string" ? JSON.parse(raw) : raw;
      if (Array.isArray(mods)) {
        modsCache.current[genId] = true;
        setCarDatabaseRaw((prev) => prev.map((brand) => ({
          ...brand,
          models: brand.models.map((model) => ({
            ...model,
            generations: model.generations.map((gen) =>
              gen.id === genId ? { ...gen, modifications: mods } : gen
            ),
          })),
        })));
      }
    } catch {
      // ignore
    } finally {
      setModsLoading(false);
    }
  }, []);

  const runAutoSync = useCallback(async (url: string) => {
    setAutoSyncStatus("syncing");
    setAutoSyncMsg("Обновляю базу авто с Яндекс.Диска…");
    try {
      const res1 = await fetch(FUNC_FETCH_YANDEX_FILE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const d1 = await res1.json().then((r: unknown) => typeof r === "string" ? JSON.parse(r) : r) as { ok?: boolean; error?: string };
      if (!res1.ok || d1.error) throw new Error(d1.error || "Ошибка скачивания файла");

      const resInit = await fetch(FUNC_PARSE_YANDEX_FILE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ init: true }),
      });
      const dInit = await resInit.json().then((r: unknown) => typeof r === "string" ? JSON.parse(r) : r) as { ok?: boolean; total_chunks?: number; error?: string };
      if (!resInit.ok || dInit.error) throw new Error(dInit.error || "Ошибка чтения файла");

      let chunkIndex = 0;
      let totalInserted = 0;
      let totalChunks = dInit.total_chunks ?? 1;

      do {
        setAutoSyncMsg(`Обновляю базу авто… чанк ${chunkIndex + 1}/${totalChunks}`);
        const res3 = await fetch(FUNC_PARSE_YANDEX_FILE, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ chunk: chunkIndex, mode: "replace" }),
        });
        const d3 = await res3.json().then((r: unknown) => typeof r === "string" ? JSON.parse(r) : r) as { inserted?: number; total_chunks?: number; done?: boolean; error?: string };
        if (!res3.ok || d3.error) throw new Error(d3.error || `Ошибка на чанке ${chunkIndex + 1}`);
        totalInserted += d3.inserted ?? 0;
        totalChunks = d3.total_chunks ?? totalChunks;
        if (d3.done) break;
        chunkIndex++;
      } while (chunkIndex < totalChunks);

      await reloadCarDb();
      setAutoSyncStatus("done");
      setAutoSyncMsg(`База авто обновлена: ${totalInserted.toLocaleString("ru-RU")} модификаций`);
    } catch (e) {
      setAutoSyncStatus("error");
      setAutoSyncMsg(e instanceof Error ? e.message : "Ошибка автообновления");
    }
  }, [reloadCarDb]);

  const triggerAutoSync = useCallback(() => {
    const url = loadLS<string>(LS_CARS_URL, "");
    if (url) runAutoSync(url);
  }, [runAutoSync]);

  const dbLoadedRef = useRef(false);

  useEffect(() => {
    if (dbLoadedRef.current) return;
    dbLoadedRef.current = true;

    reloadCarDb();

    const loadFromServer = async () => {
      try {
        const [adminRes, carsRes] = await Promise.all([
          fetch(FUNC_LOAD_ADMIN).then((r) => r.json()).then((raw) => typeof raw === "string" ? JSON.parse(raw) : raw),
          fetch(`${FUNC_GET_CARS}?tree=1`).then((r) => r.json()).then((raw) => typeof raw === "string" ? JSON.parse(raw) : raw),
        ]);

        if (Array.isArray(adminRes.works)) { setWorksDatabaseRaw(adminRes.works); saveLS(LS_WORKS, adminRes.works); }
        if (Array.isArray(adminRes.work_links)) { setWorkLinksRaw(adminRes.work_links); saveLS(LS_LINKS, adminRes.work_links); }
        if (Array.isArray(adminRes.work_filters)) { setWorkFiltersRaw(adminRes.work_filters); saveLS(LS_WORK_FILTERS, adminRes.work_filters); }
        if (Array.isArray(adminRes.branches) && adminRes.branches.length > 0) { setBranchesRaw(adminRes.branches); saveLS(LS_BRANCHES, adminRes.branches); }
        if (adminRes.settings && typeof adminRes.settings === "object") {
          if (adminRes.settings.ratePerHour) setRatePerHour(adminRes.settings.ratePerHour);
        }

        if (Array.isArray(carsRes) && carsRes.length > 0) {
          setCarDatabaseRaw(carsRes);
          saveLS(LS_CARS, carsRes);
          modsCache.current = {};
        }
      } catch {
        // fallback: keep cached localStorage data
      } finally {
        setDbReady(true);
      }
    };

    loadFromServer();

    if (!autoSyncRanRef.current) {
      autoSyncRanRef.current = true;
      const enabled = loadLS<boolean>(LS_CARS_URL_ENABLED, false);
      const url = loadLS<string>(LS_CARS_URL, "");
      if (enabled && url) runAutoSync(url);
    }
  }, [reloadCarDb, runAutoSync, setRatePerHour, setDbReady]);

  const setBranches = (fn: (prev: Branch[]) => Branch[]) => {
    setBranchesRaw((prev) => {
      const next = fn(prev);
      saveLS(LS_BRANCHES, next);
      saveToDb(LS_BRANCHES, next);
      return next;
    });
  };

  void dbReady;

  return (
    <AppDataContext.Provider value={{
      carDatabase, setCarDatabase, worksDatabase, setWorksDatabase,
      branches, setBranches, defaultRate: ratePerHour,
      workLinks, setWorkLinks, workFilters, setWorkFilters,
      carDbCount, carDbLoading, reloadCarDb, loadModifications, modsLoading,
      carsUrl, setCarsUrl, carsUrlEnabled, setCarsUrlEnabled,
      autoSyncStatus, autoSyncMsg, triggerAutoSync, dbSyncStatus,
    }}>
      {children}
    </AppDataContext.Provider>
  );
}