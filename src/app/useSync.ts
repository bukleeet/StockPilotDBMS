import { useState, useEffect, useRef, useCallback } from 'react';
import { pullFromCloud, pushToCloud, checkServerHealth, getOnlineStatus } from './syncEngine';
import type { CloudStoreData } from './syncEngine';
import type { InvItem, SaleRec, WasteRec, SupplyReq } from './types';
import type { SyncStatus } from './types';

/**
 * Hybrid sync hook — coordinates IndexedDB ↔ MongoDB Atlas.
 * - On mount (if online & authenticated): pulls cloud data
 * - On data mutations (if online & manager): debounced push
 * - On reconnection: full sync cycle
 */

interface UseSyncOptions {
  token: string | null;
  storeId: string;
  isAuthenticated: boolean;
  role: string;
  inv: InvItem[];
  sales: SaleRec[];
  waste: WasteRec[];
  supplyRequests: SupplyReq[];
  settings: { blockStockout: boolean; dateOverride: string | null };
  onCloudData?: (data: CloudStoreData) => void;
}

export function useSync({
  token,
  storeId,
  isAuthenticated,
  role,
  inv,
  sales,
  waste,
  supplyRequests,
  settings,
  onCloudData,
}: UseSyncOptions) {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('offline');
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);
  const [serverAvailable, setServerAvailable] = useState(false);
  const pushTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasPulledRef = useRef(false);
  const isInitialMountRef = useRef(true);

  // Check server health on mount
  useEffect(() => {
    if (!isAuthenticated) return;

    const check = async () => {
      const online = getOnlineStatus();
      if (!online) {
        setSyncStatus('offline');
        setServerAvailable(false);
        return;
      }

      const healthy = await checkServerHealth();
      setServerAvailable(healthy);
      setSyncStatus(healthy ? 'synced' : 'offline');
    };

    check();
  }, [isAuthenticated]);

  // Pull cloud data on mount (once)
  useEffect(() => {
    if (!isAuthenticated || !serverAvailable || hasPulledRef.current) return;

    const doPull = async () => {
      try {
        setSyncStatus('syncing');
        const cloudData = await pullFromCloud(storeId);

        // Only apply cloud data if it has content (non-empty arrays)
        const hasCloudData =
          cloudData.inventory.length > 0 ||
          cloudData.sales.length > 0 ||
          cloudData.waste.length > 0;

        if (hasCloudData && onCloudData) {
          onCloudData(cloudData);
        }

        setLastSyncedAt(cloudData.lastSyncedAt);
        setSyncStatus('synced');
        hasPulledRef.current = true;
      } catch (err) {
        console.warn('[Sync] Pull failed:', err);
        setSyncStatus('error');
      }
    };

    doPull();
  }, [isAuthenticated, serverAvailable, storeId, onCloudData]);

  // Debounced push on data changes (manager only, after initial pull)
  useEffect(() => {
    if (isInitialMountRef.current) {
      isInitialMountRef.current = false;
      return;
    }

    if (!isAuthenticated || !token || role !== 'manager' || !serverAvailable) return;
    if (!hasPulledRef.current) return; // Don't push before pulling

    if (pushTimerRef.current) clearTimeout(pushTimerRef.current);

    pushTimerRef.current = setTimeout(async () => {
      try {
        setSyncStatus('syncing');
        const result = await pushToCloud(token, {
          storeId,
          inventory: inv,
          sales,
          waste,
          supplyRequests,
          settings,
        });
        setLastSyncedAt(result.lastSyncedAt);
        setSyncStatus('synced');
      } catch (err) {
        console.warn('[Sync] Push failed:', err);
        setSyncStatus('error');
      }
    }, 1500); // 1.5s debounce

    return () => {
      if (pushTimerRef.current) clearTimeout(pushTimerRef.current);
    };
  }, [inv, sales, waste, supplyRequests, settings, isAuthenticated, token, role, serverAvailable, storeId]);

  // Listen for online/offline events
  useEffect(() => {
    const handleOnline = async () => {
      const healthy = await checkServerHealth();
      setServerAvailable(healthy);
      if (healthy) {
        setSyncStatus('synced');
        // Trigger a full sync on reconnection
        if (token && role === 'manager') {
          try {
            setSyncStatus('syncing');
            await pushToCloud(token, {
              storeId,
              inventory: inv,
              sales,
              waste,
              supplyRequests,
              settings,
            });
            setSyncStatus('synced');
          } catch {
            setSyncStatus('error');
          }
        }
      }
    };

    const handleOffline = () => {
      setServerAvailable(false);
      setSyncStatus('offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [token, role, storeId, inv, sales, waste, supplyRequests, settings]);

  // Manual trigger
  const triggerSync = useCallback(async () => {
    if (!serverAvailable || !token) return;

    try {
      setSyncStatus('syncing');
      const cloudData = await pullFromCloud(storeId);
      if (onCloudData) onCloudData(cloudData);

      await pushToCloud(token, {
        storeId,
        inventory: inv,
        sales,
        waste,
        supplyRequests,
        settings,
      });

      setSyncStatus('synced');
    } catch {
      setSyncStatus('error');
    }
  }, [serverAvailable, token, storeId, inv, sales, waste, supplyRequests, settings, onCloudData]);

  return {
    syncStatus,
    lastSyncedAt,
    serverAvailable,
    triggerSync,
  };
}
