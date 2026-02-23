export type User = {
            id?: string;
            first_name?: string | undefined;
            last_name?: string | undefined;
            email?: string | undefined;
            phoneNumber?: string | undefined;
            permission?: string[] | undefined;
            isActive?: boolean;
            role?: string | undefined;
        };

export interface AuthState {
  token: string | null;
  user: User | null;
  role: string | null;
  isAuthenticated: boolean;
  setAuth: (
    token: string,
    user: User,
    role?: string
  ) => void;
  setToken: (token: string | null) => void;
  setUser: (user: User | null) => void;
  setRole: (role: string) => void;
  logout: () => void;
  reset: () => void;
}

export interface AuthSlice {
  auth: AuthState;
}


export type RootStore = AuthSlice;
