import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

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

export const useAuthStore = create(
  persist(
    (set) => ({
      ...initialState,
      setAuth: (payload) =>
        set(() => {
          const accessToken = payload?.data?.token ?? null;
          const user = payload?.data?.user ?? null;

          return {
            accessToken,
            user,
            requiresPasswordChange:
              payload?.data?.requiresPasswordChange ?? false,
            isAuthenticated: Boolean(accessToken && user),
          };
        }),
      setAuthFromLogin: (response) => {
        useAuthStore.getState().setAuth(response);
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
