'use client';

import { GameLayout } from '@/components/game-layout';
import { TopBar } from '@/components/top-bar';
import { Footer } from '@/components/footer';
import { CharacterMascot } from '@/components/character-mascot';
import { useGameStore } from '@/lib/game-store';
import { NOUN_PHRASE_LESSONS } from '@/lib/lessons-data';
import { useState, useEffect, useCallback } from 'react';
import { WordOrdering } from '@/components/question-types/word-ordering';
import { MultipleChoice } from '@/components/question-types/multiple-choice';
import { ImageSelect } from '@/components/question-types/image-select';
import { toast } from 'sonner';

export default function Home() {
  const {
    currentLessonIndex,
    lessonStatus,
    setLessonStatus,
    nextLesson,
    reduceHeart,
    hearts
  } = useGameStore();

  const currentLesson = NOUN_PHRASE_LESSONS[currentLessonIndex % NOUN_PHRASE_LESSONS.length];

  // State for user's current answer
  const [userAnswer, setUserAnswer] = useState<any>(null);

  // Reset check on new lesson
  useEffect(() => {
    setUserAnswer(null);
  }, [currentLessonIndex]);

  const handleOrderByDnd = useCallback((orderedWords: string[]) => {
    // Join words with space for checking
    setUserAnswer(orderedWords.join(' '));
  }, []);

  const handleCheck = () => {
    if (lessonStatus === 'idle') {
      if (!userAnswer) return;

      // Logic Check
      const isCorrect = userAnswer.toLowerCase() === currentLesson.correctAnswer.toLowerCase();

      if (isCorrect) {
        setLessonStatus('correct');
        toast.success("Correct!", {
          description: "Great job! Keep it up!",
          duration: 2000,
        });
      } else {
        setLessonStatus('wrong');
        reduceHeart();
        toast.error("Incorrect", {
          description: `The correct answer is: ${currentLesson.correctAnswer}`,
          duration: 4000,
        });
      }
    } else {
      // Move to next or retry
      if (lessonStatus === 'correct') {
        nextLesson();
      } else {
        setLessonStatus('idle');
      }
    }
  };

  if (!currentLesson) return <div>Loading...</div>;

  return (
    <GameLayout>
      <TopBar />

      <main className="flex-1 flex flex-col p-4 relative z-0">
        <CharacterMascot mood={lessonStatus === 'idle' ? 'idle' : (lessonStatus === 'correct' ? 'happy' : 'sad')} />

        <div className="mt-4 space-y-6">
          <h2 className="text-xl font-bold text-slate-700">
            {currentLesson.question}
          </h2>

          {currentLesson.type === 'arrange_words' && (
            <WordOrdering
              key={currentLesson.id}
              initialWords={currentLesson.words || []}
              onOrderChange={handleOrderByDnd}
              disabled={lessonStatus !== 'idle'}
            />
          )}

          {currentLesson.type === 'multiple_choice' && (
            <MultipleChoice
              key={currentLesson.id}
              options={currentLesson.options || []}
              selectedOptionId={userAnswer}
              onSelect={(id) => setUserAnswer(id)}
              disabled={lessonStatus !== 'idle'}
            />
          )}

          {currentLesson.type === 'select_image' && (
            <ImageSelect
              key={currentLesson.id}
              options={currentLesson.options || []}
              selectedOptionId={userAnswer}
              onSelect={(id) => setUserAnswer(id)}
              disabled={lessonStatus !== 'idle'}
            />
          )}

          {currentLesson.type !== 'arrange_words' && currentLesson.type !== 'multiple_choice' && currentLesson.type !== 'select_image' && (
            <div className="p-8 border-2 border-dashed border-slate-300 rounded-xl text-center text-slate-400">
              [Tipe soal ini belum diimplementasi: {currentLesson.type}]
            </div>
          )}
        </div>
      </main>

      <Footer
        onCheck={handleCheck}
        status={lessonStatus}
        isButtonDisabled={hearts === 0 || (!userAnswer && lessonStatus === 'idle')}
      />
    </GameLayout>
  );
}
