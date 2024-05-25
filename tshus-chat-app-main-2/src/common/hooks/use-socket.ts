import { useContext } from 'react';
import { TshusContext } from '../context/tshus-context';

// Use Auth
export const useSocket = () => useContext<any>(TshusContext)?.socket.get;
