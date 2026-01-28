import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
    id: text('id').primaryKey(),
    username: text('username').unique().notNull(),
    passwordHash: text('password_hash').notNull(),
    heartCount: integer('heart_count').default(5),
    xp: integer('xp').default(0),
    streak: integer('streak').default(0),
    currentLessonIndex: integer('current_lesson_index').default(0),
    lastActive: integer('last_active', { mode: 'timestamp' }),
});

export const sessions = sqliteTable('sessions', {
    id: text('id').primaryKey(),
    userId: text('user_id').notNull().references(() => users.id),
    expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
});

export const lessons = sqliteTable('lessons', {
    id: text('id').primaryKey(), // We can use the logic 'lesson_1', 'lesson_2' etc.
    type: text('type').notNull(), // 'arrange_words', etc.
    question: text('question').notNull(),
    order: integer('order').notNull(),
    content: text('content', { mode: 'json' }).notNull(), // JSON data for specific lesson params
});

export const userProgress = sqliteTable('user_progress', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    userId: text('user_id').references(() => users.id),
    lessonId: text('lesson_id').notNull(),
    status: text('status').default('locked'), // 'completed', 'locked', 'unlocked'
    score: integer('score').default(0),
    completedAt: integer('completed_at', { mode: 'timestamp' }),
});
