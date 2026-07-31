import type { MenuItem, InvItem, StockAlert } from "./types";

/**
 * Recipe-to-Inventory Deduction Engine
 *
 * Provides functions to deduct raw ingredients from inventory when sales
 * or waste records are created, and to re-credit ingredients when records
 * are deleted. Handles unit normalization between recipe units (e.g., "kg")
 * and inventory units (e.g., "kilograms").
 */

export interface DeductionResult {
  updatedInv: InvItem[];
  alerts: StockAlert[];
}

// ─── Unit Normalization ─────────────────────────────────────────────────

/** Canonical unit aliases — maps all known strings to a canonical form */
const UNIT_ALIASES: Record<string, string> = {
  kg: "kg",
  kilograms: "kg",
  kilogram: "kg",
  g: "g",
  grams: "g",
  gram: "g",
  milligrams: "mg",
  milligram: "mg",
  mg: "mg",
  l: "l",
  liters: "l",
  liter: "l",
  ml: "ml",
  milliliters: "ml",
  milliliter: "ml",
  pieces: "pcs",
  piece: "pcs",
  pcs: "pcs",
  pc: "pcs",
  lbs: "lb",
  lb: "lb",
  pound: "lb",
  pounds: "lb",
  "pounds (lbs)": "lb",
  pack: "pack",
  packs: "pack",
  box: "box",
  boxes: "box",
};

/** Conversion factors to a base unit within each dimension */
const TO_BASE: Record<string, { base: string; factor: number }> = {
  kg: { base: "g", factor: 1000 },
  g: { base: "g", factor: 1 },
  mg: { base: "g", factor: 0.001 },
  lb: { base: "g", factor: 453.59237 },
  l: { base: "ml", factor: 1000 },
  ml: { base: "ml", factor: 1 },
  pcs: { base: "pcs", factor: 1 },
  pack: { base: "pack", factor: 1 },
  box: { base: "box", factor: 1 },
};

/**
 * Convert `fromQty` in `fromUnit` to the equivalent quantity in `toUnit`.
 * Handles abbreviated and full-string unit names.
 * Returns `fromQty` unchanged if units are the same or incompatible.
 */
export function normalizeUnitQty(
  fromQty: number,
  fromUnit: string,
  toUnit: string
): number {
  const canonFrom = UNIT_ALIASES[fromUnit.toLowerCase().trim()] || fromUnit.toLowerCase().trim();
  const canonTo = UNIT_ALIASES[toUnit.toLowerCase().trim()] || toUnit.toLowerCase().trim();

  // Same canonical unit — no conversion needed
  if (canonFrom === canonTo) return fromQty;

  const fromInfo = TO_BASE[canonFrom];
  const toInfo = TO_BASE[canonTo];

  // If either unit is unknown or they have different base dimensions, return 1:1
  if (!fromInfo || !toInfo || fromInfo.base !== toInfo.base) return fromQty;

  // Convert: fromQty * (fromFactor / toFactor)
  return fromQty * (fromInfo.factor / toInfo.factor);
}

// ─── Stock Checking ─────────────────────────────────────────────────────

/**
 * Check whether a sale/waste of `qty` servings can be fulfilled with current inventory.
 * Returns an array of StockAlerts for any ingredients with insufficient stock.
 */
export function checkStock(
  menuItem: MenuItem,
  qty: number,
  inv: InvItem[]
): StockAlert[] {
  const alerts: StockAlert[] = [];

  for (const ing of menuItem.ingredients) {
    const invItem = inv.find(
      (i) => i.name.toLowerCase() === ing.item.toLowerCase()
    );

    // Convert required quantity from recipe unit to inventory unit
    const invUnit = invItem?.unit || ing.unit;
    const requiredInInvUnit = normalizeUnitQty(ing.qty * qty, ing.unit, invUnit);
    const available = invItem ? invItem.quantity : 0;

    if (requiredInInvUnit > available) {
      alerts.push({
        ingredientName: ing.item,
        required: requiredInInvUnit,
        available,
        unit: invUnit,
      });
    }
  }

  return alerts;
}

// ─── Deduction ──────────────────────────────────────────────────────────

/**
 * Deduct ingredients from inventory for a given menu item and quantity.
 * Clamps all quantities to Math.max(0, ...) — inventory never goes negative.
 * Returns the updated inventory array and any stock alerts.
 */
export function deductIngredients(
  menuItem: MenuItem,
  qty: number,
  inv: InvItem[]
): DeductionResult {
  const alerts = checkStock(menuItem, qty, inv);

  const updatedInv = inv.map((item) => {
    const matchingIng = menuItem.ingredients.find(
      (ing) => ing.item.toLowerCase() === item.name.toLowerCase()
    );

    if (!matchingIng) return item;

    // Convert deduction from recipe unit to inventory unit
    const deduction = normalizeUnitQty(
      matchingIng.qty * qty,
      matchingIng.unit,
      item.unit
    );
    const newQuantity = Math.max(0, parseFloat((item.quantity - deduction).toFixed(4)));

    return { ...item, quantity: newQuantity };
  });

  return { updatedInv, alerts };
}

// ─── Re-credit (reverse deduction) ─────────────────────────────────────

/**
 * Restore ingredients to inventory when a sale or waste record is deleted.
 * This is the reverse of deductIngredients — adds quantities back.
 */
export function recreditIngredients(
  menuItem: MenuItem,
  qty: number,
  inv: InvItem[]
): InvItem[] {
  return inv.map((item) => {
    const matchingIng = menuItem.ingredients.find(
      (ing) => ing.item.toLowerCase() === item.name.toLowerCase()
    );

    if (!matchingIng) return item;

    // Convert credit from recipe unit to inventory unit
    const credit = normalizeUnitQty(
      matchingIng.qty * qty,
      matchingIng.unit,
      item.unit
    );
    const newQuantity = parseFloat((item.quantity + credit).toFixed(4));

    return { ...item, quantity: newQuantity };
  });
}

// ─── Fulfillment Check ─────────────────────────────────────────────────

/**
 * Check if a sale of `qty` servings can be fulfilled without any stock shortages.
 */
export function canFulfillSale(
  menuItem: MenuItem,
  qty: number,
  inv: InvItem[]
): { canFulfill: boolean; shortages: StockAlert[] } {
  const shortages = checkStock(menuItem, qty, inv);
  return { canFulfill: shortages.length === 0, shortages };
}
