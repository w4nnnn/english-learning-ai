'use server';

import { db } from '@/lib/db';
import { users, sessions } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { compare, hash } from 'bcryptjs';
import { cookies } from 'next/headers';
import { randomUUID } from 'crypto';

const SESSION_DURATION = 60 * 60 * 24 * 30; // 30 days

export async function login(formData: FormData) {
    const username = formData.get('username') as string;
    const password = formData.get('password') as string;

    if (!username || !password) {
        return { error: 'Username dan password wajib diisi.' };
    }

    const user = await db.select().from(users).where(eq(users.username, username)).get();

    // Auto-seed user 'admin' if not exists (TEMPORARY FOR DEVELOPMENT)
    if (!user && username === 'admin' && password === 'admin') {
        const hashedPassword = await hash(password, 10);
        const newUserId = randomUUID();
        await db.insert(users).values({
            id: newUserId,
            username,
            passwordHash: hashedPassword,
        });

        // Log them in immediately
        await createSession(newUserId);
        return { success: true };
    }

    if (!user) {
        return { error: 'Username tidak ditemukan.' };
    }

    const passwordMatch = await compare(password, user.passwordHash);

    if (!passwordMatch) {
        return { error: 'Password salah.' };
    }

    await createSession(user.id);
    return { success: true };
}

async function createSession(userId: string) {
    const sessionId = randomUUID();
    const expiresAt = new Date(Date.now() + SESSION_DURATION * 1000);

    await db.insert(sessions).values({
        id: sessionId,
        userId,
        expiresAt,
    });

    const cookieStore = await cookies();
    cookieStore.set('session_id', sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        expires: expiresAt,
        path: '/',
    });
}

export async function getSession() {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('session_id')?.value;

    if (!sessionId) return null;

    const session = await db.select().from(sessions).where(eq(sessions.id, sessionId)).get();

    if (!session || session.expiresAt < new Date()) {
        return null; // Session invalid or expired
    }

    return session;
}

export async function logout() {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('session_id')?.value;

    if (sessionId) {
        await db.delete(sessions).where(eq(sessions.id, sessionId));
    }

    cookieStore.delete('session_id');
}
