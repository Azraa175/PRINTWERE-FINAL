'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
    User, 
    Mail, 
    Phone, 
    Calendar, 
    Edit2, 
    LogOut, 
    Loader2, 
    Save, 
    Shield, 
    Printer, 
    ShoppingBag, 
    Clock, 
    Check 
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/authStore';
import { signOut } from 'next-auth/react';
import { formatDate } from '@/lib/utils';

interface Profile {
    id: string;
    name: string;
    email: string;
    role: string;
    avatar?: string;
    phone?: string;
    bio?: string;
    gender?: string;
    birthDate?: string;
    createdAt: string;
    _count?: { orders: number };
}

export default function ProfilePage() {
    const router = useRouter();
    const { isAuthenticated, logout: storeLogout } = useAuthStore();
    const [profile, setProfile] = useState<Profile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        bio: '',
        gender: '',
        birthDate: ''
    });

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login');
            return;
        }
        fetchProfile();
    }, [isAuthenticated]);

    const fetchProfile = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/user/profile');
            const data = await res.json();
            if (data.success) {
                setProfile(data.data);
                setFormData({
                    name: data.data.name || '',
                    phone: data.data.phone || '',
                    bio: data.data.bio || '',
                    gender: data.data.gender || '',
                    birthDate: data.data.birthDate || ''
                });
            } else {
                toast.error('Gagal memuat profil');
            }
        } catch (error) {
            toast.error('Gagal memuat profil');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const res = await fetch('/api/user/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            if (data.success) {
                setProfile(data.data);
                setIsEditing(false);
                toast.success('Profil berhasil diperbarui');
            } else {
                toast.error(data.error || 'Gagal menyimpan');
            }
        } catch (error) {
            toast.error('Gagal menyimpan');
        } finally {
            setIsSaving(false);
        }
    };

    const handleLogout = async () => {
        try {
            await signOut({ redirect: false });
            storeLogout();
            toast.success('Berhasil keluar dari akun');
            router.push('/login');
        } catch (error) {
            toast.error('Gagal logout');
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <p className="text-xs text-slate-400">Memuat profil Anda...</p>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="container mx-auto px-4 py-16 text-center">
                <p className="text-slate-500">Profil pengguna tidak ditemukan.</p>
            </div>
        );
    }

    const isAdmin = profile.role === 'ADMIN';
    const isStaff = profile.role === 'STAFF';

    return (
        <div className="container mx-auto px-4 py-10 max-w-2xl space-y-6">
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">Profil Saya</h1>
                <p className="text-sm text-slate-500 mt-1">
                    Informasi akun pribadi dan riwayat aktivitas di PrintWere.
                </p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
                {/* Avatar & Header */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 pb-6 border-b border-slate-100">
                    <div className="h-20 w-20 bg-blue-50 text-blue-600 rounded-2xl border border-blue-200 flex items-center justify-center font-bold text-2xl shrink-0 shadow-xs">
                        {profile.avatar ? (
                            <img src={profile.avatar} alt={profile.name} className="h-full w-full rounded-2xl object-cover" />
                        ) : (
                            profile.name.charAt(0).toUpperCase()
                        )}
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 leading-tight">{profile.name}</h2>
                        <p className="text-sm text-slate-500 font-mono mt-0.5">{profile.email}</p>
                        <div className="mt-2 flex items-center gap-2">
                            {isAdmin ? (
                                <Badge className="bg-purple-100 text-purple-800 border-purple-200 text-xs gap-1">
                                    <Shield className="h-3 w-3" /> Administrator
                                </Badge>
                            ) : isStaff ? (
                                <Badge className="bg-indigo-100 text-indigo-800 border-indigo-200 text-xs gap-1">
                                    <Printer className="h-3 w-3" /> Staf Produksi
                                </Badge>
                            ) : (
                                <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-xs gap-1">
                                    <User className="h-3 w-3" /> Pelanggan
                                </Badge>
                            )}
                        </div>
                    </div>
                </div>

                {/* Form Fields */}
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                            Nama Lengkap
                        </label>
                        {isEditing ? (
                            <Input
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Nama lengkap Anda"
                            />
                        ) : (
                            <p className="text-sm font-semibold text-slate-900 bg-slate-50 p-3 rounded-xl border border-slate-100">
                                {profile.name}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                            Alamat Email
                        </label>
                        <div className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                            <Mail className="h-4 w-4 text-slate-400 shrink-0" />
                            <span className="font-mono text-xs">{profile.email}</span>
                            <span className="text-[11px] text-slate-400 ml-auto">(permanen)</span>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                            Nomor WhatsApp / HP
                        </label>
                        {isEditing ? (
                            <Input
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                placeholder="Contoh: 081234567890"
                            />
                        ) : (
                            <div className="flex items-center gap-2 text-sm text-slate-900 bg-slate-50 p-3 rounded-xl border border-slate-100">
                                <Phone className="h-4 w-4 text-slate-400 shrink-0" />
                                <span className="font-mono text-xs">{profile.phone || '-'}</span>
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                            Bio / Catatan
                        </label>
                        {isEditing ? (
                            <textarea
                                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                value={formData.bio}
                                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                placeholder="Tuliskan info singkat mengenai Anda..."
                                rows={2}
                            />
                        ) : (
                            <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100">
                                {profile.bio || 'Belum ada bio'}
                            </p>
                        )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                                Jenis Kelamin
                            </label>
                            {isEditing ? (
                                <select
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                    value={formData.gender}
                                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                                >
                                    <option value="">Pilih</option>
                                    <option value="MALE">Laki-laki</option>
                                    <option value="FEMALE">Perempuan</option>
                                    <option value="OTHER">Lainnya</option>
                                </select>
                            ) : (
                                <p className="text-sm text-slate-900 bg-slate-50 p-3 rounded-xl border border-slate-100">
                                    {profile.gender === 'MALE' ? 'Laki-laki' : profile.gender === 'FEMALE' ? 'Perempuan' : profile.gender || '-'}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                                Tanggal Lahir
                            </label>
                            {isEditing ? (
                                <Input
                                    type="date"
                                    value={formData.birthDate}
                                    onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                                />
                            ) : (
                                <div className="flex items-center gap-2 text-sm text-slate-900 bg-slate-50 p-3 rounded-xl border border-slate-100">
                                    <Calendar className="h-4 w-4 text-slate-400 shrink-0" />
                                    <span>{profile.birthDate || '-'}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                    {isEditing ? (
                        <div className="flex items-center gap-2">
                            <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => setIsEditing(false)}
                                className="rounded-xl border-slate-200 text-xs"
                            >
                                Batal
                            </Button>
                            <Button 
                                size="sm"
                                onClick={handleSave} 
                                disabled={isSaving}
                                className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs gap-1.5 shadow-xs"
                            >
                                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                                Simpan Profil
                            </Button>
                        </div>
                    ) : (
                        <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setIsEditing(true)}
                            className="rounded-xl border-slate-200 text-xs gap-1.5 text-slate-700 hover:bg-slate-50"
                        >
                            <Edit2 className="h-3.5 w-3.5" />
                            Edit Profil
                        </Button>
                    )}

                    <Button 
                        variant="outline" 
                        size="sm"
                        onClick={handleLogout}
                        className="rounded-xl text-xs gap-1.5 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                    >
                        <LogOut className="h-3.5 w-3.5" />
                        Keluar Akun
                    </Button>
                </div>

                {/* Activity Stats Summary */}
                <div className="pt-4 border-t border-slate-100 grid grid-cols-2 gap-3 text-xs text-slate-500">
                    <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl">
                        <Clock className="h-4 w-4 text-slate-400" />
                        <div>
                            <span className="block text-[10px] text-slate-400">Bergabung</span>
                            <span className="font-semibold text-slate-700">{formatDate(profile.createdAt)}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl">
                        <ShoppingBag className="h-4 w-4 text-slate-400" />
                        <div>
                            <span className="block text-[10px] text-slate-400">Total Pesanan</span>
                            <span className="font-semibold text-slate-700">{profile._count?.orders || 0} kali</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
