
'use client';

import { SessionProvider, useSession, signOut } from 'next-auth/react';
import { useAuthStore } from '@/store/authStore';
import { useEffect } from 'react';
import { toast } from 'sonner';

// Component to sync session with auth store and handle banned status
function UserSync() {
    const { data: session, status } = useSession();
    const { user, login, logout } = useAuthStore();

    useEffect(() => {
        if (status === 'authenticated' && session?.user) {
            // Check if user info in store matches or is missing
            if (!user || user.email !== session.user.email) {
                // Fetch full profile to ensure we have latest status/role
                fetch('/api/user/profile')
                    .then(res => res.json())
                    .then(data => {
                        if (data.success) {
                            if (data.data.status === 'BANNED') {
                                toast.error('Akun Anda telah dibanned. Menghapus sesi...');
                                logout();
                                signOut({ callbackUrl: '/login' });
                            } else {
                                login({
                                    id: data.data.id,
                                    name: data.data.name,
                                    email: data.data.email,
                                    role: data.data.role,
                                    avatar: data.data.avatar,
                                }, 'session-token');
                            }
                        } else if (data.error === 'Account is banned') {
                            toast.error('Akun Anda telah diblocked.');
                            logout();
                            signOut({ callbackUrl: '/login' });
                        }
                    })
                    .catch(err => console.error('User sync failed', err));
            }
        } else if (status === 'unauthenticated' && user) {
            // Session expired but store still has user
            logout();
        }
    }, [session, status, user, login, logout]);

    return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <SessionProvider>
            <UserSync />
            {children}
        </SessionProvider>
    );
}
