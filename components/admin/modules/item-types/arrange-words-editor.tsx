'use client';

import { useState } from 'react';
import { Plus, X, ListOrdered, CheckCircle } from 'lucide-react';
import type { ModuleItem } from '@/lib/actions/modules';

interface ArrangeWordsEditorProps {
    options: string[];
    correctAnswer: string;
    onUpdate: (data: Partial<ModuleItem>) => void;
}

export function ArrangeWordsEditor({
    options,
    correctAnswer,
    onUpdate,
}: ArrangeWordsEditorProps) {
    const [newWord, setNewWord] = useState('');

    const addWord = () => {
        if (!newWord.trim()) return;
        onUpdate({ options: [...options, newWord.trim()] });
        setNewWord('');
    };

    const removeWord = (index: number) => {
        const newOptions = options.filter((_, i) => i !== index);
        onUpdate({ options: newOptions });
    };

    return (
        <div className="space-y-4">
            <div>
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                    <ListOrdered className="w-4 h-4 text-orange-500" />
                    Words to Arrange
                </label>
                <p className="text-xs text-slate-500 mb-3">
                    Add words that students will arrange into the correct order
                </p>

                <div className="flex flex-wrap gap-2 min-h-12 p-3 bg-white border border-slate-200 rounded-lg">
                    {options.length === 0 && (
                        <span className="text-slate-400 text-sm">No words added yet</span>
                    )}
                    {options.map((word, index) => (
                        <span
                            key={index}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-orange-100 text-orange-700 rounded-full text-sm font-medium group hover:bg-orange-200 transition-colors"
                        >
                            {word}
                            <button
                                type="button"
                                onClick={() => removeWord(index)}
                                className="p-0.5 hover:bg-orange-300 rounded-full transition-colors"
                                title="Remove word"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </span>
                    ))}
                </div>

                <div className="flex gap-2 mt-3">
                    <input
                        type="text"
                        value={newWord}
                        onChange={(e) => setNewWord(e.target.value)}
                        placeholder="Type a word and press Enter..."
                        className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                        onKeyDown={(e) => e.key === 'Enter' && addWord()}
                    />
                    <button
                        type="button"
                        onClick={addWord}
                        disabled={!newWord.trim()}
                        className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        Add
                    </button>
                </div>
            </div>

            <div>
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Correct Answer
                </label>
                <p className="text-xs text-slate-500 mb-2">
                    Enter the words in the correct order (the sentence students should form)
                </p>
                <input
                    type="text"
                    value={correctAnswer}
                    onChange={(e) => onUpdate({ correctAnswer: e.target.value })}
                    placeholder="e.g., A red car"
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none text-lg"
                />
            </div>
        </div>
    );
}
