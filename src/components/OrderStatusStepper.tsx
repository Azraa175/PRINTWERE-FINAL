'use client';

import { 
    CreditCard, 
    Receipt, 
    Calendar, 
    Printer, 
    Scissors, 
    Truck, 
    CheckCircle2, 
    Check, 
    AlertCircle, 
    XCircle 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ORDER_STATUS_LABELS } from '@/types';

export const PRINTING_STEPS = [
    {
        key: 'MENUNGGU_PEMBAYARAN',
        label: 'Belum Bayar',
        desc: 'Menunggu transfer',
        icon: CreditCard,
    },
    {
        key: 'MENUNGGU_VERIFIKASI',
        label: 'Verifikasi',
        desc: 'Cek bukti transfer',
        icon: Receipt,
    },
    {
        key: 'ANTRIAN_PRODUKSI',
        label: 'Antrean Cetak',
        desc: 'Masuk antrean mesin',
        icon: Calendar,
    },
    {
        key: 'SEDANG_DICETAK',
        label: 'Sedang Dicetak',
        desc: 'Mesin beroperasi',
        icon: Printer,
    },
    {
        key: 'FINISHING',
        label: 'Finishing',
        desc: 'Potong & jilid',
        icon: Scissors,
    },
    {
        key: 'SIAP_DIAMBIL',
        label: 'Siap Diambil',
        desc: 'Siap di toko / kurir',
        icon: Truck,
    },
    {
        key: 'SELESAI',
        label: 'Selesai',
        desc: 'Pesanan diterima',
        icon: CheckCircle2,
    },
];

const STATUS_PROGRESS_MAP: Record<string, number> = {
    MENUNGGU_PEMBAYARAN: 0,
    PENDING: 0,
    MENUNGGU_VERIFIKASI: 1,
    CONFIRMED: 1,
    ANTRIAN_PRODUKSI: 2,
    SEDANG_DICETAK: 3,
    PROCESSING: 3,
    FINISHING: 4,
    SIAP_DIAMBIL: 5,
    DIKIRIM: 5,
    READY: 5,
    SELESAI: 6,
    COMPLETED: 6,
};

interface OrderStatusStepperProps {
    status: string;
    shippingMethod?: string;
    className?: string;
}

export function OrderStatusStepper({ status, shippingMethod, className }: OrderStatusStepperProps) {
    const isCancelled = status === 'DIBATALKAN' || status === 'CANCELLED';
    const isPaymentRejected = status === 'PEMBAYARAN_DITOLAK';
    const currentIndex = STATUS_PROGRESS_MAP[status] ?? 0;
    const statusMeta = ORDER_STATUS_LABELS[status] || { label: status, color: 'bg-slate-100 text-slate-800' };

    // If cancelled or rejected, show special banner instead of progress bar
    if (isCancelled || isPaymentRejected) {
        return (
            <div className={cn(
                "rounded-2xl p-5 border flex items-start gap-3",
                isCancelled ? "bg-red-50 border-red-200 text-red-900" : "bg-rose-50 border-rose-200 text-rose-900",
                className
            )}>
                {isCancelled ? (
                    <XCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                ) : (
                    <AlertCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
                )}
                <div>
                    <h4 className="font-bold text-sm">
                        {isCancelled ? 'Pesanan Dibatalkan' : 'Pembayaran Ditolak'}
                    </h4>
                    <p className="text-xs mt-0.5 opacity-90 leading-relaxed">
                        {isCancelled 
                            ? 'Pesanan ini telah dibatalkan dan tidak dilanjutkan ke tahap produksi.'
                            : 'Bukti transfer tidak valid atau tidak terbaca. Harap lakukan konfirmasi atau unggah ulang struk transfer yang sah.'
                        }
                    </p>
                </div>
            </div>
        );
    }

    // Exact progress ratio: index / (total_steps - 1)
    const progressPercentage = Math.min(100, Math.max(0, (currentIndex / (PRINTING_STEPS.length - 1)) * 100));

    return (
        <div className={cn("bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-2xs overflow-hidden", className)}>
            {/* Header info */}
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-500">Tahapan Saat Ini:</span>
                    <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-bold border", statusMeta.color)}>
                        {statusMeta.label}
                    </span>
                </div>
                <span className="text-xs text-slate-400 font-medium">
                    Tahap {currentIndex + 1} dari {PRINTING_STEPS.length}
                </span>
            </div>

            {/* Stepper container with horizontal scroll on small screens */}
            <div className="overflow-x-auto pb-2 -mx-2 px-2">
                <div className="relative flex justify-between min-w-[620px] pt-1 pb-2">
                    {/* Precision Connecting Track Container:
                        Each step column is width ~84px. The circle (w-10 = 40px) is centered inside it, 
                        so the center of Circle 0 is at 42px from left, and Center of Circle 6 is at 42px from right.
                    */}
                    <div className="absolute top-5 left-[42px] right-[42px] h-1 pointer-events-none z-0">
                        {/* Inactive background track */}
                        <div className="w-full h-full bg-slate-100 rounded-full" />
                        
                        {/* Active progress line connecting perfectly to current step */}
                        <div 
                            className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full transition-all duration-700 ease-out shadow-xs"
                            style={{
                                width: `${progressPercentage}%`
                            }}
                        />
                    </div>

                    {PRINTING_STEPS.map((step, idx) => {
                        const isCompleted = idx < currentIndex;
                        const isCurrent = idx === currentIndex;
                        const Icon = step.icon;

                        let displayLabel = step.label;
                        if (step.key === 'SIAP_DIAMBIL') {
                            displayLabel = shippingMethod === 'PICKUP' ? 'Siap Diambil' : 'Siap Kirim';
                        }

                        return (
                            <div key={step.key} className="relative z-10 flex flex-col items-center w-[84px] text-center group">
                                {/* Step Circle */}
                                <div
                                    className={cn(
                                        "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 relative",
                                        isCompleted
                                            ? "bg-blue-600 text-white shadow-xs ring-4 ring-blue-50"
                                            : isCurrent
                                            ? "bg-gradient-to-br from-blue-600 to-cyan-600 text-white shadow-md ring-4 ring-blue-100 scale-110"
                                            : "bg-white border-2 border-slate-200 text-slate-300"
                                    )}
                                    title={step.desc}
                                >
                                    {isCompleted ? (
                                        <Check className="h-4 w-4 stroke-[3]" />
                                    ) : (
                                        <Icon className="h-4 w-4" />
                                    )}
                                </div>

                                {/* Step Label */}
                                <span
                                    className={cn(
                                        "mt-2 text-xs font-bold leading-tight transition-colors",
                                        isCurrent
                                            ? "text-blue-600"
                                            : isCompleted
                                            ? "text-slate-800"
                                            : "text-slate-400"
                                    )}
                                >
                                    {displayLabel}
                                </span>

                                {/* Short description */}
                                <span className="text-[10px] text-slate-400 leading-tight mt-0.5 line-clamp-1">
                                    {step.desc}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
