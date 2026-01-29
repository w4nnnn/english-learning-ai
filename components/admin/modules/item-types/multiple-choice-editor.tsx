'use client';

import { useState } from 'react';
import { Plus, X, Check, List, AlertTriangle } from 'lucide-react';
import type { ModuleItem } from '@/lib/actions/modules';

interface MultipleChoiceEditorProps {
    options: Array<{ id: string; label: string; isCorrect?: boolean }>;
    correctAnswer: string;
    onUpdate: (data: Partial<ModuleItem>) => void;
}

export function MultipleChoiceEditor({
    options,
    correctAnswer,
    onUpdate,
}: MultipleChoiceEditorProps) {
    const [newOptionText, setNewOptionText] = useState('');

    const addOption = () => {
        if (!newOptionText.trim()) return;
        const newId = String.fromCharCode(97 + options.length); // a, b, c, d...
        const newOptions = [...options, { id: newId, label: newOptionText.trim(), isCorrect: false }];
        onUpdate({ options: newOptions });
        setNewOptionText('');
    };

    const removeOption = (id: string) => {
        const newOptions = options.filter(opt => opt.id !== id);
        onUpdate({ options: newOptions });
        if (correctAnswer === id) {
            onUpdate({ options: newOptions, correctAnswer: '' });
        }
    };

    const updateOptionLabel = (id: string, label: string) => {
        const newOptions = options.map(opt =>
            opt.id === id ? { ...opt, label } : opt
        );
        onUpdate({ options: newOptions });
    };

    const setCorrectAnswer = (id: string) => {
        const newOptions = options.map(opt => ({
            ...opt,
            isCorrect: opt.id === id
        }));
        onUpdate({ options: newOptions, correctAnswer: id });
    };

    return (
        <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <List className="w-4 h-4 text-green-500" />
                Answer Options
            </label>

            <div className="space-y-2">
                {options.map((option) => (
                    <div
                        key={option.id}
                        className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${correctAnswer === option.id
                            ? 'border-green-500 bg-green-50'
                            : 'border-slate-200 bg-white hover:border-slate-300'
                            }`}
                    >
                        <button
                            type="button"
                            onClick={() => setCorrectAnswer(option.id)}
                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${correctAnswer === option.id
                                ? 'border-green-500 bg-green-500 text-white'
                                : 'border-slate-300 hover:border-green-400'
                                }`}
                            title="Mark as correct answer"
                        >
                            {correctAnswer === option.id && <Check className="w-4 h-4" />}
                        </button>
                        <span className="w-6 h-6 flex items-center justify-center text-sm font-medium text-slate-500 bg-slate-100 rounded">
                            {option.id.toUpperCase()}
                        </span>
                        <input
                            type="text"
                            value={option.label}
                            onChange={(e) => updateOptionLabel(option.id, e.target.value)}
                            placeholder="Enter option text..."
                            className="flex-1 px-3 py-1.5 border border-slate-200 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                        <button
                            type="button"
                            onClick={() => removeOption(option.id)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Remove option"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                ))}
            </div>

            <div className="flex gap-2">
                <input
                    type="text"
                    value={newOptionText}
                    onChange={(e) => setNewOptionText(e.target.value)}
                    placeholder="Add new option..."
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    onKeyDown={(e) => e.key === 'Enter' && addOption()}
                />
                <button
                    type="button"
                    onClick={addOption}
                    disabled={!newOptionText.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" />
                    Add
                </button>
            </div>

            {!correctAnswer && options.length > 0 && (
                <p className="text-sm text-amber-600 bg-amber-50 px-3 py-2 rounded-lg flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    Please select the correct answer by clicking the circle next to an option
                </p>
            )}
        </div>
    );
}
