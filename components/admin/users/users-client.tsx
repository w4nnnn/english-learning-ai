'use client';

import { useState, useTransition, useEffect } from 'react';
import { toast } from 'sonner';
import {
    Plus,
    Trash2,
    Edit2,
    RefreshCw,
    User,
    Heart,
    Zap,
    Flame,
    X,
    Check,
    Eye,
    EyeOff,
    Shield,
    GraduationCap,
    BookOpen,
} from 'lucide-react';
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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

interface User {
    id: string;
    username: string;
    role: string | null;
    heartCount: number | null;
    xp: number | null;
    streak: number | null;
    lastActive: Date | null;
}

interface UsersClientProps {
    initialUsers: User[];
}

const ROLES = [
    { value: 'admin', label: 'Admin', icon: Shield, color: 'text-red-600 bg-red-100' },
    { value: 'guru', label: 'Guru', icon: GraduationCap, color: 'text-blue-600 bg-blue-100' },
    { value: 'murid', label: 'Murid', icon: BookOpen, color: 'text-green-600 bg-green-100' },
];

export function UsersClient({ initialUsers }: UsersClientProps) {
    const [users, setUsers] = useState(initialUsers);
    const [isPending, startTransition] = useTransition();
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [formData, setFormData] = useState({ username: '', password: '', role: 'murid' });
    const [showPassword, setShowPassword] = useState(false);

    const handleCreate = async () => {
        if (!formData.username || !formData.password) {
            toast.error('Username dan password harus diisi!');
            return;
        }

        startTransition(async () => {
            try {
                const { createUser } = await import('@/lib/actions/users');
                const result = await createUser({
                    username: formData.username,
                    password: formData.password,
                    role: formData.role,
                });
                setUsers([...users, {
                    id: result.id,
                    username: formData.username,
                    role: formData.role,
                    heartCount: 5,
                    xp: 0,
                    streak: 0,
                    lastActive: null,
                }]);
                setFormData({ username: '', password: '', role: 'murid' });
                setIsCreateDialogOpen(false);
                toast.success('User berhasil dibuat!');
            } catch (error) {
                toast.error('Gagal membuat user!');
            }
        });
    };

    const handleUpdate = async () => {
        if (!editingUser) return;

        startTransition(async () => {
            try {
                const { updateUser } = await import('@/lib/actions/users');
                await updateUser(editingUser.id, {
                    username: formData.username || undefined,
                    password: formData.password || undefined,
                    role: formData.role || undefined,
                });
                setUsers(users.map(u =>
                    u.id === editingUser.id
                        ? { ...u, username: formData.username || u.username, role: formData.role || u.role }
                        : u
                ));
                setEditingUser(null);
                setFormData({ username: '', password: '', role: 'murid' });
                toast.success('User berhasil diupdate!');
            } catch (error) {
                toast.error('Gagal update user!');
            }
        });
    };

    const handleDelete = async (id: string) => {
        startTransition(async () => {
            try {
                const { deleteUser } = await import('@/lib/actions/users');
                await deleteUser(id);
                setUsers(users.filter(u => u.id !== id));
                toast.success('User berhasil dihapus!');
            } catch (error) {
                toast.error('Gagal menghapus user!');
            }
        });
    };

    const handleResetProgress = async (id: string) => {
        startTransition(async () => {
            try {
                const { resetUserProgress } = await import('@/lib/actions/users');
                await resetUserProgress(id);
                setUsers(users.map(u =>
                    u.id === id
                        ? { ...u, heartCount: 5, xp: 0, streak: 0 }
                        : u
                ));
                toast.success('Progress user berhasil direset!');
            } catch (error) {
                toast.error('Gagal reset progress!');
            }
        });
    };

    const openEditDialog = (user: User) => {
        setEditingUser(user);
        setFormData({ username: user.username, password: '', role: user.role || 'murid' });
    };

    return (
        <div className="p-6 lg:p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">User Management</h1>
                    <p className="text-muted-foreground mt-1">Kelola user dan progress pembelajaran</p>
                </div>
                <button
                    onClick={() => setIsCreateDialogOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors shadow-elegant"
                >
                    <Plus className="w-5 h-5" />
                    <span className="hidden sm:inline">Tambah User</span>
                </button>
            </div>

            {/* Users Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {users.map((user) => (
                    <div
                        key={user.id}
                        className="bg-card rounded-2xl border border-border shadow-elegant p-5 hover:shadow-elegant-lg transition-all"
                    >
                        {/* User Header */}
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center text-white font-bold text-lg">
                                {user.username.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <h3 className="font-semibold text-foreground truncate">{user.username}</h3>
                                    {(() => {
                                        const roleConfig = ROLES.find(r => r.value === user.role) || ROLES[2];
                                        const RoleIcon = roleConfig.icon;
                                        return (
                                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${roleConfig.color}`}>
                                                <RoleIcon className="w-3 h-3" />
                                                {roleConfig.label}
                                            </span>
                                        );
                                    })()}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    {user.lastActive
                                        ? `Aktif: ${new Date(user.lastActive).toLocaleDateString('id-ID')}`
                                        : 'Belum pernah aktif'
                                    }
                                </p>
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-2 mb-4">
                            <div className="bg-red-50 rounded-lg p-2 text-center">
                                <Heart className="w-4 h-4 text-red-500 mx-auto mb-1" />
                                <p className="text-sm font-bold text-red-600">{user.heartCount ?? 0}</p>
                            </div>
                            <div className="bg-amber-50 rounded-lg p-2 text-center">
                                <Zap className="w-4 h-4 text-amber-500 mx-auto mb-1" />
                                <p className="text-sm font-bold text-amber-600">{user.xp ?? 0}</p>
                            </div>
                            <div className="bg-orange-50 rounded-lg p-2 text-center">
                                <Flame className="w-4 h-4 text-orange-500 mx-auto mb-1" />
                                <p className="text-sm font-bold text-orange-600">{user.streak ?? 0}</p>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                            <button
                                onClick={() => openEditDialog(user)}
                                className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
                            >
                                <Edit2 className="w-4 h-4" />
                                Edit
                            </button>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <button className="flex items-center justify-center gap-1 px-3 py-2 text-sm bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 transition-colors">
                                        <RefreshCw className="w-4 h-4" />
                                    </button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Reset Progress?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Progress {user.username} akan direset (Hearts: 5, XP: 0, Streak: 0).
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Batal</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => handleResetProgress(user.id)}>
                                            Reset
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <button className="flex items-center justify-center gap-1 px-3 py-2 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Hapus User?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            User {user.username} akan dihapus permanen beserta semua progressnya.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Batal</AlertDialogCancel>
                                        <AlertDialogAction
                                            onClick={() => handleDelete(user.id)}
                                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                        >
                                            Hapus
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    </div>
                ))}

                {users.length === 0 && (
                    <div className="col-span-full text-center py-12">
                        <User className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">Belum ada user. Klik &quot;Tambah User&quot; untuk membuat.</p>
                    </div>
                )}
            </div>

            {/* Create Dialog */}
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Tambah User Baru</DialogTitle>
                        <DialogDescription>Buat akun baru untuk user.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Username</label>
                            <input
                                type="text"
                                value={formData.username}
                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-primary outline-none"
                                placeholder="Masukkan username..."
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full px-3 py-2 pr-10 border border-input rounded-lg focus:ring-2 focus:ring-primary outline-none"
                                    placeholder="Masukkan password..."
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
                        <div>
                            <label className="block text-sm font-medium mb-2">Role</label>
                            <Select
                                value={formData.role}
                                onValueChange={(value) => setFormData({ ...formData, role: value })}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Pilih role..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {ROLES.map((role) => {
                                        const RoleIcon = role.icon;
                                        return (
                                            <SelectItem key={role.value} value={role.value}>
                                                <div className="flex items-center gap-2">
                                                    <RoleIcon className="w-4 h-4" />
                                                    <span>{role.label}</span>
                                                </div>
                                            </SelectItem>
                                        );
                                    })}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <button
                            onClick={() => setIsCreateDialogOpen(false)}
                            className="px-4 py-2 text-sm border border-input rounded-lg hover:bg-muted transition-colors"
                        >
                            Batal
                        </button>
                        <button
                            onClick={handleCreate}
                            disabled={isPending}
                            className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors"
                        >
                            {isPending ? 'Menyimpan...' : 'Simpan'}
                        </button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit User</DialogTitle>
                        <DialogDescription>Update informasi user.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Username</label>
                            <input
                                type="text"
                                value={formData.username}
                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-primary outline-none"
                                placeholder="Masukkan username..."
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Password Baru (kosongkan jika tidak ingin mengubah)</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full px-3 py-2 pr-10 border border-input rounded-lg focus:ring-2 focus:ring-primary outline-none"
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
                        <div>
                            <label className="block text-sm font-medium mb-2">Role</label>
                            <Select
                                value={formData.role}
                                onValueChange={(value) => setFormData({ ...formData, role: value })}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Pilih role..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {ROLES.map((role) => {
                                        const RoleIcon = role.icon;
                                        return (
                                            <SelectItem key={role.value} value={role.value}>
                                                <div className="flex items-center gap-2">
                                                    <RoleIcon className="w-4 h-4" />
                                                    <span>{role.label}</span>
                                                </div>
                                            </SelectItem>
                                        );
                                    })}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <button
                            onClick={() => setEditingUser(null)}
                            className="px-4 py-2 text-sm border border-input rounded-lg hover:bg-muted transition-colors"
                        >
                            Batal
                        </button>
                        <button
                            onClick={handleUpdate}
                            disabled={isPending}
                            className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors"
                        >
                            {isPending ? 'Menyimpan...' : 'Simpan'}
                        </button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
