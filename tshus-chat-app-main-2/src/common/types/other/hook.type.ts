import { PayloadAction } from '@/client/context/auth/context';
import { Dispatch, SetStateAction } from 'react';
import { AuthState } from '../auth/auth-state.type';

export interface HookType<T> {
  get: T | undefined | null | any;
  set?: Dispatch<SetStateAction<T>>;
  update?: Function | null;
}

export interface SpecialHookType<T> {
  list: HookType<T>;
  current: HookType<T>;
}

export type AuthHookType<T> = {
  get: T | undefined | null | any;
  set?: Dispatch<PayloadAction<AuthState>>;
}
