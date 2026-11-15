'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Upload, Loader2, X, ArrowLeft, Image as ImageIcon, Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { toast } from 'sonner';

const CATEGORIES = ['Kartu Nama', 'Brosur', 'Banner', 'Stiker', 'Kalender', 'Document', 'Lainnya'];
const SIZES = ['A3', 'A4', 'A5', 'A6', 'F4', 'Custom'];
const FINISHING = ['Laminasi Doff', 'Laminasi Glossy', 'UV Spot', 'Emboss', 'Tanpa Finishing'];

export default function CreateProductPage() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState({
        name: '',
        price: '',
        stock: '',
        category: CATEGORIES[0],
        description: '',
        sizes: [] as string[],
        finishing: [] as string[],
        isRecommended: false,
    });

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleCheckboxChange = (field: 'sizes' | 'finishing', value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: prev[field].includes(value)
                ? prev[field].filter(v => v !== value)
                : [...prev[field], value]
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const form = new FormData();
            form.append('name', formData.name);
            form.append('price', formData.price);
            form.append('stock', formData.stock);
            form.append('category', formData.category);
            form.append('description', formData.description);
            form.append('sizes', formData.sizes.join(','));
            form.append('finishing', formData.finishing.join(','));
            form.append('isRecommended', String(formData.isRecommended));

            const imageFile = fileInputRef.current?.files?.[0];
            if (imageFile) {
                form.append('image', imageFile);
            }

            const res = await fetch('/api/admin/products', {
                method: 'POST',
                body: form,
            });

            const data = await res.json();

            if (data.success) {
                toast.success('Produk berhasil ditambahkan');
                router.push('/admin/products');
            } else {
                toast.error(data.error || 'Gagal menambahkan produk');
            }
        } catch (error) {
            toast.error('Gagal menambahkan produk');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            {/* Top Navigation */}
            <div className="flex items-center gap-3">
                <Link href="/admin/products">
                    <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl border border-slate-200 bg-white hover:bg-slate-50">
                        <ArrowLeft className="h-4 w-4 text-slate-600" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">Tambah Produk Baru</h1>
                    <p className="text-xs text-slate-500">Lengkapi formulir di bawah ini untuk menambahkan produk ke etalase</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm">
                <div>
                    <Input
                        label="Nama Produk"
                        placeholder="Contoh: Kartu Nama Premium 260gr"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                        label="Harga (Rp / pcs atau Rp / m²)"
                        type="number"
                        placeholder="Contoh: 25000"
                        required
                        min="0"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    />
                    <Input
                        label="Stok Tersedia"
                        type="number"
                        placeholder="Contoh: 100"
                        required
                        min="0"
                        value={formData.stock}
                        onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    />
                </div>

                <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                        Kategori Produk
                    </label>
                    <select
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800"
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    >
                        {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                </div>

                <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                        Pilihan Ukuran
                    </label>
                    <div className="flex flex-wrap gap-2">
                        {SIZES.map(size => {
                            const isChecked = formData.sizes.includes(size);
                            return (
                                <label 
                                    key={size} 
                                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium cursor-pointer border transition-all ${
                                        isChecked 
                                            ? 'bg-blue-50 text-blue-700 border-blue-300 shadow-xs' 
                                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                                    }`}
                                >
                                    <input
                                        type="checkbox"
                                        checked={isChecked}
                                        onChange={() => handleCheckboxChange('sizes', size)}
                                        className="rounded text-blue-600 focus:ring-blue-500"
                                    />
                                    {size}
                                </label>
                            );
                        })}
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                        Pilihan Finishing
                    </label>
                    <div className="flex flex-wrap gap-2">
                        {FINISHING.map(finish => {
                            const isChecked = formData.finishing.includes(finish);
                            return (
                                <label 
                                    key={finish} 
                                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium cursor-pointer border transition-all ${
                                        isChecked 
                                            ? 'bg-blue-50 text-blue-700 border-blue-300 shadow-xs' 
                                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                                    }`}
                                >
                                    <input
                                        type="checkbox"
                                        checked={isChecked}
                                        onChange={() => handleCheckboxChange('finishing', finish)}
                                        className="rounded text-blue-600 focus:ring-blue-500"
                                    />
                                    {finish}
                                </label>
                            );
                        })}
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                        Deskripsi Lengkap
                    </label>
                    <textarea
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 min-h-[120px] text-slate-800"
                        required
                        placeholder="Tuliskan spesifikasi bahan, ketebalan kertas, dan keterangan penting..."
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                </div>

                <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                        Gambar Produk
                    </label>
                    <input
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        onChange={handleImageChange}
                        className="hidden"
                    />
                    {imagePreview ? (
                        <div className="relative inline-block border border-slate-200 rounded-2xl overflow-hidden p-1 bg-slate-50">
                            <img src={imagePreview} alt="Preview" className="h-40 w-40 object-cover rounded-xl" />
                            <button
                                type="button"
                                onClick={() => { setImagePreview(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                                className="absolute top-3 right-3 bg-red-600 hover:bg-red-700 text-white rounded-full p-1.5 shadow-md transition-colors"
                                title="Hapus gambar"
                            >
                                <X className="h-3.5 w-3.5" />
                            </button>
                        </div>
                    ) : (
                        <div
                            className="border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center cursor-pointer hover:bg-slate-50 hover:border-blue-400 transition-colors"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <Upload className="mx-auto h-8 w-8 text-slate-400 mb-2" />
                            <p className="text-sm font-semibold text-slate-700">Klik untuk upload foto produk</p>
                            <p className="text-xs text-slate-400 mt-1">Format JPG, PNG, atau WebP (Maksimal 5MB)</p>
                        </div>
                    )}
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <label className="flex items-center gap-2.5 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={formData.isRecommended}
                            onChange={(e) => setFormData({ ...formData, isRecommended: e.target.checked })}
                            className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
                        />
                        <span className="text-xs sm:text-sm font-medium text-slate-800">
                            Tampilkan sebagai <strong>Produk Rekomendasi</strong> di halaman utama
                        </span>
                    </label>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                    <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => router.back()}
                        className="rounded-xl text-slate-700 border-slate-200"
                    >
                        Batal
                    </Button>
                    <Button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white gap-2 shadow-xs"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Menyimpan...
                            </>
                        ) : (
                            <>
                                <Check className="h-4 w-4" />
                                Simpan Produk
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
}
