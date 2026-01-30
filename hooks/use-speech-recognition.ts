'use client';

import { useState, useCallback, useEffect, useRef } from 'react';

interface UseSpeechRecognitionReturn {
    startListening: () => void;
    stopListening: () => void;
    transcript: string;
    interimTranscript: string;
    isListening: boolean;
    isSupported: boolean;
    error: string | null;
    resetTranscript: () => void;
}

// Type definition for SpeechRecognition (not available in all browsers)
interface SpeechRecognitionEvent extends Event {
    results: SpeechRecognitionResultList;
    resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
    error: string;
}

export function useSpeechRecognition(): UseSpeechRecognitionReturn {
    const [transcript, setTranscript] = useState('');
    const [interimTranscript, setInterimTranscript] = useState('');
    const [isListening, setIsListening] = useState(false);
    const [isSupported, setIsSupported] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const recognitionRef = useRef<any>(null);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        setIsSupported(!!SpeechRecognition);

        if (SpeechRecognition) {
            const recognition = new SpeechRecognition();
            recognition.continuous = false;
            recognition.interimResults = true;
            recognition.lang = 'en-US';

            recognition.onstart = () => {
                setIsListening(true);
                setError(null);
            };

            recognition.onend = () => {
                setIsListening(false);
            };

            recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
                setError(event.error);
                setIsListening(false);
            };

            recognition.onresult = (event: SpeechRecognitionEvent) => {
                let finalTranscript = '';
                let interim = '';

                for (let i = event.resultIndex; i < event.results.length; i++) {
                    const result = event.results[i];
                    if (result.isFinal) {
                        finalTranscript += result[0].transcript;
                    } else {
                        interim += result[0].transcript;
                    }
                }

                if (finalTranscript) {
                    setTranscript(prev => prev + finalTranscript);
                }
                setInterimTranscript(interim);
            };

            recognitionRef.current = recognition;
        }

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.abort();
            }
        };
    }, []);

    const startListening = useCallback(() => {
        if (!recognitionRef.current) return;

        setTranscript('');
        setInterimTranscript('');
        setError(null);

        try {
            recognitionRef.current.start();
        } catch (e) {
            // Recognition might already be started
            console.error('Speech recognition error:', e);
        }
    }, []);

    const stopListening = useCallback(() => {
        if (!recognitionRef.current) return;
        recognitionRef.current.stop();
    }, []);

    const resetTranscript = useCallback(() => {
        setTranscript('');
        setInterimTranscript('');
    }, []);

    return {
        startListening,
        stopListening,
        transcript,
        interimTranscript,
        isListening,
        isSupported,
        error,
        resetTranscript,
    };
}
