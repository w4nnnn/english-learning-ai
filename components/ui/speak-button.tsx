'use client';

import { Volume2, VolumeX } from 'lucide-react';
import { useSpeech } from '@/hooks/use-speech';
import { cn } from '@/lib/utils';

interface SpeakButtonProps {
    text: string;
    className?: string;
    size?: 'sm' | 'md' | 'lg';
}

export function SpeakButton({ text, className, size = 'md' }: SpeakButtonProps) {
    const { speak, stop, isSpeaking, isSupported } = useSpeech();

    if (!isSupported) {
        return null;
    }

    const handleClick = () => {
        if (isSpeaking) {
            stop();
        } else {
            // Strip markdown formatting for cleaner speech
            const cleanText = text
                .replace(/[*_~`#]/g, '')
                .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
                .replace(/\n+/g, '. ');
            speak(cleanText);
        }
    };

    const sizeClasses = {
        sm: 'p-1.5',
        md: 'p-2',
        lg: 'p-3',
    };

    const iconSizes = {
        sm: 'w-3.5 h-3.5',
        md: 'w-4 h-4',
        lg: 'w-5 h-5',
    };

    return (
        <button
            onClick={handleClick}
            className={cn(
                'rounded-full transition-all duration-200',
                'hover:bg-primary/10 active:scale-95',
                isSpeaking
                    ? 'bg-primary/20 text-primary animate-pulse'
                    : 'text-muted-foreground hover:text-primary',
                sizeClasses[size],
                className
            )}
            title={isSpeaking ? 'Stop speaking' : 'Read aloud'}
            aria-label={isSpeaking ? 'Stop speaking' : 'Read aloud'}
        >
            {isSpeaking ? (
                <VolumeX className={iconSizes[size]} />
            ) : (
                <Volume2 className={iconSizes[size]} />
            )}
        </button>
    );
}
