'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Mail, Phone, Calendar, Edit2, LogOut, Loader2, Save } from 'lucide-react';
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
            toast.success('Berhasil logout');
            router.push('/login');
        } catch (error) {
            toast.error('Gagal logout');
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="container mx-auto px-4 py-8 text-center">
                <p className="text-slate-500">Profil tidak ditemukan</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-2xl">
            <h1 className="text-2xl font-bold text-slate-900 mb-6">Profil Saya</h1>

            <div className="bg-white rounded-lg border p-6 space-y-6">
                {/* Avatar & Name Header */}
                <div className="flex items-center gap-4 pb-6 border-b">
                    <div className="h-20 w-20 bg-blue-100 rounded-full flex items-center justify-center">
                        {profile.avatar ? (
                            <img src={profile.avatar} alt="" className="h-20 w-20 rounded-full object-cover" />
                        ) : (
                            <User className="h-10 w-10 text-blue-600" />
                        )}
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">{profile.name}</h2>
                        <p className="text-slate-500">{profile.email}</p>
                        <Badge className="mt-1">{profile.role}</Badge>
                    </div>
                </div>

                {/* Edit Form */}
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Nama Lengkap</label>
                        {isEditing ? (
                            <Input
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        ) : (
                            <p className="text-slate-900">{profile.name}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                        <p className="text-slate-500 flex items-center gap-2">
                            <Mail className="h-4 w-4" />
                            {profile.email}
                            <span className="text-xs text-slate-400">(tidak dapat diubah)</span>
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Nomor HP</label>
                        {isEditing ? (
                            <Input
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                placeholder="081234567890"
                            />
                        ) : (
                            <p className="text-slate-900 flex items-center gap-2">
                                <Phone className="h-4 w-4" />
                                {profile.phone || '-'}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Bio</label>
                        {isEditing ? (
                            <textarea
                                className="w-full border rounded-md px-3 py-2 text-sm"
                                value={formData.bio}
                                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                placeholder="Tentang kamu..."
                                rows={3}
                            />
                        ) : (
                            <p className="text-slate-900">{profile.bio || '-'}</p>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Jenis Kelamin</label>
                            {isEditing ? (
                                <select
                                    className="w-full border rounded-md px-3 py-2 text-sm"
                                    value={formData.gender}
                                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                                >
                                    <option value="">Pilih</option>
                                    <option value="MALE">Laki-laki</option>
                                    <option value="FEMALE">Perempuan</option>
                                    <option value="OTHER">Lainnya</option>
                                </select>
                            ) : (
                                <p className="text-slate-900">
                                    {profile.gender === 'MALE' ? 'Laki-laki' : profile.gender === 'FEMALE' ? 'Perempuan' : profile.gender || '-'}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Tanggal Lahir</label>
                            {isEditing ? (
                                <Input
                                    type="date"
                                    value={formData.birthDate}
                                    onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                                />
                            ) : (
                                <p className="text-slate-900 flex items-center gap-2">
                                    <Calendar className="h-4 w-4" />
                                    {profile.birthDate || '-'}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex justify-between pt-6 border-t">
                    {isEditing ? (
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={() => setIsEditing(false)}>Batal</Button>
                            <Button onClick={handleSave} disabled={isSaving}>
                                {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                                Simpan
                            </Button>
                        </div>
                    ) : (
                        <Button onClick={() => setIsEditing(true)}>
                            <Edit2 className="h-4 w-4 mr-2" />
                            Edit Profil
                        </Button>
                    )}

                    <Button variant="destructive" onClick={handleLogout}>
                        <LogOut className="h-4 w-4 mr-2" />
                        Logout
                    </Button>
                </div>

                {/* Stats */}
                <div className="pt-6 border-t text-sm text-slate-500">
                    <p>Bergabung sejak: {formatDate(profile.createdAt)}</p>
                    <p>Total pesanan: {profile._count?.orders || 0}</p>
                </div>
            </div>
        </div>
    );
}
