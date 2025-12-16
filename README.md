# PrintWere - Online Printing E-Commerce

Web aplikasi e-commerce untuk percetakan online "PrintWere". Dibangun dengan Next.js App Router, TypeScript, dan Tailwind CSS.

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Icons**: Lucide React
- **Validation**: Zod + React Hook Form

## Fitur Utama

### Customer Side
- **Home Page**: Hero banner dan rekomendasi produk
- **Product Detail**: Upload file cetak, konfigurasi ukuran/bahan
- **Cart & Checkout**: Manajemen keranjang dan checkout dengan validasi
- **Payment**: Dukungan COD dan QRIS Manual (Upload Bukti)
- **Order Tracking**: Pelacakan status pesanan real-time

### Admin Side
- **Dashboard**: Statistik penjualan dan order
- **Product Management**: CRUD produk
- **Order Management**: Update status pesanan (Terima/Tolak/Proses/Selesai)
- **User Management**: Manajemen pengguna

## Cara Menjalankan Project

1. Install dependencies:
   ```bash
   npm install
   ```

2. Jalankan development server:
   ```bash
   npm run dev
   ```

3. Buka browser di [http://localhost:3000](http://localhost:3000)

## Folder Structure

```
src/
├── app/                 # Next.js App Router pages
│   ├── (auth)/         # Auth routes (login/register)
│   ├── admin/          # Admin pages
│   ├── api/            # API routes (if needed)
│   └── ...             # User pages
├── components/         # Reusable UI components
│   ├── layout/         # Header, Footer, Sidebar
│   └── ui/             # Shadcn-like base components
├── lib/                # Utilities
├── services/           # API integration layer
├── store/              # Global state (Zustand)
└── types/              # TypeScript interfaces
```

## Credential Demo

**Admin**
- Email: `admin@printwere.com`
- Password: `admin`

**User**
- Email: `user@printwere.com`
- Password: `user`
