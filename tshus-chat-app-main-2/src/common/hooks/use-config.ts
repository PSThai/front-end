import { TshusContext } from '@/common/context/tshus-context';
import { useContext } from 'react';

// Use Message
export const useConfig: Function = () => useContext<any>(TshusContext)?.config;
