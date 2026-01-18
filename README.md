# PrintWere - Online Printing E-Commerce 🖨️

Web aplikasi e-commerce modern untuk percetakan online "PrintWere". Dibangun untuk memudahkan proses pemesanan cetak dengan fitur upload file desain dan pelacakan pesanan real-time.

## ✨ Fitur Utama

- **Real-time Admin Dashboard**: Update statistik dan pesanan secara instan via SWR Polling.
- **Secure Authentication**: Menggunakan NextAuth.js v5 dengan hashing password `bcryptjs`.
- **Customizable Products**: Upload desain, pilih ukuran, dan opsi finishing.
- **Status Tracking**: Pelanggan dapat memantau proses produksi secara real-time.
- **Fail-Safe UI**: Dilengkapi dengan Global Error Boundaries dan Loading states.

## 🚀 Tech Stack

- **Framework**: [Next.js 15+](https://nextjs.org/) (App Router)
- **Database**: [SQLite](https://sqlite.org/) via [Prisma ORM](https://www.prisma.io/)
- **Auth**: [NextAuth.js v5 Beta](https://authjs.dev/)
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs/)
- **Data Fetching**: [SWR](https://swr.vercel.app/)
- **Styling**: Vanilla CSS & Tailwind CSS

## 🛠️ Persiapan & Instalasi

### 1. Prasyarat
Pastikan Anda sudah menginstal:
- [Node.js](https://nodejs.org/) (v18.x atau lebih baru)
- [npm](https://www.npmjs.com/)

### 2. Kloning Repositori
```bash
git clone https://github.com/username/printwere.git
cd printwere
```

### 3. Instalasi Dependencies
```bash
npm install
```

### 4. Konfigurasi Environment
Salin file `.env.example` menjadi `.env` dan isi variabel yang diperlukan:
```bash
cp .env.example .env
```
*Pastikan `AUTH_SECRET` diisi (generate dengan `npx auth secret`).*

### 5. Setup Database (Prisma)
Jalankan langkah-langkah berikut untuk menginisialisasi database:
```bash
# Generate Prisma Client
npx prisma generate

# Sinkronisasi Skema Database
npx prisma db push

# Seed Data Awal (Admin & Produk Demo)
npx prisma db seed
```

## 💻 Menjalankan Aplikasi

Jalankan development server:
```bash
npm run dev
```
Buka [http://localhost:3000](http://localhost:3000) di browser Anda.

## 📊 Kredensial Demo (Setelah Seeding)

| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin** | `admin@printwere.com` | `admin` |
| **Customer** | `user@printwere.com` | `user` |

---
*Dikembangkan dengan ❤️ untuk Project PPL.*
