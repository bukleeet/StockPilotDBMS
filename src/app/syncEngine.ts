/**
 * Sync Engine — API client for StockPilot cloud sync.
 * Communicates with the Express backend for auth and data synchronization.
 */

const isBrowser = typeof window !== 'undefined';
const isLocalhost =
  isBrowser &&
  (window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname === '[::1]');

// In development/localhost default to port 5000; in production use VITE_API_URL if provided
const API_BASE = (import.meta.env.VITE_API_URL as string | undefined)?.trim() || (isLocalhost ? 'http://localhost:5000' : '');

function getLocalPin(storeId: string): string {
  if (typeof localStorage === 'undefined') return '1234';
  return localStorage.getItem(`stockpilot_pin_${storeId}`) || '1234';
}

function createOfflineManagerToken(storeId: string): string {
  const header = btoa(JSON.stringify({ alg: 'none', typ: 'JWT' }));
  const payload = btoa(
    JSON.stringify({
      storeId,
      role: 'manager',
      exp: Math.floor(Date.now() / 1000) + 12 * 3600, // 12 hours
      isOffline: true,
    })
  );
  return `${header}.${payload}.offline`;
}

// ─── Auth API ───────────────────────────────────────────────────────────

export interface AuthResponse {
  token: string;
  role: 'manager';
  storeId: string;
}

export async function verifyPin(storeId: string, pin: string): Promise<AuthResponse> {
  // If remote API is available, try verifying with the server
  if (API_BASE) {
    try {
      const res = await fetch(`${API_BASE}/api/auth/verify-pin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storeId, pin }),
      });

      if (res.ok) {
        return await res.json();
      }

      const data = await res.json().catch(() => null);
      if (data?.error) {
        throw new Error(data.error);
      }
      throw new Error(`Authentication failed (${res.status})`);
    } catch (err: any) {
      // Re-throw explicit server validation rejections
      if (
        err.message &&
        (err.message.includes('Invalid PIN') ||
          err.message.includes('PIN is required') ||
          err.message.includes('Store not found'))
      ) {
        throw err;
      }
      // Connection refused, network error, or server down -> fallback to offline mode
      console.warn('[Auth] Remote server unreachable, falling back to Offline Mode verification:', err.message);
    }
  }

  // Offline PIN fallback (for offline PWA usage or when backend is not deployed)
  const localPin = getLocalPin(storeId);
  if (pin === localPin) {
    return {
      token: createOfflineManagerToken(storeId),
      role: 'manager',
      storeId,
    };
  }

  throw new Error('Invalid PIN (Default PIN: 1234)');
}

export async function changePin(
  token: string,
  storeId: string,
  oldPin: string,
  newPin: string
): Promise<{ message: string }> {
  if (API_BASE) {
    try {
      const res = await fetch(`${API_BASE}/api/auth/change-pin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ storeId, oldPin, newPin }),
      });

      if (res.ok) {
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem(`stockpilot_pin_${storeId}`, newPin);
        }
        return await res.json();
      }

      const data = await res.json().catch(() => null);
      if (data?.error) {
        throw new Error(data.error);
      }
      throw new Error(`Failed to change PIN (${res.status})`);
    } catch (err: any) {
      if (
        err.message &&
        (err.message.includes('incorrect') ||
          err.message.includes('least 4') ||
          err.message.includes('required') ||
          err.message.includes('Unauthorized') ||
          err.message.includes('expired'))
      ) {
        throw err;
      }
      console.warn('[Auth] Remote server unreachable during PIN change, applying offline update.');
    }
  }

  // Offline PIN change fallback
  const currentPin = getLocalPin(storeId);
  if (oldPin !== currentPin) {
    throw new Error('Current PIN is incorrect');
  }
  if (String(newPin).length < 4) {
    throw new Error('New PIN must be at least 4 digits');
  }

  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(`stockpilot_pin_${storeId}`, String(newPin));
  }
  return { message: 'Manager PIN updated successfully in local storage!' };
}

// ─── Sync API ───────────────────────────────────────────────────────────

export interface CloudStoreData {
  storeId: string;
  inventory: any[];
  sales: any[];
  waste: any[];
  supplyRequests: any[];
  settings: {
    blockStockout: boolean;
    dateOverride: string | null;
  };
  lastSyncedAt: string | null;
}

export async function pullFromCloud(storeId = 'default-store'): Promise<CloudStoreData> {
  const res = await fetch(`${API_BASE}/api/sync/pull?storeId=${encodeURIComponent(storeId)}`);

  if (!res.ok) {
    throw new Error(`Failed to pull data (${res.status})`);
  }

  return res.json();
}

export async function pushToCloud(
  token: string,
  data: {
    storeId?: string;
    inventory: any[];
    sales: any[];
    waste: any[];
    supplyRequests: any[];
    settings: { blockStockout: boolean; dateOverride: string | null };
  }
): Promise<{ message: string; lastSyncedAt: string }> {
  const res = await fetch(`${API_BASE}/api/sync/push`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ storeId: data.storeId || 'default-store', ...data }),
  });

  if (!res.ok) {
    throw new Error(`Failed to push data (${res.status})`);
  }

  return res.json();
}

// ─── Health Check ───────────────────────────────────────────────────────

export async function checkServerHealth(): Promise<boolean> {
  if (!API_BASE) return false;
  try {
    const res = await fetch(`${API_BASE}/api/health`, { signal: AbortSignal.timeout(3000) });
    return res.ok;
  } catch {
    return false;
  }
}

// ─── Network Status ─────────────────────────────────────────────────────

export function getOnlineStatus(): boolean {
  return typeof navigator !== 'undefined' ? navigator.onLine : true;
}
