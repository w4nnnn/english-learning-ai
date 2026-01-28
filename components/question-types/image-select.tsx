
'use client';

import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Image as ImageIcon } from 'lucide-react';

interface Option {
    id: string;
    label: string;
    image?: string;
}

interface ImageSelectProps {
    options: Option[];
    selectedOptionId: string | null;
    onSelect: (id: string) => void;
    disabled?: boolean;
}

export function ImageSelect({ options, selectedOptionId, onSelect, disabled }: ImageSelectProps) {
    return (
        <div className="grid grid-cols-2 gap-4">
            {options.map((option) => (
                <motion.button
                    key={option.id}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => !disabled && onSelect(option.id)}
                    className={cn(
                        "aspect-square rounded-2xl border-2 border-b-4 p-4 flex flex-col items-center justify-center gap-2 transition-all",
                        selectedOptionId === option.id
                            ? "border-sky-500 bg-sky-50 ring-2 ring-sky-500 ring-offset-2"
                            : "border-slate-200 bg-white hover:border-slate-300",
                        disabled && "cursor-default opacity-60"
                    )}
                >
                    {/* Placeholder Image Logic */}
                    {option.image ? (
                        <img src={option.image} alt={option.label} className="w-2/3 h-2/3 object-contain" />
                    ) : (
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-300">
                            <ImageIcon size={32} />
                        </div>
                    )}

                    <span className={cn(
                        "font-bold text-lg",
                        selectedOptionId === option.id ? "text-sky-600" : "text-slate-600"
                    )}>
                        {option.label}
                    </span>
                </motion.button>
            ))}
        </div>
    );
}
