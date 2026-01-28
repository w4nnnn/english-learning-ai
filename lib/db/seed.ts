import { db } from '@/lib/db';
import { lessons, users } from '@/lib/db/schema';
import { hash } from 'bcryptjs';
import { eq } from 'drizzle-orm';

// --- Types & Interfaces ---

type LessonType = 'arrange_words' | 'select_image' | 'multiple_choice';

interface Lesson {
    id: string;
    type: LessonType;
    question: string;
    correctAnswer: string;
    options?: { id: string; label: string; image?: string; isCorrect?: boolean }[];
    words?: string[];
    explanation?: string;
}

// --- Data ---

const NOUN_PHRASE_LESSONS: Lesson[] = [
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

// --- Seed Functions ---

export async function seedUsers() {
    console.log('Seeding users...');
    const existingUser = await db.select().from(users).where(eq(users.username, 'admin')).get();

    if (!existingUser) {
        // Default password: admin123
        const hashedPassword = await hash('admin123', 10);
        await db.insert(users).values({
            id: 'admin-user-id',
            username: 'admin',
            passwordHash: hashedPassword,
            heartCount: 5,
            xp: 100,
            streak: 1,
        });
        console.log('User "admin" created.');
    } else {
        console.log('User "admin" already exists.');
    }
}

export async function seedLessons() {
    console.log('Seeding lessons...');

    // Clear existing lessons to avoid duplicates if re-run
    await db.delete(lessons);

    const lessonValues = NOUN_PHRASE_LESSONS.map((l, index) => {
        // Separate core columns from content JSON
        const { id, type, question, ...rest } = l;

        return {
            id,
            type,
            question,
            order: index + 1,
            content: rest, // title, answers, options, etc. go here
        };
    });

    await db.insert(lessons).values(lessonValues);
    console.log(`Seeded ${lessonValues.length} lessons.`);
}

// --- Main Execution (if run directly) ---

// Check if this file is being run directly via tsx
import { fileURLToPath } from 'url';
if (process.argv[1] === fileURLToPath(import.meta.url)) {
    (async () => {
        try {
            console.log('Starting full database seed...');
            await seedUsers();
            await seedLessons();
            console.log('Database seeding completed successfully.');
            process.exit(0);
        } catch (error) {
            console.error('Database seeding failed:', error);
            process.exit(1);
        }
    })();
}
