export type LessonType = 'arrange_words' | 'select_image' | 'multiple_choice';

export interface Lesson {
    id: string;
    type: LessonType;
    question: string;
    // For arrange_words: the correct sentence. words are shuffled automatically or provided in 'options'
    correctAnswer: string;
    // For multiple_choice or select_image: array of choices
    options?: { id: string; label: string; image?: string; isCorrect?: boolean }[];
    // For arrange_words: items to click
    words?: string[];
    explanation?: string;
}

export const NOUN_PHRASE_LESSONS: Lesson[] = [
    // LEVEL 1: Introduction (Simple Noun Phrase)
    {
        id: 'l1-1',
        type: 'multiple_choice',
        question: 'Manakah yang merupakan Noun Phrase (Frasa Kata Benda)?',
        options: [
            { id: 'a', label: 'Run fast', isCorrect: false },
            { id: 'b', label: 'A big house', isCorrect: true },
            { id: 'c', label: 'Very quickly', isCorrect: false },
        ],
        correctAnswer: 'b',
        explanation: '"A big house" adalah Noun Phrase karena terdiri dari Determiner (A) + Adjective (big) + Noun (house).',
    },
    {
        id: 'l1-2',
        type: 'arrange_words',
        question: 'Susunlah menjadi frasa yang benar: "Sebuah mobil merah"',
        correctAnswer: 'A red car',
        words: ['car', 'A', 'red', 'blue', 'run'],
        explanation: 'Rumus: Determiner (A) + Adjective (red) + Noun (car).',
    },
    // LEVEL 2: Determiner + Adjective + Noun
    {
        id: 'l2-1',
        type: 'arrange_words',
        question: 'Terjemahkan: "Dua buku lama"',
        correctAnswer: 'Two old books',
        words: ['books', 'Two', 'old', 'new', 'apple'],
        explanation: 'Determiner (Two) + Adjective (old) + Noun (books).',
    },
    {
        id: 'l2-2',
        type: 'multiple_choice',
        question: 'Lengkapi frasa ini: "___ beautiful flower"',
        options: [
            { id: 'a', label: 'A', isCorrect: true },
            { id: 'b', label: 'An', isCorrect: false },
            { id: 'c', label: 'Of', isCorrect: false },
        ],
        correctAnswer: 'a',
        explanation: 'Gunakan "A" karena "beautiful" dimulai dengan bunyi konsonan.',
    },
    // LEVEL 3: Complex / Practice
    {
        id: 'l3-1',
        type: 'arrange_words',
        question: 'Susunlah: "Siswa-siswa pintar itu"',
        correctAnswer: 'Those smart students',
        words: ['students', 'Those', 'smart', 'this', 'student'],
        explanation: 'Determiner (Those) + Adjective (smart) + Noun (students).',
    },
    {
        id: 'l3-2',
        type: 'multiple_choice',
        question: 'Manakah susunan yang benar?',
        options: [
            { id: 'a', label: 'Red big apple', isCorrect: false },
            { id: 'b', label: 'Big red apple', isCorrect: true },
            { id: 'c', label: 'Apple big red', isCorrect: false },
        ],
        correctAnswer: 'b',
        explanation: 'Urutan kata sifat: Ukuran (Big) dulu, baru Warna (Red). -> "Big red apple".',
    },
];
