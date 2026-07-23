import { create } from 'zustand';
import type { AuthUser } from '../../shared/services/api/auth.api';
import { localStorageDriver } from '../../shared/storage/local-storage';

const MOBILE_SESSION_KEY = 'mobile_session:v1';

interface PersistedMobileSession {
  accessToken: string;
  user: AuthUser;
}

interface MobileSessionState {
  accessToken: string | null;
  user: AuthUser | null;
  hydrated: boolean;
  setMobileSession: (accessToken: string, user: AuthUser) => void;
  clearMobileSession: () => void;
  hydrateMobileSession: () => Promise<void>;
}

export const useMobileSession = create<MobileSessionState>((set) => ({
  accessToken: null,
  user: null,
  hydrated: false,
  setMobileSession: (accessToken, user) => {
    void localStorageDriver.set<PersistedMobileSession>(MOBILE_SESSION_KEY, {
      accessToken,
      user,
    });
    set({ accessToken, user, hydrated: true });
  },
  clearMobileSession: () => {
    void localStorageDriver.remove(MOBILE_SESSION_KEY);
    set({ accessToken: null, user: null, hydrated: true });
  },
  hydrateMobileSession: async () => {
    const session = await localStorageDriver.get<PersistedMobileSession>(MOBILE_SESSION_KEY);
    set({
      accessToken: session?.accessToken ?? null,
      user: session?.user ?? null,
      hydrated: true,
    });
  },
}));
