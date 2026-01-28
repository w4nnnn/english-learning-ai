'use server';

import { db } from '@/lib/db';
import { modules, moduleItems } from '@/lib/db/schema';
import { asc, eq } from 'drizzle-orm';

// Deprecated: This file is kept for backward compatibility
// Use getModules and getModuleWithItems from modules.ts instead

export async function getLessons() {
    // Get first published module and return its items
    const firstModule = await db.select()
        .from(modules)
        .where(eq(modules.isPublished, true))
        .orderBy(asc(modules.order))
        .limit(1)
        .get();

    if (!firstModule) return [];

    const items = await db.select()
        .from(moduleItems)
        .where(eq(moduleItems.moduleId, firstModule.id))
        .orderBy(asc(moduleItems.order));

    // Transform to old format for backward compatibility
    return items
        .filter(item => !['header', 'material'].includes(item.type))
        .map(item => ({
            id: item.id,
            type: item.type,
            question: item.question || '',
            correctAnswer: item.correctAnswer || '',
            options: item.options,
            words: item.type === 'arrange_words' ? item.options : undefined,
        }));
}
