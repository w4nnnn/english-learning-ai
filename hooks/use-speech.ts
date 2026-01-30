'use client';

import { useState, useCallback, useEffect } from 'react';

interface UseSpeechReturn {
    speak: (text: string) => void;
    stop: () => void;
    isSpeaking: boolean;
    isSupported: boolean;
}

export function useSpeech(): UseSpeechReturn {
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isSupported, setIsSupported] = useState(false);

    useEffect(() => {
        setIsSupported(typeof window !== 'undefined' && 'speechSynthesis' in window);
    }, []);

    const speak = useCallback((text: string) => {
        if (!isSupported) return;

        // Stop any current speech
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);

        // Try to find an English voice
        const voices = window.speechSynthesis.getVoices();
        const englishVoice = voices.find(voice =>
            voice.lang.startsWith('en') && voice.name.includes('English')
        ) || voices.find(voice => voice.lang.startsWith('en'));

        if (englishVoice) {
            utterance.voice = englishVoice;
        }

        utterance.lang = 'en-US';
        utterance.rate = 0.9; // Slightly slower for learning
        utterance.pitch = 1;

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);

        window.speechSynthesis.speak(utterance);
    }, [isSupported]);

    const stop = useCallback(() => {
        if (!isSupported) return;
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
    }, [isSupported]);

    return {
        speak,
        stop,
        isSpeaking,
        isSupported,
    };
}
