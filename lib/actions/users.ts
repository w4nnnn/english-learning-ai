'use server';

import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { hash } from 'bcryptjs';
import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export type User = typeof users.$inferSelect;

export async function getUsers() {
    return await db.select({
        id: users.id,
        username: users.username,
        role: users.role,
        heartCount: users.heartCount,
        xp: users.xp,
        streak: users.streak,
        lastActive: users.lastActive,
    }).from(users);
}

export async function createUser(data: { username: string; password: string; role?: string }) {
    const id = `user-${Date.now()}`;
    const passwordHash = await hash(data.password, 10);

    await db.insert(users).values({
        id,
        username: data.username,
        passwordHash,
        role: data.role || 'murid',
        heartCount: 5,
        xp: 0,
        streak: 0,
    });

    revalidatePath('/admin/users');
    return { id };
}

export async function updateUser(id: string, data: { username?: string; password?: string; role?: string }) {
    const updateData: Record<string, any> = {};

    if (data.username) {
        updateData.username = data.username;
    }

    if (data.password) {
        updateData.passwordHash = await hash(data.password, 10);
    }

    if (data.role) {
        updateData.role = data.role;
    }

    if (Object.keys(updateData).length > 0) {
        await db.update(users).set(updateData).where(eq(users.id, id));
    }

    revalidatePath('/admin/users');
}

export async function deleteUser(id: string) {
    await db.delete(users).where(eq(users.id, id));
    revalidatePath('/admin/users');
}

export async function resetUserProgress(id: string) {
    await db.update(users).set({
        heartCount: 5,
        xp: 0,
        streak: 0,
    }).where(eq(users.id, id));

    revalidatePath('/admin/users');
}

// Self-update for profile edit
export async function updateOwnProfile(data: { username?: string; password?: string }) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        throw new Error('Not authenticated');
    }

    const updateData: Record<string, any> = {};

    if (data.username) {
        updateData.username = data.username;
    }

    if (data.password) {
        updateData.passwordHash = await hash(data.password, 10);
    }

    if (Object.keys(updateData).length > 0) {
        await db.update(users).set(updateData).where(eq(users.id, session.user.id));
    }

    revalidatePath('/');
    return { success: true };
}

