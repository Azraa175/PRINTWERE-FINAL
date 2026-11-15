'use client';

import { useState } from 'react';
import { FileText, Download, Eye, X, Image as ImageIcon, ExternalLink } from 'lucide-react';

interface DesignFilePreviewProps {
    fileUrl?: string | null;
    title?: string;
    variant?: 'compact' | 'full';
    onRemove?: (index: number) => void;
    showRemove?: boolean;
}

export function parseFileUrls(fileUrl?: string | null): string[] {
    if (!fileUrl) return [];
    const trimmed = fileUrl.trim();
    if (!trimmed) return [];

    // Try parsing as JSON array
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
        try {
            const parsed = JSON.parse(trimmed);
            if (Array.isArray(parsed)) return parsed.filter(Boolean);
        } catch {
            // fallback to comma separated
        }
    }

    // Split by comma
    return trimmed.split(',').map(s => s.trim()).filter(Boolean);
}

export function isImageFile(url: string): boolean {
    if (!url) return false;
    if (url.startsWith('data:image/')) return true;
    const cleanUrl = url.split('?')[0].toLowerCase();
    return /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(cleanUrl);
}

export function isPdfFile(url: string): boolean {
    if (!url) return false;
    if (url.startsWith('data:application/pdf')) return true;
    const cleanUrl = url.split('?')[0].toLowerCase();
    return /\.pdf$/i.test(cleanUrl);
}

export function getFileName(url: string, index: number): string {
    if (!url) return `Berkas ${index + 1}`;
    if (url.startsWith('data:')) {
        return `Desain-${index + 1}.${url.split(';')[0].split('/')[1] || 'img'}`;
    }
    const parts = url.split('/');
    const lastPart = parts[parts.length - 1];
    return decodeURIComponent(lastPart.split('?')[0]);
}

export function DesignFilePreview({
    fileUrl,
    title = 'Berkas Desain Siap Cetak',
    variant = 'full',
    onRemove,
    showRemove = false
}: DesignFilePreviewProps) {
    const urls = parseFileUrls(fileUrl);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    if (urls.length === 0) {
        return (
            <div className="text-xs text-slate-400 italic bg-slate-50 p-2.5 rounded-xl border border-dashed border-slate-200">
                Tidak ada berkas desain yang diunggah
            </div>
        );
    }

    return (
        <div className="space-y-2.5">
            {title && (
                <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-700 flex items-center gap-1.5">
                        <ImageIcon className="h-3.5 w-3.5 text-blue-600" />
                        {title} ({urls.length} Berkas)
                    </span>
                </div>
            )}

            <div className={`grid gap-2.5 ${variant === 'compact' ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'}`}>
                {urls.map((url, idx) => {
                    const isImg = isImageFile(url);
                    const isPdf = isPdfFile(url);
                    const name = getFileName(url, idx);

                    return (
                        <div
                            key={idx}
                            className="group relative flex flex-col bg-white rounded-xl border border-slate-200 shadow-2xs hover:border-blue-300 transition-all overflow-hidden"
                        >
                            {/* Preview Thumbnail */}
                            <div className="relative aspect-video w-full bg-slate-100 flex items-center justify-center overflow-hidden">
                                {isImg ? (
                                    <>
                                        <img
                                            src={url}
                                            alt={name}
                                            className="w-full h-full object-cover transition-transform group-hover:scale-105 cursor-pointer"
                                            onClick={() => setSelectedImage(url)}
                                        />
                                        <div 
                                            onClick={() => setSelectedImage(url)}
                                            className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1 cursor-pointer"
                                        >
                                            <Eye className="h-4 w-4" />
                                            <span>Lihat Desain</span>
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex flex-col items-center justify-center p-4 text-center">
                                        <div className="h-10 w-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center mb-1">
                                            <FileText className="h-6 w-6" />
                                        </div>
                                        <span className="text-[11px] font-bold text-slate-700 uppercase">
                                            {isPdf ? 'DOKUMEN PDF' : 'DOKUMEN CETAK'}
                                        </span>
                                    </div>
                                )}

                                {showRemove && onRemove && (
                                    <button
                                        type="button"
                                        onClick={() => onRemove(idx)}
                                        className="absolute top-2 right-2 p-1 rounded-full bg-red-600 text-white hover:bg-red-700 shadow-sm transition-colors z-10"
                                        title="Hapus berkas ini"
                                    >
                                        <X className="h-3.5 w-3.5" />
                                    </button>
                                )}
                            </div>

                            {/* Info & Action Bar */}
                            <div className="p-2.5 flex items-center justify-between gap-2 bg-slate-50/70 border-t border-slate-100 text-xs">
                                <span className="truncate font-semibold text-slate-800 text-[11px]" title={name}>
                                    {name}
                                </span>
                                <div className="flex items-center gap-1 shrink-0">
                                    {isImg ? (
                                        <button
                                            type="button"
                                            onClick={() => setSelectedImage(url)}
                                            className="p-1 rounded-lg bg-white border border-slate-200 text-slate-700 hover:text-blue-600 hover:bg-slate-50 transition-colors shadow-2xs"
                                            title="Perbesar Gambar"
                                        >
                                            <Eye className="h-3.5 w-3.5" />
                                        </button>
                                    ) : (
                                        <a
                                            href={url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-1 rounded-lg bg-white border border-slate-200 text-slate-700 hover:text-blue-600 hover:bg-slate-50 transition-colors shadow-2xs"
                                            title="Buka Dokumen"
                                        >
                                            <ExternalLink className="h-3.5 w-3.5" />
                                        </a>
                                    )}
                                    <a
                                        href={url}
                                        download={name}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] transition-colors shadow-2xs"
                                        title="Unduh File Asli"
                                    >
                                        <Download className="h-3 w-3" />
                                        <span>Unduh</span>
                                    </a>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Modal Lightbox Preview Fullscreen */}
            {selectedImage && (
                <div
                    className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
                    onClick={() => setSelectedImage(null)}
                >
                    <div
                        className="relative max-w-4xl max-h-[90vh] bg-white rounded-2xl overflow-hidden shadow-2xl flex flex-col"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header Modal */}
                        <div className="flex items-center justify-between px-4 py-3 bg-slate-900 text-white">
                            <span className="text-xs font-bold truncate">Pratinjau Desain Siap Cetak</span>
                            <div className="flex items-center gap-2">
                                <a
                                    href={selectedImage}
                                    download
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-xs font-semibold transition-colors"
                                >
                                    <Download className="h-3.5 w-3.5" />
                                    <span>Unduh File Asli</span>
                                </a>
                                <button
                                    onClick={() => setSelectedImage(null)}
                                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        </div>

                        {/* Image Body */}
                        <div className="p-2 overflow-auto max-h-[80vh] flex items-center justify-center bg-slate-950/20">
                            <img
                                src={selectedImage}
                                alt="Pratinjau Desain"
                                className="max-w-full max-h-[75vh] object-contain rounded-lg"
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
