import type { MenuItem, InvItem, StockAlert } from "./types";

/**
 * Recipe-to-Inventory Deduction Engine
 *
 * Provides functions to deduct raw ingredients from inventory when sales
 * or waste records are created, ensuring inventory never drops below zero.
 */

export interface DeductionResult {
  updatedInv: InvItem[];
  alerts: StockAlert[];
}

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
    const required = ing.qty * qty;
    const invItem = inv.find(
      (i) => i.name.toLowerCase() === ing.item.toLowerCase()
    );
    const available = invItem ? invItem.quantity : 0;

    if (required > available) {
      alerts.push({
        ingredientName: ing.item,
        required,
        available,
        unit: ing.unit,
      });
    }
  }

  return alerts;
}

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

    const deduction = matchingIng.qty * qty;
    const newQuantity = Math.max(0, parseFloat((item.quantity - deduction).toFixed(4)));

    return { ...item, quantity: newQuantity };
  });

  return { updatedInv, alerts };
}

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
