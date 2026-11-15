import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('--- Mulai Seeding Database PRINTWERE / MauCetak ---');

    // 1. Bersihkan data sebelumnya secara terurut
    await prisma.orderStatusLog.deleteMany();
    await prisma.payment.deleteMany();
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.product.deleteMany();
    await prisma.user.deleteMany();

    console.log('Membersihkan data lama: selesai.');

    // 2. Seeding Pengguna (3 Role: ADMIN, STAFF / Karyawan, CUSTOMER / Pelanggan)
    const adminPassword = await bcrypt.hash('admin123', 10);
    const staffPassword = await bcrypt.hash('staff123', 10);
    const userPassword = await bcrypt.hash('user123', 10);

    const admin = await prisma.user.create({
        data: {
            name: 'Fajar (Admin Percetakan)',
            email: 'admin@printwere.com',
            passwordHash: adminPassword,
            role: 'ADMIN',
            phone: '081234567890',
            avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
        }
    });

    const staff = await prisma.user.create({
        data: {
            name: 'Budi (Operator Cetak & Finishing)',
            email: 'staff@printwere.com',
            passwordHash: staffPassword,
            role: 'STAFF',
            phone: '081234567891',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80',
        }
    });

    const customer = await prisma.user.create({
        data: {
            name: 'Rian Pelanggan',
            email: 'user@printwere.com',
            passwordHash: userPassword,
            role: 'CUSTOMER',
            phone: '081234567892',
            avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=256&q=80',
        }
    });

    console.log('Seeding Pengguna selesai:');
    console.log(' - Admin:    admin@printwere.com / admin123');
    console.log(' - Karyawan: staff@printwere.com / staff123');
    console.log(' - Customer: user@printwere.com / user123');

    // 3. Seeding Produk Percetakan Nyata (Satuan UNIT & Meter Persegi M2)
    const p1 = await prisma.product.create({
        data: {
            name: 'Spanduk / Banner Flexi Standar',
            description: 'Bahan Flexi 280gr standar, warna tajam tahan cuaca luar ruangan. Hitungan harga per meter persegi (m² = panjang x lebar).',
            price: 25000, // Rp 25.000 / m2
            priceType: 'M2',
            minArea: 1.0,
            estDays: 1,
            category: 'Banner & Spanduk',
            image: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=600&q=80',
            stock: 9999,
            rating: 4.9,
            isRecommended: true,
            finishing: 'Mata Ayam Tiap Sudut,Lipat Rapi,Kolong Bambu/Kayu,Polos Tanpa Finishing',
            sizes: 'Custom (pxl meter)',
        }
    });

    const p2 = await prisma.product.create({
        data: {
            name: 'Kartu Nama Premium (1 Box)',
            description: 'Kartu nama bahan Art Carton 260gr dengan pilihan laminasi doff atau glossy. 1 Box berisi 100 lembar kartu nama standar 9x5.5 cm.',
            price: 45000,
            priceType: 'UNIT',
            estDays: 1,
            category: 'Kartu Nama',
            image: 'https://images.unsplash.com/photo-1589330694653-dad6ef0140be?auto=format&fit=crop&w=600&q=80',
            stock: 500,
            rating: 4.8,
            isRecommended: true,
            sizes: '9x5.5 cm',
            finishing: 'Laminasi Doff,Laminasi Glossy,Tanpa Laminasi,Sudut Bulat (Rounded)',
        }
    });

    const p3 = await prisma.product.create({
        data: {
            name: 'Stiker Vinyl Custom (Per Lembar A3+)',
            description: 'Stiker vinyl anti air dan tidak mudah sobek, sudah termasuk potong kiss-cut sesuai bentuk logo/desain Anda.',
            price: 18000,
            priceType: 'UNIT',
            estDays: 2,
            category: 'Stiker',
            image: 'https://images.unsplash.com/photo-1572375992501-4b0892d50c69?auto=format&fit=crop&w=600&q=80',
            stock: 2000,
            rating: 4.7,
            isRecommended: true,
            sizes: 'A3+ (31x47 cm)',
            finishing: 'Kiss Cut Sesuai Pola,Die Cut Putus,Laminasi Dingin Doff,Laminasi Glossy',
        }
    });

    const p4 = await prisma.product.create({
        data: {
            name: 'Brosur & Flyer Promosi (1 Rim / 500 Lembar)',
            description: 'Cetak brosur ukuran A5 (14.8 x 21 cm) full color bahan Art Paper 150gr mengkilap dan elegan.',
            price: 240000,
            priceType: 'PACKAGE',
            estDays: 2,
            category: 'Marketing',
            image: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&w=600&q=80',
            stock: 100,
            rating: 4.6,
            isRecommended: false,
            sizes: 'A5,A4',
            finishing: 'Cetak 1 Sisi,Cetak 2 Sisi Bolak-balik,Lipat 2,Lipat 3',
        }
    });

    const p5 = await prisma.product.create({
        data: {
            name: 'Roll Up Banner Aluminium (60 x 160 cm)',
            description: 'Display standing banner portabel dengan kerangka aluminium kokoh dan bahan cetak Flexi Korea / Luster anti lengkung.',
            price: 185000,
            priceType: 'UNIT',
            estDays: 1,
            category: 'Display',
            image: 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&w=600&q=80',
            stock: 50,
            rating: 4.9,
            isRecommended: true,
            sizes: '60x160 cm,80x200 cm',
            finishing: 'Kerangka Aluminium + Sarung Kain',
        }
    });

    console.log('Seeding Produk Percetakan selesai (5 produk).');

    // 4. Seeding Sample Orders dengan Berbagai Status Percetakan
    const order1 = await prisma.order.create({
        data: {
            orderNo: 'MC-20261110-0001',
            userId: customer.id,
            status: 'ANTRIAN_PRODUKSI',
            paymentMethod: 'TRANSFER_BCA',
            deliveryType: 'PICKUP',
            shippingAddress: 'Ambil di Toko / Workshop',
            shippingMethod: 'Ambil Sendiri',
            shippingCost: 0,
            totalAmount: 75000,
            note: 'Banner acara seminar kampus, mohon mata ayam di setiap sudut dan tengah.',
            dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Besok
            assignedStaffId: staff.id,
            items: {
                create: [
                    {
                        productId: p1.id,
                        quantity: 1,
                        price: 75000,
                        width: 3.0, // 3 meter
                        height: 1.0, // 1 meter (luas = 3 m2 * 25.000 = 75.000)
                        fileUrl: 'https://placehold.co/1200x400/png?text=Desain+Banner+Seminar',
                        notes: 'Ukuran 3x1 meter, file sudah CMYK',
                        options: JSON.stringify({ finishing: 'Mata Ayam Tiap Sudut' })
                    }
                ]
            },
            payments: {
                create: {
                    amount: 75000,
                    method: 'TRANSFER_BCA',
                    proofUrl: 'https://placehold.co/600x800/png?text=Bukti+Transfer+BCA',
                    status: 'DISETUJUI',
                    verifiedById: admin.id,
                    verifiedAt: new Date(),
                }
            },
            statusLogs: {
                create: [
                    {
                        fromStatus: 'MENUNGGU_PEMBAYARAN',
                        toStatus: 'MENUNGGU_VERIFIKASI',
                        changedById: customer.id,
                        note: 'Pelanggan mengunggah bukti transfer BCA'
                    },
                    {
                        fromStatus: 'MENUNGGU_VERIFIKASI',
                        toStatus: 'ANTRIAN_PRODUKSI',
                        changedById: admin.id,
                        note: 'Pembayaran telah diverifikasi oleh Admin. Pesanan siap dicetak.'
                    }
                ]
            }
        }
    });

    const order2 = await prisma.order.create({
        data: {
            orderNo: 'MC-20261110-0002',
            userId: customer.id,
            status: 'MENUNGGU_VERIFIKASI',
            paymentMethod: 'QRIS',
            deliveryType: 'DELIVERY',
            shippingAddress: 'Jl. Merdeka No. 45, Bandung, Jawa Barat (081234567892)',
            shippingMethod: 'JNE Reguler',
            shippingCost: 15000,
            totalAmount: 60000, // 45000 + 15000
            note: 'Tolong cetak warna emasnya tajam ya.',
            items: {
                create: [
                    {
                        productId: p2.id,
                        quantity: 1,
                        price: 45000,
                        fileUrl: 'https://placehold.co/600x400/png?text=Desain+Kartu+Nama',
                        notes: 'Sudut Rounded, Laminasi Doff',
                        options: JSON.stringify({ finishing: 'Laminasi Doff', corner: 'Rounded' })
                    }
                ]
            },
            payments: {
                create: {
                    amount: 60000,
                    method: 'QRIS',
                    proofUrl: 'https://placehold.co/600x800/png?text=Bukti+Transfer+QRIS',
                    status: 'MENUNGGU',
                }
            },
            statusLogs: {
                create: [
                    {
                        fromStatus: 'MENUNGGU_PEMBAYARAN',
                        toStatus: 'MENUNGGU_VERIFIKASI',
                        changedById: customer.id,
                        note: 'Pelanggan mengunggah bukti QRIS'
                    }
                ]
            }
        }
    });

    console.log(`Seeding Sample Orders selesai (${order1.orderNo}, ${order2.orderNo}).`);
    console.log('--- Seeding Selesai Sukses! ---');
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error('Error saat seeding:', e);
        await prisma.$disconnect();
        process.exit(1);
    });
