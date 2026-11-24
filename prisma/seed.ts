import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('--- Mulai Pembaruan Katalog & Akun Resmi PRINTWERE ---');

    // 1. Bersihkan order & data lama agar database bersih
    await prisma.orderStatusLog.deleteMany();
    await prisma.payment.deleteMany();
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.product.deleteMany();
    await prisma.user.deleteMany();

    console.log('Database dibersihkan: data dummy pesanan lama telah dihapus.');

    // 2. Akun Resmi
    const adminPassword = await bcrypt.hash('admin123', 10);
    const staffPassword = await bcrypt.hash('staff123', 10);
    const userPassword = await bcrypt.hash('user123', 10);

    const admin = await prisma.user.create({
        data: {
            name: 'Fajar (Admin Percetakan)',
            email: 'admin@printwere.com',
            passwordHash: adminPassword,
            role: 'ADMIN',
            phone: '085156669696',
            avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
        }
    });

    const staff = await prisma.user.create({
        data: {
            name: 'Budi (Operator Cetak & Finishing)',
            email: 'staff@printwere.com',
            passwordHash: staffPassword,
            role: 'STAFF',
            phone: '085156669696',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80',
        }
    });

    const customer = await prisma.user.create({
        data: {
            name: 'Fajar Pelanggan',
            email: 'user@printwere.com',
            passwordHash: userPassword,
            role: 'CUSTOMER',
            phone: '085156669696',
            avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=256&q=80',
        }
    });

    console.log('Pengguna utama terdaftar: Admin, Staff, Customer.');

    // 3. Produk Percetakan dengan Harga Realistis Pasar Indonesia
    const productsData = [
        {
            name: 'Spanduk / Banner Outdoor Flexi 280gr',
            description: 'Bahan Flexi Standard 280gr ekonomis dan tahan cuaca outdoor. Cocok untuk spanduk toko, warung, baliho promosi, dan acara singkat. Harga dihitung per meter persegi (m² = panjang x lebar).',
            price: 20000,
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
            description: 'Bahan Flexi Korea tebal 440gr serat halus tahan angin dan tidak mudah robek, cetakan tajam tanpa garis. Sangat direkomendasikan untuk backdrop seminar dan neon box outdoor.',
            price: 35000,
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

    for (const p of productsData) {
        await prisma.product.create({ data: p as any });
    }

    console.log(`Berhasil menambahkan ${productsData.length} produk percetakan resmi ke katalog!`);
    console.log('--- Database Bersih Tanpa Pesanan Dummy! Siap untuk Transaksi Riil ---');
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
