import { ApiResponse } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

// Simulate network delay for mock data
export const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Generic fetch wrapper
export async function apiRequest<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<ApiResponse<T>> {
    const token = localStorage.getItem('auth-storage')
        ? JSON.parse(localStorage.getItem('auth-storage')!).state.token
        : null;

    const headers = {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
    };

    try {
        // For now, we'll mostly use mock data instead of real fetch
        // const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        //   ...options,
        //   headers,
        // });
        // return await response.json();

        // Mock response placeholder - implementations will be in specific service files
        console.log(`API Request to ${endpoint}`, options);
        return { success: true };
    } catch (error) {
        console.error('API Error:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error occurred',
        };
    }
}
