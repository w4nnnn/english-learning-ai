
'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '@/lib/utils';

interface SortableWordProps {
    id: string;
    word: string;
    disabled?: boolean;
    isOverlay?: boolean;
}

export function SortableWord({ id, word, disabled, isOverlay }: SortableWordProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id, disabled });

    const style = {
        transform: CSS.Translate.toString(transform),
        transition,
    };

    // If it's the overlay dragging item, we usually want to remove the transform from the style 
    // because DragOverlay handles positioning. 
    // And remove transition to make it snappy.
    const overlayStyle = isOverlay ? {} : style;

    return (
        <div
            ref={setNodeRef}
            style={overlayStyle}
            {...attributes}
            {...listeners}
            className={cn(
                "bg-white border-b-4 border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-700 shadow-sm touch-none select-none cursor-grab active:cursor-grabbing",
                isDragging && "opacity-0", // Hide original when dragging (overlay takes place)
                disabled && "opacity-50 cursor-default",
                isOverlay && "opacity-100 scale-105 shadow-xl rotate-2 z-50 cursor-grabbing border-b-blue-200"
            )}
        >
            {word}
        </div>
    );
}
