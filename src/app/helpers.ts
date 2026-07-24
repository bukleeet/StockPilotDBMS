import type { InvItem } from "./types";
import { TODAY } from "./constants";

// ─── Helpers ────────────────────────────────────────────────────────────
export const uid = () => Math.random().toString(36).slice(2, 9);

export const fmtP = (n: number) =>
  `₱${n.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export function daysUntilExpiry(expiryDate: string): number {
  const today = new Date(TODAY);
  const expiry = new Date(expiryDate);
  return Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export function getIngredientUnitCost(itemName: string, inv: InvItem[]): number {
  const found = inv.find((i) => i.name.toLowerCase() === itemName.toLowerCase());
  return found ? found.unitCost : 100;
}
