import type { View, InvItem, MenuItem, SaleRec, WasteRec } from "./types";
import {
  LayoutDashboard,
  ShoppingCart,
  Trash2,
  Calculator,
  BarChart3,
  Package,
  ClipboardList,
  Settings,
} from "lucide-react";

// ─── Constants ──────────────────────────────────────────────────────────
export const TODAY = "2026-07-22";
export const CHART_COLORS = ["#6366f1", "#f59e0b", "#10b981", "#f43f5e", "#8b5cf6", "#06b6d4"];
export const UNITS = ["pieces", "grams", "kilograms", "milligrams", "milliliters", "liters"];

export const CONTEXT_TAGS = [
  "Regular",
  "Campus Event",
  "Holiday/No Classes",
  "Rainy Day",
] as const;

export const DISPOSITION_ROUTES = [
  "Staff Allocation",
  "Charity / Community",
  "Reused as Ingredient",
  "Composted",
  "Disposed",
] as const;

// Routes considered as "food saved" (positive behavior)
export const FOOD_SAVED_ROUTES = [
  "Staff Allocation",
  "Charity / Community",
  "Reused as Ingredient",
] as const;

export const MENU_ITEMS: MenuItem[] = [
  {
    id: "m1", name: "Menudo", category: "Main Course", sellingPrice: 180,
    ingredients: [
      { item: "Beef", qty: 0.2, unit: "kg" },
      { item: "Potatoes", qty: 0.15, unit: "kg" },
      { item: "Carrots", qty: 0.15, unit: "kg" },
      { item: "Tomatoes", qty: 0.1, unit: "kg" },
    ],
  },
  {
    id: "m2", name: "Chicken Adobo", category: "Main Course", sellingPrice: 150,
    ingredients: [
      { item: "Chicken", qty: 0.3, unit: "kg" },
      { item: "Garlic", qty: 0.02, unit: "kg" },
    ],
  },
  {
    id: "m3", name: "Sinigang na Baboy", category: "Main Course", sellingPrice: 165,
    ingredients: [
      { item: "Pork", qty: 0.25, unit: "kg" },
      { item: "Tomatoes", qty: 0.1, unit: "kg" },
    ],
  },
  {
    id: "m4", name: "Grilled Chicken", category: "Main Course", sellingPrice: 145,
    ingredients: [{ item: "Chicken", qty: 0.4, unit: "kg" }],
  },
  {
    id: "m5", name: "Lechon Kawali", category: "Main Course", sellingPrice: 175,
    ingredients: [{ item: "Pork", qty: 0.35, unit: "kg" }],
  },
  {
    id: "m6", name: "Kare-Kare", category: "Main Course", sellingPrice: 220,
    ingredients: [{ item: "Beef", qty: 0.3, unit: "kg" }],
  },
  {
    id: "m7", name: "Steamed Vegetables", category: "Sides", sellingPrice: 80,
    ingredients: [
      { item: "Carrots", qty: 0.1, unit: "kg" },
      { item: "Potatoes", qty: 0.1, unit: "kg" },
    ],
  },
  {
    id: "m8", name: "Steamed Rice", category: "Sides", sellingPrice: 35,
    ingredients: [{ item: "Rice", qty: 0.2, unit: "kg" }],
  },
];

// ─── Mock Data ──────────────────────────────────────────────────────────
export const INIT_INV: InvItem[] = [
  { id: "i1", name: "Beef", category: "Proteins", quantity: 1.5, unit: "kilograms", unitCost: 380, reorderPoint: 3, dateStocked: "2026-07-20", expiryDate: "2026-07-24" },
  { id: "i2", name: "Chicken", category: "Proteins", quantity: 3, unit: "kilograms", unitCost: 220, reorderPoint: 4, dateStocked: "2026-07-20", expiryDate: "2026-07-26" },
  { id: "i3", name: "Pork", category: "Proteins", quantity: 2, unit: "kilograms", unitCost: 300, reorderPoint: 3, dateStocked: "2026-07-21", expiryDate: "2026-07-25" },
  { id: "i4", name: "Rice", category: "Grains", quantity: 10, unit: "kilograms", unitCost: 55, reorderPoint: 5, dateStocked: "2026-07-10", expiryDate: "2026-08-21" },
  { id: "i5", name: "Potatoes", category: "Produce", quantity: 1, unit: "kilograms", unitCost: 60, reorderPoint: 1.5, dateStocked: "2026-07-18", expiryDate: "2026-07-29" },
  { id: "i6", name: "Carrots", category: "Produce", quantity: 0.8, unit: "kilograms", unitCost: 50, reorderPoint: 1, dateStocked: "2026-07-18", expiryDate: "2026-08-01" },
  { id: "i7", name: "Tomatoes", category: "Produce", quantity: 0.6, unit: "kilograms", unitCost: 80, reorderPoint: 0.5, dateStocked: "2026-07-21", expiryDate: "2026-07-27" },
  { id: "i8", name: "Garlic", category: "Produce", quantity: 0.5, unit: "kilograms", unitCost: 200, reorderPoint: 0.2, dateStocked: "2026-07-15", expiryDate: "2026-08-05" },
  { id: "i9", name: "Onions", category: "Produce", quantity: 0.8, unit: "kilograms", unitCost: 70, reorderPoint: 0.5, dateStocked: "2026-07-15", expiryDate: "2026-08-05" },
  { id: "i10", name: "Cooking Oil", category: "Pantry", quantity: 2, unit: "liters", unitCost: 120, reorderPoint: 0.5, dateStocked: "2026-07-10", expiryDate: "2027-07-10" },
];

export const INIT_SALES: SaleRec[] = [
  { id: "s1", date: "2026-07-22", menuItemId: "m1", item: "Menudo", category: "Main Course", quantitySold: 18, unitPrice: 180, contextTag: "Regular" },
  { id: "s2", date: "2026-07-22", menuItemId: "m4", item: "Grilled Chicken", category: "Main Course", quantitySold: 24, unitPrice: 145, contextTag: "Regular" },
  { id: "s3", date: "2026-07-22", menuItemId: "m7", item: "Steamed Vegetables", category: "Sides", quantitySold: 9, unitPrice: 80, contextTag: "Regular" },
  { id: "s4", date: "2026-07-21", menuItemId: "m1", item: "Menudo", category: "Main Course", quantitySold: 21, unitPrice: 180, contextTag: "Regular" },
  { id: "s5", date: "2026-07-21", menuItemId: "m2", item: "Chicken Adobo", category: "Main Course", quantitySold: 15, unitPrice: 150, contextTag: "Regular" },
  { id: "s6", date: "2026-07-21", menuItemId: "m8", item: "Steamed Rice", category: "Sides", quantitySold: 40, unitPrice: 35, contextTag: "Regular" },
  { id: "s7", date: "2026-07-20", menuItemId: "m3", item: "Sinigang na Baboy", category: "Main Course", quantitySold: 12, unitPrice: 165, contextTag: "Regular" },
  { id: "s8", date: "2026-07-20", menuItemId: "m4", item: "Grilled Chicken", category: "Main Course", quantitySold: 18, unitPrice: 145, contextTag: "Regular" },
  { id: "s9", date: "2026-07-19", menuItemId: "m6", item: "Kare-Kare", category: "Main Course", quantitySold: 8, unitPrice: 220, contextTag: "Regular" },
  { id: "s10", date: "2026-07-19", menuItemId: "m5", item: "Lechon Kawali", category: "Main Course", quantitySold: 14, unitPrice: 175, contextTag: "Regular" },
  { id: "s11", date: "2026-07-18", menuItemId: "m1", item: "Menudo", category: "Main Course", quantitySold: 25, unitPrice: 180, contextTag: "Regular" },
  { id: "s12", date: "2026-07-18", menuItemId: "m8", item: "Steamed Rice", category: "Sides", quantitySold: 50, unitPrice: 35, contextTag: "Regular" },
  { id: "s13", date: "2026-07-17", menuItemId: "m2", item: "Chicken Adobo", category: "Main Course", quantitySold: 19, unitPrice: 150, contextTag: "Regular" },
  { id: "s14", date: "2026-07-16", menuItemId: "m4", item: "Grilled Chicken", category: "Main Course", quantitySold: 22, unitPrice: 145, contextTag: "Regular" },
  { id: "s15", date: "2026-07-15", menuItemId: "m3", item: "Sinigang na Baboy", category: "Main Course", quantitySold: 16, unitPrice: 165, contextTag: "Regular" },
];

export const INIT_WASTE: WasteRec[] = [
  {
    id: "w1", date: "2026-07-22", menuItem: "Menudo", servingsWasted: 3,
    ingredients: [
      { name: "Beef", qty: 0.6, unit: "kg", cost: 228 },
      { name: "Potatoes", qty: 0.45, unit: "kg", cost: 27 },
      { name: "Carrots", qty: 0.45, unit: "kg", cost: 22.5 },
      { name: "Tomatoes", qty: 0.3, unit: "kg", cost: 24 },
    ],
    estimatedLoss: 301.5,
    dispositionRoute: "Disposed",
    contextTag: "Regular",
  },
  {
    id: "w2", date: "2026-07-21", menuItem: "Grilled Chicken", servingsWasted: 2,
    ingredients: [{ name: "Chicken", qty: 0.8, unit: "kg", cost: 176 }],
    estimatedLoss: 176,
    dispositionRoute: "Staff Allocation",
    contextTag: "Regular",
  },
  {
    id: "w3", date: "2026-07-20", menuItem: "Sinigang na Baboy", servingsWasted: 4,
    ingredients: [
      { name: "Pork", qty: 1, unit: "kg", cost: 300 },
      { name: "Tomatoes", qty: 0.4, unit: "kg", cost: 32 },
    ],
    estimatedLoss: 332,
    dispositionRoute: "Charity / Community",
    contextTag: "Regular",
  },
];

// ─── Navigation Items with Role Visibility ──────────────────────────────
export const NAV_ITEMS: {
  id: View;
  label: string;
  Icon: React.ElementType;
  staffVisible: boolean;
}[] = [
  { id: "dashboard", label: "Dashboard", Icon: LayoutDashboard, staffVisible: true },
  { id: "inventory", label: "Inventory", Icon: Package, staffVisible: false },
  { id: "supplies", label: "Supplies", Icon: ClipboardList, staffVisible: true },
  { id: "sales", label: "Sales Log", Icon: ShoppingCart, staffVisible: true },
  { id: "waste", label: "Waste Log", Icon: Trash2, staffVisible: true },
  { id: "calculator", label: "Cost Calculator", Icon: Calculator, staffVisible: false },
  { id: "reports", label: "Reports & AI", Icon: BarChart3, staffVisible: false },
  { id: "settings", label: "Settings", Icon: Settings, staffVisible: false },
];
