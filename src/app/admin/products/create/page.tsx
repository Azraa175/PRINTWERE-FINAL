'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Upload } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function CreateProductPage() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        // Simulate API Create
        setTimeout(() => {
            setIsSubmitting(false);
            router.push('/admin/products');
        }, 1500);
    };

    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-8">Tambah Produk Baru</h1>

            <form onSubmit={handleSubmit} className="space-y-8 bg-white p-8 rounded-lg border border-slate-200">
                <Input label="Nama Produk" placeholder="Contoh: Kartu Nama Premium" required />

                <div className="grid grid-cols-2 gap-4">
                    <Input label="Harga" type="number" placeholder="0" required />
                    <Input label="Stok" type="number" placeholder="0" required />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-900 mb-2">Kategori</label>
                    <select className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500">
                        <option>Kartu Nama</option>
                        <option>Brosur</option>
                        <option>Banner</option>
                        <option>Stiker</option>
                        <option>Lainnya</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-900 mb-2">Deskripsi</label>
                    <textarea className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 min-h-[120px]" required />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-900 mb-2">Gambar Produk</label>
                    <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center cursor-pointer hover:bg-slate-50">
                        <Upload className="mx-auto h-8 w-8 text-slate-400 mb-2" />
                        <p className="text-sm text-slate-500">Klik untuk upload gambar</p>
                    </div>
                </div>

                <div className="flex justify-end gap-4 pt-4">
                    <Button type="button" variant="ghost" onClick={() => router.back()}>Batal</Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Menyimpan...' : 'Simpan Produk'}
                    </Button>
                </div>
            </form>
        </div>
    );
}
