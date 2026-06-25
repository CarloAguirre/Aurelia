import { create } from 'zustand';
import type { AuthUser } from '../../shared/services/api/auth.api';

interface MobileSessionState {
  accessToken: string | null;
  user: AuthUser | null;
  setMobileSession: (accessToken: string, user: AuthUser) => void;
  clearMobileSession: () => void;
}

export const useMobileSession = create<MobileSessionState>((set) => ({
  accessToken: null,
  user: null,
  setMobileSession: (accessToken, user) => set({ accessToken, user }),
  clearMobileSession: () => set({ accessToken: null, user: null }),
}));
