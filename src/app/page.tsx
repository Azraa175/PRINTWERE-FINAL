'use client';

import Link from 'next/link';
import { ArrowRight, CheckCircle, Truck, Clock, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ProductCard } from '@/components/ProductCard';
import { productService } from '@/services/products';
import { useEffect, useState } from 'react';
import { Product } from '@/types';

export default function HomePage() {
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await productService.getReceivedProducts();
        if (response.success && response.data) {
          setRecommendedProducts(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch products', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-slate-900 overflow-hidden py-24 sm:py-32">
        <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
          <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-blue-500 to-cyan-400 opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" />
        </div>

        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
              Solusi Percetakan Online <br /> Cepat & Mudah
            </h1>
            <p className="mt-6 text-lg leading-8 text-slate-300">
              Cetak kebutuhan bisnis, promosi, dan personal Anda dengan kualitas terbaik.
              Tanpa antri, harga transparan, dan hasil memuaskan.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link href="/products">
                <Button size="lg" className="rounded-full px-8 text-base">
                  Pesan Sekarang
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/about" className="text-sm font-semibold leading-6 text-white hover:text-blue-400">
                Pelajari Lebih Lanjut <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>

        <div className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]">
          <div className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-blue-500 to-cyan-400 opacity-20 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]" />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-4 text-center">
            {[
              { icon: Clock, title: 'Cepat & Tepat', desc: 'Pengerjaan sesuai deadline yang disepakati' },
              { icon: CheckCircle, title: 'Kualitas Premium', desc: 'Menggunakan mesin cetak berteknologi tinggi' },
              { icon: Truck, title: 'Pengiriman Aman', desc: 'Packing rapi dan pengiriman ke seluruh Indonesia' },
              { icon: ShieldCheck, title: 'Garansi Hasil', desc: 'Jaminan cetak ulang jika hasil tidak sesuai' },
            ].map((feature, idx) => (
              <div key={idx} className="flex flex-col items-center p-6 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-colors">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600 mb-4">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-slate-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recommended Products */}
      <section className="py-16 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">Produk Pilihan</h2>
            <Link href="/products">
              <Button variant="ghost" className="text-blue-600 hover:text-blue-700">
                Lihat Semua <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-[350px] rounded-lg bg-gray-200 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {recommendedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Siap Mencetak Ide Anda?</h2>
          <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
            Jangan ragu untuk berkonsultasi dengan kami mengenai kebutuhan cetak Anda.
            Tim kami siap membantu memberika solusi terbaik.
          </p>
          <div className="flex justify-center gap-4">
            <Button size="lg" variant="secondary" className="rounded-full">
              Mulai Pesanan
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
