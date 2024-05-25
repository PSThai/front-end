import { useContext } from 'react';
import { CallContext } from '../context/call-context';

// Use Message
export const useCall: Function = () => useContext<any>(CallContext);
