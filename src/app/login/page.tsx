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
import { useAuthStore } from '@/store/authStore';
import { signIn } from 'next-auth/react';

const loginSchema = z.object({
    email: z.string().email('Email tidak valid'),
    password: z.string().min(1, 'Password harus diisi'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
    const router = useRouter();
    const setAuth = useAuthStore((state) => state.login);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
        resolver: zodResolver(loginSchema),
    });

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
                setError('Email atau password salah');
                setIsLoading(false);
                return;
            }

            // Fetch real user data from profile API
            try {
                const profileRes = await fetch('/api/user/profile');
                const profileData = await profileRes.json();

                if (profileData.success && profileData.data) {
                    const user = profileData.data;

                    // Check if user is banned
                    if (user.status === 'BANNED') {
                        toast.error('Akun Anda telah diblokir. Hubungi admin.');
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
                    router.push(user.role === 'ADMIN' ? '/admin/dashboard' : '/');
                    router.refresh();
                } else {
                    throw new Error('Failed to get profile');
                }
            } catch (profileErr) {
                // Fallback: still allow login but with limited info
                console.error('Profile fetch error:', profileErr);
                toast.success('Login berhasil');
                router.push('/');
                router.refresh();
            }
        } catch (err) {
            toast.error('Terjadi kesalahan, silakan coba lagi');
            setError('Terjadi kesalahan, silakan coba lagi');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-[calc(100vh-200px)] items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-xl shadow-lg border border-slate-100">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-slate-900">
                        Masuk Akun
                    </h2>
                    <p className="mt-2 text-center text-sm text-slate-600">
                        Atau{' '}
                        <Link href="/register" className="font-medium text-blue-600 hover:text-blue-500">
                            daftar akun baru
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
                            label="Email Address"
                            type="email"
                            autoComplete="email"
                            error={errors.email?.message}
                            {...register('email')}
                        />
                        <Input
                            label="Password"
                            type="password"
                            autoComplete="current-password"
                            error={errors.password?.message}
                            {...register('password')}
                        />
                    </div>

                    <div>
                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Memproses...
                                </>
                            ) : (
                                'Masuk'
                            )}
                        </Button>
                    </div>

                    <div className="text-center text-xs text-slate-500">
                        <p>Demo Admin: admin@printwere.com / admin</p>
                        <p>Demo User: user@printwere.com / user</p>
                    </div>
                </form>
            </div>
        </div>
    );
}
