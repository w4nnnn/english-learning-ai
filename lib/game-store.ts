import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface GameState {
    hearts: number;
    xp: number;
    streak: number;
    currentLessonIndex: number;
    lessonStatus: 'idle' | 'correct' | 'wrong';
    hasCompletedDaily: boolean;

    // Actions
    reduceHeart: () => void;
    addXP: (amount: number) => void;
    nextLesson: () => void;
    setLessonStatus: (status: 'idle' | 'correct' | 'wrong') => void;
    resetHearts: () => void;
    resetProgress: () => void;
}

export const useGameStore = create<GameState>()(
    persist(
        (set) => ({
            hearts: 5,
            xp: 0,
            streak: 0,
            currentLessonIndex: 0,
            lessonStatus: 'idle',
            hasCompletedDaily: false,

            reduceHeart: () =>
                set((state) => {
                    const newHearts = Math.max(0, state.hearts - 1);
                    return { hearts: newHearts };
                }),

            addXP: (amount) => set((state) => ({ xp: state.xp + amount })),

            nextLesson: () =>
                set((state) => ({
                    currentLessonIndex: state.currentLessonIndex + 1,
                    lessonStatus: 'idle',
                })),

            setLessonStatus: (status) => set({ lessonStatus: status }),

            resetHearts: () => set({ hearts: 5 }),

            resetProgress: () => set({ currentLessonIndex: 0, lessonStatus: 'idle', hearts: 5 }),
        }),
        {
            name: 'english-game-storage',
        }
    )
);
