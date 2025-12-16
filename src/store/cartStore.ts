import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem, Product } from '@/types';

interface CartState {
    items: CartItem[];
    addItem: (product: Product, quantity: number, options?: any) => void;
    removeItem: (itemId: string) => void;
    updateQuantity: (itemId: string, quantity: number) => void;
    clearCart: () => void;
    totalItems: () => number;
    totalPrice: () => number;
}

export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            items: [],
            addItem: (product, quantity, options) => {
                const currentItems = get().items;
                const existingItem = currentItems.find(
                    (item) => item.productId === product.id && JSON.stringify(item.options) === JSON.stringify(options)
                );

                if (existingItem) {
                    set({
                        items: currentItems.map((item) =>
                            item.id === existingItem.id
                                ? { ...item, quantity: item.quantity + quantity }
                                : item
                        ),
                    });
                } else {
                    set({
                        items: [
                            ...currentItems,
                            {
                                id: Math.random().toString(36).substr(2, 9),
                                productId: product.id,
                                product,
                                quantity,
                                options,
                            },
                        ],
                    });
                }
            },
            removeItem: (itemId) => {
                set({
                    items: get().items.filter((item) => item.id !== itemId),
                });
            },
            updateQuantity: (itemId, quantity) => {
                if (quantity <= 0) {
                    get().removeItem(itemId);
                    return;
                }
                set({
                    items: get().items.map((item) =>
                        item.id === itemId ? { ...item, quantity } : item
                    ),
                });
            },
            clearCart: () => set({ items: [] }),
            totalItems: () => get().items.reduce((acc, item) => acc + item.quantity, 0),
            totalPrice: () =>
                get().items.reduce((acc, item) => acc + item.product.price * item.quantity, 0),
        }),
        {
            name: 'cart-storage',
        }
    )
);
