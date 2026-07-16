import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

const initialState = {
  accessToken: null,
  refreshToken: null,
  user: null,
  requiresPasswordChange: false,
  isAuthenticated: false,
  resetEmail: null,
  accessLevel: null,
};

const storage =
  typeof window !== 'undefined'
    ? createJSONStorage(() => localStorage)
    : undefined;

export const useAuthStore = create(
  persist(
    (set) => ({
      ...initialState,
      setAuth: (payload) =>
        set(() => {
          const accessToken = payload?.data?.token ?? null;
          const refreshToken = payload?.data?.refreshToken ?? null;
          const user = payload?.data?.user ?? null;

          return {
            accessToken,
            refreshToken,
            user,
            requiresPasswordChange:
              payload?.data?.requiresPasswordChange ?? false,
            isAuthenticated: Boolean(accessToken && user),
          };
        }),
      setAuthFromLogin: (response) => {
        useAuthStore.getState().setAuth(response);
      },
      setAccessToken: (token, refreshToken) =>
        set((state) => ({
          accessToken: token,
          refreshToken: refreshToken,
          isAuthenticated: Boolean(token && state.user),
        })),
      setUser: (user) =>
        set((state) => ({
          user,
          isAuthenticated: Boolean(state.accessToken && user),
        })),
      setResetEmail: (email) =>
        set(() => ({
          resetEmail: email,
        })),
      setAccessLevel: (accessLevel) =>
        set(() => ({
          accessLevel:
            accessLevel && accessLevel?.length > 0 ? accessLevel : null,
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
        refreshToken: state.refreshToken,
        user: state.user,
        requiresPasswordChange: state.requiresPasswordChange,
        isAuthenticated: state.isAuthenticated,
        resetEmail: state.resetEmail,
      }),
    },
  ),
);
