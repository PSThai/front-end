import { createContext, Dispatch, FC, ReactNode, useEffect, useReducer } from 'react';
import { getCookie } from '@/common/utils/cookie';
import { AuthState } from '@/common/types/auth/auth-state.type';
import { initialize, reducer } from './reducers';
import { useSocket } from '@/common/hooks/use-socket';
import { TshusSocket } from '@/common/types/other/socket.type';

export enum AuthActionType {
  INITIALZE = 'INITIALIZE',
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  UPDATE = 'UPDATE'
}

export interface PayloadAction<T> {
  type: AuthActionType;
  payload: T;
}

export interface AuthContextType extends AuthState {
  dispatch: Dispatch<PayloadAction<AuthState>>;
}

const initialState: AuthState = {
  isAuthenticated: false,
  isInitialized: false,
};

export const AuthContext = createContext<AuthContextType>({
  ...initialState,
  dispatch: () => {},
});

interface Props {
  children: ReactNode;
}

const AuthProvider: FC<Props> = ({ children }: Props) => {
  // State
  const [state, dispatch] = useReducer(reducer, initialState);

  // Socket
  const socket: TshusSocket = useSocket();

  // Use Effect
  useEffect(() => {
    (async () => {
      // Get access token from cookie
      const accessToken = getCookie('token');

      // Check access oken
      if (!accessToken) {
        return dispatch(initialize({ isAuthenticated: false }));
      }

      try {
        // User
        const user = getCookie('user');
        dispatch(initialize({ isAuthenticated: true, ...user }));
      } catch (error) {
        dispatch(initialize({ isAuthenticated: false }));
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    (async () => {
      // User
      const user = getCookie('user');

      // Check
      if (socket && user) {
        // Set id to socket
        socket.auth = {
          user: user?._id,
        };
        socket?.connect();
      }

      // Return 
      return () => socket?.disconnect();
    })();
  }, [socket, state]);

  // Shared
  const shared: any = {
    user: {
      get: state,
      set: dispatch,
    },
  };

  // Return
  return <AuthContext.Provider value={shared}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
