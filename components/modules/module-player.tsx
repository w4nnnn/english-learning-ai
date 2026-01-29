'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { ArrowLeft, Heart, Zap, CheckCircle, X, ChevronRight, Sparkles } from 'lucide-react';
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

    const items = module.items;
    const currentItem = items[currentIndex];
    const totalItems = items.length;
    const progress = ((currentIndex + 1) / totalItems) * 100;

    // Save progress periodically
    useEffect(() => {
        const timer = setTimeout(() => {
            saveUserProgress(userId, { heartCount: hearts, xp });
            updateModuleProgress(userId, module.id, {
                currentItemIndex: currentIndex,
                status: currentIndex >= items.length - 1 ? 'completed' : 'in_progress',
            });
        }, 1000);
        return () => clearTimeout(timer);
    }, [currentIndex, hearts, xp, userId, module.id, items.length]);

    const handleNext = async () => {
        if (currentIndex < items.length - 1) {
            setCurrentIndex(currentIndex + 1);
            setStatus('idle');
            setUserAnswer(null);
        } else {
            // Finish
            await updateModuleProgress(userId, module.id, {
                currentItemIndex: currentIndex,
                status: 'completed'
            });
            toast.success('🎉 Modul selesai!', {
                description: `Kamu mendapat ${xp} XP`,
            });
            router.push('/');
        }
    };

    const handleCheck = async () => {
        if (!currentItem) return;

        if (['header', 'material'].includes(currentItem.type)) {
            handleNext();
            return;
        }

        if (status === 'idle') {
            if (!userAnswer) return;

            const isCorrect = userAnswer.toLowerCase() === currentItem.correctAnswer?.toLowerCase();

            if (isCorrect) {
                setStatus('correct');
                setXp(xp + (currentItem.xpReward || 10));
                toast.success('Benar! 🎉', { duration: 2000 });
            } else {
                setStatus('wrong');
                setHearts(Math.max(0, hearts - 1));
                toast.error('Salah', {
                    description: 'Semangat! Coba lagi.',
                    duration: 2000,
                });
            }

            // Save response and force progress update if correct
            await saveItemResponse(userId, module.id, currentItem.id, userAnswer, isCorrect);
            if (isCorrect) {
                await updateModuleProgress(userId, module.id, {
                    currentItemIndex: currentIndex,
                    status: 'in_progress'
                });
            }
        } else {
            handleNext();
        }
    };

    const handleOrderChange = useCallback((words: string[]) => {
        setUserAnswer(words.join(' '));
    }, []);

    if (!currentItem) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-elegant">
                <div className="animate-pulse text-muted-foreground">Loading...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-elegant flex flex-col">
            {/* Top Bar */}
            <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-border px-4 py-3">
                <div className="max-w-2xl mx-auto flex items-center gap-4">
                    <Link
                        href="/"
                        className="p-2 hover:bg-muted rounded-xl transition-elegant"
                    >
                        <X className="w-5 h-5 text-muted-foreground" />
                    </Link>

                    {/* Progress Bar */}
                    <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-success transition-all duration-500 ease-out rounded-full"
                            style={{ width: `${progress}%` }}
                        />
                    </div>

                    {/* Hearts */}
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 rounded-full">
                        <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                        <span className="font-bold text-red-600 text-sm">{hearts}</span>
                    </div>

                    {/* XP */}
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 rounded-full">
                        <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
                        <span className="font-bold text-amber-600 text-sm">{xp}</span>
                    </div>
                </div>
            </header>

            {/* Content Area */}
            <main className="flex-1 flex flex-col max-w-2xl mx-auto w-full px-4 py-8">
                {/* Header Type */}
                {currentItem.type === 'header' && (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="text-center">
                            <div className="w-20 h-20 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-elegant-lg">
                                <Sparkles className="w-8 h-8 text-white" />
                            </div>
                            <h1 className="text-3xl font-bold text-foreground mb-3">
                                {currentItem.title}
                            </h1>
                            <p className="text-muted-foreground">
                                Tekan lanjutkan untuk mulai
                            </p>
                        </div>
                    </div>
                )}

                {/* Material Type */}
                {currentItem.type === 'material' && (
                    <div className="flex-1">
                        <h2 className="text-2xl font-bold text-foreground mb-6">
                            {currentItem.title}
                        </h2>
                        <div className="bg-white rounded-2xl p-8 shadow-elegant border border-border">
                            <div
                                className="prose prose-slate max-w-none"
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
                    <div className="flex-1 space-y-8">
                        <div className="text-center">
                            <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4">
                                Pertanyaan {currentIndex + 1} dari {totalItems}
                            </span>
                            <h2 className="text-2xl font-bold text-foreground">
                                {currentItem.question}
                            </h2>
                        </div>

                        <div className="bg-white rounded-2xl p-6 shadow-elegant border border-border">
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
                    </div>
                )}
            </main>

            {/* Footer */}
            <footer className="sticky bottom-0 bg-white/90 backdrop-blur-xl border-t border-border px-4 py-4">
                <div className="max-w-2xl mx-auto">
                    {/* Feedback Messages */}
                    {status === 'correct' && (
                        <div className="flex items-center gap-3 mb-4 p-4 bg-green-50 rounded-2xl border border-green-200">
                            <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                                <CheckCircle className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <p className="font-bold text-green-700">Benar!</p>
                                <p className="text-sm text-green-600">+{currentItem.xpReward || 10} XP</p>
                            </div>
                        </div>
                    )}

                    {status === 'wrong' && (
                        <div className="flex items-center gap-3 mb-4 p-4 bg-red-50 rounded-2xl border border-red-200">
                            <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center">
                                <X className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <p className="font-bold text-red-700">Salah</p>
                                <p className="text-sm text-red-600">Coba lagi!</p>
                            </div>
                        </div>
                    )}

                    {/* Action Button */}
                    <button
                        onClick={handleCheck}
                        disabled={hearts === 0 || (status === 'idle' && !userAnswer && !['header', 'material'].includes(currentItem.type))}
                        className={`
                            w-full py-4 rounded-2xl font-bold text-lg
                            flex items-center justify-center gap-2
                            transition-elegant disabled:opacity-50 disabled:cursor-not-allowed
                            ${status === 'correct'
                                ? 'bg-gradient-success text-white shadow-lg hover:shadow-xl'
                                : status === 'wrong'
                                    ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg hover:shadow-xl'
                                    : 'bg-gradient-primary text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5'
                            }
                        `}
                    >
                        <span>
                            {status === 'idle'
                                ? ['header', 'material'].includes(currentItem.type)
                                    ? 'Lanjutkan'
                                    : 'Periksa Jawaban'
                                : 'Lanjutkan'
                            }
                        </span>
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            </footer>
        </div>
    );
}
