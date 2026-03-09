import { Branch } from "@/components/admin/TabBranches";
import { CarBrand } from "@/data/carDatabase";

export type Tab = "calculator" | "admin" | "history" | "help";

export interface HistoryItem {
  id: string;
  date: string;
  car: string;
  part: string;
  hours: number;
  ratePerHour: number;
  costWithParts: number;
  costWithMarkup: number;
}

export interface WorkEntry {
  id: string;
  name: string;
}

export type WorkFilterParam =
  | "engineType"
  | "transmission"
  | "frontBrakes"
  | "rearBrakes"
  | "driveType"
  | "frontSuspension"
  | "rearSuspension"
  | "turboType";

export const WORK_FILTER_PARAM_LABELS: Record<WorkFilterParam, string> = {
  engineType: "Тип двигателя",
  transmission: "Тип КПП",
  frontBrakes: "Передние тормоза",
  rearBrakes: "Задние тормоза",
  driveType: "Привод",
  frontSuspension: "Подвеска передняя",
  rearSuspension: "Подвеска задняя",
  turboType: "Тип наддува",
};

export const WORK_FILTER_PARAMS: WorkFilterParam[] = [
  "engineType", "transmission", "frontBrakes", "rearBrakes",
  "driveType", "frontSuspension", "rearSuspension", "turboType",
];

export interface WorkFilterRule {
  param: WorkFilterParam;
  allowedValues: string[];
}

export interface WorkFilter {
  id: string;
  workName: string;
  rules: WorkFilterRule[];
}

export interface WorkLinkScope {
  brandId: string;
  brandName: string;
  modelId?: string;
  modelName?: string;
}

export interface WorkLinkGroup {
  id: string;
  label: string;
  color: string;
  mainWorkName: string;
  linkedWorkNames: string[];
  scope: WorkLinkScope[];
}

export const LINK_COLORS = [
  "#4f46e5", "#0891b2", "#16a34a", "#d97706",
  "#dc2626", "#9333ea", "#0d9488", "#db2777",
];

export type AutoSyncStatus = "idle" | "syncing" | "done" | "error";
export type DbSyncStatus = "idle" | "saving" | "saved" | "error";

export interface AppDataContextType {
  carDatabase: CarBrand[];
  setCarDatabase: (data: CarBrand[]) => void;
  worksDatabase: WorkEntry[];
  setWorksDatabase: (data: WorkEntry[]) => void;
  branches: Branch[];
  setBranches: (fn: (prev: Branch[]) => Branch[]) => void;
  defaultRate: number;
  workLinks: WorkLinkGroup[];
  setWorkLinks: (data: WorkLinkGroup[]) => void;
  workFilters: WorkFilter[];
  setWorkFilters: (data: WorkFilter[]) => void;
  carDbCount: number;
  carDbLoading: boolean;
  reloadCarDb: () => Promise<void>;
  loadModifications: (genId: string) => Promise<void>;
  modsLoading: boolean;
  carsUrl: string;
  setCarsUrl: (url: string) => void;
  carsUrlEnabled: boolean;
  setCarsUrlEnabled: (v: boolean) => void;
  autoSyncStatus: AutoSyncStatus;
  autoSyncMsg: string;
  triggerAutoSync: () => void;
  dbSyncStatus: DbSyncStatus;
}

export const DEFAULT_BRANCHES: Branch[] = [
  { id: "1", name: "Remtech — Главный", address: "г. Москва, ул. Примерная, 1", phone: "+7 (495) 000-00-01", rate: 2500, active: true },
];
