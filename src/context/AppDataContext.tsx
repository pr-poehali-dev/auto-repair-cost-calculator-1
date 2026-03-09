import { createContext, useContext } from "react";
import { CarBrand } from "@/data/carDatabase";
import { AppDataContextType, DEFAULT_BRANCHES } from "@/types/appTypes";

export const AppDataContext = createContext<AppDataContextType>({
  carDatabase: [] as CarBrand[],
  setCarDatabase: () => {},
  worksDatabase: [],
  setWorksDatabase: () => {},
  branches: DEFAULT_BRANCHES,
  setBranches: () => {},
  defaultRate: 2500,
  workLinks: [],
  setWorkLinks: () => {},
  workFilters: [],
  setWorkFilters: () => {},
  carDbCount: 0,
  carDbLoading: false,
  reloadCarDb: async () => {},
  loadModifications: async () => {},
  modsLoading: false,
  carsUrl: "",
  setCarsUrl: () => {},
  carsUrlEnabled: false,
  setCarsUrlEnabled: () => {},
  autoSyncStatus: "idle",
  autoSyncMsg: "",
  triggerAutoSync: () => {},
  dbSyncStatus: "idle",
});

export const useAppData = () => useContext(AppDataContext);
