# 🖨️ PrintWere — Sistem Manajemen Percetakan Digital

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=for-the-badge&logo=prisma)
![PostgreSQL](https://img.shields.io/badge/Neon-PostgreSQL-4169E1?style=for-the-badge&logo=postgresql)
![Tailwind](https://img.shields.io/badge/Tailwind-CSS-06B6D4?style=for-the-badge&logo=tailwindcss)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript)

**Platform manajemen percetakan all-in-one: pemesanan, produksi, dan pengiriman.**

[Demo →](https://printwere.vercel.app) · [Mobile App →](https://github.com/Azraa175/PRINTWERE-MOBILE)

</div>

---

## 📋 Daftar Isi

- [Fitur](#-fitur)
- [Tech Stack](#-tech-stack)
- [Arsitektur](#-arsitektur)
- [Persiapan](#-persiapan)
- [Instalasi & Setup](#-instalasi--setup)
- [Konfigurasi Environment](#-konfigurasi-environment)
- [Database Setup](#-database-setup)
- [Menjalankan Aplikasi](#-menjalankan-aplikasi)
- [Deploy ke Vercel](#-deploy-ke-vercel)
- [Akun Default](#-akun-default)
- [Struktur Folder](#-struktur-folder)

---

## ✨ Fitur

### 👤 Customer (Pelanggan)
- Registrasi & login akun
- Katalog produk percetakan dengan harga dinamis
- Kalkulasi otomatis harga berdasarkan ukuran (m²) dan jumlah
- Upload multi-file desain (JPG, PNG, PDF) ke cloud storage
- Preview gambar dengan lightbox/zoom
- Keranjang belanja & checkout
- Tracking status pesanan real-time
- Upload bukti pembayaran
- Riwayat pesanan lengkap

### 🛡️ Admin (Pemilik Toko)
- Dashboard ringkasan operasional (grafik, statistik)
- Manajemen produk (CRUD, kategori, ukuran, finishing)
- Manajemen pesanan (verifikasi, konfirmasi, tolak)
- Verifikasi bukti pembayaran
- Manajemen pengguna (ban/unban, role management)
- Responsive mobile layout (card view)

### 🏭 Staff (Operator Produksi)
- Antrean produksi berdasarkan status
- Update status pesanan: Dicetak → Finishing → Siap Diambil
- Download file desain pelanggan
- Filter tab status produksi

### 📱 Mobile App (React Native)
- Aplikasi mobile companion untuk pelanggan
- Semua fitur customer dalam genggaman
- Upload foto desain langsung dari kamera/galeri

---

## 🛠️ Tech Stack

| Layer | Teknologi |
|-------|-----------|
| **Framework** | Next.js 16 (App Router, Turbopack) |
| **Language** | TypeScript |
| **Database** | Neon PostgreSQL (Cloud) |
| **ORM** | Prisma |
| **Auth** | NextAuth v5 (bcrypt) |
| **Storage** | Neon Object Storage (S3-compatible) |
| **Styling** | Tailwind CSS |
| **State** | Zustand + SWR |
| **UI** | Lucide Icons, Sonner Toast |
| **Deploy** | Vercel |

---

## 🏗️ Arsitektur

```
┌─────────────┐    ┌──────────────┐    ┌─────────────────┐
│  Next.js    │───▶│ Neon         │    │ Neon Object     │
│  App Router │    │ PostgreSQL   │    │ Storage (S3)    │
│  (Vercel)   │───▶│ (Database)   │    │ (File Upload)   │
└──────┬──────┘    └──────────────┘    └─────────────────┘
       │                                        ▲
       │            ┌──────────────┐            │
       └───────────▶│ NextAuth v5  │            │
       │            │ (Session)    │            │
       │            └──────────────┘            │
       │                                        │
┌──────▼──────┐                                 │
│  Mobile App │─────────────────────────────────┘
│  (Expo/RN)  │  via API /api/mobile/*
└─────────────┘
```

---

## 📦 Persiapan

Pastikan sudah terinstall:
- **Node.js** ≥ 18.x → [download](https://nodejs.org)
- **npm** ≥ 9.x (bawaan Node.js)
- **Git** → [download](https://git-scm.com)
- Akun **[Neon](https://neon.tech)** (gratis) untuk database PostgreSQL
- Akun **[Vercel](https://vercel.com)** (gratis) untuk deployment

---

## 🚀 Instalasi & Setup

### 1. Clone Repository

```bash
git clone https://github.com/Azraa175/PRINTWERE-FINAL.git
cd PRINTWERE-FINAL
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Salin File Environment

```bash
cp .env.example .env
```

Lalu edit file `.env` sesuai panduan di bawah.

---

## 🔐 Konfigurasi Environment

Buka file `.env` dan isi setiap variable:

### Database (Wajib)

```env
# Dapatkan dari Neon Console → Project → Connection Details
# Gunakan "Pooled connection" untuk DATABASE_URL
DATABASE_URL="postgresql://neondb_owner:AbCdEf@ep-xxx.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"

# Gunakan "Direct connection" (tanpa pooling) untuk migrasi
DATABASE_URL_UNPOOLED="postgresql://neondb_owner:AbCdEf@ep-xxx.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"
```

**Cara mendapatkan:**
1. Buka [console.neon.tech](https://console.neon.tech)
2. Buat project baru (atau pilih yang sudah ada)
3. Klik **Connection Details** di sidebar
4. Copy **Pooled connection string** → paste ke `DATABASE_URL`
5. Copy **Direct connection string** → paste ke `DATABASE_URL_UNPOOLED`

### Authentication (Wajib)

```env
# Generate random secret — jalankan di terminal:
# node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
AUTH_SECRET="paste-hasil-generate-di-sini"

# Set true jika deploy di Vercel/domain custom
AUTH_TRUST_HOST=true
```

### Neon Object Storage / File Upload (Opsional, untuk cloud upload)

```env
# Dapatkan dari Neon Console → Project → Storage
AWS_ACCESS_KEY_ID=nak_live_xxx
AWS_SECRET_ACCESS_KEY=nsk_live_xxx
AWS_ENDPOINT_URL_S3=https://your-branch.storage.region.aws.neon.tech
AWS_REGION=ap-southeast-1
NEON_STORAGE_BUCKET=printwere-uploads
```

**Cara mendapatkan:**
1. Install [Neon CLI](https://neon.tech/docs/reference/cli-install): `npm i -g neonctl`
2. Login: `neon auth`
3. Buat bucket: `neon buckets create printwere-uploads --access-level public_read --project-id <project-id>`
4. Buat credential: `neon credentials create --project-id <project-id> --scope storage:read --scope storage:write`
5. Output berisi `Token ID` (→ `AWS_ACCESS_KEY_ID`) dan `Secret` (→ `AWS_SECRET_ACCESS_KEY`)
6. Untuk endpoint: `neon projects get <project-id>` → lihat bagian storage endpoint

> **Catatan:** Jika variable storage tidak diisi, upload akan menggunakan fallback Base64 Data URL (file tersimpan di database, ukuran terbatas).

### Konfigurasi Lainnya

```env
# URL API (tidak perlu diubah untuk development)
NEXT_PUBLIC_API_URL="http://localhost:3000/api"

# Upload limits
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=image/jpeg,image/png,application/pdf

# Email admin default
ADMIN_EMAIL=admin@printwere.com
```

---

## 🗄️ Database Setup

### 1. Generate Prisma Client

```bash
npx prisma generate
```

### 2. Push Schema ke Database

```bash
npx prisma db push
```

### 3. Seed Data Awal (Produk + Akun Default)

```bash
npx prisma db seed
```

Ini akan membuat 12 produk percetakan dan 3 akun default (lihat [Akun Default](#-akun-default)).

### 4. (Opsional) Buka Prisma Studio

```bash
npx prisma studio
```

Browser akan terbuka di `http://localhost:5555` untuk melihat/edit data.

---

## ▶️ Menjalankan Aplikasi

### Development Mode

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser.

### Production Build

```bash
npm run build
npm start
```

---

## 🌐 Deploy ke Vercel

### 1. Push ke GitHub

```bash
git add -A
git commit -m "Initial deploy"
git push origin main
```

### 2. Import di Vercel

1. Buka [vercel.com/new](https://vercel.com/new)
2. Import repository `PRINTWERE-FINAL`
3. Framework: **Next.js** (auto-detected)

### 3. Tambahkan Environment Variables

Di **Settings → Environment Variables**, tambahkan semua variable dari `.env`:

| Variable | Wajib? | Keterangan |
|----------|--------|------------|
| `DATABASE_URL` | ✅ | Pooled connection string Neon |
| `AUTH_SECRET` | ✅ | Random 32-byte hex string |
| `AUTH_TRUST_HOST` | ✅ | Set `true` |
| `AWS_ACCESS_KEY_ID` | ⭐ | Neon storage token ID |
| `AWS_SECRET_ACCESS_KEY` | ⭐ | Neon storage secret |
| `AWS_ENDPOINT_URL_S3` | ⭐ | Neon storage endpoint |
| `AWS_REGION` | ⭐ | `ap-southeast-1` |
| `NEON_STORAGE_BUCKET` | ⭐ | `printwere-uploads` |

> ⭐ = Opsional, tapi direkomendasikan untuk fitur upload file

**Penting:** Jangan gunakan tanda kutip `"` di value Vercel!

### 4. Deploy

Klik **Deploy** dan tunggu ~2 menit.

---

## 👤 Akun Default

Setelah menjalankan `npx prisma db seed`, tersedia 3 akun:

| Role | Email | Password |
|------|-------|----------|
| **Admin** | `admin@printwere.com` | `admin123` |
| **Staff** | `staff@printwere.com` | `staff123` |
| **Customer** | `user@printwere.com` | `user123` |

---

## 📁 Struktur Folder

```
PRINTWERE-FINAL/
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── seed.ts                # Seed data (produk + akun)
├── src/
│   ├── app/
│   │   ├── (auth)/            # Login, Register pages
│   │   ├── admin/             # Admin panel (dashboard, orders, products, users)
│   │   ├── staff/             # Staff production queue
│   │   ├── orders/            # Customer order tracking
│   │   ├── products/          # Product catalog & detail
│   │   ├── profile/           # User profile
│   │   ├── cart/              # Shopping cart
│   │   ├── checkout/          # Checkout flow
│   │   └── api/               # API routes
│   │       ├── auth/          # NextAuth endpoints
│   │       ├── admin/         # Admin API (products, orders, users)
│   │       ├── mobile/        # Mobile app API endpoints
│   │       ├── upload/        # File upload (multi-file, S3)
│   │       └── user/          # Customer API (orders, profile)
│   ├── components/
│   │   ├── layout/            # Header, Footer, AdminSidebar
│   │   ├── ui/                # Reusable UI (Button, Card, Badge, Input)
│   │   ├── DesignFilePreview  # Image preview + lightbox
│   │   └── OrderStatusStepper # Order tracking stepper
│   ├── hooks/                 # Custom hooks (useAdminOrders, etc.)
│   ├── lib/                   # Utilities (prisma, auth, storage, utils)
│   ├── store/                 # Zustand stores
│   └── types/                 # TypeScript types
├── .env.example               # Template environment variables
├── next.config.ts             # Next.js configuration
├── tailwind.config.ts         # Tailwind CSS configuration
└── package.json
```

---

## 📱 Mobile App

Aplikasi mobile companion tersedia di repository terpisah:

👉 **[PRINTWERE-MOBILE](https://github.com/Azraa175/PRINTWERE-MOBILE)**

---

## 📄 Lisensi

Project ini dibuat untuk keperluan tugas akhir / skripsi.

---

<div align="center">

**Dibuat oleh [Azraa175](https://github.com/Azraa175)**

</div>
