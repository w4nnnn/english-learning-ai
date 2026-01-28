import { db } from '@/lib/db';
import { modules, moduleItems, users } from '@/lib/db/schema';
import { hash } from 'bcryptjs';
import { eq } from 'drizzle-orm';

// --- Sample Data ---

const SAMPLE_MODULES = [
    {
        id: 'module-1',
        title: 'Noun Phrase - Pengenalan',
        description: 'Pelajari dasar-dasar Noun Phrase (Frasa Kata Benda) dalam bahasa Inggris.',
        order: 1,
        isPublished: true,
    },
    {
        id: 'module-2',
        title: 'Noun Phrase - Intermediate',
        description: 'Materi lanjutan tentang Noun Phrase dengan contoh lebih kompleks.',
        order: 2,
        isPublished: false,
    },
];

const SAMPLE_MODULE_ITEMS = [
    // Module 1 Items
    {
        id: 'item-1-1',
        moduleId: 'module-1',
        type: 'header',
        order: 1,
        title: 'Bagian 1: Apa itu Noun Phrase?',
    },
    {
        id: 'item-1-2',
        moduleId: 'module-1',
        type: 'material',
        order: 2,
        title: 'Pengenalan Noun Phrase',
        content: `**Noun Phrase** adalah frasa yang terdiri dari kata benda (noun) sebagai inti dan kata-kata lain yang memodifikasinya.

Rumus dasar:
- **Determiner** (a, the, this, those, two, dll)
- **Adjective** (big, red, beautiful, dll)
- **Noun** (car, house, book, dll)

Contoh: "A beautiful house" = Det + Adj + Noun`,
    },
    {
        id: 'item-1-3',
        moduleId: 'module-1',
        type: 'multiple_choice',
        order: 3,
        question: 'Manakah yang merupakan Noun Phrase (Frasa Kata Benda)?',
        options: [
            { id: 'a', label: 'Run fast', isCorrect: false },
            { id: 'b', label: 'A big house', isCorrect: true },
            { id: 'c', label: 'Very quickly', isCorrect: false },
        ],
        correctAnswer: 'b',
        xpReward: 10,
    },
    {
        id: 'item-1-4',
        moduleId: 'module-1',
        type: 'arrange_words',
        order: 4,
        question: 'Susunlah menjadi frasa yang benar: "Sebuah mobil merah"',
        options: ['car', 'A', 'red', 'blue', 'run'],
        correctAnswer: 'A red car',
        xpReward: 15,
    },
    {
        id: 'item-1-5',
        moduleId: 'module-1',
        type: 'header',
        order: 5,
        title: 'Bagian 2: Latihan',
    },
    {
        id: 'item-1-6',
        moduleId: 'module-1',
        type: 'arrange_words',
        order: 6,
        question: 'Terjemahkan: "Dua buku lama"',
        options: ['books', 'Two', 'old', 'new', 'apple'],
        correctAnswer: 'Two old books',
        xpReward: 15,
    },
    {
        id: 'item-1-7',
        moduleId: 'module-1',
        type: 'multiple_choice',
        order: 7,
        question: 'Lengkapi frasa ini: "___ beautiful flower"',
        options: [
            { id: 'a', label: 'A', isCorrect: true },
            { id: 'b', label: 'An', isCorrect: false },
            { id: 'c', label: 'Of', isCorrect: false },
        ],
        correctAnswer: 'a',
        xpReward: 10,
    },
];

// --- Seed Functions ---

export async function seedUsers() {
    console.log('Seeding users...');
    const existingUser = await db.select().from(users).where(eq(users.username, 'admin')).get();

    if (!existingUser) {
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

export async function seedModules() {
    console.log('Seeding modules...');

    // Clear existing data
    await db.delete(moduleItems);
    await db.delete(modules);

    // Insert modules
    await db.insert(modules).values(SAMPLE_MODULES);
    console.log(`Seeded ${SAMPLE_MODULES.length} modules.`);

    // Insert module items
    await db.insert(moduleItems).values(SAMPLE_MODULE_ITEMS);
    console.log(`Seeded ${SAMPLE_MODULE_ITEMS.length} module items.`);
}

// Backward compatibility
export async function seedLessons() {
    await seedModules();
}

// --- Main Execution ---

import { fileURLToPath } from 'url';
if (process.argv[1] === fileURLToPath(import.meta.url)) {
    (async () => {
        try {
            console.log('Starting database seed...');
            await seedUsers();
            await seedModules();
            console.log('Database seeding completed successfully.');
            process.exit(0);
        } catch (error) {
            console.error('Database seeding failed:', error);
            process.exit(1);
        }
    })();
}
