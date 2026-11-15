export type UserRole = 'ADMIN' | 'STAFF' | 'CUSTOMER';

export interface User {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    avatar?: string;
    phone?: string;
    status?: 'ACTIVE' | 'BANNED';
}

export type PriceType = 'UNIT' | 'M2' | 'PACKAGE';

export interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    priceType?: PriceType;
    minArea?: number;
    estDays?: number;
    image: string;
    category: string;
    stock: number;
    rating?: number;
    isRecommended?: boolean;
    isActive?: boolean;
    sizes?: string[];
    finishing?: string[];
}

export interface CartItem {
    id: string;
    productId: string;
    product: Product;
    quantity: number;
    fileUrl?: string;
    width?: number;  // Dimensi meter untuk produk M2
    height?: number; // Dimensi meter untuk produk M2
    options?: {
        size?: string;
        material?: string;
        finishing?: string;
        notes?: string;
        fileName?: string;
        [key: string]: any;
    };
}

export interface Cart {
    items: CartItem[];
    total: number;
}

// Status alur percetakan terpadu (PRD v2 + kompatibilitas legacy)
export type OrderStatus =
    // Siklus resmi percetakan
    | 'MENUNGGU_PEMBAYARAN'
    | 'MENUNGGU_VERIFIKASI'
    | 'PEMBAYARAN_DITOLAK'
    | 'ANTRIAN_PRODUKSI'
    | 'SEDANG_DICETAK'
    | 'FINISHING'
    | 'SIAP_DIAMBIL'
    | 'DIKIRIM'
    | 'SELESAI'
    | 'DIBATALKAN'
    // Status legacy kompatibilitas
    | 'PENDING'
    | 'CONFIRMED'
    | 'PROCESSING'
    | 'READY'
    | 'COMPLETED'
    | 'CANCELLED';

export interface OrderItem {
    id: string;
    product: Product;
    quantity: number;
    price: number;
    width?: number;
    height?: number;
    fileUrl?: string;
    notes?: string;
    options?: any;
}

export interface PaymentRecord {
    id: string;
    orderId: string;
    amount: number;
    method: string;
    proofUrl: string;
    status: 'MENUNGGU' | 'DISETUJUI' | 'DITOLAK';
    rejectReason?: string;
    verifiedAt?: string;
    createdAt: string;
}

export interface OrderStatusLog {
    id: string;
    orderId: string;
    fromStatus: string;
    toStatus: string;
    changedById?: string;
    note?: string;
    createdAt: string;
}

export interface Order {
    id: string;
    orderNo?: string;
    userId: string;
    user?: User;
    items: OrderItem[];
    totalAmount: number;
    status: OrderStatus;
    createdAt: string;
    updatedAt?: string;
    paymentMethod: string;
    paymentProof?: string;
    deliveryType?: 'PICKUP' | 'DELIVERY';
    shippingAddress: string;
    shippingMethod: string;
    shippingCost: number;
    note?: string;
    dueDate?: string;
    assignedStaffId?: string;
    assignedStaff?: User;
    payments?: PaymentRecord[];
    statusLogs?: OrderStatusLog[];
}

export type CreateOrderDTO = Omit<Order, 'id' | 'createdAt' | 'status' | 'userId' | 'items'> & {
    items: {
        productId: string;
        quantity: number;
        price: number;
        width?: number;
        height?: number;
        fileUrl?: string;
        notes?: string;
        options?: any;
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
    inProductionOrders?: number;
    recentOrders: Order[];
}

// Helper untuk label status percetakan dalam Bahasa Indonesia (Ringkas & Jelas)
export const ORDER_STATUS_LABELS: Record<string, { label: string; color: string; badgeVariant: 'warning' | 'info' | 'success' | 'danger' | 'default' }> = {
    MENUNGGU_PEMBAYARAN: { label: 'Belum Bayar', color: 'text-amber-600 bg-amber-50 border-amber-200', badgeVariant: 'warning' },
    MENUNGGU_VERIFIKASI: { label: 'Verifikasi', color: 'text-blue-600 bg-blue-50 border-blue-200', badgeVariant: 'info' },
    PEMBAYARAN_DITOLAK: { label: 'Ditolak', color: 'text-rose-600 bg-rose-50 border-rose-200', badgeVariant: 'danger' },
    ANTRIAN_PRODUKSI: { label: 'Siap Cetak', color: 'text-purple-600 bg-purple-50 border-purple-200', badgeVariant: 'info' },
    SEDANG_DICETAK: { label: 'Dicetak', color: 'text-indigo-600 bg-indigo-50 border-indigo-200', badgeVariant: 'info' },
    FINISHING: { label: 'Finishing', color: 'text-cyan-600 bg-cyan-50 border-cyan-200', badgeVariant: 'info' },
    SIAP_DIAMBIL: { label: 'Siap Diambil', color: 'text-emerald-600 bg-emerald-50 border-emerald-200', badgeVariant: 'success' },
    DIKIRIM: { label: 'Dikirim', color: 'text-sky-600 bg-sky-50 border-sky-200', badgeVariant: 'info' },
    SELESAI: { label: 'Selesai', color: 'text-emerald-700 bg-emerald-100 border-emerald-300', badgeVariant: 'success' },
    DIBATALKAN: { label: 'Batal', color: 'text-gray-600 bg-gray-100 border-gray-300', badgeVariant: 'default' },
    // Mappings for legacy status values
    PENDING: { label: 'Belum Bayar', color: 'text-amber-600 bg-amber-50 border-amber-200', badgeVariant: 'warning' },
    CONFIRMED: { label: 'Siap Cetak', color: 'text-purple-600 bg-purple-50 border-purple-200', badgeVariant: 'info' },
    PROCESSING: { label: 'Diproses', color: 'text-indigo-600 bg-indigo-50 border-indigo-200', badgeVariant: 'info' },
    READY: { label: 'Siap Diambil', color: 'text-emerald-600 bg-emerald-50 border-emerald-200', badgeVariant: 'success' },
    COMPLETED: { label: 'Selesai', color: 'text-emerald-700 bg-emerald-100 border-emerald-300', badgeVariant: 'success' },
    CANCELLED: { label: 'Batal', color: 'text-gray-600 bg-gray-100 border-gray-300', badgeVariant: 'default' },
};
