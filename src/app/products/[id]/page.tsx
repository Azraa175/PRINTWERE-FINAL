'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Star, Upload, FileText, Loader2, X, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { useCartStore } from '@/store/cartStore';
import { toast } from 'sonner';
import { Product } from '@/types';
import { formatCurrency } from '@/lib/utils';

export default function ProductDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const [product, setProduct] = useState<Product | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [file, setFile] = useState<File | null>(null);
    const [fileUrl, setFileUrl] = useState<string | null>(null);
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
                const res = await fetch(`/api/products/${id}`);
                const data = await res.json();
                if (data.success && data.data) {
                    const productData = data.data;
                    setProduct(productData);
                    if (productData.sizes && productData.sizes.length > 0) {
                        setOptions(prev => ({ ...prev, size: productData.sizes![0] }));
                    }
                }
            } catch (error) {
                console.error(error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchProduct();
    }, [id]);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (!selectedFile) return;

        // Validate file size
        if (selectedFile.size > 10 * 1024 * 1024) {
            toast.error('File terlalu besar. Maksimal 10MB');
            return;
        }

        setFile(selectedFile);
        setIsUploading(true);

        try {
            const formData = new FormData();
            formData.append('file', selectedFile);

            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });

            const data = await res.json();

            if (data.success) {
                setFileUrl(data.data.url);
                toast.success('File berhasil diupload');
            } else {
                toast.error(data.error || 'Gagal upload file');
                setFile(null);
            }
        } catch (error) {
            toast.error('Gagal upload file');
            setFile(null);
        } finally {
            setIsUploading(false);
        }
    };

    const removeFile = () => {
        setFile(null);
        setFileUrl(null);
    };

    const handleAddToCart = () => {
        if (!product) return;
        addItem(product, quantity, {
            ...options,
            fileName: file?.name,
            fileUrl: fileUrl // Pass the uploaded file URL
        });
        toast.success('Produk ditambahkan ke keranjang');
        router.push('/cart');
    };

    if (isLoading) return <div className="p-12 text-center">Loading product...</div>;
    if (!product) return <div className="p-12 text-center">Product not found</div>;

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Product Image */}
                <div className="space-y-4">
                    <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-gray-100 border border-slate-200">
                        <Image
                            src={product.image}
                            alt={product.name}
                            fill
                            className="object-cover"
                            priority
                        />
                    </div>
                </div>

                {/* Product Details */}
                <div className="space-y-8">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <Badge variant="secondary" className="text-blue-600 bg-blue-50">
                                {product.category}
                            </Badge>
                            {product.isRecommended && (
                                <Badge variant="secondary" className="text-yellow-600 bg-yellow-50">
                                    Best Seller
                                </Badge>
                            )}
                        </div>

                        <h1 className="text-3xl font-bold text-slate-900 mb-2">{product.name}</h1>

                        <div className="flex items-center gap-2 mb-4">
                            <div className="flex items-center text-yellow-400">
                                <Star className="h-5 w-5 fill-current" />
                                <span className="ml-1 font-bold text-slate-700">{product.rating}</span>
                            </div>
                            <span className="text-slate-400">•</span>
                            <span className="text-slate-500">Terjual 1.2k+</span>
                        </div>

                        <p className="text-3xl font-bold text-blue-600">
                            {formatCurrency(product.price)}
                        </p>
                    </div>

                    <div className="prose prose-slate max-w-none text-slate-600">
                        <p>{product.description}</p>
                    </div>

                    <div className="space-y-6 border-t border-slate-200 pt-6">
                        {/* Options */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Ukuran</label>
                                <select
                                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
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
                                <label className="block text-sm font-medium text-slate-700 mb-2">Bahan</label>
                                <select
                                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    value={options.material}
                                    onChange={(e) => setOptions({ ...options, material: e.target.value })}
                                >
                                    <option value="Standard">Standard (HVS/Art Paper)</option>
                                    <option value="Premium">Premium (Textured/Thick)</option>
                                    <option value="Glossy">Glossy Finish</option>
                                </select>
                            </div>
                        </div>

                        {/* File Upload */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Upload Desain</label>
                            {file && fileUrl ? (
                                <div className="border-2 border-green-300 bg-green-50 rounded-lg p-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <CheckCircle className="h-8 w-8 text-green-600" />
                                            <div>
                                                <p className="font-medium text-green-800">{file.name}</p>
                                                <p className="text-sm text-green-600">{(file.size / 1024 / 1024).toFixed(2)} MB - Berhasil diupload</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={removeFile}
                                            className="p-2 hover:bg-green-100 rounded-full transition-colors"
                                        >
                                            <X className="h-5 w-5 text-green-600" />
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 hover:bg-slate-50 transition-colors text-center cursor-pointer relative">
                                    <input
                                        type="file"
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        onChange={handleFileChange}
                                        accept=".pdf,.jpg,.jpeg,.png"
                                        disabled={isUploading}
                                    />

                                    {isUploading ? (
                                        <div className="flex flex-col items-center text-blue-600">
                                            <Loader2 className="h-8 w-8 mb-2 animate-spin" />
                                            <span className="font-medium text-sm">Mengupload file...</span>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center text-slate-400">
                                            <Upload className="h-8 w-8 mb-2" />
                                            <span className="font-medium text-sm text-slate-600">Klik untuk upload file</span>
                                            <span className="text-xs mt-1">PDF, JPG, PNG (Max 10MB)</span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Notes */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Catatan Tambahan</label>
                            <textarea
                                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none min-h-[80px]"
                                placeholder="Instruksi khusus untuk percetakan..."
                                value={options.notes}
                                onChange={(e) => setOptions({ ...options, notes: e.target.value })}
                            />
                        </div>

                        {/* Quantity & Action */}
                        <div className="flex items-end gap-4">
                            <div className="w-32">
                                <Input
                                    label="Jumlah"
                                    type="number"
                                    min={1}
                                    value={quantity}
                                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                                />
                            </div>
                            <Button
                                size="lg"
                                className="flex-1"
                                onClick={handleAddToCart}
                                disabled={isUploading}
                            >
                                + Keranjang - {formatCurrency(product.price * quantity)}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
