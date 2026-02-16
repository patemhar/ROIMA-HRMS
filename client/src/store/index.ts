import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import type { RootStore } from "./types";
import { createAuthSlice } from "./slices/authSlice";

export const useStore = create<RootStore>()(
  devtools(
    persist(
      (...args) => ({
        ...createAuthSlice(...args)
      }),
      {
        name: "HRMS",
        partialize: (state) => ({
          auth: {
            token: state.auth.token,
            user: state.auth.user,
            roles: state.auth.role,
            isAuthenticated: state.auth.isAuthenticated,
          }
        }),
        merge: (persistedState, currentState) => {
          const persisted = persistedState as Partial<RootStore> | undefined;

          return {
            ...currentState,
            auth: {
              ...currentState.auth,
              ...(persisted?.auth ?? {}),
            }
          } satisfies RootStore;
        },
      }
    ),
    { name: "HRMS" }
  )
);

export const useAuth = useStore;
