export type UserRole = 'ADMIN' | 'CUSTOMER';

export interface User {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    avatar?: string;
}

export interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    image: string;
    category: string;
    stock: number;
    rating?: number;
    isRecommended?: boolean;
}

export interface CartItem {
    id: string;
    productId: string;
    product: Product;
    quantity: number;
    fileUrl?: string;
    options?: {
        size?: string;
        material?: string;
        notes?: string;
        fileName?: string;
    };
}

export interface Cart {
    items: CartItem[];
    total: number;
}

export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'READY' | 'COMPLETED' | 'CANCELLED';

export interface OrderItem {
    id: string;
    product: Product;
    quantity: number;
    price: number;
    fileUrl?: string;
    options?: any;
}

export interface Order {
    id: string;
    userId: string;
    items: OrderItem[];
    totalAmount: number;
    status: OrderStatus;
    createdAt: string;
    paymentMethod: 'COD' | 'QRIS';
    paymentProof?: string;
    shippingAddress: string;
    shippingMethod: string;
    shippingCost: number;
}

export type CreateOrderDTO = Omit<Order, 'id' | 'createdAt' | 'status' | 'userId' | 'items'> & {
    items: {
        productId: string;
        quantity: number;
        options?: any;
        price: number;
        fileUrl?: string;
    }[];
};

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
}

export interface DashboardStats {
    totalOrders: number;
    totalRevenue: number;
    pendingOrders: number;
    recentOrders: Order[];
}
