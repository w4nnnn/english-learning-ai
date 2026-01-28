'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { ArrowLeft, Heart, Zap, ChevronRight, CheckCircle, X } from 'lucide-react';
import { WordOrdering } from '@/components/question-types/word-ordering';
import { MultipleChoice } from '@/components/question-types/multiple-choice';
import { ImageSelect } from '@/components/question-types/image-select';
import {
    saveUserProgress,
    saveItemResponse,
    updateModuleProgress,
} from '@/lib/actions/user-progress';
import type { Module, ModuleItem } from '@/lib/actions/modules';

interface ModulePlayerProps {
    module: Module & { items: ModuleItem[] };
    userId: string;
    initialProgress: any;
}

export function ModulePlayer({ module, userId, initialProgress }: ModulePlayerProps) {
    const router = useRouter();
    const [currentIndex, setCurrentIndex] = useState(initialProgress?.currentItemIndex ?? 0);
    const [status, setStatus] = useState<'idle' | 'correct' | 'wrong'>('idle');
    const [userAnswer, setUserAnswer] = useState<any>(null);
    const [hearts, setHearts] = useState(5);
    const [xp, setXp] = useState(0);
    const [completedItems, setCompletedItems] = useState(initialProgress?.completedItems ?? 0);

    const items = module.items;
    const currentItem = items[currentIndex];
    const totalItems = items.length;
    const progress = ((currentIndex + 1) / totalItems) * 100;

    // Filter only question items for progress counting
    const questionItems = items.filter(i => !['header', 'material'].includes(i.type));

    // Save progress periodically
    useEffect(() => {
        const timer = setTimeout(() => {
            saveUserProgress(userId, { heartCount: hearts, xp });
            updateModuleProgress(userId, module.id, {
                currentItemIndex: currentIndex,
                completedItems,
                status: currentIndex >= items.length - 1 ? 'completed' : 'in_progress',
            });
        }, 1000);
        return () => clearTimeout(timer);
    }, [currentIndex, hearts, xp, completedItems]);

    const handleNext = () => {
        if (currentIndex < items.length - 1) {
            setCurrentIndex(currentIndex + 1);
            setStatus('idle');
            setUserAnswer(null);
        } else {
            // Module completed
            toast.success('🎉 Modul selesai!', {
                description: `Kamu mendapat ${xp} XP`,
            });
            router.push('/');
        }
    };

    const handleCheck = () => {
        if (!currentItem) return;

        // For non-question items, just move next
        if (['header', 'material'].includes(currentItem.type)) {
            handleNext();
            return;
        }

        if (status === 'idle') {
            if (!userAnswer) return;

            // Check answer
            const isCorrect = userAnswer.toLowerCase() === currentItem.correctAnswer?.toLowerCase();

            if (isCorrect) {
                setStatus('correct');
                setXp(xp + (currentItem.xpReward || 10));
                setCompletedItems(completedItems + 1);
                toast.success('Benar! 🎉', { duration: 2000 });
            } else {
                setStatus('wrong');
                setHearts(Math.max(0, hearts - 1));
                toast.error('Salah', {
                    description: `Jawaban yang benar: ${currentItem.correctAnswer}`,
                    duration: 3000,
                });
            }

            // Save response
            saveItemResponse(userId, module.id, currentItem.id, userAnswer, isCorrect);
        } else {
            handleNext();
        }
    };

    const handleOrderChange = useCallback((words: string[]) => {
        setUserAnswer(words.join(' '));
    }, []);

    if (!currentItem) {
        return <div className="p-8 text-center">Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex flex-col">
            {/* Top Bar */}
            <header className="bg-white border-b border-slate-200 px-4 py-3">
                <div className="max-w-2xl mx-auto flex items-center gap-4">
                    <Link href="/" className="p-2 hover:bg-slate-100 rounded-lg">
                        <X className="w-5 h-5 text-slate-500" />
                    </Link>

                    {/* Progress Bar */}
                    <div className="flex-1 h-3 bg-slate-200 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-green-400 to-emerald-500 transition-all duration-300"
                            style={{ width: `${progress}%` }}
                        />
                    </div>

                    {/* Hearts */}
                    <div className="flex items-center gap-1 text-red-500">
                        <Heart className="w-5 h-5 fill-current" />
                        <span className="font-bold">{hearts}</span>
                    </div>

                    {/* XP */}
                    <div className="flex items-center gap-1 text-amber-500">
                        <Zap className="w-5 h-5 fill-current" />
                        <span className="font-bold">{xp}</span>
                    </div>
                </div>
            </header>

            {/* Content Area */}
            <main className="flex-1 flex flex-col max-w-2xl mx-auto w-full px-4 py-6">
                {/* Header Type */}
                {currentItem.type === 'header' && (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                <span className="text-2xl font-bold text-white">{currentIndex + 1}</span>
                            </div>
                            <h1 className="text-2xl font-bold text-slate-800 mb-2">
                                {currentItem.title}
                            </h1>
                            <p className="text-slate-500">Tekan lanjutkan untuk mulai</p>
                        </div>
                    </div>
                )}

                {/* Material Type */}
                {currentItem.type === 'material' && (
                    <div className="flex-1">
                        <h2 className="text-xl font-bold text-slate-800 mb-4">
                            {currentItem.title}
                        </h2>
                        <div className="prose prose-slate max-w-none bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                            <div
                                dangerouslySetInnerHTML={{
                                    __html: (currentItem.content || '')
                                        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                        .replace(/\n/g, '<br/>')
                                }}
                            />
                        </div>
                    </div>
                )}

                {/* Question Types */}
                {!['header', 'material'].includes(currentItem.type) && (
                    <div className="flex-1 space-y-6">
                        <h2 className="text-xl font-bold text-slate-700">
                            {currentItem.question}
                        </h2>

                        {currentItem.type === 'arrange_words' && (
                            <WordOrdering
                                key={currentItem.id}
                                initialWords={Array.isArray(currentItem.options) ? currentItem.options : []}
                                onOrderChange={handleOrderChange}
                                disabled={status !== 'idle'}
                            />
                        )}

                        {currentItem.type === 'multiple_choice' && (
                            <MultipleChoice
                                key={currentItem.id}
                                options={Array.isArray(currentItem.options) ? currentItem.options : []}
                                selectedOptionId={userAnswer}
                                onSelect={(id) => setUserAnswer(id)}
                                disabled={status !== 'idle'}
                            />
                        )}

                        {currentItem.type === 'select_image' && (
                            <ImageSelect
                                key={currentItem.id}
                                options={Array.isArray(currentItem.options) ? currentItem.options : []}
                                selectedOptionId={userAnswer}
                                onSelect={(id) => setUserAnswer(id)}
                                disabled={status !== 'idle'}
                            />
                        )}
                    </div>
                )}
            </main>

            {/* Footer */}
            <footer className="bg-white border-t border-slate-200 px-4 py-4">
                <div className="max-w-2xl mx-auto">
                    {status === 'correct' && (
                        <div className="flex items-center gap-3 mb-4 p-4 bg-green-50 rounded-xl border border-green-200">
                            <CheckCircle className="w-6 h-6 text-green-500" />
                            <span className="font-medium text-green-700">Benar! +{currentItem.xpReward || 10} XP</span>
                        </div>
                    )}

                    {status === 'wrong' && (
                        <div className="flex items-center gap-3 mb-4 p-4 bg-red-50 rounded-xl border border-red-200">
                            <X className="w-6 h-6 text-red-500" />
                            <span className="font-medium text-red-700">
                                Jawaban: {currentItem.correctAnswer}
                            </span>
                        </div>
                    )}

                    <button
                        onClick={handleCheck}
                        disabled={hearts === 0 || (status === 'idle' && !userAnswer && !['header', 'material'].includes(currentItem.type))}
                        className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${status === 'correct'
                                ? 'bg-green-500 hover:bg-green-600 text-white'
                                : status === 'wrong'
                                    ? 'bg-red-500 hover:bg-red-600 text-white'
                                    : 'bg-blue-500 hover:bg-blue-600 text-white disabled:bg-slate-300 disabled:cursor-not-allowed'
                            }`}
                    >
                        {status === 'idle'
                            ? ['header', 'material'].includes(currentItem.type)
                                ? 'Lanjutkan'
                                : 'Periksa'
                            : 'Lanjutkan'
                        }
                    </button>
                </div>
            </footer>
        </div>
    );
}
