import { AdminSidebar } from '@/components/layout/AdminSidebar';
import { AdminHeader } from '@/components/layout/AdminHeader';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-slate-50">
            <AdminSidebar />
            <div className="transition-all duration-300 md:pl-64">
                <AdminHeader />
                <main className="p-4 md:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
