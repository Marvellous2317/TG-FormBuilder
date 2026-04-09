import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { LoginResponse, User } from '../utils/types';

type Company = Record<string, unknown> | null;

type AuthState = {
  accessToken: string | null;
  user: User | null;
  requiresPasswordChange: boolean;
  isAuthenticated: boolean;
  setAuth: (payload: LoginResponse) => void;
  setAuthFromLogin: (response: LoginResponse) => void;
  setAccessToken: (token: string | null) => void;
  setUser: (user: User | null) => void;
  clearAuth: () => void;
};

const initialState = {
  accessToken: null,
  user: null,
  requiresPasswordChange: false,
  isAuthenticated: false,
};

const storage =
  typeof window !== 'undefined'
    ? createJSONStorage(() => localStorage)
    : undefined;

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      ...initialState,
      setAuth: (payload) =>
        set(() => {
          const accessToken = payload.data.token ?? null;
          const user = payload.data.user ?? null;

          return {
            accessToken,
            user,
            requiresPasswordChange:
              payload.data.requiresPasswordChange ?? false,
            isAuthenticated: Boolean(accessToken && user),
          };
        }),
      setAuthFromLogin: (response) => {
        const payload = response;
        useAuthStore.getState().setAuth(payload);
      },
      setAccessToken: (token) =>
        set((state) => ({
          accessToken: token,
          isAuthenticated: Boolean(token && state.user),
        })),
      setUser: (user) =>
        set((state) => ({
          user,
          isAuthenticated: Boolean(state.accessToken && user),
        })),
      clearAuth: () =>
        set(() => ({
          ...initialState,
        })),
    }),
    {
      name: 'auth-storage',
      storage,
      partialize: (state) => ({
        accessToken: state.accessToken,
        user: state.user,
        requiresPasswordChange: state.requiresPasswordChange,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
