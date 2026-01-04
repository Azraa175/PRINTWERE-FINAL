import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'PrintWere - Solusi Percetakan Online',
  description: 'Cetak keperluan bisnis dan personal Anda dengan mudah dan cepat.',
};

import { Toaster } from '@/components/ui/Toast';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className={inter.className}>
        <div className="flex min-h-screen flex-col">
          <Header />
          <main className="flex-1 bg-slate-50">{children}</main>
          <Footer />
        </div>
        <Toaster />
      </body>
    </html>
  );
}
