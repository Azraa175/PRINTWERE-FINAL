import { ApiResponse, User } from '@/types';
import { delay } from './api';

// Mock Auth Service
export const authService = {
    login: async (email: string, password: string): Promise<ApiResponse<{ user: User; token: string }>> => {
        await delay(1000);
        if (email === 'admin@printwere.com' && password === 'admin') {
            return {
                success: true,
                data: {
                    user: { id: 'admin-1', name: 'Admin User', email, role: 'ADMIN' },
                    token: 'mock-admin-token'
                }
            };
        }
        return {
            success: true,
            data: {
                user: { id: 'user-1', name: 'User Demo', email, role: 'CUSTOMER' },
                token: 'mock-user-token'
            }
        };
    },

    register: async (data: any): Promise<ApiResponse<{ user: User; token: string }>> => {
        await delay(1000);
        return {
            success: true,
            data: {
                user: { id: 'new-user', name: data.name, email: data.email, role: 'CUSTOMER' },
                token: 'mock-new-token'
            }
        };
    }
};
