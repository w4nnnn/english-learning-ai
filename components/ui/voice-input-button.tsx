'use client';

import { Mic, MicOff, Loader2 } from 'lucide-react';
import { useSpeechRecognition } from '@/hooks/use-speech-recognition';
import { cn } from '@/lib/utils';
import { useEffect } from 'react';

interface VoiceInputButtonProps {
    onTranscript: (text: string) => void;
    className?: string;
    size?: 'sm' | 'md' | 'lg';
}

export function VoiceInputButton({ onTranscript, className, size = 'md' }: VoiceInputButtonProps) {
    const {
        startListening,
        stopListening,
        transcript,
        interimTranscript,
        isListening,
        isSupported,
        error
    } = useSpeechRecognition();

    // Send transcript to parent when finalized
    useEffect(() => {
        if (transcript && !isListening) {
            onTranscript(transcript);
        }
    }, [transcript, isListening, onTranscript]);

    if (!isSupported) {
        return null;
    }

    const handleClick = () => {
        if (isListening) {
            stopListening();
        } else {
            startListening();
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
        <div className="relative inline-flex items-center gap-2">
            <button
                onClick={handleClick}
                className={cn(
                    'rounded-full transition-all duration-200',
                    'hover:bg-red-50 active:scale-95',
                    isListening
                        ? 'bg-red-100 text-red-600 animate-pulse ring-2 ring-red-300'
                        : 'text-muted-foreground hover:text-red-500',
                    sizeClasses[size],
                    className
                )}
                title={isListening ? 'Stop recording' : 'Voice input'}
                aria-label={isListening ? 'Stop recording' : 'Voice input'}
            >
                {isListening ? (
                    <MicOff className={iconSizes[size]} />
                ) : (
                    <Mic className={iconSizes[size]} />
                )}
            </button>

            {/* Interim transcript tooltip */}
            {isListening && interimTranscript && (
                <div className="absolute left-full ml-2 px-3 py-1.5 bg-slate-800 text-white text-sm rounded-lg whitespace-nowrap max-w-48 truncate animate-in fade-in slide-in-from-left-2">
                    {interimTranscript}...
                </div>
            )}

            {/* Error tooltip */}
            {error && (
                <div className="absolute left-full ml-2 px-3 py-1.5 bg-red-600 text-white text-xs rounded-lg whitespace-nowrap">
                    {error === 'not-allowed' ? 'Microphone blocked' : error}
                </div>
            )}
        </div>
    );
}
