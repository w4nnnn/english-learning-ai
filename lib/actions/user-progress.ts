'use server';

import { db } from '@/lib/db';
import { users, userModuleProgress, userItemResponses, moduleItems } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

export async function saveUserProgress(userId: string, data: {
    heartCount?: number;
    xp?: number;
    streak?: number;
}) {
    await db.update(users)
        .set({
            heartCount: data.heartCount,
            xp: data.xp,
            streak: data.streak,
            lastActive: new Date(),
        })
        .where(eq(users.id, userId));
}

export async function saveItemResponse(
    userId: string,
    moduleId: string,
    itemId: string,
    userAnswer: string,
    isCorrect: boolean
) {
    // Check if response already exists
    const existing = await db.select()
        .from(userItemResponses)
        .where(and(
            eq(userItemResponses.userId, userId),
            eq(userItemResponses.itemId, itemId)
        ))
        .get();

    if (existing) {
        // Update attempt count
        await db.update(userItemResponses)
            .set({
                userAnswer,
                isCorrect,
                attemptCount: (existing.attemptCount ?? 1) + 1,
                answeredAt: new Date(),
            })
            .where(eq(userItemResponses.id, existing.id));
    } else {
        await db.insert(userItemResponses).values({
            userId,
            moduleId,
            itemId,
            userAnswer,
            isCorrect,
        });
    }
}

export async function updateModuleProgress(
    userId: string,
    moduleId: string,
    data: {
        currentItemIndex?: number;
        status?: 'not_started' | 'in_progress' | 'completed';
        score?: number;
        completedItems?: number;
    }
) {
    const existing = await db.select()
        .from(userModuleProgress)
        .where(and(
            eq(userModuleProgress.userId, userId),
            eq(userModuleProgress.moduleId, moduleId)
        ))
        .get();

    if (existing) {
        await db.update(userModuleProgress)
            .set({
                ...data,
                completedAt: data.status === 'completed' ? new Date() : undefined,
            })
            .where(eq(userModuleProgress.id, existing.id));
    } else {
        // Count total items for this module
        const items = await db.select().from(moduleItems).where(eq(moduleItems.moduleId, moduleId));
        const questionItems = items.filter(i => !['header', 'material'].includes(i.type));

        await db.insert(userModuleProgress).values({
            userId,
            moduleId,
            status: 'in_progress',
            totalItems: questionItems.length,
            startedAt: new Date(),
            ...data,
        });
    }
}

export async function getUserProgress(userId: string) {
    return await db.select().from(users).where(eq(users.id, userId)).get();
}

export async function getUserModuleProgress(userId: string, moduleId: string) {
    return await db.select()
        .from(userModuleProgress)
        .where(and(
            eq(userModuleProgress.userId, userId),
            eq(userModuleProgress.moduleId, moduleId)
        ))
        .get();
}

export async function getAllModuleProgress(userId: string) {
    return await db.select()
        .from(userModuleProgress)
        .where(eq(userModuleProgress.userId, userId));
}
