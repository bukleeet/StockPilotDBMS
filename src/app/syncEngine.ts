/**
 * Sync Engine — API client for StockPilot cloud sync.
 * Communicates with the Express backend for auth and data synchronization.
 */

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// ─── Auth API ───────────────────────────────────────────────────────────

export interface AuthResponse {
  token: string;
  role: 'manager';
  storeId: string;
}

export async function verifyPin(storeId: string, pin: string): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/api/auth/verify-pin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ storeId, pin }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({ error: 'Network error' }));
    throw new Error(data.error || `Authentication failed (${res.status})`);
  }

  return res.json();
}

export async function changePin(
  token: string,
  storeId: string,
  oldPin: string,
  newPin: string
): Promise<{ message: string }> {
  const res = await fetch(`${API_BASE}/api/auth/change-pin`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ storeId, oldPin, newPin }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({ error: 'Network error' }));
    throw new Error(data.error || `Failed to change PIN (${res.status})`);
  }

  return res.json();
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
