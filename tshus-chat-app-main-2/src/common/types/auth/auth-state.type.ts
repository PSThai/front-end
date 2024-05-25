
export interface AuthState {
  isAuthenticated?: boolean;
  isInitialized?: boolean;
  username?: string;
  password?: string;
  roles?: string[];
  nickname?: string;
  phone?: number;
  avatar?: string;
  created_at?: string;
  updated_at?: string;
}
