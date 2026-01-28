import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { AdminSidebar } from '@/components/layouts/admin-sidebar';

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getServerSession(authOptions);
    if (!session) {
        redirect('/login');
    }

    return (
        <div className="min-h-screen flex bg-gradient-elegant">
            <AdminSidebar userName={session.user?.name || 'Admin'} />

            {/* Main Content */}
            <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto lg:ml-0">
                <div className="max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
