import { getModuleWithItems } from '@/lib/actions/modules';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, BookOpen } from 'lucide-react';
import { ModuleEditor } from '@/components/admin/modules/module-editor';

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
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link
                    href="/admin/modules"
                    className="p-2.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-elegant"
                >
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center shadow-md">
                        <BookOpen className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">{moduleData.title}</h1>
                        <p className="text-sm text-muted-foreground">{moduleData.items.length} items</p>
                    </div>
                </div>
            </div>

            <ModuleEditor module={moduleData} />
        </div>
    );
}
