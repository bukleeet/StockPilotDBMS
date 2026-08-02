import { useState, useCallback, useEffect } from 'react';
import type { Role } from './types';

/**
 * Authentication hook for StockPilot.
 * Manages JWT token in sessionStorage (auto-cleared on tab close).
 */

const TOKEN_KEY = 'stockpilot_jwt';
const STORE_KEY = 'stockpilot_store_id';

interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  role: Role;
  storeId: string;
}

function decodeJwtPayload(token: string): { storeId: string; role: string; exp: number } | null {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
}

function getInitialState(): AuthState {
  const token = sessionStorage.getItem(TOKEN_KEY);
  const storeId = sessionStorage.getItem(STORE_KEY) || 'default-store';

  if (token) {
    const payload = decodeJwtPayload(token);
    if (payload && payload.exp * 1000 > Date.now()) {
      return {
        isAuthenticated: true,
        token,
        role: payload.role === 'manager' ? 'manager' : 'staff',
        storeId: payload.storeId || storeId,
      };
    }
    // Token expired — clear it
    sessionStorage.removeItem(TOKEN_KEY);
  }

  return { isAuthenticated: false, token: null, role: 'staff', storeId };
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>(getInitialState);

  // Login with JWT token (manager mode)
  const login = useCallback((token: string, storeId: string) => {
    sessionStorage.setItem(TOKEN_KEY, token);
    sessionStorage.setItem(STORE_KEY, storeId);
    setAuthState({ isAuthenticated: true, token, role: 'manager', storeId });
  }, []);

  // Staff bypass — no JWT, limited access
  const staffBypass = useCallback((storeId = 'default-store') => {
    sessionStorage.setItem(STORE_KEY, storeId);
    sessionStorage.removeItem(TOKEN_KEY);
    setAuthState({ isAuthenticated: true, token: null, role: 'staff', storeId });
  }, []);

  // Logout — clear session
  const logout = useCallback(() => {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(STORE_KEY);
    setAuthState({ isAuthenticated: false, token: null, role: 'staff', storeId: 'default-store' });
  }, []);

  // Check token expiration periodically
  useEffect(() => {
    if (!authState.token) return;

    const checkExpiry = () => {
      const payload = decodeJwtPayload(authState.token!);
      if (!payload || payload.exp * 1000 <= Date.now()) {
        logout();
      }
    };

    const interval = setInterval(checkExpiry, 60_000); // Check every minute
    return () => clearInterval(interval);
  }, [authState.token, logout]);

  return {
    isAuthenticated: authState.isAuthenticated,
    token: authState.token,
    role: authState.role,
    storeId: authState.storeId,
    login,
    staffBypass,
    logout,
  };
}
