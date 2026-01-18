'use client';

import { useEffect, useState } from 'react';
import { Users, Shield, Ban, Check, Loader2, RefreshCw } from 'lucide-react';
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
    createdAt: string;
    _count?: { orders: number };
}

export default function AdminUsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);

    const fetchUsers = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/admin/users');
            const data = await res.json();
            if (data.success) {
                setUsers(data.data);
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
        if (!confirm(`Ban pengguna "${name}"?`)) return;
        setProcessingId(id);
        try {
            const res = await fetch(`/api/admin/users/${id}/ban`, { method: 'PATCH' });
            const data = await res.json();
            if (data.success) {
                toast.success(data.message);
                fetchUsers();
            } else {
                toast.error(data.error);
            }
        } catch (error) {
            toast.error('Gagal mem-ban pengguna');
        } finally {
            setProcessingId(null);
        }
    };

    const handleUnban = async (id: string, name: string) => {
        if (!confirm(`Unban pengguna "${name}"?`)) return;
        setProcessingId(id);
        try {
            const res = await fetch(`/api/admin/users/${id}/unban`, { method: 'PATCH' });
            const data = await res.json();
            if (data.success) {
                toast.success(data.message);
                fetchUsers();
            } else {
                toast.error(data.error);
            }
        } catch (error) {
            toast.error('Gagal meng-unban pengguna');
        } finally {
            setProcessingId(null);
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Manajemen Pengguna</h1>
                <Button variant="outline" onClick={fetchUsers} disabled={isLoading}>
                    <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                    Refresh
                </Button>
            </div>

            <div className="rounded-md border border-slate-200 bg-white">
                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                    </div>
                ) : users.length === 0 ? (
                    <div className="text-center py-12 text-slate-500">
                        Tidak ada pengguna.
                    </div>
                ) : (
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-500 uppercase">
                            <tr>
                                <th className="px-6 py-3">Nama</th>
                                <th className="px-6 py-3">Email</th>
                                <th className="px-6 py-3">Role</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3">Orders</th>
                                <th className="px-6 py-3">Terdaftar</th>
                                <th className="px-6 py-3 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => (
                                <tr key={user.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                                    <td className="px-6 py-4 font-medium text-slate-900">
                                        <div className="flex items-center gap-2">
                                            {user.avatar ? (
                                                <img src={user.avatar} alt="" className="h-8 w-8 rounded-full" />
                                            ) : (
                                                <div className="h-8 w-8 bg-slate-100 rounded-full flex items-center justify-center">
                                                    <Users className="h-4 w-4 text-slate-500" />
                                                </div>
                                            )}
                                            {user.name}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">{user.email}</td>
                                    <td className="px-6 py-4">
                                        {user.role === 'ADMIN' ? (
                                            <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                                                <Shield className="h-3 w-3 mr-1" /> Admin
                                            </Badge>
                                        ) : (
                                            <Badge variant="secondary" className="bg-blue-50 text-blue-800">Customer</Badge>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <Badge
                                            variant="outline"
                                            className={user.status === 'ACTIVE' ? 'text-green-600 border-green-200' : 'text-red-600 border-red-200'}
                                        >
                                            {user.status}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-4">{user._count?.orders || 0}</td>
                                    <td className="px-6 py-4">{formatDate(user.createdAt)}</td>
                                    <td className="px-6 py-4 text-right">
                                        {user.role !== 'ADMIN' && (
                                            user.status === 'ACTIVE' ? (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                                    onClick={() => handleBan(user.id, user.name)}
                                                    disabled={processingId === user.id}
                                                >
                                                    {processingId === user.id ? (
                                                        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                                                    ) : (
                                                        <Ban className="h-4 w-4 mr-1" />
                                                    )}
                                                    Ban
                                                </Button>
                                            ) : (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-green-500 hover:text-green-600 hover:bg-green-50"
                                                    onClick={() => handleUnban(user.id, user.name)}
                                                    disabled={processingId === user.id}
                                                >
                                                    {processingId === user.id ? (
                                                        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                                                    ) : (
                                                        <Check className="h-4 w-4 mr-1" />
                                                    )}
                                                    Unban
                                                </Button>
                                            )
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
