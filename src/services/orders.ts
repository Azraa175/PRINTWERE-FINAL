import { ApiResponse, Order, OrderStatus } from '@/types';
import { delay } from './api';
import { MOCK_PRODUCTS } from './products';

// Mock Data
const MOCK_ORDERS: Order[] = [
    {
        id: 'ORD-20231215-001',
        userId: 'user-1',
        items: [
            {
                id: 'item-1',
                product: MOCK_PRODUCTS[0],
                quantity: 2,
                price: 45000,
                options: { material: 'Art Paper 260gr', notes: 'Laminasi Doff' }
            }
        ],
        totalAmount: 90000,
        status: 'COMPLETED',
        createdAt: '2023-12-15T10:00:00Z',
        paymentMethod: 'QRIS',
        shippingAddress: 'Jl. Sudirman No. 123, Jakarta Selatan',
        shippingMethod: 'GOSEND',
        shippingCost: 25000
    },
    {
        id: 'ORD-20231216-002',
        userId: 'user-2',
        items: [
            {
                id: 'item-3',
                product: MOCK_PRODUCTS[2],
                quantity: 1,
                price: 75000,
                options: {
                    size: 'A3',
                    notes: 'Glossy paper'
                }
            }
        ],
        totalAmount: 87000, // 75000 + 12000 shipping
        status: 'PROCESSING',
        createdAt: '2023-12-16T09:30:00Z',
        paymentMethod: 'COD',
        shippingAddress: 'Jl. Ahmad Yani No. 45, Bandung',
        shippingMethod: 'JNE',
        shippingCost: 12000
    }
];

export const orderService = {
    getMyOrders: async (): Promise<ApiResponse<Order[]>> => {
        await delay(1000);
        return { success: true, data: MOCK_ORDERS };
    },

    getOrderById: async (id: string): Promise<ApiResponse<Order>> => {
        await delay(1000);
        const order = MOCK_ORDERS.find(o => o.id === id);
        if (!order) return { success: false, error: 'Order not found' };
        return { success: true, data: order };
    },

    createOrder: async (orderData: Partial<Order>): Promise<ApiResponse<Order>> => {
        await delay(1500);
        const newOrder: Order = {
            id: `ORD-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(Math.random() * 1000)}`,
            userId: 'user-1', // Mock user
            items: orderData.items || [],
            totalAmount: orderData.totalAmount || 0,
            status: 'PENDING',
            createdAt: new Date().toISOString(),
            paymentMethod: orderData.paymentMethod,
            shippingAddress: orderData.shippingAddress,
            shippingMethod: orderData.shippingMethod,
            shippingCost: orderData.shippingCost,
            ...orderData
        } as Order;

        return { success: true, data: newOrder };
    }
};
