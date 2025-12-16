'use client';

import { Users, Shield, Ban } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

const MOCK_USERS = [
    { id: 1, name: 'Admin User', email: 'admin@printwere.com', role: 'ADMIN', status: 'ACTIVE' },
    { id: 2, name: 'Budi Santoso', email: 'budi@gmail.com', role: 'CUSTOMER', status: 'ACTIVE' },
    { id: 3, name: 'Siti Aminah', email: 'siti@yahoo.com', role: 'CUSTOMER', status: 'ACTIVE' },
    { id: 4, name: 'Spammer Account', email: 'spam@bot.com', role: 'CUSTOMER', status: 'BANNED' },
];

export default function AdminUsersPage() {
    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Manajemen Pengguna</h1>

            <div className="rounded-md border border-slate-200 bg-white">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-500 uppercase">
                        <tr>
                            <th className="px-6 py-3">Nama</th>
                            <th className="px-6 py-3">Email</th>
                            <th className="px-6 py-3">Role</th>
                            <th className="px-6 py-3">Status</th>
                            <th className="px-6 py-3 text-right">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {MOCK_USERS.map((user) => (
                            <tr key={user.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                                <td className="px-6 py-4 font-medium text-slate-900">
                                    <div className="flex items-center gap-2">
                                        <div className="h-8 w-8 bg-slate-100 rounded-full flex items-center justify-center">
                                            <Users className="h-4 w-4 text-slate-500" />
                                        </div>
                                        {user.name}
                                    </div>
                                </td>
                                <td className="px-6 py-4">{user.email}</td>
                                <td className="px-6 py-4">
                                    {user.role === 'ADMIN' ? (
                                        <Badge variant="secondary" className="bg-purple-100 text-purple-800">Admin</Badge>
                                    ) : (
                                        <Badge variant="secondary" className="bg-blue-50 text-blue-800">Customer</Badge>
                                    )}
                                </td>
                                <td className="px-6 py-4">
                                    <Badge variant="outline" className={user.status === 'ACTIVE' ? 'text-green-600 border-green-200' : 'text-red-600 border-red-200'}>
                                        {user.status}
                                    </Badge>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-50">
                                        <Ban className="h-4 w-4 mr-1" /> Ban
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
