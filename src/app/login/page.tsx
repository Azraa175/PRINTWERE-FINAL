'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, AlertCircle, Printer, ArrowRight, ShieldCheck, UserCheck, KeyRound } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuthStore } from '@/store/authStore';
import { signIn } from 'next-auth/react';

const loginSchema = z.object({
    email: z.string().email('Format email tidak valid'),
    password: z.string().min(1, 'Password harus diisi'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
    const router = useRouter();
    const setAuth = useAuthStore((state) => state.login);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const { register, handleSubmit, setValue, formState: { errors } } = useForm<LoginForm>({
        resolver: zodResolver(loginSchema),
    });

    const fillDemo = (email: string, pass: string) => {
        setValue('email', email);
        setValue('password', pass);
        setError('');
    };

    const onSubmit = async (data: LoginForm) => {
        setError('');
        setIsLoading(true);
        try {
            const result = await signIn('credentials', {
                email: data.email,
                password: data.password,
                redirect: false,
            });

            if (result?.error) {
                toast.error('Email atau password salah');
                setError('Email atau password yang Anda masukkan tidak sesuai');
                setIsLoading(false);
                return;
            }

            // Fetch real user data from profile API
            try {
                const profileRes = await fetch('/api/user/profile');
                const profileData = await profileRes.json();

                if (profileData.success && profileData.data) {
                    const user = profileData.data;

                    if (user.status === 'BANNED') {
                        toast.error('Akun Anda telah diblokir. Hubungi customer service.');
                        setError('Akun Anda telah diblokir.');
                        setIsLoading(false);
                        return;
                    }

                    setAuth({
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        role: user.role,
                        avatar: user.avatar,
                    }, 'session-token');

                    toast.success(`Selamat datang kembali, ${user.name}`);
                    if (user.role === 'ADMIN') {
                        router.push('/admin/dashboard');
                    } else if (user.role === 'STAFF') {
                        router.push('/staff/queue');
                    } else {
                        router.push('/');
                    }
                    router.refresh();
                } else {
                    throw new Error('Failed to get profile');
                }
            } catch (profileErr) {
                console.error('Profile fetch error:', profileErr);
                toast.success('Login berhasil');
                router.push('/');
                router.refresh();
            }
        } catch (err) {
            toast.error('Terjadi kesalahan jaringan, silakan coba lagi');
            setError('Terjadi kendala saat login. Silakan coba lagi.');
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
                        Masuk ke Akun Anda
                    </h2>
                    <p className="text-xs text-slate-500">
                        Belum punya akun?{' '}
                        <Link href="/register" className="font-semibold text-blue-600 hover:text-blue-500 underline">
                            Daftar sekarang
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
                            label="Alamat Email"
                            type="email"
                            placeholder="nama@email.com"
                            autoComplete="email"
                            error={errors.email?.message}
                            {...register('email')}
                        />
                        <Input
                            label="Kata Sandi (Password)"
                            type="password"
                            placeholder="••••••••"
                            autoComplete="current-password"
                            error={errors.password?.message}
                            {...register('password')}
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
                                Memproses Masuk...
                            </>
                        ) : (
                            'Masuk Sekarang'
                        )}
                    </Button>

                    {/* Quick Demo Fill Buttons */}
                    <div className="pt-4 border-t border-slate-100">
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 text-center mb-2.5">
                            Akun Demo Pengujian (Klik untuk Isi):
                        </p>
                        <div className="grid grid-cols-3 gap-2">
                            <button
                                type="button"
                                onClick={() => fillDemo('admin@printwere.com', 'admin123')}
                                className="px-2 py-1.5 text-[11px] font-medium bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 rounded-lg transition-colors flex items-center justify-center gap-1"
                            >
                                <ShieldCheck className="h-3 w-3" /> Admin
                            </button>
                            <button
                                type="button"
                                onClick={() => fillDemo('staff@printwere.com', 'staff123')}
                                className="px-2 py-1.5 text-[11px] font-medium bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors flex items-center justify-center gap-1"
                            >
                                <Printer className="h-3 w-3" /> Staff
                            </button>
                            <button
                                type="button"
                                onClick={() => fillDemo('user@printwere.com', 'user123')}
                                className="px-2 py-1.5 text-[11px] font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors flex items-center justify-center gap-1"
                            >
                                <UserCheck className="h-3 w-3" /> Customer
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
