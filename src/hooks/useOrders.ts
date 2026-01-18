
import useSWR from 'swr';
import { Order, ApiResponse } from '@/types';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export function useOrders() {
    const { data, error, isLoading, mutate } = useSWR<ApiResponse<Order[]>>(
        '/api/orders',
        fetcher,
        {
            refreshInterval: 5000, // Poll every 5 seconds
            revalidateOnFocus: true,
        }
    );

    return {
        orders: data?.data || [],
        isLoading,
        isError: error,
        mutate,
    };
}

export function useOrder(id: string) {
    const { data, error, isLoading, mutate } = useSWR<ApiResponse<Order>>(
        id ? `/api/orders/${id}` : null,
        fetcher,
        {
            refreshInterval: 5000,
            revalidateOnFocus: true,
        }
    );

    return {
        order: data?.data,
        isLoading,
        isError: error,
        mutate,
    };
}
