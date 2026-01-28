'use server';

import { db } from '@/lib/db';
import { users, userProgress } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function saveUserProgress(userId: string, data: {
    heartCount?: number;
    xp?: number;
    streak?: number;
    currentLessonIndex?: number;
}) {
    // Only update existing users. Users must be created via Auth.
    await db.update(users)
        .set({
            heartCount: data.heartCount,
            xp: data.xp,
            streak: data.streak,
            currentLessonIndex: data.currentLessonIndex,
            lastActive: new Date(),
        })
        .where(eq(users.id, userId));
}

export async function saveLessonHistory(userId: string, lessonId: string, score: number, status: 'completed' | 'locked' | 'unlocked') {
    await db.insert(userProgress).values({
        userId,
        lessonId,
        score,
        status,
        completedAt: new Date(),
    });
}

export async function getUserProgress(userId: string) {
    const user = await db.select().from(users).where(eq(users.id, userId)).get();
    return user;
}
