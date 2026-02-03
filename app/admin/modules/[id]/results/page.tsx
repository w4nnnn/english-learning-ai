import { getModuleById } from '@/lib/actions/modules';
import { getModuleStudentResults } from '@/lib/actions/user-progress';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Users, FileSpreadsheet } from 'lucide-react';
import { ExportResultsButton } from '@/components/admin/modules/export-results-button';
import { ResultsTable } from '@/components/admin/modules/results-table';

export default async function ModuleResultsPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const moduleData = await getModuleById(id);

    if (!moduleData) {
        notFound();
    }

    const results = await getModuleStudentResults(id);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Link
                        href={`/admin/modules/${id}`}
                        className="p-2.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-elegant"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center shadow-md">
                            <Users className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-foreground">Hasil Siswa</h1>
                            <p className="text-sm text-muted-foreground">{moduleData.title}</p>
                        </div>
                    </div>
                </div>

                {results.length > 0 && (
                    <ExportResultsButton 
                        moduleId={id} 
                        moduleTitle={moduleData.title} 
                        results={results}
                    />
                )}
            </div>

            {/* Results Table */}
            {results.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-elegant border border-border p-12 text-center">
                    <div className="w-20 h-20 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <Users className="w-10 h-10 text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">Belum Ada Hasil</h3>
                    <p className="text-muted-foreground">
                        Belum ada siswa yang mengerjakan modul ini.
                    </p>
                </div>
            ) : (
                <ResultsTable results={results} />
            )}
        </div>
    );
}
