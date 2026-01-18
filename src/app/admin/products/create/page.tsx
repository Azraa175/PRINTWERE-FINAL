'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, Loader2, X } from 'lucide-react';
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
        <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-8">Tambah Produk Baru</h1>

            <form onSubmit={handleSubmit} className="space-y-8 bg-white p-8 rounded-lg border border-slate-200">
                <Input
                    label="Nama Produk"
                    placeholder="Contoh: Kartu Nama Premium"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />

                <div className="grid grid-cols-2 gap-4">
                    <Input
                        label="Harga"
                        type="number"
                        placeholder="0"
                        required
                        min="0"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    />
                    <Input
                        label="Stok"
                        type="number"
                        placeholder="0"
                        required
                        min="0"
                        value={formData.stock}
                        onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-900 mb-2">Kategori</label>
                    <select
                        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    >
                        {CATEGORIES.map(cat => <option key={cat}>{cat}</option>)}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-900 mb-2">Ukuran Tersedia</label>
                    <div className="flex flex-wrap gap-2">
                        {SIZES.map(size => (
                            <label key={size} className="flex items-center gap-2 px-3 py-2 border rounded-md cursor-pointer hover:bg-slate-50">
                                <input
                                    type="checkbox"
                                    checked={formData.sizes.includes(size)}
                                    onChange={() => handleCheckboxChange('sizes', size)}
                                />
                                {size}
                            </label>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-900 mb-2">Finishing</label>
                    <div className="flex flex-wrap gap-2">
                        {FINISHING.map(finish => (
                            <label key={finish} className="flex items-center gap-2 px-3 py-2 border rounded-md cursor-pointer hover:bg-slate-50">
                                <input
                                    type="checkbox"
                                    checked={formData.finishing.includes(finish)}
                                    onChange={() => handleCheckboxChange('finishing', finish)}
                                />
                                {finish}
                            </label>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-900 mb-2">Deskripsi</label>
                    <textarea
                        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 min-h-[120px]"
                        required
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-900 mb-2">Gambar Produk</label>
                    <input
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        onChange={handleImageChange}
                        className="hidden"
                    />
                    {imagePreview ? (
                        <div className="relative inline-block">
                            <img src={imagePreview} alt="Preview" className="h-32 w-32 object-cover rounded-lg border" />
                            <button
                                type="button"
                                onClick={() => { setImagePreview(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    ) : (
                        <div
                            className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center cursor-pointer hover:bg-slate-50"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <Upload className="mx-auto h-8 w-8 text-slate-400 mb-2" />
                            <p className="text-sm text-slate-500">Klik untuk upload gambar</p>
                        </div>
                    )}
                </div>

                <label className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        checked={formData.isRecommended}
                        onChange={(e) => setFormData({ ...formData, isRecommended: e.target.checked })}
                    />
                    <span className="text-sm text-slate-700">Tampilkan sebagai Produk Rekomendasi</span>
                </label>

                <div className="flex justify-end gap-4 pt-4">
                    <Button type="button" variant="ghost" onClick={() => router.back()}>Batal</Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Menyimpan...
                            </>
                        ) : 'Simpan Produk'}
                    </Button>
                </div>
            </form>
        </div>
    );
}
