import { getModuleWithItems } from '@/lib/actions/modules';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { ModuleEditor } from './module-editor';

export default async function EditModulePage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const moduleData = await getModuleWithItems(id);

    if (!moduleData) {
        notFound();
    }

    return (
        <div>
            <div className="flex items-center gap-4 mb-6">
                <Link
                    href="/admin/modules"
                    className="p-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">{moduleData.title}</h1>
                    <p className="text-sm text-slate-500">{moduleData.items.length} items</p>
                </div>
            </div>

            <ModuleEditor module={moduleData} />
        </div>
    );
}
