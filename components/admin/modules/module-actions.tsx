'use client';

import { deleteModule, toggleModulePublish } from '@/lib/actions/modules';
import { Trash2, Eye, EyeOff } from 'lucide-react';
import { useTransition } from 'react';
import { toast } from 'sonner';

export function DeleteModuleButton({ moduleId }: { moduleId: string }) {
    const [isPending, startTransition] = useTransition();

    const handleDelete = () => {
        if (!confirm('Are you sure you want to delete this module? This action cannot be undone.')) {
            return;
        }

        startTransition(async () => {
            await deleteModule(moduleId);
            toast.success('Module deleted');
        });
    };

    return (
        <button
            onClick={handleDelete}
            disabled={isPending}
            className="p-2.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition-elegant disabled:opacity-50"
            title="Delete"
        >
            <Trash2 className="w-4 h-4" />
        </button>
    );
}

export function TogglePublishButton({
    moduleId,
    isPublished,
}: {
    moduleId: string;
    isPublished: boolean;
}) {
    const [isPending, startTransition] = useTransition();

    const handleToggle = () => {
        startTransition(async () => {
            await toggleModulePublish(moduleId);
            toast.success(isPublished ? 'Module unpublished' : 'Module published');
        });
    };

    return (
        <button
            onClick={handleToggle}
            disabled={isPending}
            className={`p-2.5 rounded-xl transition-elegant disabled:opacity-50 ${isPublished
                    ? 'text-green-600 hover:bg-green-50'
                    : 'text-muted-foreground hover:text-primary hover:bg-primary/10'
                }`}
            title={isPublished ? 'Unpublish' : 'Publish'}
        >
            {isPublished ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
        </button>
    );
}
