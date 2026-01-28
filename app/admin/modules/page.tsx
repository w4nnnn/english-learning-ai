import { getModules } from '@/lib/actions/modules';
import Link from 'next/link';
import { Plus, Eye, EyeOff, Pencil, Trash2 } from 'lucide-react';
import { DeleteModuleButton, TogglePublishButton } from './module-actions';

export default async function ModulesPage() {
    const modules = await getModules(true);

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-slate-800">Modules</h1>
                <Link
                    href="/admin/modules/new"
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    New Module
                </Link>
            </div>

            {modules.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
                    <p className="text-slate-500 mb-4">No modules yet. Create your first module!</p>
                    <Link
                        href="/admin/modules/new"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        <Plus className="w-4 h-4" />
                        Create Module
                    </Link>
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="text-left px-6 py-3 text-sm font-medium text-slate-500">Order</th>
                                <th className="text-left px-6 py-3 text-sm font-medium text-slate-500">Title</th>
                                <th className="text-left px-6 py-3 text-sm font-medium text-slate-500">Status</th>
                                <th className="text-right px-6 py-3 text-sm font-medium text-slate-500">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {modules.map((module) => (
                                <tr key={module.id} className="hover:bg-slate-50">
                                    <td className="px-6 py-4 text-sm text-slate-600">{module.order}</td>
                                    <td className="px-6 py-4">
                                        <p className="font-medium text-slate-800">{module.title}</p>
                                        {module.description && (
                                            <p className="text-sm text-slate-500 truncate max-w-md">
                                                {module.description}
                                            </p>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        {module.isPublished ? (
                                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                                                <Eye className="w-3 h-3" />
                                                Published
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-full">
                                                <EyeOff className="w-3 h-3" />
                                                Draft
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-end gap-2">
                                            <TogglePublishButton
                                                moduleId={module.id}
                                                isPublished={module.isPublished ?? false}
                                            />
                                            <Link
                                                href={`/admin/modules/${module.id}`}
                                                className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="Edit"
                                            >
                                                <Pencil className="w-4 h-4" />
                                            </Link>
                                            <DeleteModuleButton moduleId={module.id} />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
