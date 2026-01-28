import { getModules } from '@/lib/actions/modules';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { BookOpen, ChevronRight, Lock, CheckCircle } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect('/login');
  }

  const modules = await getModules(); // Only published modules

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-slate-800">English Learning</h1>
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <span>👋 {session.user.name}</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Pilih Modul</h2>
        <p className="text-slate-500 mb-6">Pilih modul yang ingin kamu pelajari</p>

        {modules.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">Belum ada modul yang tersedia.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {modules.map((module, index) => (
              <Link
                key={module.id}
                href={`/modules/${module.id}`}
                className="block bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-md hover:border-blue-300 transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-800 group-hover:text-blue-600 transition-colors">
                      {module.title}
                    </h3>
                    {module.description && (
                      <p className="text-sm text-slate-500 mt-1">
                        {module.description}
                      </p>
                    )}
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
