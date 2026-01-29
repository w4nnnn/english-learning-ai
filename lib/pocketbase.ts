import PocketBase from 'pocketbase';

// Singleton instance for server-side usage
let pb: PocketBase | null = null;

export function getPocketBase(): PocketBase {
    if (!pb) {
        const url = process.env.POCKETBASE_URL;
        if (!url) {
            throw new Error('POCKETBASE_URL environment variable is not set');
        }
        pb = new PocketBase(url);
    }
    return pb;
}

// Authenticate as admin (for server-side operations only)
export async function authenticateAdmin(): Promise<PocketBase> {
    const pb = getPocketBase();

    const email = process.env.POCKETBASE_ADMIN_EMAIL;
    const password = process.env.POCKETBASE_ADMIN_PASSWORD;

    if (!email || !password) {
        throw new Error('PocketBase admin credentials not configured in environment');
    }

    // Check if already authenticated
    if (pb.authStore.isValid) {
        return pb;
    }

    // Authenticate as admin
    await pb.admins.authWithPassword(email, password);

    return pb;
}

// Get public URL for a file
export function getFileUrl(collectionId: string, recordId: string, filename: string): string {
    const baseUrl = process.env.POCKETBASE_URL;
    return `${baseUrl}/api/files/${collectionId}/${recordId}/${filename}`;
}
