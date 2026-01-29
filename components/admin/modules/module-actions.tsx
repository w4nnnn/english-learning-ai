'use client';

import { deleteModule, toggleModulePublish } from '@/lib/actions/modules';
import { Trash2, Eye, EyeOff, AlertTriangle } from 'lucide-react';
import { useTransition } from 'react';
import { toast } from 'sonner';
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

export function DeleteModuleButton({ moduleId }: { moduleId: string }) {
    const [isPending, startTransition] = useTransition();

    const handleDelete = () => {
        startTransition(async () => {
            await deleteModule(moduleId);
            toast.success('Module deleted');
        });
    };

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <button
                    disabled={isPending}
                    className="p-2.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition-elegant disabled:opacity-50"
                    title="Delete"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
                            <AlertTriangle className="w-5 h-5 text-destructive" />
                        </div>
                        <AlertDialogTitle>Delete Module</AlertDialogTitle>
                    </div>
                    <AlertDialogDescription className="pt-2">
                        Are you sure you want to delete this module? This action cannot be undone
                        and all associated items will be permanently removed.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleDelete}
                        className="bg-destructive hover:bg-destructive/90"
                    >
                        {isPending ? 'Deleting...' : 'Delete Module'}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
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
