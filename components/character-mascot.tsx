
'use client';

import { motion } from 'framer-motion';

interface CharacterMascotProps {
    mood: 'idle' | 'happy' | 'sad';
}

export function CharacterMascot({ mood }: CharacterMascotProps) {
    // Simple SVG or Emoji placeholder for now
    return (
        <div className="flex justify-center py-6">
            <motion.div
                animate={mood === 'happy' ? { rotate: [0, -10, 10, 0], y: [0, -20, 0] } : {}}
                transition={{ duration: 0.5 }}
                className="text-[100px] leading-none filter drop-shadow-xl"
            >
                {mood === 'idle' && '🦉'}
                {mood === 'happy' && '🤩'}
                {mood === 'sad' && '😢'}
            </motion.div>
        </div>
    );
}
