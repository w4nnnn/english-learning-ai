'use client';

import { Mic, MessageSquare, FileText } from 'lucide-react';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import type { ModuleItem } from '@/lib/actions/modules';

interface VoiceAnswerEditorProps {
    item: ModuleItem;
    onUpdate: (data: Partial<ModuleItem>) => void;
}

export function VoiceAnswerEditor({ item, onUpdate }: VoiceAnswerEditorProps) {
    return (
        <div className="space-y-4">
            {/* Question */}
            <div>
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                    <MessageSquare className="w-4 h-4 text-green-500" />
                    Question
                </label>
                <RichTextEditor
                    value={item.question || ''}
                    onChange={(value) => onUpdate({ question: value })}
                    mode="minimal"
                    placeholder="Enter the question for voice response..."
                    height="100px"
                />
            </div>

            {/* Expected Answer */}
            <div>
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                    <Mic className="w-4 h-4 text-red-500" />
                    Expected Answer (what user should say)
                </label>
                <input
                    type="text"
                    value={item.correctAnswer || ''}
                    onChange={(e) => onUpdate({ correctAnswer: e.target.value })}
                    placeholder="e.g., The cat is on the table"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <p className="text-xs text-slate-500 mt-1">
                    Voice recognition akan membandingkan jawaban user dengan teks ini (case-insensitive)
                </p>
            </div>

            {/* Hint (optional) */}
            <div>
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                    <FileText className="w-4 h-4 text-blue-500" />
                    Hint (optional)
                </label>
                <input
                    type="text"
                    value={item.content || ''}
                    onChange={(e) => onUpdate({ content: e.target.value })}
                    placeholder="e.g., Start with 'The cat...'"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
            </div>
        </div>
    );
}
