'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

const registerSchema = z.object({
    name: z.string().min(3, 'Nama harus diisi minimal 3 karakter'),
    email: z.string().email('Email tidak valid'),
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
                    password: data.password
                })
            });

            const result = await res.json();

            if (result.success) {
                toast.success('Registrasi berhasil! Silakan masuk.');
                router.push('/login');
            } else {
                setError(result.error || 'Gagal mendaftar');
                toast.error(result.error || 'Gagal mendaftar');
            }
        } catch (err) {
            console.error('Registration error:', err);
            setError('Terjadi kesalahan pada server');
            toast.error('Terjadi kesalahan pada server');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-[calc(100vh-200px)] items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-xl shadow-lg border border-slate-100">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-slate-900">
                        Daftar Akun Baru
                    </h2>
                    <p className="mt-2 text-center text-sm text-slate-600">
                        Sudah punya akun?{' '}
                        <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
                            Masuk di sini
                        </Link>
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
                    {error && (
                        <div className="rounded-md bg-red-50 p-4 border border-red-200">
                            <div className="flex">
                                <AlertCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-red-800">{error}</h3>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="space-y-4 rounded-md shadow-sm">
                        <Input
                            label="Nama Lengkap"
                            error={errors.name?.message}
                            autoComplete="name"
                            {...register('name')}
                        />
                        <Input
                            label="Email Address"
                            type="email"
                            error={errors.email?.message}
                            autoComplete="email"
                            {...register('email')}
                        />
                        <Input
                            label="Password"
                            type="password"
                            error={errors.password?.message}
                            autoComplete="new-password"
                            {...register('password')}
                        />
                        <Input
                            label="Konfirmasi Password"
                            type="password"
                            error={errors.confirmPassword?.message}
                            autoComplete="new-password"
                            {...register('confirmPassword')}
                        />
                    </div>

                    <div>
                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Mendaftar...
                                </>
                            ) : (
                                'Daftar Sekarang'
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
