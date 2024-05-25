import { useContext } from 'react';
import { TshusContext } from '../context/tshus-context';

// Use Message
export const useOnline: Function = () => useContext<any>(TshusContext)?.online;
