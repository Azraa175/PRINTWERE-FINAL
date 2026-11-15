'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function OrderListPage() {
    const router = useRouter();

    useEffect(() => {
        router.replace('/my-orders');
    }, [router]);

    return (
        <div className="flex items-center justify-center min-h-[50vh]">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        </div>
    );
}
