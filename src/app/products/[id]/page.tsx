'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { 
    Star, 
    Upload, 
    FileText, 
    Loader2, 
    X, 
    CheckCircle, 
    ArrowLeft, 
    ShoppingCart, 
    Calculator,
    Clock,
    ShieldCheck,
    HelpCircle
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useCartStore } from '@/store/cartStore';
import { toast } from 'sonner';
import { Product } from '@/types';
import { formatCurrency, cn } from '@/lib/utils';
import { DesignFilePreview } from '@/components/DesignFilePreview';

export default function ProductDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const [product, setProduct] = useState<Product | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    
    // M2 Dimensions (for banner / spanduk)
    const [width, setWidth] = useState<number>(2.0);  // meter
    const [height, setHeight] = useState<number>(1.0); // meter

    const [fileUrl, setFileUrl] = useState<string | null>(null);
    const [uploadedFiles, setUploadedFiles] = useState<Array<{ url: string; name: string; size: number }>>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [options, setOptions] = useState({
        size: 'A4',
        material: 'Standard',
        notes: ''
    });
    const addItem = useCartStore((state) => state.addItem);

    useEffect(() => {
        if (!id) return;
        const fetchProduct = async () => {
            try {
                const res = await fetch(`/api/products/${id}`, { cache: 'no-store' });
                const data = await res.json();
                if (data.success && data.data) {
                    const productData = data.data;
                    setProduct(productData);
                    if (productData.sizes && productData.sizes.length > 0) {
                        setOptions(prev => ({ ...prev, size: productData.sizes![0] }));
                    }
                }
            } catch (error) {
                console.error('Failed to fetch product', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchProduct();
    }, [id]);

    const isM2 = product?.priceType === 'M2';

    // Calculate effective area in m2
    const rawArea = width * height;
    const minArea = product?.minArea || 1.0;
    const effectiveArea = Math.max(minArea, rawArea);

    // Calculate unit price based on priceType
    const unitPrice = isM2 
        ? Math.round((product?.price || 0) * effectiveArea)
        : (product?.price || 0);

    const totalPrice = unitPrice * quantity;

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawFiles = Array.from(e.target.files || []);
        if (rawFiles.length === 0) return;

        // Validate file size (15MB per file)
        for (const f of rawFiles) {
            if (f.size > 15 * 1024 * 1024) {
                toast.error(`Berkas "${f.name}" terlalu besar. Maksimal 15MB per file.`);
                return;
            }
        }

        setIsUploading(true);

        try {
            const formData = new FormData();
            rawFiles.forEach((f) => formData.append('files', f));

            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });

            const data = await res.json();

            if (data.success) {
                const incomingFiles: Array<{ url: string; name: string; size: number }> = 
                    (data.files || data.data?.files || []).map((f: any) => ({
                        url: f.url,
                        name: f.filename || f.name,
                        size: f.size
                    }));

                const finalFiles = incomingFiles.length > 0 ? incomingFiles : [
                    { url: data.fileUrl || data.url, name: rawFiles[0].name, size: rawFiles[0].size }
                ];

                const updated = [...uploadedFiles, ...finalFiles];
                setUploadedFiles(updated);
                setFileUrl(updated.map(f => f.url).join(','));
                toast.success(`${finalFiles.length} berkas desain berhasil diunggah!`);
            } else {
                toast.error(data.error || 'Gagal mengunggah berkas');
            }
        } catch (error) {
            toast.error('Gagal mengunggah berkas');
        } finally {
            setIsUploading(false);
            e.target.value = '';
        }
    };

    const handleRemoveFile = (index: number) => {
        const updated = uploadedFiles.filter((_, i) => i !== index);
        setUploadedFiles(updated);
        setFileUrl(updated.length > 0 ? updated.map(f => f.url).join(',') : null);
        toast.info('Berkas dihapus');
    };

    const handleAddToCart = () => {
        if (!product) return;

        addItem(
            {
                ...product,
                price: unitPrice // Use calculated unit price
            },
            quantity,
            {
                ...options,
                fileName: uploadedFiles.map(f => f.name).join(', '),
                fileUrl: fileUrl,
                files: uploadedFiles,
                width: isM2 ? width : undefined,
                height: isM2 ? height : undefined,
                area: isM2 ? effectiveArea : undefined,
            }
        );
        toast.success('Produk berhasil ditambahkan ke keranjang!');
        router.push('/cart');
    };

    if (isLoading) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-slate-400">
                <Loader2 className="h-10 w-10 animate-spin text-blue-600 mb-2" />
                <p className="text-xs">Memuat detail produk...</p>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="container mx-auto px-4 py-20 text-center">
                <p className="text-lg font-bold text-slate-700">Produk tidak ditemukan</p>
                <Link href="/products" className="mt-4 inline-block text-blue-600 hover:underline text-sm font-semibold">
                    ← Kembali ke Katalog
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50/50 py-8">
            <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
                {/* Breadcrumbs */}
                <div className="flex items-center gap-2 text-xs text-slate-500 mb-6">
                    <Link href="/" className="hover:text-blue-600">Beranda</Link>
                    <span>/</span>
                    <Link href="/products" className="hover:text-blue-600">Produk</Link>
                    <span>/</span>
                    <span className="text-slate-900 font-semibold truncate max-w-[200px]">{product.name}</span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                    {/* Left: Product Image */}
                    <div className="space-y-4">
                        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-white border border-slate-200 shadow-sm">
                            <Image
                                src={product.image}
                                alt={product.name}
                                fill
                                className="object-cover"
                                priority
                            />
                            {isM2 && (
                                <div className="absolute top-4 left-4 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                                    Hitung Per Meter (m²)
                                </div>
                            )}
                        </div>

                        {/* Assurance Badges */}
                        <div className="grid grid-cols-2 gap-3 pt-2">
                            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-700">
                                <Clock className="h-4 w-4 text-blue-600 shrink-0" />
                                <span>Estimasi {product.estDays || 1} Hari Kerja</span>
                            </div>
                            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-700">
                                <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                                <span>Garansi Cetak Ulang</span>
                            </div>
                        </div>
                    </div>

                    {/* Right: Product Details & Configurator */}
                    <div className="space-y-6">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                                    {product.category}
                                </span>
                                {product.isRecommended && (
                                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                                        Rekomendasi
                                    </span>
                                )}
                            </div>

                            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
                                {product.name}
                            </h1>

                            <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
                                <div className="flex items-center text-amber-500">
                                    <Star className="h-4 w-4 fill-current" />
                                    <span className="ml-1 font-bold text-slate-800">{product.rating || '4.9'}</span>
                                </div>
                                <span>•</span>
                                <span>Terjual 1.2k+</span>
                                <span>•</span>
                                <span className="text-emerald-600 font-semibold">Tersedia</span>
                            </div>

                            {/* Price display */}
                            <div className="mt-4 p-4 rounded-xl bg-blue-50/60 border border-blue-100 flex items-baseline gap-2">
                                <span className="text-2xl sm:text-3xl font-black text-blue-600">
                                    {formatCurrency(unitPrice)}
                                </span>
                                {isM2 && (
                                    <span className="text-xs text-slate-500">
                                        (Ukuran: {width}m × {height}m = {effectiveArea.toFixed(2)} m²)
                                    </span>
                                )}
                            </div>
                        </div>

                        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                            {product.description}
                        </p>

                        <div className="space-y-5 border-t border-slate-200 pt-5">
                            {/* If M2 product: Width and Height Inputs */}
                            {isM2 && (
                                <div className="p-4 rounded-xl bg-slate-100/70 border border-slate-200 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                                            <Calculator className="h-4 w-4 text-blue-600" />
                                            Ukuran Cetak Spanduk / Banner (Meter)
                                        </label>
                                        <span className="text-[11px] text-slate-500">Min. {minArea} m²</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <span className="text-[11px] text-slate-500 font-medium mb-1 block">Panjang (m)</span>
                                            <input
                                                type="number"
                                                min="0.5"
                                                step="0.1"
                                                value={width}
                                                onChange={(e) => setWidth(Math.max(0.1, parseFloat(e.target.value) || 0.1))}
                                                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                                            />
                                        </div>
                                        <div>
                                            <span className="text-[11px] text-slate-500 font-medium mb-1 block">Lebar / Tinggi (m)</span>
                                            <input
                                                type="number"
                                                min="0.5"
                                                step="0.1"
                                                value={height}
                                                onChange={(e) => setHeight(Math.max(0.1, parseFloat(e.target.value) || 0.1))}
                                                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                                            />
                                        </div>
                                    </div>
                                    <p className="text-[11px] text-blue-700 font-semibold">
                                        Luas terhitung: {effectiveArea.toFixed(2)} m² × {formatCurrency(product.price)} = {formatCurrency(unitPrice)}
                                    </p>
                                </div>
                            )}

                            {/* Standard Options (Ukuran & Bahan) */}
                            {!isM2 && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1.5">Ukuran</label>
                                        <select
                                            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white font-medium"
                                            value={options.size}
                                            onChange={(e) => setOptions({ ...options, size: e.target.value })}
                                        >
                                            {product.sizes ? (
                                                product.sizes.map((size) => (
                                                    <option key={size} value={size}>
                                                        {size}
                                                    </option>
                                                ))
                                            ) : (
                                                <>
                                                    <option value="A4">A4 (21 x 29.7 cm)</option>
                                                    <option value="A5">A5 (14.8 x 21 cm)</option>
                                                    <option value="A3">A3 (29.7 x 42 cm)</option>
                                                </>
                                            )}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1.5">Bahan / Material</label>
                                        <select
                                            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white font-medium"
                                            value={options.material}
                                            onChange={(e) => setOptions({ ...options, material: e.target.value })}
                                        >
                                            <option value="Standard">Standard (HVS / Art Paper)</option>
                                            <option value="Premium">Premium Tebal (Art Carton 260g)</option>
                                            <option value="Laminasi Glossy">Laminasi Kilap (Glossy)</option>
                                            <option value="Laminasi Doff">Laminasi Elegan (Matte/Doff)</option>
                                        </select>
                                    </div>
                                </div>
                            )}

                            {/* Upload Desain Siap Cetak (Multi-File with Live Preview) */}
                            <div className="space-y-2.5">
                                <div className="flex items-center justify-between">
                                    <label className="block text-xs font-bold text-slate-700">
                                        Unggah Desain Siap Cetak <span className="text-slate-400 font-normal">(Bisa banyak berkas)</span>
                                    </label>
                                    {uploadedFiles.length > 0 && (
                                        <span className="text-[11px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                                            {uploadedFiles.length} Berkas Siap
                                        </span>
                                    )}
                                </div>

                                {uploadedFiles.length > 0 ? (
                                    <div className="space-y-3">
                                        <DesignFilePreview
                                            fileUrl={uploadedFiles.map(f => f.url).join(',')}
                                            title="Pratinjau Desain Siap Cetak"
                                            showRemove={true}
                                            onRemove={handleRemoveFile}
                                        />

                                        <div className="flex items-center gap-2 pt-1">
                                            <label className="relative inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold cursor-pointer transition-colors shadow-2xs">
                                                <Upload className="h-3.5 w-3.5" />
                                                <span>+ Tambah Desain Lain</span>
                                                <input
                                                    type="file"
                                                    multiple
                                                    className="hidden"
                                                    onChange={handleFileChange}
                                                    accept=".pdf,.jpg,.jpeg,.png,.webp"
                                                    disabled={isUploading}
                                                />
                                            </label>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setUploadedFiles([]);
                                                    setFileUrl(null);
                                                }}
                                                className="text-[11px] text-red-600 hover:text-red-700 hover:underline px-2 font-medium"
                                            >
                                                Hapus Semua
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-2xl p-6 hover:bg-blue-50/40 transition-all text-center cursor-pointer relative group bg-slate-50/50">
                                        <input
                                            type="file"
                                            multiple
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                            onChange={handleFileChange}
                                            accept=".pdf,.jpg,.jpeg,.png,.webp"
                                            disabled={isUploading}
                                        />

                                        {isUploading ? (
                                            <div className="flex flex-col items-center text-blue-600 py-2">
                                                <Loader2 className="h-7 w-7 mb-1.5 animate-spin" />
                                                <span className="font-bold text-xs">Mengunggah file desain ke cloud...</span>
                                                <span className="text-[10px] text-slate-400 mt-1">Mohon tunggu sebentar</span>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center text-slate-500 py-1">
                                                <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform shadow-2xs">
                                                    <Upload className="h-5 w-5" />
                                                </div>
                                                <span className="font-bold text-xs text-slate-800">Klik atau Tarik Berkas Desain ke Sini</span>
                                                <span className="text-[10px] text-slate-400 mt-0.5">Dukung banyak file sekaligus (PDF, JPG, PNG, WEBP maks 15MB)</span>
                                                <span className="mt-2 text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full font-semibold">
                                                    ✓ Pratinjau gambar langsung otomatis tampil
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Catatan Tambahan */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1.5">Catatan Tambahan untuk Operator</label>
                                <textarea
                                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none min-h-[70px] bg-white"
                                    placeholder="Contoh: Tolong lubang mata ayam di setiap sudut spanduk..."
                                    value={options.notes}
                                    onChange={(e) => setOptions({ ...options, notes: e.target.value })}
                                />
                            </div>

                            {/* Quantity & CTA */}
                            <div className="flex items-center gap-3 pt-2">
                                <div className="flex items-center border border-slate-300 rounded-xl bg-white p-1">
                                    <button
                                        type="button"
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center font-bold text-slate-600 text-sm"
                                    >
                                        -
                                    </button>
                                    <span className="w-10 text-center text-xs font-bold text-slate-900">
                                        {quantity}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => setQuantity(quantity + 1)}
                                        className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center font-bold text-slate-600 text-sm"
                                    >
                                        +
                                    </button>
                                </div>

                                <Button
                                    size="lg"
                                    className="flex-1 h-11 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-sm flex items-center justify-center gap-2"
                                    onClick={handleAddToCart}
                                    disabled={isUploading}
                                >
                                    <ShoppingCart className="h-4 w-4" />
                                    <span>Masukkan Keranjang • {formatCurrency(totalPrice)}</span>
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
