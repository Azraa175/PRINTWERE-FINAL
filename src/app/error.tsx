
'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { AlertTriangle, RefreshCcw } from 'lucide-react';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error('Global Error Boundary:', error);
    }, [error]);

    return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-6 text-center">
            <div className="bg-red-50 p-4 rounded-full mb-4">
                <AlertTriangle className="h-10 w-10 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Terjadi Kesalahan</h2>
            <p className="text-slate-600 max-w-md mb-6">
                Maaf, sistem mengalami gangguan teknis. Silakan coba muat ulang halaman.
            </p>
            <div className="flex gap-4">
                <Button variant="outline" onClick={() => window.location.reload()}>
                    Muat Ulang Halaman
                </Button>
                <Button onClick={() => reset()}>
                    <RefreshCcw className="h-4 w-4 mr-2" />
                    Coba Lagi
                </Button>
            </div>
        </div>
    );
}
