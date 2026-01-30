'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { signIn, getSession } from 'next-auth/react';
import { BookOpen, Sparkles } from 'lucide-react';

export default function LoginPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setIsLoading(true);

        const formData = new FormData(event.currentTarget);
        const username = formData.get('username') as string;
        const password = formData.get('password') as string;

        const result = await signIn('credentials', {
            username,
            password,
            redirect: false,
        });

        if (result?.error) {
            setIsLoading(false);
            toast.error("Login gagal. Periksa username dan password.");
        } else {
            toast.success("Login berhasil!");

            // Get session to check role
            const session = await getSession();
            const userRole = session?.user?.role;

            // Redirect based on role
            if (userRole === 'admin' || userRole === 'guru') {
                router.push('/admin');
            } else {
                router.push('/');
            }
            router.refresh();
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-animated p-4 relative overflow-hidden">
            {/* Decorative Elements */}
            <div className="absolute top-20 left-20 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
            <div className="absolute bottom-20 right-20 w-96 h-96 bg-accent/20 rounded-full blur-3xl" />

            {/* Login Card */}
            <div className="relative w-full max-w-md">
                {/* Glass Card */}
                <div className="glass rounded-3xl shadow-elegant-lg p-8 sm:p-10">
                    {/* Logo */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-primary rounded-2xl shadow-lg mb-4">
                            <BookOpen className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-2xl font-bold text-foreground">Welcome Back!</h1>
                        <p className="text-muted-foreground mt-1">
                            Masuk untuk melanjutkan belajar
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={onSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <Label htmlFor="username" className="text-foreground font-medium">
                                Username
                            </Label>
                            <Input
                                id="username"
                                name="username"
                                placeholder="Masukkan username"
                                required
                                disabled={isLoading}
                                className="h-12 rounded-xl border-border bg-background/50 focus-elegant"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-foreground font-medium">
                                Password
                            </Label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                placeholder="Masukkan password"
                                required
                                disabled={isLoading}
                                className="h-12 rounded-xl border-border bg-background/50 focus-elegant"
                            />
                        </div>
                        <Button
                            className="w-full h-12 rounded-xl bg-gradient-primary hover:opacity-90 text-white font-semibold shadow-lg hover:shadow-xl transition-elegant"
                            type="submit"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <span className="flex items-center gap-2">
                                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Memproses...
                                </span>
                            ) : (
                                <span className="flex items-center gap-2">
                                    <Sparkles className="w-4 h-4" />
                                    Masuk
                                </span>
                            )}
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
}

