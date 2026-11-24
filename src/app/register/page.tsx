'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, AlertCircle, Printer, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

const registerSchema = z.object({
    name: z.string().min(3, 'Nama harus diisi minimal 3 karakter'),
    email: z.string().email('Format email tidak valid'),
    phone: z.string().min(10, 'Nomor WhatsApp minimal 10 digit').optional().or(z.literal('')),
    password: z.string().min(6, 'Password minimal 6 karakter'),
    confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
    message: "Konfirmasi password tidak cocok",
    path: ["confirmPassword"],
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const { register, handleSubmit, formState: { errors } } = useForm<RegisterForm>({
        resolver: zodResolver(registerSchema),
    });

    const onSubmit = async (data: RegisterForm) => {
        setIsLoading(true);
        setError('');
        try {
            const res = await fetch('/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: data.name,
                    email: data.email,
                    phone: data.phone || undefined,
                    password: data.password
                })
            });

            const result = await res.json();

            if (result.success) {
                toast.success('Pendaftaran berhasil! Silakan masuk ke akun Anda.');
                router.push('/login');
            } else {
                setError(result.error || 'Gagal mendaftar');
                toast.error(result.error || 'Gagal mendaftar');
            }
        } catch (err) {
            console.error('Registration error:', err);
            setError('Terjadi kendala pada server. Silakan coba beberapa saat lagi.');
            toast.error('Terjadi kendala pada server');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-[calc(100vh-160px)] items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50/50">
            <div className="w-full max-w-md space-y-6 bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
                {/* Logo & Heading */}
                <div className="text-center space-y-2">
                    <Link href="/" className="inline-flex items-center gap-2 group">
                        <div className="h-10 w-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs group-hover:bg-blue-700 transition-colors">
                            <Printer className="h-5 w-5" />
                        </div>
                        <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                            PrintWere
                        </span>
                    </Link>
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                        Buat Akun Baru
                    </h2>
                    <p className="text-xs text-slate-500">
                        Sudah memiliki akun?{' '}
                        <Link href="/login" className="font-semibold text-blue-600 hover:text-blue-500 underline">
                            Masuk di sini
                        </Link>
                    </p>
                </div>

                <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
                    {error && (
                        <div className="rounded-xl bg-red-50 p-3.5 border border-red-200 flex items-center gap-2.5 text-xs text-red-700">
                            <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    <div className="space-y-3">
                        <Input
                            label="Nama Lengkap"
                            placeholder="Contoh: Budi Santoso"
                            error={errors.name?.message}
                            autoComplete="name"
                            {...register('name')}
                        />
                        <Input
                            label="Alamat Email"
                            type="email"
                            placeholder="nama@email.com"
                            error={errors.email?.message}
                            autoComplete="email"
                            {...register('email')}
                        />
                        <Input
                            label="Nomor WhatsApp (Untuk Notifikasi Faktur)"
                            type="tel"
                            placeholder="Contoh: 081234567890"
                            error={errors.phone?.message}
                            autoComplete="tel"
                            {...register('phone')}
                        />
                        <Input
                            label="Kata Sandi (Password)"
                            type="password"
                            placeholder="Minimal 6 karakter"
                            error={errors.password?.message}
                            autoComplete="new-password"
                            {...register('password')}
                        />
                        <Input
                            label="Konfirmasi Kata Sandi"
                            type="password"
                            placeholder="Ulangi kata sandi"
                            error={errors.confirmPassword?.message}
                            autoComplete="new-password"
                            {...register('confirmPassword')}
                        />
                    </div>

                    <Button 
                        type="submit" 
                        className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 text-white py-2.5 text-sm font-semibold shadow-xs" 
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Mendaftarkan Akun...
                            </>
                        ) : (
                            'Daftar Sekarang'
                        )}
                    </Button>
                </form>
            </div>
        </div>
    );
}
