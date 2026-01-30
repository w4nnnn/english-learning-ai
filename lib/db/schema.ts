import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

// ===== USERS =====
export const users = sqliteTable('users', {
    id: text('id').primaryKey(),
    username: text('username').unique().notNull(),
    passwordHash: text('password_hash').notNull(),
    role: text('role').default('murid').notNull(), // 'admin' | 'guru' | 'murid'
    heartCount: integer('heart_count').default(5),
    xp: integer('xp').default(0),
    streak: integer('streak').default(0),
    lastActive: integer('last_active', { mode: 'timestamp' }),
});

// ===== MODULES (seperti Form di Google Form) =====
export const modules = sqliteTable('modules', {
    id: text('id').primaryKey(),
    title: text('title').notNull(),
    description: text('description'),
    coverImage: text('cover_image'),
    order: integer('order').notNull().default(0),
    isPublished: integer('is_published', { mode: 'boolean' }).default(false),
    createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// ===== MODULE ITEMS (seperti pertanyaan/section di Google Form) =====
// Types: 'header' | 'material' | 'multiple_choice' | 'arrange_words' | 'select_image' | 'fill_blank'
export const moduleItems = sqliteTable('module_items', {
    id: text('id').primaryKey(),
    moduleId: text('module_id').references(() => modules.id, { onDelete: 'cascade' }).notNull(),
    type: text('type').notNull(),
    order: integer('order').notNull().default(0),

    // Untuk header & material
    title: text('title'),
    content: text('content'), // Rich text / HTML / Markdown
    caption: text('caption'), // Description for images/videos

    // Untuk semua question types
    question: text('question'),
    correctAnswer: text('correct_answer'),
    options: text('options', { mode: 'json' }), // JSON array for choices

    // Gamification per item
    xpReward: integer('xp_reward').default(10),

    // Metadata
    isRequired: integer('is_required', { mode: 'boolean' }).default(true),
    createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// ===== USER MODULE PROGRESS (tracking per module) =====
export const userModuleProgress = sqliteTable('user_module_progress', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    userId: text('user_id').references(() => users.id).notNull(),
    moduleId: text('module_id').references(() => modules.id, { onDelete: 'cascade' }).notNull(),
    currentItemIndex: integer('current_item_index').default(0),
    status: text('status').default('not_started'), // 'not_started' | 'in_progress' | 'completed'
    score: integer('score').default(0),
    totalItems: integer('total_items').default(0),
    completedItems: integer('completed_items').default(0),
    startedAt: integer('started_at', { mode: 'timestamp' }),
    completedAt: integer('completed_at', { mode: 'timestamp' }),
});

// ===== USER ITEM RESPONSES (tracking per item - seperti form responses) =====
export const userItemResponses = sqliteTable('user_item_responses', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    userId: text('user_id').references(() => users.id).notNull(),
    moduleId: text('module_id').references(() => modules.id, { onDelete: 'cascade' }).notNull(),
    itemId: text('item_id').references(() => moduleItems.id, { onDelete: 'cascade' }).notNull(),
    userAnswer: text('user_answer'),
    isCorrect: integer('is_correct', { mode: 'boolean' }),
    attemptCount: integer('attempt_count').default(1),
    answeredAt: integer('answered_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});
