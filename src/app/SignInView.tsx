import { useState } from "react";
import { Package, Shield, Users, ArrowRight, Lock, Sparkles } from "lucide-react";
import { verifyPin } from "./syncEngine";

interface SignInViewProps {
  onLoginSuccess: (token: string, storeId: string) => void;
  onStaffBypass: (storeId?: string) => void;
}

export function SignInView({ onLoginSuccess, onStaffBypass }: SignInViewProps) {
  const [storeId, setStoreId] = useState("default-store");
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pin.trim()) {
      setError("Please enter your Manager PIN");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const data = await verifyPin(storeId.trim() || "default-store", pin.trim());
      onLoginSuccess(data.token, data.storeId);
    } catch (err: any) {
      setError(err.message || "Failed to verify PIN. Default PIN is 1234.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full grid grid-cols-1 lg:grid-cols-2 bg-background text-foreground" style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
      {/* Left Panel: Auth Form */}
      <div className="flex flex-col justify-between p-6 sm:p-10 lg:p-14 max-w-xl mx-auto w-full min-h-screen">
        {/* Top Header */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-sky-500 flex items-center justify-center shadow-md">
            <Package className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-bold text-lg tracking-tight">StockPilot</span>
            <span className="text-[10px] uppercase font-bold text-sky-600 dark:text-sky-400 bg-sky-100 dark:bg-sky-950/60 px-2 py-0.5 rounded-full ml-2">Cloud Sync</span>
          </div>
        </div>

        {/* Form Container */}
        <div className="my-auto py-8">
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">Log in to your store</h1>
            <p className="text-sm text-muted-foreground">
              Enter your Manager PIN for full administration, or continue as staff for quick POS & sales entry.
            </p>
          </div>

          {/* Social / OAuth Placeholders */}
          <div className="space-y-2.5 mb-6">
            <button
              type="button"
              onClick={() => setError("Google OAuth is disabled for local demo. Please use Manager PIN or Staff Bypass.")}
              className="w-full py-2.5 px-4 rounded-xl border border-border bg-card hover:bg-accent transition-colors flex items-center justify-center gap-3 text-sm font-medium shadow-xs"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              Sign in with Google
            </button>

            <button
              type="button"
              onClick={() => setError("GitHub OAuth is disabled for local demo. Please use Manager PIN or Staff Bypass.")}
              className="w-full py-2.5 px-4 rounded-xl border border-border bg-card hover:bg-accent transition-colors flex items-center justify-center gap-3 text-sm font-medium shadow-xs"
            >
              <svg className="w-4 h-4 shrink-0 fill-current" viewBox="0 0 24 24">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
              Sign in with GitHub
            </button>
          </div>

          <div className="relative my-6 flex items-center justify-center">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
            <span className="relative bg-background px-3 text-xs uppercase font-semibold text-muted-foreground tracking-wider">
              Or with Store PIN
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400 text-xs font-medium flex items-center gap-2">
                <Lock className="w-4 h-4 shrink-0 text-rose-500" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
                Store ID
              </label>
              <input
                type="text"
                value={storeId}
                onChange={(e) => setStoreId(e.target.value)}
                placeholder="default-store"
                className="w-full px-3.5 py-2.5 bg-input-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/30 transition-shadow"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Manager PIN
                </label>
                <span className="text-[11px] text-sky-600 dark:text-sky-400 font-medium">Default: 1234</span>
              </div>
              <input
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="••••"
                maxLength={10}
                className="w-full px-3.5 py-2.5 bg-input-background border border-border rounded-xl text-sm tracking-widest focus:outline-none focus:ring-2 focus:ring-sky-500/30 transition-shadow"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-sky-500 hover:bg-sky-600 active:bg-sky-700 text-white rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2 shadow-md shadow-sky-500/20 disabled:opacity-60"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Shield className="w-4 h-4" />
                  Sign In as Manager
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => onStaffBypass(storeId)}
              className="w-full py-3 bg-accent/60 hover:bg-accent text-foreground border border-border rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2"
            >
              <Users className="w-4 h-4 text-emerald-500" />
              Continue as Staff (Sales & POS Only)
              <ArrowRight className="w-4 h-4 ml-auto text-muted-foreground" />
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-xs text-center text-muted-foreground">
          StockPilot Offline-First DBMS · Hybrid MongoDB Cloud Sync
        </p>
      </div>

      {/* Right Panel: Hero Banner (hidden lg:flex on mobile) */}
      <div className="hidden lg:flex flex-col justify-between p-12 bg-slate-900 text-white relative overflow-hidden">
        {/* Background Image snapshot */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-luminosity transform scale-105 transition-transform duration-1000"
          style={{ backgroundImage: "url('/snapshot.png')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/90 to-slate-900/60" />

        {/* Top Info Tag */}
        <div className="relative z-10 flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">Smart Canteen & F&B DBMS</span>
        </div>

        {/* Center Hero Content */}
        <div className="relative z-10 max-w-lg my-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/20 border border-sky-400/30 text-sky-300 text-xs font-medium">
            <Sparkles className="w-3.5 h-3.5" />
            Real-time Recipe Deductions & Waste Analytics
          </div>

          <h2 className="text-3xl xl:text-4xl font-extrabold tracking-tight text-white leading-tight">
            Manage Your Food Service With Confidence.
          </h2>

          <p className="text-slate-300 text-sm xl:text-base leading-relaxed">
            Real-time stock tracking, recipe-driven ingredient deductions, automated reorder alerts, and intelligent food waste reduction.
          </p>

          {/* Quote Card */}
          <div className="p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 space-y-2">
            <p className="text-xs italic text-slate-200 leading-relaxed">
              "Shift from a 'dispose immediately' mindset toward sustainable solutions — tracking every gram to protect operational margins."
            </p>
            <div className="flex items-center justify-between text-[11px] text-sky-300 font-semibold pt-1">
              <span>— StockPilot Food Recovery System</span>
              <span className="text-slate-400">v2.0 Hybrid</span>
            </div>
          </div>
        </div>

        {/* Bottom Feature Badges */}
        <div className="relative z-10 grid grid-cols-3 gap-3 text-center border-t border-slate-800 pt-6">
          <div>
            <p className="text-lg font-bold text-sky-400">100%</p>
            <p className="text-[11px] text-slate-400">Offline First</p>
          </div>
          <div>
            <p className="text-lg font-bold text-emerald-400">Live</p>
            <p className="text-[11px] text-slate-400">Atlas Cloud Sync</p>
          </div>
          <div>
            <p className="text-lg font-bold text-amber-400">Zero</p>
            <p className="text-[11px] text-slate-400">Food Waste Loss</p>
          </div>
        </div>
      </div>
    </div>
  );
}
