import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('--- Mulai Pembaruan Katalog & Harga Pasar PRINTWERE ---');

    // 1. Bersihkan order & data produk lama agar fresh
    await prisma.orderStatusLog.deleteMany();
    await prisma.payment.deleteMany();
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.product.deleteMany();
    await prisma.user.deleteMany();

    console.log('Membersihkan data lama: selesai.');

    // 2. Seeding Pengguna (Admin, Staff, Customer)
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

    console.log('Pengguna terdaftar: Admin, Staff, Customer.');

    // 3. Produk Percetakan dengan Harga Realistis Pasar Indonesia
    const productsData = [
        {
            name: 'Spanduk / Banner Outdoor Flexi 280gr',
            description: 'Bahan Flexi Standard 280gr ekonomis dan tahan cuaca outdoor. Cocok untuk spanduk toko, warung, baliho promosi, dan acara singkat. Harga dihitung per meter persegi (m² = panjang x lebar).',
            price: 20000, // Rp 20.000 / m2
            priceType: 'M2',
            minArea: 1.0,
            estDays: 1,
            category: 'Banner & Spanduk',
            image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=80',
            stock: 9999,
            rating: 4.9,
            isRecommended: true,
            finishing: 'Mata Ayam Tiap Sudut,Lipat Rapi Pinggir,Kolong Bambu/Kayu,Polos Tanpa Finishing',
            sizes: 'Custom (pxl meter)',
        },
        {
            name: 'Spanduk Tebal Flexi Korea 440gr (High-Res)',
            description: 'Bahan Flexi Korea tebal 440gr serat halus tahan angin dan tidak mudah robek, cetakan tajam tajam tanpa garis. Sangat direkomendasikan untuk backdrop seminar dan neon box outdoor.',
            price: 35000, // Rp 35.000 / m2
            priceType: 'M2',
            minArea: 1.0,
            estDays: 1,
            category: 'Banner & Spanduk',
            image: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&w=800&q=80',
            stock: 9999,
            rating: 5.0,
            isRecommended: true,
            finishing: 'Mata Ayam Tiap Sudut,Lipat Pres Lem,Kolong Selongsong Atas Bawah',
            sizes: 'Custom (pxl meter)',
        },
        {
            name: 'Standing X-Banner Fiber (60 x 160 cm)',
            description: 'Satu set lengkap cetakan banner albatros/luster anti lengkung sudah termasuk kerangka stand X fiber fleksibel dan tas sarung. Praktis untuk pameran, toko, dan pintu masuk kantor.',
            price: 65000,
            priceType: 'UNIT',
            estDays: 1,
            category: 'Banner & Spanduk',
            image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=800&q=80',
            stock: 300,
            rating: 4.8,
            isRecommended: true,
            sizes: '60x160 cm',
            finishing: 'Bahan Albatros + Laminasi Doff,Bahan Albatros + Laminasi Glossy',
        },
        {
            name: 'Roll Up Banner Aluminium Kokoh (60 x 160 cm)',
            description: 'Display standing roll up otomatis berbahan aluminium tebal, kokoh, dan elegan. Menggunakan bahan Luster anti gores. Tinggal tarik ke atas saat digunakan.',
            price: 175000,
            priceType: 'UNIT',
            estDays: 1,
            category: 'Banner & Spanduk',
            image: 'https://images.unsplash.com/photo-1542744094-24638eff58bb?auto=format&fit=crop&w=800&q=80',
            stock: 120,
            rating: 4.9,
            isRecommended: true,
            sizes: '60x160 cm,80x200 cm (+Rp 45.000)',
            finishing: 'Bahan Luster Premium + Tas Oxford',
        },
        {
            name: 'Kartu Nama Bisnis Premium (1 Box = 100 Pcs)',
            description: 'Kartu nama bahan Art Carton 260gr tebal, cetak 2 sisi full color sudah termasuk kotak mika bening. Pilihan laminasi doff halus atau glossy mengkilap elegan.',
            price: 35000,
            priceType: 'UNIT',
            estDays: 1,
            category: 'Kartu Nama',
            image: 'https://images.unsplash.com/photo-1589330694653-dad6ef0140be?auto=format&fit=crop&w=800&q=80',
            stock: 800,
            rating: 4.9,
            isRecommended: true,
            sizes: '9x5.5 cm (Standar Box)',
            finishing: 'Laminasi Doff 2 Sisi,Laminasi Glossy 2 Sisi,Sudut Rounded (Melengkung),Tanpa Laminasi',
        },
        {
            name: 'Stiker Vinyl Custom Anti Air (A3+ Kiss-Cut)',
            description: 'Stiker bahan vinyl plastik putih/transparan anti air, tidak mudah sobek, dan lem kuat. Sudah dipotong rapi mengikuti lekuk pola desain (kiss-cut). Tinggal kelupas dan tempel.',
            price: 15000,
            priceType: 'UNIT',
            estDays: 1,
            category: 'Stiker & Label',
            image: 'https://images.unsplash.com/photo-1572375992501-4b0892d50c69?auto=format&fit=crop&w=800&q=80',
            stock: 1500,
            rating: 4.9,
            isRecommended: true,
            sizes: 'A3+ (31x47 cm)',
            finishing: 'Kiss Cut Mengikuti Pola,Die Cut Potong Putus,Laminasi Dingin Doff,Laminasi Glossy',
        },
        {
            name: 'Stiker Kromo Label Kemasan Makanan (A3+ Potong Bulat/Kotak)',
            description: 'Stiker kertas kromo glossy mengkilap ekonomis, solusi praktis untuk label toples kue, botol minuman, kemasan snack, dan segel dus makanan.',
            price: 10000,
            priceType: 'UNIT',
            estDays: 1,
            category: 'Stiker & Label',
            image: 'https://images.unsplash.com/photo-1607083206968-13611e3d76db?auto=format&fit=crop&w=800&q=80',
            stock: 2500,
            rating: 4.7,
            isRecommended: false,
            sizes: 'A3+ (31x47 cm)',
            finishing: 'Potong Pola Lingkaran,Potong Kotak Persegi,Tanpa Potong (Lembaran)',
        },
        {
            name: 'Brosur Promosi A5 Art Paper 150gr (1 Rim = 500 Lembar)',
            description: 'Brosur ukuran A5 cetak full color bolak-balik bahan Art Paper 150gr licin dan elegan. Pilihan tepat untuk sebar brosur promosi properti, kuliner, dan event.',
            price: 195000,
            priceType: 'PACKAGE',
            estDays: 2,
            category: 'Brosur & Flyer',
            image: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&w=800&q=80',
            stock: 100,
            rating: 4.8,
            isRecommended: true,
            sizes: 'A5 (14.8 x 21 cm),A4 (21 x 29.7 cm)',
            finishing: 'Cetak 2 Sisi Bolak-Balik,Cetak 1 Sisi,Lipat 2 (Bifold),Lipat 3 (Trifold)',
        },
        {
            name: 'Poster Dinding Art Carton 260gr (A3+)',
            description: 'Poster promosi dinding, menu kafe, atau dekorasi kamar ukuran jumbo A3+ bahan tebal 260gr dengan warna tajam tidak mudah pudar.',
            price: 8000,
            priceType: 'UNIT',
            estDays: 1,
            category: 'Dokumen',
            image: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80',
            stock: 1200,
            rating: 4.7,
            isRecommended: false,
            sizes: 'A3+ (31 x 47 cm)',
            finishing: 'Laminasi Doff Halus,Laminasi Glossy Mengkilap,Tanpa Laminasi',
        },
        {
            name: 'Mug Keramik Putih Custom Souvenir (Free Box)',
            description: 'Mug keramik SNI putih bersih di-sublimasi warna foto tajam dan awet dicuci berkali-kali. Sudah termasuk kemasan box satuan, cocok untuk hadiah, seminar, atau souvenir kantor.',
            price: 22000,
            priceType: 'UNIT',
            estDays: 1,
            category: 'Merchandise',
            image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80',
            stock: 450,
            rating: 4.9,
            isRecommended: true,
            sizes: 'Standar 11 oz (Tinggi 9.5cm)',
            finishing: 'Sudah Termasuk Box Putih Satuan',
        },
        {
            name: 'Tote Bag Kanvas Blacu Tebal (Sablon Full Color)',
            description: 'Tas jinjing kain kanvas blacu tebal ramah lingkungan ukuran 30x40 cm dengan cetak sablon DTF full color tidak pecah. Pilihan populer untuk goodie bag event & merchandise komunitas.',
            price: 28000,
            priceType: 'UNIT',
            estDays: 2,
            category: 'Merchandise',
            image: 'https://images.unsplash.com/photo-1597484661643-2f5fef640dd1?auto=format&fit=crop&w=800&q=80',
            stock: 350,
            rating: 4.8,
            isRecommended: true,
            sizes: '30x40 cm,35x40 cm dengan Resleting',
            finishing: 'Tanpa Resleting,Dengan Resleting (+Rp 4.000)',
        },
        {
            name: 'Buku Nota / Kwitansi NCR 2 Rangkap (1 Buku = 50 Set)',
            description: 'Nota kontan / surat jalan tembus tanpa karbon (NCR) 2 rangkap (Putih + Merah/Kuning). Sudah termasuk nomorator urut dan porporasi sobekan rapi.',
            price: 12000,
            priceType: 'UNIT',
            estDays: 3,
            category: 'Dokumen',
            image: 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?auto=format&fit=crop&w=800&q=80',
            stock: 500,
            rating: 4.6,
            isRecommended: false,
            sizes: '1/4 Folio (10x16 cm),1/2 Folio (16x21 cm)',
            finishing: 'Porporasi Sobekan + Nomorator Urut',
        }
    ];

    const createdProducts = [];
    for (const p of productsData) {
        const prod = await prisma.product.create({ data: p as any });
        createdProducts.push(prod);
    }

    console.log(`Berhasil menambahkan ${createdProducts.length} produk percetakan ke katalog!`);

    // 4. Seeding Sample Orders
    const pBanner = createdProducts[0];
    const pCard = createdProducts[4];

    const order1 = await prisma.order.create({
        data: {
            orderNo: 'PW-20261115-1001',
            userId: customer.id,
            status: 'ANTRIAN_PRODUKSI',
            paymentMethod: 'TRANSFER',
            deliveryType: 'PICKUP',
            shippingAddress: 'Ambil di Toko / Workshop PrintWere',
            shippingMethod: 'Ambil Sendiri',
            shippingCost: 0,
            totalAmount: 60000,
            note: 'Banner panggung seminar kampus, mohon lubang mata ayam di setiap sudut dan tengah.',
            dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
            assignedStaffId: staff.id,
            items: {
                create: [
                    {
                        productId: pBanner.id,
                        quantity: 1,
                        price: 60000,
                        width: 3.0,
                        height: 1.0, // 3 x 1 = 3 m2 * Rp 20.000 = Rp 60.000
                        fileUrl: 'https://placehold.co/1200x400/png?text=Desain+Banner+Seminar',
                        notes: 'Ukuran 3x1 meter, finishing mata ayam rapi',
                        options: JSON.stringify({ finishing: 'Mata Ayam Tiap Sudut' })
                    }
                ]
            },
            payments: {
                create: {
                    amount: 60000,
                    method: 'TRANSFER',
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
                        note: 'Pelanggan mengunggah bukti transfer'
                    },
                    {
                        fromStatus: 'MENUNGGU_VERIFIKASI',
                        toStatus: 'ANTRIAN_PRODUKSI',
                        changedById: admin.id,
                        note: 'Pembayaran telah diverifikasi oleh Admin. Masuk antrean cetak.'
                    }
                ]
            }
        }
    });

    const order2 = await prisma.order.create({
        data: {
            orderNo: 'PW-20261115-1002',
            userId: customer.id,
            status: 'MENUNGGU_VERIFIKASI',
            paymentMethod: 'QRIS',
            deliveryType: 'DELIVERY',
            shippingAddress: 'Jl. Dago Asri No. 12, Bandung, Jawa Barat (081234567892)',
            shippingMethod: 'Kurir Standar (JNE/J&T)',
            shippingCost: 15000,
            totalAmount: 50000, // 35000 + 15000
            note: 'Tolong laminasi doff-nya halus ya.',
            items: {
                create: [
                    {
                        productId: pCard.id,
                        quantity: 1,
                        price: 35000,
                        fileUrl: 'https://placehold.co/600x400/png?text=Desain+Kartu+Nama+Bisnis',
                        notes: 'Sudut Rounded, Laminasi Doff',
                        options: JSON.stringify({ finishing: 'Laminasi Doff 2 Sisi', corner: 'Rounded' })
                    }
                ]
            },
            payments: {
                create: {
                    amount: 50000,
                    method: 'QRIS',
                    proofUrl: 'https://placehold.co/600x800/png?text=Bukti+QRIS+Berhasil',
                    status: 'MENUNGGU',
                }
            },
            statusLogs: {
                create: [
                    {
                        fromStatus: 'MENUNGGU_PEMBAYARAN',
                        toStatus: 'MENUNGGU_VERIFIKASI',
                        changedById: customer.id,
                        note: 'Pelanggan mengunggah bukti pembayaran QRIS'
                    }
                ]
            }
        }
    });

    console.log(`Sample Orders berhasil dibuat: ${order1.orderNo}, ${order2.orderNo}`);
    console.log('--- Pembaruan Katalog & Harga Pasar Selesai! ---');
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
