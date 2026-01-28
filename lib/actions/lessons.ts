'use server';

import { db } from '@/lib/db';
import { lessons } from '@/lib/db/schema';
import { asc } from 'drizzle-orm';

export async function getLessons() {
    const allLessons = await db.select().from(lessons).orderBy(asc(lessons.order));

    // Transform back to application format
    return allLessons.map(l => {
        const content = l.content as any;
        return {
            id: l.id,
            type: l.type,
            question: l.question,
            ...content, // spread title, answers, options, etc.
        };
    });
}
