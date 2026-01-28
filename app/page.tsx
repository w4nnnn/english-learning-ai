import { getModules } from '@/lib/actions/modules';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { BookOpen, ChevronRight, Sparkles, Trophy, Target } from 'lucide-react';
import { AppHeader } from '@/components/layouts/app-header';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect('/login');
  }

  const modules = await getModules();

  return (
    <div className="min-h-screen bg-gradient-elegant">
      <AppHeader
        userName={session.user.name || 'User'}
        xp={150}
        showXp={true}
      />

      {/* Hero Section */}
      <section className="relative overflow-hidden py-12 sm:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              Welcome back, {session.user.name}!
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
              Continue Your
              <span className="text-gradient"> Learning Journey</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Pilih modul yang ingin kamu pelajari dan tingkatkan kemampuan bahasa Inggrismu
            </p>
          </div>
        </div>

        {/* Decorative blobs */}
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/10 rounded-full blur-3xl" />
      </section>

      {/* Stats Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 -mt-4 mb-8">
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-elegant border border-border text-center">
            <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center mx-auto mb-3">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-foreground">{modules.length}</p>
            <p className="text-sm text-muted-foreground">Modules</p>
          </div>
          <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-elegant border border-border text-center">
            <div className="w-12 h-12 bg-gradient-success rounded-xl flex items-center justify-center mx-auto mb-3">
              <Target className="w-6 h-6 text-white" />
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-foreground">0</p>
            <p className="text-sm text-muted-foreground">Completed</p>
          </div>
          <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-elegant border border-border text-center">
            <div className="w-12 h-12 bg-gradient-accent rounded-xl flex items-center justify-center mx-auto mb-3">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-foreground">150</p>
            <p className="text-sm text-muted-foreground">Total XP</p>
          </div>
        </div>
      </section>

      {/* Modules Grid */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-foreground">Available Modules</h2>
          <span className="text-sm text-muted-foreground">{modules.length} modules</span>
        </div>

        {modules.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-elegant border border-border p-12 text-center">
            <div className="w-20 h-20 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-6">
              <BookOpen className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">No Modules Yet</h3>
            <p className="text-muted-foreground">
              Belum ada modul yang tersedia. Hubungi admin untuk menambahkan modul.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {modules.map((module, index) => (
              <Link
                key={module.id}
                href={`/modules/${module.id}`}
                className="group bg-white rounded-2xl shadow-elegant border border-border p-6 hover-lift"
              >
                {/* Module Number Badge */}
                <div className="flex items-start justify-between mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-primary flex items-center justify-center text-white font-bold text-xl shadow-lg">
                    {index + 1}
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-elegant" />
                </div>

                {/* Module Info */}
                <h3 className="font-bold text-lg text-foreground mb-2 group-hover:text-primary transition-elegant">
                  {module.title}
                </h3>
                {module.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                    {module.description}
                  </p>
                )}

                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium text-foreground">0%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-primary rounded-full transition-all duration-500"
                      style={{ width: '0%' }}
                    />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
