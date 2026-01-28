
'use client';

import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface FooterProps {
    onCheck: () => void;
    status: 'idle' | 'correct' | 'wrong';
    isButtonDisabled?: boolean;
}

export function Footer({ onCheck, status, isButtonDisabled }: FooterProps) {

    const getButtonStyles = () => {
        switch (status) {
            case 'correct':
                return 'bg-green-500 border-green-600 hover:bg-green-400';
            case 'wrong':
                return 'bg-red-500 border-red-600 hover:bg-red-400';
            default:
                return 'bg-green-500 border-green-600 hover:bg-green-400';
        }
    };

    const getButtonText = () => {
        switch (status) {
            case 'correct':
                return 'LANJUTKAN';
            case 'wrong':
                return 'MENGERTI';
            default:
                return 'PERIKSA';
        }
    };

    return (
        <footer className={cn(
            "bg-white border-t p-4 pb-8",
            status === 'correct' && "bg-green-100 border-green-200",
            status === 'wrong' && "bg-red-100 border-red-200"
        )}>
            <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={onCheck}
                disabled={isButtonDisabled}
                className={cn(
                    "w-full rounded-2xl py-3 text-lg font-bold tracking-wide text-white shadow-[0_4px_0_0_rgb(0,0,0,0.2)] transition-all active:translate-y-[4px] active:shadow-none uppercase",
                    getButtonStyles(),
                    isButtonDisabled && "bg-slate-300 border-slate-400 text-slate-500 shadow-none pointer-events-none"
                )}
            >
                {getButtonText()}
            </motion.button>
        </footer>
    );
}
