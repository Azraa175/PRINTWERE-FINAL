'use client';

import { useEffect, useState } from 'react';
import { 
    Users, 
    Shield, 
    Printer, 
    User as UserIcon, 
    Ban, 
    Check, 
    Loader2, 
    RefreshCw, 
    Search, 
    Calendar, 
    ShoppingBag, 
    CheckCircle2 
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatDate } from '@/lib/utils';
import { toast } from 'sonner';

interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    status: string;
    avatar?: string;
    phone?: string;
    createdAt: string;
    _count?: { orders: number };
}

export default function AdminUsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState('ALL');

    const fetchUsers = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/admin/users');
            const data = await res.json();
            if (data.success) {
                setUsers(data.data || []);
            } else {
                toast.error(data.error || 'Gagal memuat pengguna');
            }
        } catch (error) {
            toast.error('Gagal memuat pengguna');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleBan = async (id: string, name: string) => {
        if (!confirm(`Blokir (Ban) akun "${name}"? Pengguna tidak akan dapat login.`)) return;
        setProcessingId(id);
        try {
            const res = await fetch(`/api/admin/users/${id}/ban`, { method: 'PATCH' });
            const data = await res.json();
            if (data.success) {
                toast.success(data.message || 'Pengguna berhasil diblokir');
                fetchUsers();
            } else {
                toast.error(data.error || 'Gagal memblokir pengguna');
            }
        } catch (error) {
            toast.error('Gagal memblokir pengguna');
        } finally {
            setProcessingId(null);
        }
    };

    const handleUnban = async (id: string, name: string) => {
        if (!confirm(`Buka blokir (Unban) akun "${name}"?`)) return;
        setProcessingId(id);
        try {
            const res = await fetch(`/api/admin/users/${id}/unban`, { method: 'PATCH' });
            const data = await res.json();
            if (data.success) {
                toast.success(data.message || 'Pengguna berhasil diaktifkan kembali');
                fetchUsers();
            } else {
                toast.error(data.error || 'Gagal membuka blokir pengguna');
            }
        } catch (error) {
            toast.error('Gagal membuka blokir pengguna');
        } finally {
            setProcessingId(null);
        }
    };

    // Filter calculations
    const filteredUsers = users.filter((u) => {
        const matchesSearch = 
            u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (u.phone && u.phone.includes(searchQuery));
        const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
        return matchesSearch && matchesRole;
    });

    const stats = {
        total: users.length,
        admin: users.filter(u => u.role === 'ADMIN').length,
        staff: users.filter(u => u.role === 'STAFF').length,
        customer: users.filter(u => u.role === 'CUSTOMER' || (!['ADMIN', 'STAFF'].includes(u.role))).length,
        active: users.filter(u => u.status === 'ACTIVE').length,
    };

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">Manajemen Pengguna</h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Kelola akun pengguna, hak akses role (Admin, Staff, Customer), dan status keaktifan.
                    </p>
                </div>
                <Button 
                    variant="outline" 
                    size="sm"
                    onClick={fetchUsers} 
                    disabled={isLoading}
                    className="gap-2 rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 w-fit"
                >
                    <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                    Segarkan
                </Button>
            </div>

            {/* Quick Stat Counter Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3.5">
                    <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                        <Users className="h-5 w-5" />
                    </div>
                    <div>
                        <p className="text-xs text-slate-500 font-medium">Total Akun</p>
                        <p className="text-xl font-bold text-slate-900">{stats.total}</p>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3.5">
                    <div className="h-10 w-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                        <Shield className="h-5 w-5" />
                    </div>
                    <div>
                        <p className="text-xs text-slate-500 font-medium">Administrator</p>
                        <p className="text-xl font-bold text-slate-900">{stats.admin}</p>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3.5">
                    <div className="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                        <Printer className="h-5 w-5" />
                    </div>
                    <div>
                        <p className="text-xs text-slate-500 font-medium">Staf Produksi</p>
                        <p className="text-xl font-bold text-slate-900">{stats.staff}</p>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3.5">
                    <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="h-5 w-5" />
                    </div>
                    <div>
                        <p className="text-xs text-slate-500 font-medium">Pelanggan Aktif</p>
                        <p className="text-xl font-bold text-slate-900">{stats.customer}</p>
                    </div>
                </div>
            </div>

            {/* Search & Filter Bar */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Cari nama, email, atau no handphone..."
                        className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
                    />
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto">
                    <span className="text-xs font-semibold text-slate-400 whitespace-nowrap">Filter Role:</span>
                    <select
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                        className="text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    >
                        <option value="ALL">Semua Role</option>
                        <option value="ADMIN">Administrator</option>
                        <option value="STAFF">Staf Produksi</option>
                        <option value="CUSTOMER">Pelanggan (Customer)</option>
                    </select>
                </div>
            </div>

            {/* Users Table Card */}
            <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-16 gap-3">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                        <p className="text-xs text-slate-400">Memuat data pengguna...</p>
                    </div>
                ) : filteredUsers.length === 0 ? (
                    <div className="text-center py-16 px-4">
                        <Users className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                        <h3 className="text-base font-semibold text-slate-800">Tidak Ada Pengguna</h3>
                        <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
                            Tidak ditemukan akun pengguna yang cocok dengan kriteria pencarian Anda.
                        </p>
                        <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => { setSearchQuery(''); setRoleFilter('ALL'); }}
                            className="rounded-xl text-xs"
                        >
                            Reset Filter
                        </Button>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50/80 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-3.5">Pengguna</th>
                                    <th className="px-6 py-3.5">Email</th>
                                    <th className="px-6 py-3.5">Role</th>
                                    <th className="px-6 py-3.5">Status</th>
                                    <th className="px-6 py-3.5">Total Pesanan</th>
                                    <th className="px-6 py-3.5">Terdaftar</th>
                                    <th className="px-6 py-3.5 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredUsers.map((user) => {
                                    const isBanned = user.status === 'BANNED';
                                    const isAdmin = user.role === 'ADMIN';
                                    const isStaff = user.role === 'STAFF';

                                    return (
                                        <tr key={user.id} className="hover:bg-slate-50/70 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    {user.avatar ? (
                                                        <img 
                                                            src={user.avatar} 
                                                            alt={user.name} 
                                                            className="h-9 w-9 rounded-full object-cover border border-slate-200" 
                                                        />
                                                    ) : (
                                                        <div className="h-9 w-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-xs text-slate-700">
                                                            {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                                                        </div>
                                                    )}
                                                    <div>
                                                        <p className="font-semibold text-slate-900 leading-tight">
                                                            {user.name}
                                                        </p>
                                                        {user.phone && (
                                                            <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                                                                {user.phone}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-slate-600 font-mono text-xs">
                                                {user.email}
                                            </td>
                                            <td className="px-6 py-4">
                                                {isAdmin ? (
                                                    <Badge variant="secondary" className="bg-purple-50 text-purple-700 border border-purple-200 gap-1 text-xs">
                                                        <Shield className="h-3 w-3" /> Admin
                                                    </Badge>
                                                ) : isStaff ? (
                                                    <Badge variant="secondary" className="bg-indigo-50 text-indigo-700 border border-indigo-200 gap-1 text-xs">
                                                        <Printer className="h-3 w-3" /> Staff
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="secondary" className="bg-slate-100 text-slate-700 border border-slate-200 gap-1 text-xs">
                                                        <UserIcon className="h-3 w-3" /> Pelanggan
                                                    </Badge>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span 
                                                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                                                        isBanned 
                                                            ? 'bg-red-50 text-red-700 border-red-200' 
                                                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                                    }`}
                                                >
                                                    <span className={`h-1.5 w-1.5 rounded-full ${isBanned ? 'bg-red-500' : 'bg-emerald-500'}`} />
                                                    {isBanned ? 'Diblokir' : 'Aktif'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-slate-700 font-medium">
                                                <span className="inline-flex items-center gap-1.5">
                                                    <ShoppingBag className="h-3.5 w-3.5 text-slate-400" />
                                                    {user._count?.orders || 0}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-xs text-slate-500">
                                                <span className="inline-flex items-center gap-1">
                                                    <Calendar className="h-3.5 w-3.5 text-slate-400" />
                                                    {formatDate(user.createdAt)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                {!isAdmin && (
                                                    isBanned ? (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="text-emerald-700 border-emerald-200 hover:bg-emerald-50 rounded-xl text-xs gap-1.5 h-8"
                                                            onClick={() => handleUnban(user.id, user.name)}
                                                            disabled={processingId === user.id}
                                                            title="Buka blokir akun pengguna"
                                                        >
                                                            {processingId === user.id ? (
                                                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                            ) : (
                                                                <Check className="h-3.5 w-3.5" />
                                                            )}
                                                            Aktifkan
                                                        </Button>
                                                    ) : (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="text-red-600 border-red-200 hover:bg-red-50 rounded-xl text-xs gap-1.5 h-8"
                                                            onClick={() => handleBan(user.id, user.name)}
                                                            disabled={processingId === user.id}
                                                            title="Blokir akun pengguna"
                                                        >
                                                            {processingId === user.id ? (
                                                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                            ) : (
                                                                <Ban className="h-3.5 w-3.5" />
                                                            )}
                                                            Blokir
                                                        </Button>
                                                    )
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
