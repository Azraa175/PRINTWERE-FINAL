
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useAdminOrders(statusFilter = 'all') {
    const url = statusFilter === 'all'
        ? '/api/admin/orders'
        : `/api/admin/orders?status=${statusFilter}`;

    const { data, error, isLoading, mutate } = useSWR(url, fetcher, {
        refreshInterval: 5000, // Poll every 5 seconds
        revalidateOnFocus: true,
    });

    return {
        orders: data?.data || [],
        isLoading,
        isError: error || (data && !data.success),
        mutate,
    };
}

export function useAdminStats() {
    const { data, error, isLoading, mutate } = useSWR('/api/admin/stats', fetcher, {
        refreshInterval: 10000, // Stats can poll less frequently (10s)
        revalidateOnFocus: true,
    });

    return {
        stats: data?.data || {
            totalOrders: 0,
            pendingOrders: 0,
            waitingVerification: 0,
            inProductionOrders: 0,
            completedOrders: 0,
            paidOrders: 0,
            totalRevenue: 0,
            totalUsers: 0,
            totalStaff: 0
        },
        isLoading,
        isError: error || (data && !data.success),
        mutate,
    };
}
