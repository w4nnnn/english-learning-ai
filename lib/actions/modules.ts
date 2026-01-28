'use server';

import { db } from '@/lib/db';
import { modules, moduleItems } from '@/lib/db/schema';
import { eq, asc, desc } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

// ===== Types =====

export type Module = typeof modules.$inferSelect;
export type ModuleInsert = typeof modules.$inferInsert;
export type ModuleItem = typeof moduleItems.$inferSelect;
export type ModuleItemInsert = typeof moduleItems.$inferInsert;

// ===== MODULES CRUD =====

export async function getModules(includeUnpublished = false) {
    const query = db.select().from(modules).orderBy(asc(modules.order));

    if (!includeUnpublished) {
        return await query.where(eq(modules.isPublished, true));
    }

    return await query;
}

export async function getModuleById(id: string) {
    return await db.select().from(modules).where(eq(modules.id, id)).get();
}

export async function createModule(data: Omit<ModuleInsert, 'id'>) {
    const id = `module-${Date.now()}`;

    // Get max order
    const lastModule = await db.select({ order: modules.order })
        .from(modules)
        .orderBy(desc(modules.order))
        .limit(1)
        .get();

    const newOrder = (lastModule?.order ?? 0) + 1;

    await db.insert(modules).values({
        id,
        ...data,
        order: data.order ?? newOrder,
    });

    revalidatePath('/admin/modules');
    return { id };
}

export async function updateModule(id: string, data: Partial<ModuleInsert>) {
    await db.update(modules)
        .set({
            ...data,
            updatedAt: new Date(),
        })
        .where(eq(modules.id, id));

    revalidatePath('/admin/modules');
    revalidatePath(`/admin/modules/${id}`);
}

export async function deleteModule(id: string) {
    // moduleItems will be cascade deleted due to foreign key
    await db.delete(modules).where(eq(modules.id, id));
    revalidatePath('/admin/modules');
}

export async function toggleModulePublish(id: string) {
    const module = await getModuleById(id);
    if (!module) return;

    await db.update(modules)
        .set({ isPublished: !module.isPublished, updatedAt: new Date() })
        .where(eq(modules.id, id));

    revalidatePath('/admin/modules');
}

// ===== MODULE ITEMS CRUD =====

export async function getModuleItems(moduleId: string) {
    return await db.select()
        .from(moduleItems)
        .where(eq(moduleItems.moduleId, moduleId))
        .orderBy(asc(moduleItems.order));
}

export async function getModuleItemById(id: string) {
    return await db.select().from(moduleItems).where(eq(moduleItems.id, id)).get();
}

export async function createModuleItem(data: Omit<ModuleItemInsert, 'id'>) {
    const id = `item-${Date.now()}`;

    // Get max order in this module
    const lastItem = await db.select({ order: moduleItems.order })
        .from(moduleItems)
        .where(eq(moduleItems.moduleId, data.moduleId))
        .orderBy(desc(moduleItems.order))
        .limit(1)
        .get();

    const newOrder = (lastItem?.order ?? 0) + 1;

    await db.insert(moduleItems).values({
        id,
        ...data,
        order: data.order ?? newOrder,
    });

    revalidatePath(`/admin/modules/${data.moduleId}`);
    return { id };
}

export async function updateModuleItem(id: string, data: Partial<ModuleItemInsert>) {
    const item = await getModuleItemById(id);
    if (!item) return;

    await db.update(moduleItems)
        .set(data)
        .where(eq(moduleItems.id, id));

    revalidatePath(`/admin/modules/${item.moduleId}`);
}

export async function deleteModuleItem(id: string) {
    const item = await getModuleItemById(id);
    if (!item) return;

    await db.delete(moduleItems).where(eq(moduleItems.id, id));
    revalidatePath(`/admin/modules/${item.moduleId}`);
}

export async function reorderModuleItems(moduleId: string, itemIds: string[]) {
    // Update order for each item
    await Promise.all(
        itemIds.map((id, index) =>
            db.update(moduleItems)
                .set({ order: index + 1 })
                .where(eq(moduleItems.id, id))
        )
    );

    revalidatePath(`/admin/modules/${moduleId}`);
}

// ===== COMBINED QUERIES =====

export async function getModuleWithItems(moduleId: string) {
    const module = await getModuleById(moduleId);
    if (!module) return null;

    const items = await getModuleItems(moduleId);

    return {
        ...module,
        items,
    };
}
