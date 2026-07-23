import { useState, useMemo } from "react";
import type { ReactNode, Dispatch, SetStateAction } from "react";
import {
  LayoutDashboard,
  ShoppingCart,
  Trash2,
  Calculator,
  BarChart3,
  Menu,
  X,
  Moon,
  Sun,
  Plus,
  Minus,
  Edit2,
  Trash,
  Search,
  DollarSign,
  AlertTriangle,
  Bot,
  Package,
  Sparkles,
  RefreshCw,
  ClipboardList,
  Check,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// ─── Types ─────────────────────────────────────────────────────────────
type View = "dashboard" | "inventory" | "supplies" | "sales" | "waste" | "calculator" | "reports";

interface InvItem {
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

interface MenuItem {
  id: string;
  name: string;
  category: string;
  sellingPrice: number;
  ingredients: { item: string; qty: number; unit: string }[];
}

interface SaleRec {
  id: string;
  date: string;
  menuItemId: string;
  item: string;
  category: string;
  quantitySold: number;
  unitPrice: number;
}

interface WasteRec {
  id: string;
  date: string;
  menuItem: string;
  servingsWasted: number;
  ingredients: { name: string; qty: number; unit: string; cost: number }[];
  estimatedLoss: number;
}

interface SupplyReq {
  id: string;
  item: string;
  quantity: number | null;
  unit: string;
}

type Rec = {
  type: "increase" | "reduce" | "warning" | "insight";
  title: string;
  detail: string;
  priority: "high" | "medium" | "low";
};

// ─── Constants ──────────────────────────────────────────────────────────
const TODAY = "2026-07-22";
const CHART_COLORS = ["#6366f1", "#f59e0b", "#10b981", "#f43f5e", "#8b5cf6", "#06b6d4"];
const UNITS = ["pieces", "grams", "kilograms", "milligrams", "milliliters", "liters"];

const MENU_ITEMS: MenuItem[] = [
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
const INIT_INV: InvItem[] = [
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

const INIT_SALES: SaleRec[] = [
  { id: "s1", date: "2026-07-22", menuItemId: "m1", item: "Menudo", category: "Main Course", quantitySold: 18, unitPrice: 180 },
  { id: "s2", date: "2026-07-22", menuItemId: "m4", item: "Grilled Chicken", category: "Main Course", quantitySold: 24, unitPrice: 145 },
  { id: "s3", date: "2026-07-22", menuItemId: "m7", item: "Steamed Vegetables", category: "Sides", quantitySold: 9, unitPrice: 80 },
  { id: "s4", date: "2026-07-21", menuItemId: "m1", item: "Menudo", category: "Main Course", quantitySold: 21, unitPrice: 180 },
  { id: "s5", date: "2026-07-21", menuItemId: "m2", item: "Chicken Adobo", category: "Main Course", quantitySold: 15, unitPrice: 150 },
  { id: "s6", date: "2026-07-21", menuItemId: "m8", item: "Steamed Rice", category: "Sides", quantitySold: 40, unitPrice: 35 },
  { id: "s7", date: "2026-07-20", menuItemId: "m3", item: "Sinigang na Baboy", category: "Main Course", quantitySold: 12, unitPrice: 165 },
  { id: "s8", date: "2026-07-20", menuItemId: "m4", item: "Grilled Chicken", category: "Main Course", quantitySold: 18, unitPrice: 145 },
  { id: "s9", date: "2026-07-19", menuItemId: "m6", item: "Kare-Kare", category: "Main Course", quantitySold: 8, unitPrice: 220 },
  { id: "s10", date: "2026-07-19", menuItemId: "m5", item: "Lechon Kawali", category: "Main Course", quantitySold: 14, unitPrice: 175 },
  { id: "s11", date: "2026-07-18", menuItemId: "m1", item: "Menudo", category: "Main Course", quantitySold: 25, unitPrice: 180 },
  { id: "s12", date: "2026-07-18", menuItemId: "m8", item: "Steamed Rice", category: "Sides", quantitySold: 50, unitPrice: 35 },
  { id: "s13", date: "2026-07-17", menuItemId: "m2", item: "Chicken Adobo", category: "Main Course", quantitySold: 19, unitPrice: 150 },
  { id: "s14", date: "2026-07-16", menuItemId: "m4", item: "Grilled Chicken", category: "Main Course", quantitySold: 22, unitPrice: 145 },
  { id: "s15", date: "2026-07-15", menuItemId: "m3", item: "Sinigang na Baboy", category: "Main Course", quantitySold: 16, unitPrice: 165 },
];

const INIT_WASTE: WasteRec[] = [
  {
    id: "w1", date: "2026-07-22", menuItem: "Menudo", servingsWasted: 3,
    ingredients: [
      { name: "Beef", qty: 0.6, unit: "kg", cost: 228 },
      { name: "Potatoes", qty: 0.45, unit: "kg", cost: 27 },
      { name: "Carrots", qty: 0.45, unit: "kg", cost: 22.5 },
      { name: "Tomatoes", qty: 0.3, unit: "kg", cost: 24 },
    ],
    estimatedLoss: 301.5,
  },
  {
    id: "w2", date: "2026-07-21", menuItem: "Grilled Chicken", servingsWasted: 2,
    ingredients: [{ name: "Chicken", qty: 0.8, unit: "kg", cost: 176 }],
    estimatedLoss: 176,
  },
  {
    id: "w3", date: "2026-07-20", menuItem: "Sinigang na Baboy", servingsWasted: 4,
    ingredients: [
      { name: "Pork", qty: 1, unit: "kg", cost: 300 },
      { name: "Tomatoes", qty: 0.4, unit: "kg", cost: 32 },
    ],
    estimatedLoss: 332,
  },
];

const NAV_ITEMS: { id: View; label: string; Icon: React.ElementType }[] = [
  { id: "dashboard", label: "Dashboard", Icon: LayoutDashboard },
  { id: "inventory", label: "Inventory", Icon: Package },
  { id: "supplies", label: "Supplies", Icon: ClipboardList },
  { id: "sales", label: "Sales Log", Icon: ShoppingCart },
  { id: "waste", label: "Waste Log", Icon: Trash2 },
  { id: "calculator", label: "Cost Calculator", Icon: Calculator },
  { id: "reports", label: "Reports & AI", Icon: BarChart3 },
];

// ─── Helpers ────────────────────────────────────────────────────────────
const uid = () => Math.random().toString(36).slice(2, 9);
const fmtP = (n: number) =>
  `₱${n.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

function daysUntilExpiry(expiryDate: string): number {
  const today = new Date(TODAY);
  const expiry = new Date(expiryDate);
  return Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function getIngredientUnitCost(itemName: string, inv: InvItem[]): number {
  const found = inv.find((i) => i.name.toLowerCase() === itemName.toLowerCase());
  return found ? found.unitCost : 100;
}

// ─── Shared components ──────────────────────────────────────────────────
function FieldInput({
  label,
  value,
  onChange,
  type = "text",
  className = "",
}: {
  label: string;
  value: string | number;
  onChange: (v: string) => void;
  type?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 bg-input-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-shadow"
      />
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
  className = "",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 bg-input-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}

function Modal({
  title,
  onClose,
  onSave,
  children,
}: {
  title: string;
  onClose: () => void;
  onSave: () => void;
  children: ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-card rounded-2xl border border-border w-full max-w-md shadow-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
          <h2 className="font-semibold">{title}</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-6 space-y-4 overflow-y-auto">{children}</div>
        <div className="flex gap-3 px-6 py-4 border-t border-border shrink-0">
          <button
            onClick={onClose}
            className="flex-1 py-2 border border-border rounded-lg text-sm hover:bg-accent transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            className="flex-1 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {subtitle && <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

function KpiCard({
  label,
  value,
  sub,
  Icon,
  iconBg,
  iconColor,
}: {
  label: string;
  value: string;
  sub: string;
  Icon: React.ElementType;
  iconBg: string;
  iconColor: string;
}) {
  return (
    <div className="bg-card rounded-xl border border-border p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{label}</p>
        <div className={`p-2 rounded-lg ${iconBg}`}>
          <Icon className={`w-4 h-4 ${iconColor}`} />
        </div>
      </div>
      <div>
        <p className="text-2xl font-semibold">{value}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
      </div>
    </div>
  );
}

function ExpiryBadge({ expiryDate }: { expiryDate: string }) {
  const days = daysUntilExpiry(expiryDate);
  if (days <= 0) return <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-rose-100 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400">Expired</span>;
  if (days <= 2) return <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-rose-100 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400">Expires in {days}d</span>;
  if (days <= 7) return <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400">Expires in {days}d</span>;
  return <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400">Expires in {days}d</span>;
}

// ─── Dashboard View ─────────────────────────────────────────────────────
function DashboardView({ inv, sales, waste }: { inv: InvItem[]; sales: SaleRec[]; waste: WasteRec[] }) {
  const totalInvValue = inv.reduce((a, i) => a + i.quantity * i.unitCost, 0);
  const todayRevenue = sales.filter((s) => s.date === TODAY).reduce((a, s) => a + s.quantitySold * s.unitPrice, 0);
  const weekWasteLoss = waste.filter((w) => w.date >= "2026-07-16").reduce((a, w) => a + w.estimatedLoss, 0);
  const expiringSoon = inv.filter((i) => { const d = daysUntilExpiry(i.expiryDate); return d >= 0 && d <= 3; });

  const trendData = useMemo(() => {
    const days = [
      { date: "2026-07-16", label: "Jul 16" },
      { date: "2026-07-17", label: "Jul 17" },
      { date: "2026-07-18", label: "Jul 18" },
      { date: "2026-07-19", label: "Jul 19" },
      { date: "2026-07-20", label: "Jul 20" },
      { date: "2026-07-21", label: "Jul 21" },
      { date: "2026-07-22", label: "Jul 22" },
    ];
    return days.map(({ date, label }) => ({
      label,
      Revenue: parseFloat(sales.filter((s) => s.date === date).reduce((a, s) => a + s.quantitySold * s.unitPrice, 0).toFixed(2)),
      "Waste Loss": parseFloat(waste.filter((w) => w.date === date).reduce((a, w) => a + w.estimatedLoss, 0).toFixed(2)),
    }));
  }, [sales, waste]);

  return (
    <div className="space-y-5">
      <PageHeader title="Dashboard" subtitle="Your operation at a glance — Jul 22, 2026" />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard label="Inventory Value" value={fmtP(totalInvValue)} sub={`${inv.length} items tracked`} Icon={Package} iconBg="bg-indigo-100 dark:bg-indigo-950/40" iconColor="text-indigo-600 dark:text-indigo-400" />
        <KpiCard label="Today's Revenue" value={fmtP(todayRevenue)} sub="Jul 22 · Live" Icon={DollarSign} iconBg="bg-emerald-100 dark:bg-emerald-950/40" iconColor="text-emerald-600 dark:text-emerald-400" />
        <KpiCard label="Waste Loss (7d)" value={fmtP(weekWasteLoss)} sub="Past 7 days" Icon={Trash2} iconBg="bg-rose-100 dark:bg-rose-950/40" iconColor="text-rose-600 dark:text-rose-400" />
        <KpiCard label="Expiring Soon" value={String(expiringSoon.length)} sub="Items within 3 days" Icon={AlertTriangle} iconBg="bg-amber-100 dark:bg-amber-950/40" iconColor="text-amber-600 dark:text-amber-400" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-card rounded-xl border border-border p-5">
          <h3 className="font-semibold text-sm mb-4">Revenue vs. Waste Loss — Last 7 Days</h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={trendData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="gRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gWaste" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.12)" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v) => `₱${v}`} width={52} />
              <Tooltip formatter={(v: number) => fmtP(v)} />
              <Legend iconType="circle" iconSize={8} />
              <Area type="monotone" dataKey="Revenue" stroke="#6366f1" fill="url(#gRev)" strokeWidth={2} dot={false} />
              <Area type="monotone" dataKey="Waste Loss" stroke="#f43f5e" fill="url(#gWaste)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="font-semibold text-sm mb-4 flex items-center gap-2">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
            Expiring Soon
          </h3>
          {expiringSoon.length === 0 ? (
            <p className="text-sm text-muted-foreground">All items have sufficient shelf life.</p>
          ) : (
            <div className="space-y-1">
              {expiringSoon.map((item) => (
                <div key={item.id} className="flex items-center justify-between py-2.5 border-b border-border last:border-0">
                  <div>
                    <p className="text-sm font-medium">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{item.quantity} {item.unit}</p>
                  </div>
                  <ExpiryBadge expiryDate={item.expiryDate} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h3 className="font-semibold text-sm">Recent Sales</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/30 border-b border-border">
                {["Date", "Item", "Category", "Qty", "Revenue"].map((h) => (
                  <th key={h} className={`px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide ${h === "Qty" || h === "Revenue" ? "text-right" : "text-left"}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sales.slice(0, 8).map((s) => (
                <tr key={s.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                  <td className="px-5 py-3 text-muted-foreground text-xs">{s.date}</td>
                  <td className="px-5 py-3 font-medium">{s.item}</td>
                  <td className="px-5 py-3 text-muted-foreground">{s.category}</td>
                  <td className="px-5 py-3 text-right">{s.quantitySold}</td>
                  <td className="px-5 py-3 text-right font-semibold text-emerald-600 dark:text-emerald-400">
                    {fmtP(s.quantitySold * s.unitPrice)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Inventory View ─────────────────────────────────────────────────────
function InventoryView({
  inv,
  setInv,
  onRequestSupplies,
}: {
  inv: InvItem[];
  setInv: Dispatch<SetStateAction<InvItem[]>>;
  onRequestSupplies: () => void;
}) {
  const [search, setSearch] = useState("");
  const [form, setForm] = useState<Partial<InvItem> | null>(null);

  const filtered = inv.filter(
    (i) =>
      i.name.toLowerCase().includes(search.toLowerCase()) ||
      i.category.toLowerCase().includes(search.toLowerCase())
  );

  const adjust = (id: string, delta: number) =>
    setInv((p) =>
      p.map((i) => (i.id === id ? { ...i, quantity: Math.max(0, parseFloat((i.quantity + delta).toFixed(2))) } : i))
    );

  const upd = (k: string, v: string | number) =>
    setForm((p) => (p ? { ...p, [k]: v } : p));

  const save = () => {
    if (!form) return;
    if (form.id) {
      setInv((p) => p.map((i) => (i.id === form.id ? (form as InvItem) : i)));
    } else {
      setInv((p) => [...p, { ...form, id: uid() } as InvItem]);
    }
    setForm(null);
  };

  const totalValue = inv.reduce((a, i) => a + i.quantity * i.unitCost, 0);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Inventory"
        subtitle={`${inv.length} items · Total value ${fmtP(totalValue)}`}
        action={
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={onRequestSupplies}
              className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg text-sm font-semibold hover:bg-accent transition-colors whitespace-nowrap"
            >
              <ClipboardList className="w-4 h-4" />
              Request Supplies
            </button>
            <button
              onClick={() =>
                setForm({ name: "", category: "", quantity: 0, unit: "kilograms", unitCost: 0, reorderPoint: 0, dateStocked: TODAY, expiryDate: "" })
              }
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              Input New Stock
            </button>
          </div>
        }
      />

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search inventory..."
          className="w-full pl-9 pr-4 py-2.5 bg-card border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>

      <div className="space-y-2">
        {filtered.map((item) => {
          const low = item.quantity <= item.reorderPoint;
          return (
            <div
              key={item.id}
              className={`bg-card rounded-xl border p-4 flex items-center gap-3 transition-colors ${low ? "border-amber-300 dark:border-amber-800" : "border-border"}`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold">{item.name}</p>
                  <ExpiryBadge expiryDate={item.expiryDate} />
                  {low && (
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400">
                      Low Stock
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {item.quantity} {item.unit} remaining · Stocked {item.dateStocked}
                </p>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => adjust(item.id, -1)}
                  className="w-8 h-8 rounded-lg border border-border flex items-center justify-center hover:bg-rose-50 hover:border-rose-200 hover:text-rose-600 dark:hover:bg-rose-950/30 transition-colors text-muted-foreground"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-10 text-center font-semibold text-sm tabular-nums">{item.quantity}</span>
                <button
                  onClick={() => adjust(item.id, 1)}
                  className="w-8 h-8 rounded-lg border border-border flex items-center justify-center hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-600 dark:hover:bg-emerald-950/30 transition-colors text-muted-foreground"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
                <div className="w-px h-5 bg-border mx-1" />
                <button
                  onClick={() => setForm({ ...item })}
                  className="p-1.5 rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setInv((p) => p.filter((i) => i.id !== item.id))}
                  className="p-1.5 rounded hover:bg-rose-100 dark:hover:bg-rose-950/30 text-muted-foreground hover:text-rose-600 transition-colors"
                >
                  <Trash className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {form && (
        <Modal title={form.id ? "Edit Item" : "Input New Stock"} onClose={() => setForm(null)} onSave={save}>
          <datalist id="inv-names">
            {inv.map((i) => (
              <option key={i.id} value={i.name} />
            ))}
          </datalist>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
                Item Name
              </label>
              <input
                list="inv-names"
                value={form.name || ""}
                onChange={(e) => {
                  const val = e.target.value;
                  const existing = inv.find((i) => i.name.toLowerCase() === val.toLowerCase());
                  if (existing) {
                    setForm((p) => p ? { ...p, name: val, category: existing.category, unit: existing.unit, unitCost: existing.unitCost, reorderPoint: existing.reorderPoint } : p);
                  } else {
                    upd("name", val);
                  }
                }}
                placeholder="Type or select from existing..."
                className="w-full px-3 py-2 bg-input-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>

            <FieldInput label="Category" value={form.category || ""} onChange={(v) => upd("category", v)} />

            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
                Unit
              </label>
              <select
                value={form.unit || "kilograms"}
                onChange={(e) => upd("unit", e.target.value)}
                className="w-full px-3 py-2 bg-input-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                {UNITS.map((u) => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>

            <FieldInput label="Quantity" type="number" value={form.quantity ?? 0} onChange={(v) => upd("quantity", parseFloat(v) || 0)} />
            <FieldInput label="Unit Cost (₱)" type="number" value={form.unitCost ?? 0} onChange={(v) => upd("unitCost", parseFloat(v) || 0)} />
            <FieldInput label="Reorder Point" type="number" value={form.reorderPoint ?? 0} onChange={(v) => upd("reorderPoint", parseFloat(v) || 0)} />
            <FieldInput label="Date Stocked" type="date" value={form.dateStocked || TODAY} onChange={(v) => upd("dateStocked", v)} />
            <FieldInput label="Expiry / Use By" type="date" value={form.expiryDate || ""} onChange={(v) => upd("expiryDate", v)} />
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── Request Supplies View ──────────────────────────────────────────────
function SuppliesView({ inv }: { inv: InvItem[] }) {
  const [selectedItem, setSelectedItem] = useState(inv[0]?.name || "");
  const [customItem, setCustomItem] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("kilograms");
  const [list, setList] = useState<SupplyReq[]>([]);
  const [requested, setRequested] = useState(false);

  const itemName = selectedItem === "__custom__" ? customItem : selectedItem;

  const addToList = () => {
    if (!itemName.trim()) return;
    setList((p) => [
      ...p,
      { id: uid(), item: itemName.trim(), quantity: quantity ? parseFloat(quantity) : null, unit },
    ]);
    setQuantity("");
    if (selectedItem === "__custom__") setCustomItem("");
  };

  const requestSupplies = () => {
    setRequested(true);
    setTimeout(() => {
      setList([]);
      setRequested(false);
    }, 3000);
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Request Supplies"
        subtitle="Build a grocery list and send a request to your manager"
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Form panel */}
        <div className="bg-card rounded-xl border border-border p-6 space-y-4">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Add Item</h3>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
              Item
            </label>
            <select
              value={selectedItem}
              onChange={(e) => setSelectedItem(e.target.value)}
              className="w-full px-3 py-2.5 bg-input-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              {inv.map((i) => (
                <option key={i.id} value={i.name}>{i.name}</option>
              ))}
              <option value="__custom__">+ Add custom item...</option>
            </select>
          </div>

          {selectedItem === "__custom__" && (
            <FieldInput label="Custom Item Name" value={customItem} onChange={setCustomItem} />
          )}

          <div className="grid grid-cols-2 gap-3">
            <FieldInput label="Quantity (optional)" type="number" value={quantity} onChange={setQuantity} />
            <SelectField label="Unit" value={unit} onChange={setUnit} options={UNITS} />
          </div>

          <button
            onClick={addToList}
            disabled={!itemName.trim()}
            className="w-full py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add to List
          </button>
        </div>

        {/* Grocery list panel */}
        <div className="bg-card rounded-xl border border-border p-6 flex flex-col min-h-64">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-4">
            Grocery List{list.length > 0 && ` (${list.length})`}
          </h3>

          {list.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-sm text-muted-foreground text-center">
                No items added yet.
                <br />
                Add items from the form on the left.
              </p>
            </div>
          ) : (
            <div className="flex-1 space-y-2 mb-4">
              {list.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-muted/40 rounded-lg">
                  <div>
                    <p className="font-semibold text-sm">{item.item.toUpperCase()}</p>
                    {item.quantity !== null && (
                      <p className="text-xs text-muted-foreground">
                        {item.quantity} {item.unit}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => setList((p) => p.filter((x) => x.id !== item.id))}
                    className="p-1.5 rounded hover:bg-rose-100 dark:hover:bg-rose-950/30 text-muted-foreground hover:text-rose-600 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {requested ? (
            <div className="flex items-center gap-2 justify-center p-3 bg-emerald-100 dark:bg-emerald-950/20 rounded-lg text-emerald-700 dark:text-emerald-400 text-sm font-semibold">
              <Check className="w-4 h-4" />
              Supply request sent to manager!
            </div>
          ) : (
            <button
              onClick={requestSupplies}
              disabled={list.length === 0}
              className="w-full py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              REQUEST SUPPLIES
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Sales View ─────────────────────────────────────────────────────────
function SalesView({ sales, setSales }: { sales: SaleRec[]; setSales: Dispatch<SetStateAction<SaleRec[]>> }) {
  const [search, setSearch] = useState("");

  const todayCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    sales.filter((s) => s.date === TODAY).forEach((s) => {
      counts[s.menuItemId] = (counts[s.menuItemId] || 0) + s.quantitySold;
    });
    return counts;
  }, [sales]);

  const addSale = (menuItem: MenuItem) => {
    setSales((prev) => {
      const existing = prev.find((s) => s.date === TODAY && s.menuItemId === menuItem.id);
      if (existing) {
        return prev.map((s) =>
          s.id === existing.id ? { ...s, quantitySold: s.quantitySold + 1 } : s
        );
      }
      return [
        ...prev,
        { id: uid(), date: TODAY, menuItemId: menuItem.id, item: menuItem.name, category: menuItem.category, quantitySold: 1, unitPrice: menuItem.sellingPrice },
      ];
    });
  };

  const filteredMenu = MENU_ITEMS.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase())
  );

  const todayRevenue = sales.filter((s) => s.date === TODAY).reduce((a, s) => a + s.quantitySold * s.unitPrice, 0);
  const todayServings = sales.filter((s) => s.date === TODAY).reduce((a, s) => a + s.quantitySold, 0);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Sales Log"
        subtitle={`Tap +1 to record a serving sold · ${TODAY}`}
      />

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search menu items..."
          className="w-full pl-9 pr-4 py-2.5 bg-card border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>

      <div className="space-y-2">
        {filteredMenu.map((menuItem) => {
          const count = todayCounts[menuItem.id] || 0;
          return (
            <div
              key={menuItem.id}
              className="bg-card rounded-xl border border-border p-4 flex items-center gap-4 hover:bg-muted/10 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <p className="font-semibold">{menuItem.name}</p>
                <div className="flex items-center gap-3 mt-0.5">
                  <p className={`text-sm font-medium ${count > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"}`}>
                    {count} sold today
                  </p>
                  <span className="text-xs text-muted-foreground">{fmtP(menuItem.sellingPrice)}/serving</span>
                </div>
              </div>
              <button
                onClick={() => addSale(menuItem)}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-bold hover:bg-primary/90 active:scale-95 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                +1
              </button>
            </div>
          );
        })}
      </div>

      <div className="bg-card rounded-xl border border-border p-5 grid grid-cols-2 gap-4">
        <div className="text-center p-3 bg-emerald-50 dark:bg-emerald-950/20 rounded-lg">
          <p className="text-xs text-muted-foreground mb-1">Today's Revenue</p>
          <p className="font-bold text-emerald-600 dark:text-emerald-400">{fmtP(todayRevenue)}</p>
        </div>
        <div className="text-center p-3 bg-indigo-50 dark:bg-indigo-950/20 rounded-lg">
          <p className="text-xs text-muted-foreground mb-1">Servings Sold</p>
          <p className="font-bold text-indigo-600 dark:text-indigo-400">{todayServings}</p>
        </div>
      </div>
    </div>
  );
}

// ─── Waste View ─────────────────────────────────────────────────────────
function WasteView({
  waste,
  setWaste,
  inv,
}: {
  waste: WasteRec[];
  setWaste: Dispatch<SetStateAction<WasteRec[]>>;
  inv: InvItem[];
}) {
  const [selectedMenuId, setSelectedMenuId] = useState<string>(MENU_ITEMS[0].id);
  const [servings, setServings] = useState(1);

  const selectedMenu = MENU_ITEMS.find((m) => m.id === selectedMenuId) ?? MENU_ITEMS[0];

  const computedIngredients = selectedMenu.ingredients.map((ing) => {
    const costPerUnit = getIngredientUnitCost(ing.item, inv);
    const totalQty = ing.qty * servings;
    return { name: ing.item, qty: totalQty, unit: ing.unit, cost: costPerUnit * totalQty };
  });

  const estimatedLoss = computedIngredients.reduce((a, i) => a + i.cost, 0);

  const addToRecords = () => {
    const newRec: WasteRec = {
      id: uid(),
      date: TODAY,
      menuItem: selectedMenu.name,
      servingsWasted: servings,
      ingredients: computedIngredients,
      estimatedLoss,
    };
    setWaste((p) => [newRec, ...p]);
    setServings(1);
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Waste & Leftovers"
        subtitle="Log unsold dishes and auto-calculate ingredient losses"
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
        {/* Input card */}
        <div className="bg-card rounded-xl border border-border p-6 space-y-5">
          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
              Select Item
            </label>
            <select
              value={selectedMenuId}
              onChange={(e) => setSelectedMenuId(e.target.value)}
              className="w-full px-3 py-2.5 bg-input-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              {MENU_ITEMS.map((m) => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>

          {/* Servings stepper */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-4">
              Servings Wasted
            </p>
            <div className="flex items-center justify-center gap-5">
              <button
                onClick={() => setServings((s) => Math.max(1, s - 1))}
                className="w-14 h-14 rounded-xl border-2 border-border flex items-center justify-center text-xl font-bold hover:bg-rose-50 hover:border-rose-300 hover:text-rose-600 dark:hover:bg-rose-950/30 transition-colors"
              >
                −
              </button>
              <div className="w-20 h-20 rounded-2xl bg-amber-100 dark:bg-amber-950/30 border-2 border-amber-300 dark:border-amber-800 flex items-center justify-center">
                <span className="text-3xl font-bold text-amber-700 dark:text-amber-400">{servings}</span>
              </div>
              <button
                onClick={() => setServings((s) => s + 1)}
                className="w-14 h-14 rounded-xl border-2 border-border flex items-center justify-center text-xl font-bold hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-600 dark:hover:bg-emerald-950/30 transition-colors"
              >
                +
              </button>
            </div>
          </div>

          {/* Auto-filled ingredients */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              Ingredients Used (auto-filled)
            </p>
            <div className="bg-muted/40 rounded-xl p-4 space-y-2">
              {computedIngredients.map((ing) => (
                <div key={ing.name} className="flex items-center justify-between text-sm">
                  <span className="text-primary font-medium">{ing.name}</span>
                  <span className="text-muted-foreground tabular-nums">
                    {ing.qty.toFixed(2)} {ing.unit}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Estimated loss */}
          <div className="flex items-center justify-between p-4 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900 rounded-xl">
            <span className="font-semibold text-sm">Estimated Loss</span>
            <span className="font-bold text-xl text-rose-600 dark:text-rose-400">{fmtP(estimatedLoss)}</span>
          </div>

          <button
            onClick={addToRecords}
            className="w-full py-3 bg-primary text-primary-foreground rounded-xl text-sm font-bold tracking-wide hover:bg-primary/90 transition-colors"
          >
            ADD TO RECORDS
          </button>
        </div>

        {/* Records list */}
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <h3 className="font-semibold text-sm">Waste Records</h3>
            <span className="text-xs text-muted-foreground">{waste.length} entries</span>
          </div>
          {waste.length === 0 ? (
            <div className="px-5 py-8 text-center">
              <p className="text-sm text-muted-foreground">No waste records yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-border max-h-[500px] overflow-y-auto">
              {waste.map((rec) => (
                <div key={rec.id} className="px-5 py-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-semibold text-sm">{rec.menuItem}</p>
                      <p className="text-xs text-muted-foreground">
                        {rec.date} · {rec.servingsWasted} serving{rec.servingsWasted !== 1 ? "s" : ""}
                      </p>
                    </div>
                    <div className="text-right flex items-center gap-3">
                      <p className="font-semibold text-sm text-rose-600 dark:text-rose-400">
                        {fmtP(rec.estimatedLoss)}
                      </p>
                      <button
                        onClick={() => setWaste((p) => p.filter((w) => w.id !== rec.id))}
                        className="p-1 rounded hover:bg-rose-100 dark:hover:bg-rose-950/30 text-muted-foreground hover:text-rose-600 transition-colors"
                      >
                        <Trash className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-x-3 gap-y-0.5">
                    {rec.ingredients.map((ing) => (
                      <span key={ing.name} className="text-xs text-muted-foreground">
                        {ing.name}: {ing.qty.toFixed(2)} {ing.unit}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Calculator View ────────────────────────────────────────────────────
function CalculatorView({ inv }: { inv: InvItem[] }) {
  const [name, setName] = useState("Chicken");
  const [qty, setQty] = useState("10");
  const [cost, setCost] = useState("220");
  const [markup, setMarkup] = useState("145");
  const [overhead, setOverhead] = useState("15");

  const unitCost = parseFloat(cost) || 0;
  const quantity = parseFloat(qty) || 0;
  const markupPct = parseFloat(markup) || 0;
  const overheadPct = parseFloat(overhead) || 0;

  const totalCost = unitCost * quantity;
  const overheadCost = totalCost * (overheadPct / 100);
  const costWithOverhead = totalCost + overheadCost;
  const sellingPrice = costWithOverhead * (1 + markupPct / 100);
  const profitPerUnit = quantity > 0 ? (sellingPrice - costWithOverhead) / quantity : 0;
  const profitMargin = sellingPrice > 0 ? ((sellingPrice - costWithOverhead) / sellingPrice) * 100 : 0;
  const totalProfit = sellingPrice - costWithOverhead;

  const rows: { label: string; value: string; highlight?: boolean; green?: boolean }[] = [
    { label: "Quantity", value: `${quantity} units` },
    { label: "Unit Cost", value: fmtP(unitCost) },
    { label: "Total Raw Cost", value: fmtP(totalCost) },
    { label: `Overhead (${overheadPct}%)`, value: fmtP(overheadCost) },
    { label: "Cost with Overhead", value: fmtP(costWithOverhead) },
    { label: `Markup (${markupPct}%)`, value: fmtP(sellingPrice - costWithOverhead) },
    { label: "Selling Price (total)", value: fmtP(sellingPrice), highlight: true },
    { label: "Profit per Unit", value: fmtP(profitPerUnit), green: true },
    { label: "Total Profit", value: fmtP(totalProfit), green: true },
    { label: "Profit Margin", value: `${profitMargin.toFixed(1)}%`, highlight: true, green: true },
  ];

  return (
    <div className="space-y-5 max-w-2xl">
      <PageHeader title="Cost Calculator" subtitle="Calculate selling price, markup, overhead, and profit margin" />

      <div className="bg-card rounded-xl border border-border p-6">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-4">Inputs</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FieldInput label="Item Name" value={name} onChange={setName} className="sm:col-span-2" />
          <FieldInput label="Quantity" type="number" value={qty} onChange={setQty} />
          <FieldInput label="Unit Cost (₱)" type="number" value={cost} onChange={setCost} />
          <FieldInput label="Markup (%)" type="number" value={markup} onChange={setMarkup} />
          <FieldInput label="Overhead (%)" type="number" value={overhead} onChange={setOverhead} />
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h3 className="font-semibold text-sm">Results — {name || "Item"}</h3>
        </div>
        <div className="divide-y divide-border">
          {rows.map(({ label, value, highlight, green }) => (
            <div key={label} className={`flex items-center justify-between px-6 py-3 ${highlight ? "bg-primary/5" : ""}`}>
              <span className={`text-sm ${highlight ? "font-semibold" : "text-muted-foreground"}`}>{label}</span>
              <span className={`text-sm font-semibold ${green ? "text-emerald-600 dark:text-emerald-400" : ""}`}>{value}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border p-5">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Quick Fill from Inventory</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {inv.map((item) => (
            <button
              key={item.id}
              onClick={() => { setName(item.name); setCost(String(item.unitCost)); setQty("10"); }}
              className="flex items-center justify-between px-3 py-2.5 rounded-lg border border-border hover:bg-accent hover:border-primary/30 transition-colors text-left"
            >
              <span className="text-sm font-medium">{item.name}</span>
              <span className="text-xs text-muted-foreground">{fmtP(item.unitCost)}/{item.unit}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── AI Recommendations ─────────────────────────────────────────────────
function generateRecommendations(inv: InvItem[], sales: SaleRec[], waste: WasteRec[]): Rec[] {
  const recs: Rec[] = [];

  const wasteByMenuItem: Record<string, number> = {};
  waste.forEach((w) => { wasteByMenuItem[w.menuItem] = (wasteByMenuItem[w.menuItem] || 0) + w.estimatedLoss; });

  const salesByItem: Record<string, number> = {};
  sales.forEach((s) => { salesByItem[s.item] = (salesByItem[s.item] || 0) + s.quantitySold; });

  const totalRevenue = sales.reduce((a, s) => a + s.quantitySold * s.unitPrice, 0);
  const totalWasteLoss = waste.reduce((a, w) => a + w.estimatedLoss, 0);

  Object.entries(wasteByMenuItem)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .forEach(([item, loss]) => {
      if (loss > 100) {
        recs.push({
          type: "reduce",
          title: `Reduce ${item} prepared quantity`,
          detail: `${item} accounts for ${fmtP(loss)} in waste losses. Over-preparation is the likely cause. Consider reducing batch size by 20–30% and preparing in shorter intervals throughout service hours to maintain freshness and minimize surplus.`,
          priority: loss > 250 ? "high" : "medium",
        });
      }
    });

  inv
    .filter((i) => {
      const sold = salesByItem[i.name] || 0;
      return sold > 20 && i.quantity < i.reorderPoint * 2;
    })
    .forEach((item) => {
      recs.push({
        type: "increase",
        title: `Restock ${item.name} soon`,
        detail: `${item.name} has only ${item.quantity} ${item.unit} remaining with demand velocity of ~${Math.ceil((salesByItem[item.name] || 0) / 8)} servings/day. At this rate, stock-out is projected within 2–3 days. Recommend a 40–50% increase on next purchase order.`,
        priority: "high",
      });
    });

  const expiringItems = inv.filter((i) => { const d = daysUntilExpiry(i.expiryDate); return d >= 0 && d <= 3; });
  if (expiringItems.length > 0) {
    recs.push({
      type: "warning",
      title: `${expiringItems.length} item${expiringItems.length > 1 ? "s" : ""} expiring within 3 days`,
      detail: `${expiringItems.map((i) => i.name).join(", ")} ${expiringItems.length > 1 ? "are" : "is"} approaching expiry. Prioritize these in today's menu preparation to minimize waste losses. Consider offering a daily special featuring these ingredients.`,
      priority: "high",
    });
  }

  const wasteRatio = totalRevenue > 0 ? totalWasteLoss / totalRevenue : 0;
  if (wasteRatio > 0.08) {
    recs.push({
      type: "warning",
      title: "Waste-to-revenue ratio exceeds benchmark",
      detail: `Current ratio is ${(wasteRatio * 100).toFixed(1)}% against the 8% industry benchmark. Implement FIFO across all stations, conduct daily expiry checks, and consider smaller, more frequent supplier deliveries for high-spoilage items like proteins and produce.`,
      priority: "medium",
    });
  }

  const topSeller = Object.entries(salesByItem).sort((a, b) => b[1] - a[1])[0];
  if (topSeller) {
    const topRevenue = sales.filter((s) => s.item === topSeller[0]).reduce((a, s) => a + s.quantitySold * s.unitPrice, 0);
    recs.push({
      type: "insight",
      title: `Top performer: ${topSeller[0]}`,
      detail: `${topSeller[0]} is your best-selling item at ${topSeller[1]} servings and ${fmtP(topRevenue)} in revenue over the tracked period (${((topRevenue / totalRevenue) * 100).toFixed(0)}% of total). Secure reliable supplier terms and maintain a safety buffer above the reorder point to avoid stock-outs on peak days.`,
      priority: "low",
    });
  }

  return recs;
}

// ─── Reports View ────────────────────────────────────────────────────────
function ReportsView({ inv, sales, waste }: { inv: InvItem[]; sales: SaleRec[]; waste: WasteRec[] }) {
  const [tab, setTab] = useState<"charts" | "ai">("charts");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiShown, setAiShown] = useState(false);
  const [recs, setRecs] = useState<Rec[]>([]);

  const runAI = () => {
    setAiLoading(true);
    setAiShown(false);
    setTimeout(() => {
      setRecs(generateRecommendations(inv, sales, waste));
      setAiLoading(false);
      setAiShown(true);
    }, 1800);
  };

  const salesByCategory = useMemo(() => {
    const map: Record<string, number> = {};
    sales.forEach((s) => { map[s.category] = (map[s.category] || 0) + s.quantitySold * s.unitPrice; });
    return Object.entries(map).map(([name, value]) => ({ name, value: parseFloat(value.toFixed(2)) }));
  }, [sales]);

  const wasteByMenuItem = useMemo(() => {
    const map: Record<string, number> = {};
    waste.forEach((w) => { map[w.menuItem] = (map[w.menuItem] || 0) + w.estimatedLoss; });
    return Object.entries(map).map(([name, value]) => ({ name, value: parseFloat(value.toFixed(2)) })).sort((a, b) => b.value - a.value);
  }, [waste]);

  const dailyData = useMemo(() => {
    const days = ["2026-07-15", "2026-07-16", "2026-07-17", "2026-07-18", "2026-07-19", "2026-07-20", "2026-07-21", "2026-07-22"];
    return days.map((d) => ({
      date: d.slice(5),
      Revenue: parseFloat(sales.filter((s) => s.date === d).reduce((a, s) => a + s.quantitySold * s.unitPrice, 0).toFixed(2)),
      Waste: parseFloat(waste.filter((w) => w.date === d).reduce((a, w) => a + w.estimatedLoss, 0).toFixed(2)),
    }));
  }, [sales, waste]);

  const invByCategory = useMemo(() => {
    const map: Record<string, number> = {};
    inv.forEach((i) => { map[i.category] = (map[i.category] || 0) + i.quantity * i.unitCost; });
    return Object.entries(map).map(([name, value]) => ({ name, value: parseFloat(value.toFixed(2)) }));
  }, [inv]);

  const totalRevenue = sales.reduce((a, s) => a + s.quantitySold * s.unitPrice, 0);
  const totalWaste = waste.reduce((a, w) => a + w.estimatedLoss, 0);

  const recStyle: Record<string, { bg: string; border: string; labelColor: string; label: string }> = {
    increase: { bg: "bg-emerald-50 dark:bg-emerald-950/20", border: "border-emerald-200 dark:border-emerald-900", labelColor: "text-emerald-700 dark:text-emerald-400", label: "Increase Supply" },
    reduce: { bg: "bg-amber-50 dark:bg-amber-950/20", border: "border-amber-200 dark:border-amber-900", labelColor: "text-amber-700 dark:text-amber-400", label: "Reduce Order" },
    warning: { bg: "bg-rose-50 dark:bg-rose-950/20", border: "border-rose-200 dark:border-rose-900", labelColor: "text-rose-700 dark:text-rose-400", label: "Warning" },
    insight: { bg: "bg-indigo-50 dark:bg-indigo-950/20", border: "border-indigo-200 dark:border-indigo-900", labelColor: "text-indigo-700 dark:text-indigo-400", label: "Insight" },
  };

  const priorityDot: Record<string, string> = { high: "bg-rose-500", medium: "bg-amber-500", low: "bg-slate-400" };

  return (
    <div className="space-y-5">
      <PageHeader title="Reports & AI" subtitle="Data summaries, trend analysis, and AI-powered supply recommendations" />

      <div className="flex gap-1 p-1 bg-muted rounded-xl w-fit">
        {(["charts", "ai"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors ${tab === t ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
          >
            {t === "charts" ? "Charts & Graphs" : "AI Analysis"}
          </button>
        ))}
      </div>

      {tab === "charts" && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Total Revenue", value: fmtP(totalRevenue), color: "text-emerald-600 dark:text-emerald-400" },
              { label: "Total Waste Loss", value: fmtP(totalWaste), color: "text-rose-600 dark:text-rose-400" },
              { label: "Inventory Value", value: fmtP(inv.reduce((a, i) => a + i.quantity * i.unitCost, 0)), color: "text-indigo-600 dark:text-indigo-400" },
              { label: "Waste Ratio", value: `${totalRevenue > 0 ? ((totalWaste / totalRevenue) * 100).toFixed(1) : 0}%`, color: "text-amber-600 dark:text-amber-400" },
            ].map(({ label, value, color }) => (
              <div key={label} className="bg-card rounded-xl border border-border p-4 text-center">
                <p className="text-xs text-muted-foreground mb-1">{label}</p>
                <p className={`font-bold text-base ${color}`}>{value}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-card rounded-xl border border-border p-5">
              <h3 className="font-semibold text-sm mb-4">Daily Revenue vs. Waste Loss</h3>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={dailyData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.12)" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v) => `₱${v}`} width={52} />
                  <Tooltip formatter={(v: number) => fmtP(v)} />
                  <Legend iconType="circle" iconSize={8} />
                  <Bar dataKey="Revenue" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Waste" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-card rounded-xl border border-border p-5">
              <h3 className="font-semibold text-sm mb-4">Revenue by Category</h3>
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie data={salesByCategory} cx="50%" cy="50%" innerRadius={55} outerRadius={95} dataKey="value" nameKey="name" paddingAngle={3}>
                    {salesByCategory.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number) => fmtP(v)} />
                  <Legend iconType="circle" iconSize={8} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-card rounded-xl border border-border p-5">
              <h3 className="font-semibold text-sm mb-4">Waste Loss by Dish</h3>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={wasteByMenuItem} layout="vertical" margin={{ top: 4, right: 20, bottom: 0, left: 110 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.12)" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v) => `₱${v}`} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={110} />
                  <Tooltip formatter={(v: number) => fmtP(v)} />
                  <Bar dataKey="value" name="Waste Loss" fill="#f43f5e" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-card rounded-xl border border-border p-5">
              <h3 className="font-semibold text-sm mb-4">Inventory Value by Category</h3>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={invByCategory} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.12)" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v) => `₱${v}`} width={52} />
                  <Tooltip formatter={(v: number) => fmtP(v)} />
                  <Bar dataKey="value" name="Value" radius={[4, 4, 0, 0]}>
                    {invByCategory.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {tab === "ai" && (
        <div className="space-y-4">
          <div className="bg-card rounded-xl border border-border p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-11 h-11 rounded-xl bg-indigo-100 dark:bg-indigo-950/40 flex items-center justify-center shrink-0">
                <Bot className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <h3 className="font-semibold">AI Supply & Demand Analyst</h3>
                <p className="text-sm text-muted-foreground">Analyzes inventory, sales, and waste to surface actionable insights</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed mb-5">
              The analyst examines your logs to detect waste trends, stock-out risks, expiry alerts, and demand patterns — then generates prioritized recommendations for your procurement and preparation decisions.
            </p>
            <button
              onClick={runAI}
              disabled={aiLoading}
              className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 disabled:opacity-60 transition-colors"
            >
              {aiLoading ? (
                <><RefreshCw className="w-4 h-4 animate-spin" /> Analyzing logs...</>
              ) : (
                <><Sparkles className="w-4 h-4" /> {aiShown ? "Re-run Analysis" : "Run AI Analysis"}</>
              )}
            </button>
          </div>

          {aiLoading && (
            <div className="space-y-3">
              {[1, 2, 3].map((n) => (
                <div key={n} className="bg-card rounded-xl border border-border p-5 animate-pulse">
                  <div className="h-3 bg-muted rounded w-1/4 mb-3" />
                  <div className="h-4 bg-muted rounded w-2/3 mb-2" />
                  <div className="h-3 bg-muted rounded w-full mb-1" />
                  <div className="h-3 bg-muted rounded w-5/6" />
                </div>
              ))}
            </div>
          )}

          {aiShown && !aiLoading && (
            <div className="space-y-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                {recs.length} Recommendations Generated
              </p>
              {recs.map((rec, i) => {
                const s = recStyle[rec.type];
                return (
                  <div key={i} className={`rounded-xl border p-5 ${s.bg} ${s.border}`}>
                    <div className="flex items-start gap-3">
                      <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${priorityDot[rec.priority]}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className={`text-xs font-bold uppercase tracking-wide ${s.labelColor}`}>{s.label}</span>
                          <span className="text-xs text-muted-foreground">· {rec.priority} priority</span>
                        </div>
                        <h4 className="font-semibold text-sm mb-1.5">{rec.title}</h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">{rec.detail}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [dark, setDark] = useState(false);
  const [view, setView] = useState<View>("dashboard");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [inv, setInv] = useState<InvItem[]>(INIT_INV);
  const [sales, setSales] = useState<SaleRec[]>(INIT_SALES);
  const [waste, setWaste] = useState<WasteRec[]>(INIT_WASTE);

  const navigate = (v: View) => {
    setView(v);
    setMobileOpen(false);
  };

  return (
    <div className={dark ? "dark" : ""}>
      <div
        className="min-h-screen bg-background text-foreground flex overflow-hidden"
        style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}
      >
        {mobileOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-20 lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-30 w-60 bg-card border-r border-border flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="h-14 flex items-center px-5 border-b border-border shrink-0">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center mr-2.5 shrink-0">
              <Package className="w-3.5 h-3.5 text-primary-foreground" />
            </div>
            <span className="font-bold text-sm tracking-tight">StockPilot</span>
          </div>

          <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
            {NAV_ITEMS.map(({ id, label, Icon }) => (
              <button
                key={id}
                onClick={() => navigate(id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  view === id
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {label}
              </button>
            ))}
          </nav>

          <div className="p-3 border-t border-border shrink-0">
            <button
              onClick={() => setDark(!dark)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              {dark ? <Sun className="w-4 h-4 shrink-0" /> : <Moon className="w-4 h-4 shrink-0" />}
              {dark ? "Light Mode" : "Dark Mode"}
            </button>
          </div>
        </aside>

        {/* Main */}
        <div className="flex-1 flex flex-col min-h-screen lg:ml-60">
          {/* Mobile header */}
          <header className="lg:hidden h-14 flex items-center justify-between px-4 bg-card border-b border-border sticky top-0 z-10 shrink-0">
            <button onClick={() => setMobileOpen(true)} className="p-2 rounded-lg hover:bg-accent transition-colors">
              <Menu className="w-5 h-5" />
            </button>
            <span className="font-bold text-sm">StockPilot</span>
            <button onClick={() => setDark(!dark)} className="p-2 rounded-lg hover:bg-accent transition-colors">
              {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </header>

          <main className="flex-1 overflow-auto p-4 lg:p-6 lg:pt-8">
            {view === "dashboard" && <DashboardView inv={inv} sales={sales} waste={waste} />}
            {view === "inventory" && <InventoryView inv={inv} setInv={setInv} onRequestSupplies={() => navigate("supplies")} />}
            {view === "supplies" && <SuppliesView inv={inv} />}
            {view === "sales" && <SalesView sales={sales} setSales={setSales} />}
            {view === "waste" && <WasteView waste={waste} setWaste={setWaste} inv={inv} />}
            {view === "calculator" && <CalculatorView inv={inv} />}
            {view === "reports" && <ReportsView inv={inv} sales={sales} waste={waste} />}
          </main>
        </div>
      </div>
    </div>
  );
}
