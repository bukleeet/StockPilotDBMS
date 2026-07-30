import type { InvItem } from "./types";

// ─── Helpers ────────────────────────────────────────────────────────────
export const uid = () => Math.random().toString(36).slice(2, 9);

export const fmtP = (n: number) =>
  `₱${n.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

/**
 * Dynamic date system.
 * Returns today's date as YYYY-MM-DD string.
 * Accepts an optional override for manager testing (date override from settings).
 */
let _dateOverride: string | null = null;

export function setDateOverride(date: string | null): void {
  _dateOverride = date;
}

export function getDateOverride(): string | null {
  return _dateOverride;
}

export function getTodayString(): string {
  if (_dateOverride) return _dateOverride;
  return new Date().toISOString().slice(0, 10);
}

export function daysUntilExpiry(expiryDate: string): number {
  const today = new Date(getTodayString());
  const expiry = new Date(expiryDate);
  return Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export function getIngredientUnitCost(itemName: string, inv: InvItem[]): number {
  const found = inv.find((i) => i.name.toLowerCase() === itemName.toLowerCase());
  return found ? found.unitCost : 100;
}
