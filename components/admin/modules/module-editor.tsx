'use client';

import { useState, useTransition } from 'react';
import { createModuleItem, updateModule, updateModuleItem, deleteModuleItem, reorderModuleItems } from '@/lib/actions/modules';
import type { Module, ModuleItem } from '@/lib/actions/modules';
import { toast } from 'sonner';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import {
    Plus,
    GripVertical,
    Trash2,
    FileText,
    HelpCircle,
    Type,
    ListOrdered,
    Image,
    Save,
    ChevronDown,
    ChevronUp,
    X,
    Check,
} from 'lucide-react';

// Item type configurations
const ITEM_TYPES = [
    { type: 'header', label: 'Header', icon: Type, color: 'bg-purple-100 text-purple-600', description: 'Section divider with title' },
    { type: 'material', label: 'Material', icon: FileText, color: 'bg-blue-100 text-blue-600', description: 'Rich text content' },
    { type: 'multiple_choice', label: 'Multiple Choice', icon: HelpCircle, color: 'bg-green-100 text-green-600', description: 'Question with options' },
    { type: 'arrange_words', label: 'Arrange Words', icon: ListOrdered, color: 'bg-orange-100 text-orange-600', description: 'Arrange words in order' },
    { type: 'select_image', label: 'Select Image', icon: Image, color: 'bg-pink-100 text-pink-600', description: 'Choose correct image' },
];

interface ModuleEditorProps {
    module: Module & { items: ModuleItem[] };
}

export function ModuleEditor({ module }: ModuleEditorProps) {
    const [isPending, startTransition] = useTransition();
    const [items, setItems] = useState(module.items);
    const [moduleInfo, setModuleInfo] = useState({
        title: module.title,
        description: module.description || '',
    });
    const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
    const [showAddMenu, setShowAddMenu] = useState(false);

    const toggleExpand = (itemId: string) => {
        const newExpanded = new Set(expandedItems);
        if (newExpanded.has(itemId)) {
            newExpanded.delete(itemId);
        } else {
            newExpanded.add(itemId);
        }
        setExpandedItems(newExpanded);
    };

    const handleSaveModule = () => {
        startTransition(async () => {
            await updateModule(module.id, {
                title: moduleInfo.title,
                description: moduleInfo.description || undefined,
            });
            toast.success('Module saved!');
        });
    };

    const handleAddItem = (type: string) => {
        setShowAddMenu(false);
        startTransition(async () => {
            const defaultOptions = type === 'multiple_choice'
                ? [{ id: 'a', label: 'Option A', isCorrect: true }, { id: 'b', label: 'Option B', isCorrect: false }]
                : type === 'arrange_words'
                    ? ['word1', 'word2', 'word3']
                    : null;

            const result = await createModuleItem({
                moduleId: module.id,
                type,
                title: type === 'header' ? 'New Section' : undefined,
                question: type !== 'header' && type !== 'material' ? 'Enter your question here...' : undefined,
                content: type === 'material' ? '# Enter your content here\n\nStart writing...' : undefined,
                options: defaultOptions,
                correctAnswer: type === 'multiple_choice' ? 'a' : type === 'arrange_words' ? 'word1 word2 word3' : undefined,
            });

            // Add to local state
            setItems([...items, {
                id: result.id,
                moduleId: module.id,
                type,
                order: items.length + 1,
                title: type === 'header' ? 'New Section' : null,
                content: type === 'material' ? '# Enter your content here\n\nStart writing...' : null,
                question: type !== 'header' && type !== 'material' ? 'Enter your question here...' : null,
                correctAnswer: type === 'multiple_choice' ? 'a' : type === 'arrange_words' ? 'word1 word2 word3' : null,
                options: defaultOptions,
                xpReward: 10,
                isRequired: true,
                createdAt: new Date(),
            }]);
            setExpandedItems(new Set([...expandedItems, result.id]));
            toast.success('Item added!');
        });
    };

    const handleUpdateItem = (itemId: string, data: Partial<ModuleItem>) => {
        // Update local state
        setItems(items.map(item =>
            item.id === itemId ? { ...item, ...data } : item
        ));

        // Debounced save
        startTransition(async () => {
            await updateModuleItem(itemId, data);
        });
    };

    const handleDeleteItem = (itemId: string) => {
        if (!confirm('Delete this item?')) return;

        setItems(items.filter(item => item.id !== itemId));
        startTransition(async () => {
            await deleteModuleItem(itemId);
            toast.success('Item deleted');
        });
    };

    const moveItem = (index: number, direction: 'up' | 'down') => {
        const newIndex = direction === 'up' ? index - 1 : index + 1;
        if (newIndex < 0 || newIndex >= items.length) return;

        const newItems = [...items];
        [newItems[index], newItems[newIndex]] = [newItems[newIndex], newItems[index]];
        setItems(newItems);

        startTransition(async () => {
            await reorderModuleItems(module.id, newItems.map(i => i.id));
        });
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Module Info */}
            <div className="lg:col-span-1">
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 sticky top-6">
                    <h2 className="font-semibold text-slate-800 mb-4">📚 Module Info</h2>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                            <input
                                type="text"
                                value={moduleInfo.title}
                                onChange={(e) => setModuleInfo({ ...moduleInfo, title: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                            <RichTextEditor
                                value={moduleInfo.description}
                                onChange={(value) => setModuleInfo({ ...moduleInfo, description: value })}
                                mode="minimal"
                                placeholder="Describe this module..."
                            />
                        </div>

                        <button
                            onClick={handleSaveModule}
                            disabled={isPending}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                        >
                            <Save className="w-4 h-4" />
                            Save Module
                        </button>
                    </div>

                    {/* Quick Stats */}
                    <div className="mt-6 pt-6 border-t border-slate-200">
                        <h3 className="text-sm font-medium text-slate-600 mb-3">Quick Stats</h3>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-blue-50 rounded-lg p-3 text-center">
                                <p className="text-2xl font-bold text-blue-600">{items.filter(i => i.type === 'material').length}</p>
                                <p className="text-xs text-blue-600">Materials</p>
                            </div>
                            <div className="bg-green-50 rounded-lg p-3 text-center">
                                <p className="text-2xl font-bold text-green-600">{items.filter(i => !['header', 'material'].includes(i.type)).length}</p>
                                <p className="text-xs text-green-600">Questions</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Column - Items */}
            <div className="lg:col-span-2 space-y-4">
                {/* Items List */}
                {items.length === 0 && (
                    <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl p-12 text-center">
                        <p className="text-slate-500 mb-2">No items yet</p>
                        <p className="text-slate-400 text-sm">Click &quot;Add Item&quot; below to start building your module</p>
                    </div>
                )}

                {items.map((item, index) => {
                    const typeConfig = ITEM_TYPES.find(t => t.type === item.type);
                    const Icon = typeConfig?.icon || FileText;
                    const isExpanded = expandedItems.has(item.id);

                    return (
                        <div
                            key={item.id}
                            className={`bg-white rounded-xl shadow-sm border-2 overflow-hidden transition-all ${isExpanded ? 'border-blue-300' : 'border-slate-200'
                                }`}
                        >
                            {/* Item Header */}
                            <div
                                className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-slate-50 transition-colors"
                                onClick={() => toggleExpand(item.id)}
                            >
                                <GripVertical className="w-4 h-4 text-slate-400" />
                                <div className={`p-2 rounded-lg ${typeConfig?.color || 'bg-slate-100'}`}>
                                    <Icon className="w-4 h-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-slate-800 truncate">
                                        {item.title || item.question || `${typeConfig?.label} Item`}
                                    </p>
                                    <p className="text-xs text-slate-500">{typeConfig?.label}</p>
                                </div>
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); moveItem(index, 'up'); }}
                                        disabled={index === 0}
                                        className="p-1.5 text-slate-400 hover:text-slate-600 disabled:opacity-30 hover:bg-slate-100 rounded transition-colors"
                                        title="Move up"
                                    >
                                        <ChevronUp className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); moveItem(index, 'down'); }}
                                        disabled={index === items.length - 1}
                                        className="p-1.5 text-slate-400 hover:text-slate-600 disabled:opacity-30 hover:bg-slate-100 rounded transition-colors"
                                        title="Move down"
                                    >
                                        <ChevronDown className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleDeleteItem(item.id); }}
                                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                        title="Delete"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                    <div className={`ml-2 transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                                        <ChevronDown className="w-4 h-4 text-slate-400" />
                                    </div>
                                </div>
                            </div>

                            {/* Item Editor */}
                            {isExpanded && (
                                <div className="px-4 py-4 border-t border-slate-200 bg-slate-50">
                                    <ItemEditor
                                        item={item}
                                        onUpdate={(data) => handleUpdateItem(item.id, data)}
                                    />
                                </div>
                            )}
                        </div>
                    );
                })}

                {/* Add Item Button */}
                <div className="relative">
                    <button
                        onClick={() => setShowAddMenu(!showAddMenu)}
                        className="w-full flex items-center justify-center gap-2 px-4 py-4 border-2 border-dashed border-slate-300 rounded-xl text-slate-600 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-all"
                    >
                        <Plus className="w-5 h-5" />
                        Add Item
                    </button>

                    {showAddMenu && (
                        <>
                            {/* Backdrop */}
                            <div
                                className="fixed inset-0 z-10"
                                onClick={() => setShowAddMenu(false)}
                            />
                            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-200 p-3 z-20">
                                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2 px-2">Add new item</p>
                                <div className="grid gap-1">
                                    {ITEM_TYPES.map(({ type, label, icon: TypeIcon, color, description }) => (
                                        <button
                                            key={type}
                                            onClick={() => handleAddItem(type)}
                                            className="w-full flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-slate-50 text-left transition-colors group"
                                        >
                                            <div className={`p-2 rounded-lg ${color} group-hover:scale-110 transition-transform`}>
                                                <TypeIcon className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-slate-700">{label}</p>
                                                <p className="text-xs text-slate-500">{description}</p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

// Item Editor Component
function ItemEditor({
    item,
    onUpdate,
}: {
    item: ModuleItem;
    onUpdate: (data: Partial<ModuleItem>) => void;
}) {
    if (item.type === 'header') {
        return (
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                    📌 Section Title
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

    if (item.type === 'material') {
        return (
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                        📝 Title (optional)
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
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                        📄 Content
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

    // Question types
    return (
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                    ❓ Question
                </label>
                <RichTextEditor
                    value={item.question || ''}
                    onChange={(value) => onUpdate({ question: value })}
                    mode="minimal"
                    placeholder="Enter your question..."
                />
            </div>

            {item.type === 'arrange_words' && (
                <ArrangeWordsEditor
                    options={Array.isArray(item.options) ? item.options : []}
                    correctAnswer={item.correctAnswer || ''}
                    onUpdate={onUpdate}
                />
            )}

            {item.type === 'multiple_choice' && (
                <MultipleChoiceEditor
                    options={Array.isArray(item.options) ? item.options : []}
                    correctAnswer={item.correctAnswer || ''}
                    onUpdate={onUpdate}
                />
            )}

            {item.type === 'select_image' && (
                <SelectImageEditor
                    options={Array.isArray(item.options) ? item.options : []}
                    correctAnswer={item.correctAnswer || ''}
                    onUpdate={onUpdate}
                />
            )}

            <div className="flex items-center gap-4 pt-4 border-t border-slate-200">
                <div className="flex-1">
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                        ⭐ XP Reward
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

// Multiple Choice Editor - Interactive
function MultipleChoiceEditor({
    options,
    correctAnswer,
    onUpdate,
}: {
    options: Array<{ id: string; label: string; isCorrect?: boolean }>;
    correctAnswer: string;
    onUpdate: (data: Partial<ModuleItem>) => void;
}) {
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
        // If removed option was correct answer, clear it
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
            <label className="block text-sm font-medium text-slate-700">
                📋 Answer Options
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

            {/* Add new option */}
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
                <p className="text-sm text-amber-600 bg-amber-50 px-3 py-2 rounded-lg">
                    ⚠️ Please select the correct answer by clicking the circle next to an option
                </p>
            )}
        </div>
    );
}

// Arrange Words Editor - Interactive
function ArrangeWordsEditor({
    options,
    correctAnswer,
    onUpdate,
}: {
    options: string[];
    correctAnswer: string;
    onUpdate: (data: Partial<ModuleItem>) => void;
}) {
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
                <label className="block text-sm font-medium text-slate-700 mb-2">
                    🔤 Words to Arrange
                </label>
                <p className="text-xs text-slate-500 mb-3">
                    Add words that students will arrange into the correct order
                </p>

                {/* Word chips */}
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

                {/* Add word input */}
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
                <label className="block text-sm font-medium text-slate-700 mb-2">
                    ✅ Correct Answer
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

// Select Image Editor - Placeholder
function SelectImageEditor({
    options,
    correctAnswer,
    onUpdate,
}: {
    options: Array<{ id: string; imageUrl: string; label?: string }>;
    correctAnswer: string;
    onUpdate: (data: Partial<ModuleItem>) => void;
}) {
    const [newImageUrl, setNewImageUrl] = useState('');
    const [newImageLabel, setNewImageLabel] = useState('');

    const addImage = () => {
        if (!newImageUrl.trim()) return;
        const newId = `img_${Date.now()}`;
        const newOptions = [...(options || []), {
            id: newId,
            imageUrl: newImageUrl.trim(),
            label: newImageLabel.trim() || undefined
        }];
        onUpdate({ options: newOptions });
        setNewImageUrl('');
        setNewImageLabel('');
    };

    const removeImage = (id: string) => {
        const newOptions = options.filter(opt => opt.id !== id);
        onUpdate({ options: newOptions });
        if (correctAnswer === id) {
            onUpdate({ options: newOptions, correctAnswer: '' });
        }
    };

    const setCorrectAnswer = (id: string) => {
        onUpdate({ correctAnswer: id });
    };

    return (
        <div className="space-y-4">
            <label className="block text-sm font-medium text-slate-700">
                🖼️ Image Options
            </label>

            {/* Image grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {(options || []).map((option) => (
                    <div
                        key={option.id}
                        className={`relative rounded-lg border-2 overflow-hidden cursor-pointer transition-all ${correctAnswer === option.id
                                ? 'border-green-500 ring-2 ring-green-200'
                                : 'border-slate-200 hover:border-slate-300'
                            }`}
                        onClick={() => setCorrectAnswer(option.id)}
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
                                <Image className="w-8 h-8 text-slate-300" />
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

            {/* Add image */}
            <div className="space-y-2 p-4 bg-white border border-dashed border-slate-300 rounded-lg">
                <p className="text-sm font-medium text-slate-600">Add Image</p>
                <input
                    type="text"
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    placeholder="Image URL..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-pink-500 outline-none"
                />
                <input
                    type="text"
                    value={newImageLabel}
                    onChange={(e) => setNewImageLabel(e.target.value)}
                    placeholder="Label (optional)..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-pink-500 outline-none"
                />
                <button
                    type="button"
                    onClick={addImage}
                    disabled={!newImageUrl.trim()}
                    className="w-full px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                    <Plus className="w-4 h-4" />
                    Add Image
                </button>
            </div>

            {!correctAnswer && (options || []).length > 0 && (
                <p className="text-sm text-amber-600 bg-amber-50 px-3 py-2 rounded-lg">
                    ⚠️ Please click on an image to mark it as the correct answer
                </p>
            )}
        </div>
    );
}
