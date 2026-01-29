'use client';

import { PenLine, FileText, ImageIcon, Video } from 'lucide-react';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { MediaUploader } from '@/components/ui/media-uploader';
import type { ItemEditorProps } from './types';

export function MaterialEditor({ item, onUpdate }: ItemEditorProps) {
    return (
        <div className="space-y-4">
            <div>
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                    <PenLine className="w-4 h-4 text-blue-500" />
                    Title (optional)
                </label>
                <input
                    type="text"
                    value={item.title || ''}
                    onChange={(e) => onUpdate({ title: e.target.value })}
                    placeholder="Enter material title..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
            </div>
            <div>
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                    <FileText className="w-4 h-4 text-blue-500" />
                    Content
                </label>
                <RichTextEditor
                    value={item.content || ''}
                    onChange={(value) => onUpdate({ content: value })}
                    mode="full"
                    placeholder="Write your learning material here..."
                    height="400px"
                />
            </div>
        </div>
    );
}

export function MaterialImageEditor({ item, onUpdate }: ItemEditorProps) {
    return (
        <div className="space-y-4">
            <div>
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                    <PenLine className="w-4 h-4 text-blue-500" />
                    Title (optional)
                </label>
                <input
                    type="text"
                    value={item.title || ''}
                    onChange={(e) => onUpdate({ title: e.target.value })}
                    placeholder="Enter material title..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
            </div>
            <div>
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                    <ImageIcon className="w-4 h-4 text-blue-500" />
                    Image
                </label>
                <MediaUploader
                    value={item.content || ''}
                    onChange={(url) => onUpdate({ content: url })}
                    accept="image"
                />
            </div>
            <div>
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                    <FileText className="w-4 h-4 text-blue-500" />
                    Deskripsi (Caption)
                </label>
                <RichTextEditor
                    value={item.caption || ''}
                    onChange={(value) => onUpdate({ caption: value })}
                    mode="minimal"
                    placeholder="Tulis deskripsi gambar..."
                    height="150px"
                />
            </div>
        </div>
    );
}

export function MaterialVideoEditor({ item, onUpdate }: ItemEditorProps) {
    return (
        <div className="space-y-4">
            <div>
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                    <PenLine className="w-4 h-4 text-blue-500" />
                    Title (optional)
                </label>
                <input
                    type="text"
                    value={item.title || ''}
                    onChange={(e) => onUpdate({ title: e.target.value })}
                    placeholder="Enter material title..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
            </div>
            <div>
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                    <Video className="w-4 h-4 text-blue-500" />
                    Video
                </label>
                <MediaUploader
                    value={item.content || ''}
                    onChange={(url) => onUpdate({ content: url })}
                    accept="video"
                />
            </div>
            <div>
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                    <FileText className="w-4 h-4 text-blue-500" />
                    Deskripsi (Caption)
                </label>
                <RichTextEditor
                    value={item.caption || ''}
                    onChange={(value) => onUpdate({ caption: value })}
                    mode="minimal"
                    placeholder="Tulis deskripsi video..."
                    height="150px"
                />
            </div>
        </div>
    );
}
