import { ApiResponse, Product } from '@/types';
import { delay } from './api';

// Mock Data
export const MOCK_PRODUCTS: Product[] = [
    {
        id: '1',
        name: 'Kartu Nama Premium',
        description: 'Kartu nama berkualitas tinggi dengan bahan art paper 260gr, finishing laminasi doff/glossy. Cocok untuk profesional.',
        price: 45000,
        image: 'https://placehold.co/600x400/png?text=Kartu+Nama',
        category: 'Kartu Nama',
        stock: 100,
        rating: 4.8,
        isRecommended: true,
        sizes: ['10x5cm', 'Custom']
    },
    {
        id: '2',
        name: 'Brosur',
        description: 'Cetak brosur ukuran A5 1 sisi atau 2 sisi. Bahan Art Paper 150gr. Warna tajam dan jelas.',
        price: 250000,
        image: 'https://placehold.co/600x400/png?text=Brosur',
        category: 'Marketing',
        stock: 50,
        rating: 4.5,
        isRecommended: true,
        sizes: ['A5']
    },
    {
        id: '4',
        name: 'Stiker Vinyl Custom',
        description: 'Stiker vinyl anti air dengan potongan kiss-cut sesuai pola. Minimum order 5 lembar A3.',
        price: 15000,
        image: 'https://placehold.co/600x400/png?text=Stiker',
        category: 'Stiker',
        stock: 1000,
        rating: 4.6,
        isRecommended: true
    },
    {
        id: '5',
        name: 'Kalender Meja 2025',
        description: 'Kalender meja spiral dengan dudukan hard carton. Isi 7 lembar (bolak-balik).',
        price: 35000,
        image: 'https://placehold.co/600x400/png?text=Kalender',
        category: 'Kalender',
        stock: 75,
        rating: 4.9,
        sizes: ['A5', 'A6', 'Custom']
    },
    {
        id: '6',
        name: 'Print on Paper',
        description: 'Jasa print dokumen berkualitas pada berbagai ukuran kertas.',
        price: 500,
        image: 'https://placehold.co/600x400/png?text=Print+on+Paper',
        category: 'Document',
        stock: 9999,
        rating: 5.0,
        sizes: ['A3', 'A4', 'F4', 'Quarto', 'Custom']
    }
];

export const productService = {
    getReceivedProducts: async (): Promise<ApiResponse<Product[]>> => {
        await delay(800);
        return {
            success: true,
            data: MOCK_PRODUCTS.filter(p => p.isRecommended)
        };
    },

    getAllProducts: async (): Promise<ApiResponse<Product[]>> => {
        await delay(500);
        return {
            success: true,
            data: MOCK_PRODUCTS
        };
    },

    getProductById: async (id: string): Promise<ApiResponse<Product>> => {
        await delay(600);
        const product = MOCK_PRODUCTS.find(p => p.id === id);
        if (!product) {
            return { success: false, error: 'Product not found' };
        }
        return { success: true, data: product };
    }
};
