
'use client';

import { Heart } from 'lucide-react';
import { useGameStore } from '@/lib/actions/game-store';
import { motion } from 'framer-motion';

export function TopBar() {
    const { hearts, currentLessonIndex } = useGameStore();
    const totalLessons = 6; // Example total
    const progress = ((currentLessonIndex) / totalLessons) * 100;

    return (
        <header className="flex items-center gap-4 p-4 pt-6">
            {/* Progress Bar Container */}
            <div className="h-4 flex-1 overflow-hidden rounded-full bg-slate-200">
                <motion.div
                    className="h-full bg-green-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                />
            </div>

            {/* Hearts */}
            <div className="flex items-center gap-2 text-red-500">
                <Heart className="fill-current" size={28} />
                <span className="text-xl font-bold">{hearts}</span>
            </div>
        </header>
    );
}
