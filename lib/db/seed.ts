import { db } from '@/lib/db';
import { modules, moduleItems, users } from '@/lib/db/schema';
import { hash } from 'bcryptjs';
import { eq } from 'drizzle-orm';

// --- Sample Data ---

const SAMPLE_MODULES = [
    {
        id: 'module-np-1',
        title: 'Noun Phrase 1: Basics',
        description: 'Pengenalan dasar Noun Phrase (Frasa Kata Benda) dan komponen utamanya.',
        order: 1,
        isPublished: true,
    },
    {
        id: 'module-np-2',
        title: 'Noun Phrase 2: Structure',
        description: 'Memahami sruktur Pre-modifier dan Post-modifier dalam Noun Phrase.',
        order: 2,
        isPublished: true,
    },
    {
        id: 'module-np-3',
        title: 'Noun Phrase 3: Advanced Practice',
        description: 'Latihan intensif menyusun dan mengidentifikasi Noun Phrase yang kompleks.',
        order: 3,
        isPublished: true,
    },
];

const SAMPLE_MODULE_ITEMS = [
    // --- Module 1: Basics ---
    {
        id: 'item-1-1',
        moduleId: 'module-np-1',
        type: 'header',
        order: 1,
        title: 'Introduction to Noun Phrase',
    },
    {
        id: 'item-1-2',
        moduleId: 'module-np-1',
        type: 'material',
        order: 2,
        title: 'Apa itu Noun Phrase?',
        content: `**Noun Phrase (NP)** adalah kelompok kata yang bekerja sama sebagai kata benda. Inti dari frasa ini adalah **Head Noun** (Kata Benda Utama).

**Contoh Sederhana:**
1. **The cat** (Determiner + Noun)
2. **A red car** (Determiner + Adjective + Noun)
3. **My old book** (Possessive + Adjective + Noun)

Rumus Basic:
**Determiner + Adjective + Head Noun**`,
    },
    {
        id: 'item-1-3',
        moduleId: 'module-np-1',
        type: 'multiple_choice',
        order: 3,
        question: 'Manakah yang merupakan "Head Noun" dari frasa: "The big yellow bus"?',
        options: [
            { id: 'a', label: 'The', isCorrect: false },
            { id: 'b', label: 'big', isCorrect: false },
            { id: 'c', label: 'yellow', isCorrect: false },
            { id: 'd', label: 'bus', isCorrect: true },
        ],
        correctAnswer: 'd',
        xpReward: 10,
    },
    {
        id: 'item-1-4',
        moduleId: 'module-np-1',
        type: 'arrange_words',
        order: 4,
        question: 'Susunlah menjadi Noun Phrase yang benar: "Ekor panjang itu"',
        options: ['tail', 'long', 'That'],
        correctAnswer: 'That long tail',
        xpReward: 15,
    },
    {
        id: 'item-1-5',
        moduleId: 'module-np-1',
        type: 'select_image',
        order: 5,
        question: 'Pilih gambar yang sesuai dengan frasa: "A delicious pizza"',
        options: [
            { id: 'a', imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400', label: 'Pizza' },
            { id: 'b', imageUrl: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400', label: 'Pancake' },
            { id: 'c', imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400', label: 'Burger' },
        ],
        correctAnswer: 'a',
        xpReward: 10,
    },

    // --- Module 2: Structure (Modifiers) ---
    {
        id: 'item-2-1',
        moduleId: 'module-np-2',
        type: 'header',
        order: 1,
        title: 'Pre-modifiers & Post-modifiers',
    },
    {
        id: 'item-2-2',
        moduleId: 'module-np-2',
        type: 'material',
        order: 2,
        title: 'Posisi Modifier',
        content: `Noun Phrase bisa menjadi panjang karena adanya **Modifiers** (penjelas).

1. **Pre-modifiers** (Sebelum Noun):
   - Adjectives: *smart* student
   - Nouns (sebagai adj): *school* bus
   - Participles: *sleeping* baby

2. **Post-modifiers** (Setelah Noun):
   - Prepositional Phrase: The man *in the room*
   - Relative Clause: The girl *who likes cookies*`,
    },
    {
        id: 'item-2-3',
        moduleId: 'module-np-2',
        type: 'multiple_choice',
        order: 3,
        question: 'Identifikasi Post-modifier dalam kalimat: "The book on the table"',
        options: [
            { id: 'a', label: 'The book', isCorrect: false },
            { id: 'b', label: 'on the table', isCorrect: true },
            { id: 'c', label: 'The', isCorrect: false },
        ],
        correctAnswer: 'b',
        xpReward: 15,
    },
    {
        id: 'item-2-4',
        moduleId: 'module-np-2',
        type: 'arrange_words',
        order: 4,
        question: 'Susun frasa dengan Noun Modifier: "Sebuah toko sepatu"',
        options: ['shop', 'A', 'shoe'],
        correctAnswer: 'A shoe shop',
        xpReward: 15,
    },

    // --- Module 3: Practice ---
    {
        id: 'item-3-1',
        moduleId: 'module-np-3',
        type: 'header',
        order: 1,
        title: 'Challenge Yourself!',
    },
    {
        id: 'item-3-2',
        moduleId: 'module-np-3',
        type: 'arrange_words',
        order: 2,
        question: 'Complex NP: "Gadis cantik yang berbaju merah itu"',
        options: ['girl', 'beautiful', 'The', 'red', 'in', 'dress'],
        correctAnswer: 'The beautiful girl in red dress',
        xpReward: 25,
    },
    {
        id: 'item-3-3',
        moduleId: 'module-np-3',
        type: 'multiple_choice',
        order: 3,
        question: 'Mana susunan yang BENAR (Order of Adjectives)?',
        options: [
            { id: 'a', label: 'A red big car', isCorrect: false },
            { id: 'b', label: 'A big red car', isCorrect: true },
            { id: 'c', label: 'Red a big car', isCorrect: false },
        ],
        correctAnswer: 'b',
        xpReward: 20,
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
