'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { LogOut, Zap, User } from 'lucide-react';
import { useState } from 'react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface AppHeaderProps {
    userName?: string;
    xp?: number;
    showXp?: boolean;
}

export function AppHeader({ userName = 'User', xp = 0, showXp = true }: AppHeaderProps) {
    const router = useRouter();
    const [showSignOutDialog, setShowSignOutDialog] = useState(false);

    const handleSignOut = async () => {
        await signOut({ redirect: false });
        router.push('/login');
    };

    return (
        <>
            <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-border">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
                    <div className="flex items-center justify-between">
                        {/* Logo */}
                        <Link href="/" className="flex items-center gap-3 group">
                            <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-md group-hover:shadow-lg transition-elegant">
                                <span className="text-white font-bold text-lg">E</span>
                            </div>
                            <div className="hidden sm:block">
                                <h1 className="font-bold text-foreground">English Learning</h1>
                                <p className="text-xs text-muted-foreground">Learn with joy</p>
                            </div>
                        </Link>

                        {/* Right Side */}
                        <div className="flex items-center gap-4">
                            {/* XP Badge */}
                            {showXp && (
                                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-accent text-accent-foreground font-semibold shadow-sm">
                                    <Zap className="w-4 h-4" />
                                    <span>{xp} XP</span>
                                </div>
                            )}

                            {/* User Menu */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-muted transition-elegant">
                                        <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center text-white font-medium text-sm">
                                            {userName.charAt(0).toUpperCase()}
                                        </div>
                                        <span className="hidden sm:block font-medium text-foreground">
                                            {userName}
                                        </span>
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48">
                                    <DropdownMenuItem asChild>
                                        <Link href="/profile" className="cursor-pointer">
                                            <User className="w-4 h-4 mr-2" />
                                            Profile
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        onClick={() => setShowSignOutDialog(true)}
                                        className="cursor-pointer text-destructive focus:text-destructive"
                                    >
                                        <LogOut className="w-4 h-4 mr-2" />
                                        Sign Out
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </div>
            </header>

            {/* Sign Out Dialog */}
            <AlertDialog open={showSignOutDialog} onOpenChange={setShowSignOutDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                                <LogOut className="w-5 h-5 text-muted-foreground" />
                            </div>
                            <AlertDialogTitle>Sign Out</AlertDialogTitle>
                        </div>
                        <AlertDialogDescription className="pt-2">
                            Are you sure you want to sign out? You will need to log in again to continue learning.
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
        </>
    );
}
