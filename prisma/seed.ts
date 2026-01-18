
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    // Clear existing data
    await prisma.orderItem.deleteMany()
    await prisma.order.deleteMany()
    await prisma.product.deleteMany()
    await prisma.user.deleteMany()

    const products = [
        {
            name: 'Kartu Nama Premium',
            description: 'Kartu nama berkualitas tinggi dengan bahan art paper 260gr, finishing laminasi doff/glossy. Cocok untuk profesional.',
            price: 45000,
            image: 'https://placehold.co/600x400/png?text=Kartu+Nama',
            category: 'Kartu Nama',
            stock: 100,
            rating: 4.8,
            isRecommended: true,
            sizes: '10x5cm,Custom'
        },
        {
            name: 'Brosur',
            description: 'Cetak brosur ukuran A5 1 sisi atau 2 sisi. Bahan Art Paper 150gr. Warna tajam dan jelas.',
            price: 250000,
            image: 'https://placehold.co/600x400/png?text=Brosur',
            category: 'Marketing',
            stock: 50,
            rating: 4.5,
            isRecommended: true,
            sizes: 'A5'
        },
        {
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
            name: 'Kalender Meja 2025',
            description: 'Kalender meja spiral dengan dudukan hard carton. Isi 7 lembar (bolak-balik).',
            price: 35000,
            image: 'https://placehold.co/600x400/png?text=Kalender',
            category: 'Kalender',
            stock: 75,
            rating: 4.9,
            sizes: 'A5,A6,Custom'
        },
        {
            name: 'Print on Paper',
            description: 'Jasa print dokumen berkualitas pada berbagai ukuran kertas.',
            price: 500,
            image: 'https://placehold.co/600x400/png?text=Print+on+Paper',
            category: 'Document',
            stock: 9999,
            rating: 5.0,
            sizes: 'A3,A4,F4,Quarto,Custom'
        }
    ]

    console.log('Start seeding products...')
    for (const p of products) {
        await prisma.product.create({ data: p })
    }

    // For seeding, we'll hash them manually or use a hardcoded hash for simplicity in PoC
    // 'admin' -> $2a$10$8.N0Yk6K7Ww7Ww7Ww7Ww7uWw7Ww7Ww7Ww7Ww7Ww7Ww7Ww7Ww7Ww7W
    // Actually better to use real hash
    const adminHash = '$2a$10$W6v9VvE9VvE9VvE9VvE9VuWw7Ww7Ww7Ww7Ww7Ww7Ww7Ww7Ww7Ww7W'
    // Wait, I'll just hardcode a known hash or if I can't, I'll use a simple one and update it in the script

    console.log('Start seeding users...')
    await prisma.user.create({
        data: {
            name: 'PPL Admin',
            email: 'admin@printwere.com',
            passwordHash: await require('bcryptjs').hash('admin', 10),
            role: 'ADMIN',
            avatar: 'https://placehold.co/400x400/000000/FFF?text=A'
        }
    })

    await prisma.user.create({
        data: {
            name: 'PPL User',
            email: 'user@printwere.com',
            passwordHash: await require('bcryptjs').hash('user', 10),
            role: 'CUSTOMER',
            avatar: 'https://placehold.co/400x400/4F46E5/FFF?text=U'
        }
    })

    console.log('Seeding finished.')
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
