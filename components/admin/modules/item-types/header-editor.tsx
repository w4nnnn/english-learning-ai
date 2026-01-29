'use client';

import { Pin } from 'lucide-react';
import type { ItemEditorProps } from './types';

export function HeaderEditor({ item, onUpdate }: ItemEditorProps) {
    return (
        <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                <Pin className="w-4 h-4 text-purple-500" />
                Section Title
            </label>
            <input
                type="text"
                value={item.title || ''}
                onChange={(e) => onUpdate({ title: e.target.value })}
                placeholder="Enter section title..."
                className="w-full px-4 py-3 text-lg font-semibold border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
            />
        </div>
    );
}
