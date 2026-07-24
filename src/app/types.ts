// ─── Types ─────────────────────────────────────────────────────────────
export type View =
  | "dashboard"
  | "inventory"
  | "supplies"
  | "sales"
  | "waste"
  | "calculator"
  | "reports"
  | "settings";

export type Role = "staff" | "manager";

export type ContextTag =
  | "Regular"
  | "Campus Event"
  | "Holiday/No Classes"
  | "Rainy Day";

export type DispositionRoute =
  | "Staff Allocation"
  | "Charity / Community"
  | "Reused as Ingredient"
  | "Composted"
  | "Disposed";

export interface InvItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  unitCost: number;
  reorderPoint: number;
  dateStocked: string;
  expiryDate: string;
}

export interface MenuItem {
  id: string;
  name: string;
  category: string;
  sellingPrice: number;
  ingredients: { item: string; qty: number; unit: string }[];
}

export interface SaleRec {
  id: string;
  date: string;
  menuItemId: string;
  item: string;
  category: string;
  quantitySold: number;
  unitPrice: number;
  contextTag?: ContextTag;
}

export interface WasteRec {
  id: string;
  date: string;
  menuItem: string;
  servingsWasted: number;
  ingredients: { name: string; qty: number; unit: string; cost: number }[];
  estimatedLoss: number;
  dispositionRoute: DispositionRoute;
  contextTag?: ContextTag;
}

export interface SupplyReq {
  id: string;
  item: string;
  quantity: number | null;
  unit: string;
}

export type Rec = {
  type: "increase" | "reduce" | "warning" | "insight";
  title: string;
  detail: string;
  priority: "high" | "medium" | "low";
};

export interface StockAlert {
  ingredientName: string;
  required: number;
  available: number;
  unit: string;
}
