import { get, set, del, keys } from "idb-keyval";
import type { InvItem, SaleRec, WasteRec, SupplyReq, Role } from "./types";

/**
 * IndexedDB persistence adapter for StockPilot.
 * Uses idb-keyval for lightweight key-value storage.
 * Falls back to localStorage if IndexedDB is unavailable.
 */

const STORAGE_KEYS = {
  inventory: "stockpilot_inventory",
  sales: "stockpilot_sales",
  waste: "stockpilot_waste",
  supplyRequests: "stockpilot_supply_requests",
  role: "stockpilot_role",
  darkMode: "stockpilot_dark_mode",
  settings: "stockpilot_settings",
} as const;

// ─── Generic storage wrappers ───────────────────────────────────────────

let useLocalStorage = false;

async function testIndexedDB(): Promise<boolean> {
  try {
    await keys();
    return true;
  } catch {
    return false;
  }
}

export async function initStorage(): Promise<void> {
  const available = await testIndexedDB();
  useLocalStorage = !available;
}

async function saveState<T>(key: string, data: T): Promise<void> {
  try {
    if (useLocalStorage) {
      localStorage.setItem(key, JSON.stringify(data));
    } else {
      await set(key, data);
    }
  } catch (err) {
    console.warn(`[StockPilot] Failed to save ${key}:`, err);
    // Fallback to localStorage on IndexedDB failure
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch {
      // Storage completely full; silently fail
    }
  }
}

async function loadState<T>(key: string): Promise<T | undefined> {
  try {
    if (useLocalStorage) {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : undefined;
    } else {
      return await get<T>(key);
    }
  } catch (err) {
    console.warn(`[StockPilot] Failed to load ${key}:`, err);
    // Fallback to localStorage
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : undefined;
    } catch {
      return undefined;
    }
  }
}

// ─── Typed save/load for each data domain ───────────────────────────────

export async function saveInventory(data: InvItem[]): Promise<void> {
  await saveState(STORAGE_KEYS.inventory, data);
}

export async function loadInventory(): Promise<InvItem[] | undefined> {
  return loadState<InvItem[]>(STORAGE_KEYS.inventory);
}

export async function saveSales(data: SaleRec[]): Promise<void> {
  await saveState(STORAGE_KEYS.sales, data);
}

export async function loadSales(): Promise<SaleRec[] | undefined> {
  return loadState<SaleRec[]>(STORAGE_KEYS.sales);
}

export async function saveWaste(data: WasteRec[]): Promise<void> {
  await saveState(STORAGE_KEYS.waste, data);
}

export async function loadWaste(): Promise<WasteRec[] | undefined> {
  return loadState<WasteRec[]>(STORAGE_KEYS.waste);
}

export async function saveSupplyRequests(data: SupplyReq[]): Promise<void> {
  await saveState(STORAGE_KEYS.supplyRequests, data);
}

export async function loadSupplyRequests(): Promise<SupplyReq[] | undefined> {
  return loadState<SupplyReq[]>(STORAGE_KEYS.supplyRequests);
}

export async function saveRole(data: Role): Promise<void> {
  await saveState(STORAGE_KEYS.role, data);
}

export async function loadRole(): Promise<Role | undefined> {
  return loadState<Role>(STORAGE_KEYS.role);
}

export async function saveDarkMode(data: boolean): Promise<void> {
  await saveState(STORAGE_KEYS.darkMode, data);
}

export async function loadDarkMode(): Promise<boolean | undefined> {
  return loadState<boolean>(STORAGE_KEYS.darkMode);
}

// App settings (stockout blocking, date override, etc.)
export interface AppSettings {
  blockStockout?: boolean;
  dateOverride?: string | null;
}

export async function saveSettings(data: AppSettings): Promise<void> {
  await saveState(STORAGE_KEYS.settings, data);
}

export async function loadSettings(): Promise<AppSettings | undefined> {
  return loadState<AppSettings>(STORAGE_KEYS.settings);
}

// ─── Export / Import ────────────────────────────────────────────────────

export interface ExportData {
  version: 1;
  exportedAt: string;
  inventory: InvItem[];
  sales: SaleRec[];
  waste: WasteRec[];
  supplyRequests?: SupplyReq[];
}

export async function exportAllData(
  inv: InvItem[],
  sales: SaleRec[],
  waste: WasteRec[],
  supplyRequests?: SupplyReq[]
): Promise<string> {
  const data: ExportData = {
    version: 1,
    exportedAt: new Date().toISOString(),
    inventory: inv,
    sales,
    waste,
    supplyRequests,
  };
  return JSON.stringify(data, null, 2);
}

export function validateImportData(
  json: string
): { valid: true; data: ExportData } | { valid: false; error: string } {
  try {
    const parsed = JSON.parse(json);

    if (!parsed || typeof parsed !== "object") {
      return { valid: false, error: "Invalid JSON structure" };
    }

    if (!Array.isArray(parsed.inventory)) {
      return { valid: false, error: "Missing or invalid 'inventory' array" };
    }

    if (!Array.isArray(parsed.sales)) {
      return { valid: false, error: "Missing or invalid 'sales' array" };
    }

    if (!Array.isArray(parsed.waste)) {
      return { valid: false, error: "Missing or invalid 'waste' array" };
    }

    return { valid: true, data: parsed as ExportData };
  } catch {
    return { valid: false, error: "Invalid JSON format" };
  }
}

export async function clearAllData(): Promise<void> {
  try {
    if (useLocalStorage) {
      Object.values(STORAGE_KEYS).forEach((key) => localStorage.removeItem(key));
    } else {
      await Promise.all(Object.values(STORAGE_KEYS).map((key) => del(key)));
    }
  } catch (err) {
    console.warn("[StockPilot] Failed to clear data:", err);
    // Fallback
    Object.values(STORAGE_KEYS).forEach((key) => localStorage.removeItem(key));
  }
}

// ─── Debounce utility ───────────────────────────────────────────────────

export function createDebouncedSaver<T>(
  saveFn: (data: T) => Promise<void>,
  delayMs = 250
): (data: T) => void {
  let timer: ReturnType<typeof setTimeout> | null = null;
  return (data: T) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      saveFn(data);
    }, delayMs);
  };
}
