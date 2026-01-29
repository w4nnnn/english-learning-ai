'use client';

import { useState } from 'react';
import { X, Check, ImageIcon, AlertTriangle } from 'lucide-react';
import { MediaUploader } from '@/components/ui/media-uploader';
import type { ModuleItem } from '@/lib/actions/modules';

interface SelectImageEditorProps {
    options: Array<{ id: string; imageUrl: string; label?: string }>;
    correctAnswer: string;
    onUpdate: (data: Partial<ModuleItem>) => void;
}

export function SelectImageEditor({
    options,
    correctAnswer,
    onUpdate,
}: SelectImageEditorProps) {
    const [isAdding, setIsAdding] = useState(false);
    const [newImageLabel, setNewImageLabel] = useState('');

    const handleImageUpload = (url: string) => {
        if (!url) return;
        const newId = `img_${Date.now()}`;
        const newOptions = [...(options || []), {
            id: newId,
            imageUrl: url,
            label: newImageLabel.trim() || undefined
        }];
        onUpdate({ options: newOptions });
        setNewImageLabel('');
        setIsAdding(false);
    };

    const removeImage = (id: string) => {
        const newOptions = options.filter(opt => opt.id !== id);
        onUpdate({ options: newOptions });
        if (correctAnswer === id) {
            onUpdate({ options: newOptions, correctAnswer: '' });
        }
    };

    const setCorrectAnswerHandler = (id: string) => {
        onUpdate({ correctAnswer: id });
    };

    return (
        <div className="space-y-4">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <ImageIcon className="w-4 h-4 text-pink-500" />
                Image Options
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {(options || []).map((option) => (
                    <div
                        key={option.id}
                        className={`relative rounded-lg border-2 overflow-hidden cursor-pointer transition-all group ${correctAnswer === option.id
                            ? 'border-green-500 ring-2 ring-green-200'
                            : 'border-slate-200 hover:border-slate-300'
                            }`}
                        onClick={() => setCorrectAnswerHandler(option.id)}
                    >
                        <div className="aspect-square bg-slate-100 flex items-center justify-center">
                            {option.imageUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                    src={option.imageUrl}
                                    alt={option.label || 'Option'}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <ImageIcon className="w-8 h-8 text-slate-300" />
                            )}
                        </div>
                        {option.label && (
                            <div className="p-2 bg-white text-center text-sm text-slate-600 truncate">
                                {option.label}
                            </div>
                        )}
                        {correctAnswer === option.id && (
                            <div className="absolute top-2 right-2 w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center">
                                <Check className="w-4 h-4" />
                            </div>
                        )}
                        <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); removeImage(option.id); }}
                            className="absolute top-2 left-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 hover:bg-red-600 transition-all"
                        >
                            <X className="w-3 h-3" />
                        </button>
                    </div>
                ))}
            </div>

            {isAdding ? (
                <div className="space-y-3 p-4 bg-white border border-slate-200 rounded-lg">
                    <input
                        type="text"
                        value={newImageLabel}
                        onChange={(e) => setNewImageLabel(e.target.value)}
                        placeholder="Label (optional)..."
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-pink-500 outline-none"
                    />
                    <MediaUploader
                        onChange={handleImageUpload}
                        accept="image"
                    />
                    <button
                        type="button"
                        onClick={() => setIsAdding(false)}
                        className="w-full px-4 py-2 border border-slate-300 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                        Cancel
                    </button>
                </div>
            ) : (
                <button
                    type="button"
                    onClick={() => setIsAdding(true)}
                    className="w-full px-4 py-3 border-2 border-dashed border-slate-300 text-slate-600 rounded-lg hover:border-pink-400 hover:text-pink-600 hover:bg-pink-50 transition-colors flex items-center justify-center gap-2"
                >
                    <ImageIcon className="w-5 h-5" />
                    Add Image Option
                </button>
            )}

            {!correctAnswer && (options || []).length > 0 && (
                <p className="text-sm text-amber-600 bg-amber-50 px-3 py-2 rounded-lg flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    Please click on an image to mark it as the correct answer
                </p>
            )}
        </div>
    );
}
