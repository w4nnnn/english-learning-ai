'use server';

import { authenticateAdmin, getFileUrl } from '@/lib/pocketbase';

const COLLECTION_NAME = 'demo_english_learn';
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/ogg'];

export interface UploadResult {
    success: boolean;
    url?: string;
    error?: string;
    recordId?: string;
    filename?: string;
}

export async function uploadMedia(formData: FormData): Promise<UploadResult> {
    try {
        const file = formData.get('file') as File;

        if (!file || file.size === 0) {
            return { success: false, error: 'No file provided' };
        }

        // Validate file size
        if (file.size > MAX_FILE_SIZE) {
            console.error('[Upload] File too large');
            return { success: false, error: 'File size exceeds 50MB limit' };
        }

        // Validate file type
        const isImage = ALLOWED_IMAGE_TYPES.includes(file.type);
        const isVideo = ALLOWED_VIDEO_TYPES.includes(file.type);

        if (!isImage && !isVideo) {
            console.error(`[Upload] Unsupported type: ${file.type}`);
            return {
                success: false,
                error: `Unsupported file type: ${file.type}. Allowed: images (JPEG, PNG, GIF, WebP) and videos (MP4, WebM, OGG)`
            };
        }

        // Authenticate and upload
        const pb = await authenticateAdmin();

        // Create form data for PocketBase
        const pbFormData = new FormData();
        // User's PocketBase has field named 'image', not 'file'
        pbFormData.append('image', file);
        pbFormData.append('alt', formData.get('alt') as string || file.name);
        pbFormData.append('type', isImage ? 'image' : 'video');

        // Create record in collection
        const record = await pb.collection(COLLECTION_NAME).create(pbFormData);

        // Get the uploaded file URL
        // Handle both single (string) and multiple (array) response formats
        let filename = record.image;
        if (Array.isArray(filename)) {
            // If strictly multiple, this is an array. We take the first one.
            filename = filename.length > 0 ? filename[0] : null;
        }

        if (!filename && record.file) {
            filename = record.file;
        }

        const url = getFileUrl(COLLECTION_NAME, record.id, filename as string);

        return {
            success: true,
            url,
            recordId: record.id,
            filename: filename as string,
        };
    } catch (error) {
        console.error('[Upload] Error:', error);
        if (typeof error === 'object' && error !== null && 'data' in error) {
            console.error('[Upload] PocketBase error details:', JSON.stringify((error as any).data, null, 2));
        }
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Upload failed',
        };
    }
}

export async function deleteMedia(recordId: string): Promise<{ success: boolean; error?: string }> {
    try {
        const pb = await authenticateAdmin();
        await pb.collection(COLLECTION_NAME).delete(recordId);
        return { success: true };
    } catch (error) {
        console.error('Media delete error:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Delete failed',
        };
    }
}
