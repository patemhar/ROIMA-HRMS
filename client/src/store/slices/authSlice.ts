import type { StateCreator } from "zustand";
import type { AuthSlice, RootStore } from "../types";

const baseState = {
  token: null,
  user: null,
  role: null,
  isAuthenticated: false,
};

export const createAuthSlice: StateCreator<RootStore, [], [], AuthSlice> = (
  set
) => ({
  auth: {
    ...baseState,
    
    setAuth: (token, user, role) => {
      set((state) => ({
        auth: {
          ...state.auth,
          token,
          user,
          role: role ?? user.role ?? null,
          isAuthenticated: true,
        },
      }));
    },

    setToken: (token) => {
      set((state) => ({
        auth: {
          ...state.auth,
          token,
          isAuthenticated: Boolean(token),
        },
      }));
    },

    setUser: (user) => {
      set((state) => ({
        auth: {
          ...state.auth,
          user,
          role: user?.role ?? state.auth.role,
        },
      }));
    },

    setRole: (role) => {
      set((state) => ({
        auth: {
          ...state.auth,
          role,
        },
      }));
    },

    logout: () => {
      set((state) => ({
        auth: {
          ...state.auth,
          ...baseState,
        },
      }));
    },

    reset: () => {
      set((state) => ({
        auth: {
          ...state.auth,
          ...baseState,
        },
      }));
    },
  },
});
