import { useContext } from 'react';
import { AuthContext } from '../context/auth/context';

// Use Auth
export const useAuth = () => {
     // Context
     const context = useContext<any>(AuthContext)?.user;

     if(!context) throw new Error('Không tìm thấy dữ liệu lưu trữ');

     // Return
     return context;
};
