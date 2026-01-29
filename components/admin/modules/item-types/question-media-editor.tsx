'use client';

import { MessageCircleQuestion, ImageIcon, Video, Star } from 'lucide-react';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { MediaUploader } from '@/components/ui/media-uploader';
import { MultipleChoiceEditor } from './multiple-choice-editor';
import type { ItemEditorProps } from './types';

// Question with Image - shows image then asks multiple choice question
export function QuestionImageEditor({ item, onUpdate }: ItemEditorProps) {
    const options = Array.isArray(item.options) ? item.options : [];

    return (
        <div className="space-y-4">
            <div>
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                    <ImageIcon className="w-4 h-4 text-teal-500" />
                    Question Image
                </label>
                <MediaUploader
                    value={item.content || ''}
                    onChange={(url) => onUpdate({ content: url })}
                    accept="image"
                />
            </div>

            <div>
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                    <MessageCircleQuestion className="w-4 h-4 text-teal-500" />
                    Question
                </label>
                <RichTextEditor
                    value={item.question || ''}
                    onChange={(value) => onUpdate({ question: value })}
                    mode="minimal"
                    placeholder="Enter your question about the image..."
                />
            </div>

            <MultipleChoiceEditor
                options={options as Array<{ id: string; label: string; isCorrect?: boolean }>}
                correctAnswer={item.correctAnswer || ''}
                onUpdate={onUpdate}
            />

            <div className="flex items-center gap-4 pt-4 border-t border-slate-200">
                <div className="flex-1">
                    <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-1">
                        <Star className="w-4 h-4 text-amber-500" />
                        XP Reward
                    </label>
                    <input
                        type="number"
                        value={item.xpReward || 10}
                        onChange={(e) => onUpdate({ xpReward: parseInt(e.target.value) || 10 })}
                        min={0}
                        max={100}
                        className="w-24 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                </div>
            </div>
        </div>
    );
}

// Question with Video - shows video then asks multiple choice question
export function QuestionVideoEditor({ item, onUpdate }: ItemEditorProps) {
    const options = Array.isArray(item.options) ? item.options : [];

    return (
        <div className="space-y-4">
            <div>
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                    <Video className="w-4 h-4 text-teal-500" />
                    Question Video
                </label>
                <MediaUploader
                    value={item.content || ''}
                    onChange={(url) => onUpdate({ content: url })}
                    accept="video"
                />
            </div>

            <div>
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                    <MessageCircleQuestion className="w-4 h-4 text-teal-500" />
                    Question
                </label>
                <RichTextEditor
                    value={item.question || ''}
                    onChange={(value) => onUpdate({ question: value })}
                    mode="minimal"
                    placeholder="Enter your question about the video..."
                />
            </div>

            <MultipleChoiceEditor
                options={options as Array<{ id: string; label: string; isCorrect?: boolean }>}
                correctAnswer={item.correctAnswer || ''}
                onUpdate={onUpdate}
            />

            <div className="flex items-center gap-4 pt-4 border-t border-slate-200">
                <div className="flex-1">
                    <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-1">
                        <Star className="w-4 h-4 text-amber-500" />
                        XP Reward
                    </label>
                    <input
                        type="number"
                        value={item.xpReward || 10}
                        onChange={(e) => onUpdate({ xpReward: parseInt(e.target.value) || 10 })}
                        min={0}
                        max={100}
                        className="w-24 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                </div>
            </div>
        </div>
    );
}
