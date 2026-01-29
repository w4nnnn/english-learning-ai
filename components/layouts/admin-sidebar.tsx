'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import {
    LayoutDashboard,
    BookOpen,
    Settings,
    LogOut,
    ChevronRight,
    Menu,
    X
} from 'lucide-react';
import { useState } from 'react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface AdminSidebarProps {
    userName?: string;
}

const navItems = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/modules', label: 'Modules', icon: BookOpen },
    { href: '/admin/settings', label: 'Settings', icon: Settings },
];

export function AdminSidebar({ userName = 'Admin' }: AdminSidebarProps) {
    const pathname = usePathname();
    const router = useRouter();
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    const handleSignOut = async () => {
        await signOut({ redirect: false });
        router.push('/login');
    };

    return (
        <>
            {/* Mobile Toggle */}
            <button
                onClick={() => setIsMobileOpen(!isMobileOpen)}
                className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-xl bg-sidebar text-sidebar-foreground shadow-elegant"
            >
                {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Backdrop */}
            {isMobileOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/50 z-40"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed lg:static inset-y-0 left-0 z-40
                w-72 bg-sidebar text-sidebar-foreground 
                flex flex-col
                transform transition-transform duration-300 ease-out
                ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                {/* Logo */}
                <div className="p-6 border-b border-sidebar-border">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center">
                            <span className="text-white font-bold">E</span>
                        </div>
                        <div>
                            <h1 className="font-bold text-lg">Admin Panel</h1>
                            <p className="text-xs text-sidebar-foreground/60">English Learning</p>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-1">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href ||
                            (item.href !== '/admin' && pathname.startsWith(item.href));

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setIsMobileOpen(false)}
                                className={`
                                    flex items-center gap-3 px-4 py-3 rounded-xl
                                    transition-elegant group
                                    ${isActive
                                        ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-md'
                                        : 'hover:bg-sidebar-accent text-sidebar-foreground/80 hover:text-sidebar-foreground'
                                    }
                                `}
                            >
                                <item.icon className="w-5 h-5" />
                                <span className="font-medium">{item.label}</span>
                                {isActive && (
                                    <ChevronRight className="w-4 h-4 ml-auto" />
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* User Section */}
                <div className="p-4 border-t border-sidebar-border">
                    <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-sidebar-accent/50 mb-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center text-white font-bold">
                            {userName.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{userName}</p>
                            <p className="text-xs text-sidebar-foreground/60">Administrator</p>
                        </div>
                    </div>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <button
                                className="w-full flex items-center gap-3 px-4 py-2 rounded-xl text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-elegant"
                            >
                                <LogOut className="w-4 h-4" />
                                <span className="text-sm">Sign Out</span>
                            </button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                                        <LogOut className="w-5 h-5 text-muted-foreground" />
                                    </div>
                                    <AlertDialogTitle>Sign Out</AlertDialogTitle>
                                </div>
                                <AlertDialogDescription className="pt-2">
                                    Are you sure you want to sign out? You will need to log in again to access the admin panel.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleSignOut}>
                                    Sign Out
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </aside>
        </>
    );
}
