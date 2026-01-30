'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { ArrowLeft, User, Heart, Zap, Flame, Shield, GraduationCap, BookOpen, Edit2, Eye, EyeOff, Save } from 'lucide-react';

interface ProfileClientProps {
    userName: string;
    userRole: string;
    xp: number;
    heartCount: number;
    streak: number;
}

const ROLE_CONFIG = {
    admin: { label: 'Admin', icon: Shield, color: 'text-red-600 bg-red-100' },
    guru: { label: 'Guru', icon: GraduationCap, color: 'text-blue-600 bg-blue-100' },
    murid: { label: 'Murid', icon: BookOpen, color: 'text-green-600 bg-green-100' },
};

export function ProfileClient({ userName, userRole, xp, heartCount, streak }: ProfileClientProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({ username: userName, password: '' });
    const [showPassword, setShowPassword] = useState(false);

    const roleConfig = ROLE_CONFIG[userRole as keyof typeof ROLE_CONFIG] || ROLE_CONFIG.murid;
    const RoleIcon = roleConfig.icon;

    const handleSave = async () => {
        if (!formData.username) {
            toast.error('Username harus diisi!');
            return;
        }

        startTransition(async () => {
            try {
                const { updateOwnProfile } = await import('@/lib/actions/users');
                await updateOwnProfile({
                    username: formData.username,
                    password: formData.password || undefined,
                });

                toast.success('Profile berhasil diupdate!');
                setIsEditing(false);
                setFormData({ username: formData.username, password: '' });
                router.refresh();
            } catch (error) {
                toast.error('Gagal update profile!');
            }
        });
    };

    return (
        <div className="min-h-screen bg-gradient-elegant">
            {/* Header */}
            <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-border">
                <div className="max-w-2xl mx-auto px-4 py-4">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/"
                            className="p-2 rounded-xl hover:bg-muted transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <h1 className="text-xl font-bold text-foreground">Profile</h1>
                    </div>
                </div>
            </header>

            {/* Content */}
            <main className="max-w-2xl mx-auto px-4 py-8">
                {/* Profile Card */}
                <div className="bg-card rounded-2xl border border-border shadow-elegant p-6 mb-6">
                    {/* Avatar & Basic Info */}
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-20 h-20 rounded-2xl bg-gradient-primary flex items-center justify-center text-white font-bold text-3xl shadow-lg">
                            {userName.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={formData.username}
                                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                    className="text-2xl font-bold text-foreground bg-transparent border-b-2 border-primary outline-none w-full"
                                />
                            ) : (
                                <h2 className="text-2xl font-bold text-foreground">{userName}</h2>
                            )}
                            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium mt-2 ${roleConfig.color}`}>
                                <RoleIcon className="w-4 h-4" />
                                {roleConfig.label}
                            </span>
                        </div>
                        {!isEditing && (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="p-2 rounded-xl hover:bg-muted transition-colors"
                            >
                                <Edit2 className="w-5 h-5 text-muted-foreground" />
                            </button>
                        )}
                    </div>

                    {/* Password Edit (only when editing) */}
                    {isEditing && (
                        <div className="mb-6 p-4 bg-muted/50 rounded-xl">
                            <label className="block text-sm font-medium mb-2">
                                Password Baru (kosongkan jika tidak ingin mengubah)
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full px-3 py-2 pr-10 border border-input rounded-lg focus:ring-2 focus:ring-primary outline-none bg-background"
                                    placeholder="Masukkan password baru..."
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Edit Actions */}
                    {isEditing && (
                        <div className="flex gap-2">
                            <button
                                onClick={() => {
                                    setIsEditing(false);
                                    setFormData({ username: userName, password: '' });
                                }}
                                className="flex-1 px-4 py-2 border border-input rounded-xl hover:bg-muted transition-colors"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={isPending}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 disabled:opacity-50 transition-colors"
                            >
                                <Save className="w-4 h-4" />
                                {isPending ? 'Menyimpan...' : 'Simpan'}
                            </button>
                        </div>
                    )}
                </div>

                {/* Stats Card */}
                <div className="bg-card rounded-2xl border border-border shadow-elegant p-6">
                    <h3 className="text-lg font-semibold text-foreground mb-4">Statistik</h3>
                    <div className="grid grid-cols-3 gap-4">
                        <div className="bg-red-50 rounded-xl p-4 text-center">
                            <Heart className="w-6 h-6 text-red-500 mx-auto mb-2" />
                            <p className="text-2xl font-bold text-red-600">{heartCount}</p>
                            <p className="text-xs text-red-600">Hearts</p>
                        </div>
                        <div className="bg-amber-50 rounded-xl p-4 text-center">
                            <Zap className="w-6 h-6 text-amber-500 mx-auto mb-2" />
                            <p className="text-2xl font-bold text-amber-600">{xp}</p>
                            <p className="text-xs text-amber-600">XP</p>
                        </div>
                        <div className="bg-orange-50 rounded-xl p-4 text-center">
                            <Flame className="w-6 h-6 text-orange-500 mx-auto mb-2" />
                            <p className="text-2xl font-bold text-orange-600">{streak}</p>
                            <p className="text-xs text-orange-600">Streak</p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
