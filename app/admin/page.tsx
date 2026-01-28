import { getModules } from '@/lib/actions/modules';
import Link from 'next/link';
import { BarChart3, BookOpen, Plus, TrendingUp, Users } from 'lucide-react';

export default async function AdminDashboard() {
    const modules = await getModules(true);
    const publishedCount = modules.filter(m => m.isPublished).length;

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
                <p className="text-muted-foreground mt-1">Welcome to the admin panel</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-2xl shadow-elegant border border-border p-6 hover-lift">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-primary flex items-center justify-center">
                            <BookOpen className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Total Modules</p>
                            <p className="text-3xl font-bold text-foreground">{modules.length}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-elegant border border-border p-6 hover-lift">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-success flex items-center justify-center">
                            <BarChart3 className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Published</p>
                            <p className="text-3xl font-bold text-foreground">{publishedCount}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-elegant border border-border p-6 hover-lift">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-accent flex items-center justify-center">
                            <TrendingUp className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Draft</p>
                            <p className="text-3xl font-bold text-foreground">{modules.length - publishedCount}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-elegant border border-border p-6 hover-lift">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                            <Users className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Active Users</p>
                            <p className="text-3xl font-bold text-foreground">0</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-elegant border border-border overflow-hidden">
                <div className="p-6 border-b border-border">
                    <h2 className="text-xl font-bold text-foreground">Quick Actions</h2>
                    <p className="text-sm text-muted-foreground mt-1">Common tasks and shortcuts</p>
                </div>
                <div className="p-6">
                    <div className="flex flex-wrap gap-4">
                        <Link
                            href="/admin/modules/new"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-primary text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-elegant"
                        >
                            <Plus className="w-5 h-5" />
                            Create New Module
                        </Link>
                        <Link
                            href="/admin/modules"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-white border-2 border-border text-foreground font-semibold rounded-xl hover:bg-muted hover:border-primary/30 transition-elegant"
                        >
                            <BookOpen className="w-5 h-5" />
                            Manage Modules
                        </Link>
                    </div>
                </div>
            </div>

            {/* Recent Modules */}
            <div className="bg-white rounded-2xl shadow-elegant border border-border overflow-hidden">
                <div className="p-6 border-b border-border flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-foreground">Recent Modules</h2>
                        <p className="text-sm text-muted-foreground mt-1">Your latest created modules</p>
                    </div>
                    <Link
                        href="/admin/modules"
                        className="text-sm text-primary hover:underline font-medium"
                    >
                        View all
                    </Link>
                </div>
                <div className="divide-y divide-border">
                    {modules.slice(0, 5).map((module) => (
                        <Link
                            key={module.id}
                            href={`/admin/modules/${module.id}`}
                            className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-elegant"
                        >
                            <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center text-white font-bold">
                                {module.title.charAt(0)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-medium text-foreground truncate">{module.title}</p>
                                <p className="text-sm text-muted-foreground">
                                    {module.isPublished ? '🟢 Published' : '🟡 Draft'}
                                </p>
                            </div>
                        </Link>
                    ))}
                    {modules.length === 0 && (
                        <div className="p-8 text-center text-muted-foreground">
                            No modules yet. Create your first module!
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
