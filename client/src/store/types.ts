export type User = {
            id?: string;
            first_name?: string | null;
            last_name?: string | null;
            email?: string | null;
            phoneNumber?: string | null;
            isActive?: boolean;
            role?: string | null;
        }; ;

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
