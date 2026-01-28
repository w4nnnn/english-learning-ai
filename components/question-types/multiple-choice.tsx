
'use client';

import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface Option {
    id: string;
    label: string;
}

interface MultipleChoiceProps {
    options: Option[];
    selectedOptionId: string | null;
    onSelect: (id: string) => void;
    disabled?: boolean;
}

export function MultipleChoice({ options, selectedOptionId, onSelect, disabled }: MultipleChoiceProps) {
    return (
        <div className="grid gap-3">
            {options.map((option, index) => (
                <motion.button
                    key={option.id}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => !disabled && onSelect(option.id)}
                    className={cn(
                        "w-full p-4 rounded-xl border-2 border-b-4 text-left font-medium transition-colors text-lg",
                        selectedOptionId === option.id
                            ? "border-sky-500 bg-sky-100 text-sky-700"
                            : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
                        disabled && "cursor-default opacity-80"
                    )}
                >
                    <div className="flex items-center gap-3">
                        <div className={cn(
                            "w-8 h-8 rounded-lg border-2 flex items-center justify-center text-sm font-bold",
                            selectedOptionId === option.id
                                ? "border-sky-500 bg-sky-500 text-white"
                                : "border-slate-300 text-slate-400"
                        )}>
                            {index + 1}
                        </div>
                        {option.label}
                    </div>
                </motion.button>
            ))}
        </div>
    );
}
