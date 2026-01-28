'use client';

import { useState, useTransition } from 'react';
import { createModuleItem, updateModule, updateModuleItem, deleteModuleItem, reorderModuleItems } from '@/lib/actions/modules';
import type { Module, ModuleItem } from '@/lib/actions/modules';
import { toast } from 'sonner';
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
} from 'lucide-react';

// Item type configurations
const ITEM_TYPES = [
    { type: 'header', label: 'Header', icon: Type, color: 'bg-purple-100 text-purple-600' },
    { type: 'material', label: 'Material', icon: FileText, color: 'bg-blue-100 text-blue-600' },
    { type: 'multiple_choice', label: 'Multiple Choice', icon: HelpCircle, color: 'bg-green-100 text-green-600' },
    { type: 'arrange_words', label: 'Arrange Words', icon: ListOrdered, color: 'bg-orange-100 text-orange-600' },
    { type: 'select_image', label: 'Select Image', icon: Image, color: 'bg-pink-100 text-pink-600' },
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
            const result = await createModuleItem({
                moduleId: module.id,
                type,
                title: type === 'header' ? 'New Section' : undefined,
                question: type !== 'header' && type !== 'material' ? 'New Question' : undefined,
                content: type === 'material' ? 'Enter your content here...' : undefined,
            });

            // Add to local state
            setItems([...items, {
                id: result.id,
                moduleId: module.id,
                type,
                order: items.length + 1,
                title: type === 'header' ? 'New Section' : null,
                content: type === 'material' ? 'Enter your content here...' : null,
                question: type !== 'header' && type !== 'material' ? 'New Question' : null,
                correctAnswer: null,
                options: null,
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
                    <h2 className="font-semibold text-slate-800 mb-4">Module Info</h2>

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
                            <textarea
                                value={moduleInfo.description}
                                onChange={(e) => setModuleInfo({ ...moduleInfo, description: e.target.value })}
                                rows={3}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                            />
                        </div>

                        <button
                            onClick={handleSaveModule}
                            disabled={isPending}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                        >
                            <Save className="w-4 h-4" />
                            Save Module
                        </button>
                    </div>
                </div>
            </div>

            {/* Right Column - Items */}
            <div className="lg:col-span-2 space-y-4">
                {/* Items List */}
                {items.map((item, index) => {
                    const typeConfig = ITEM_TYPES.find(t => t.type === item.type);
                    const Icon = typeConfig?.icon || FileText;
                    const isExpanded = expandedItems.has(item.id);

                    return (
                        <div
                            key={item.id}
                            className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden"
                        >
                            {/* Item Header */}
                            <div
                                className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-slate-50"
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
                                        className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-30"
                                    >
                                        <ChevronUp className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); moveItem(index, 'down'); }}
                                        disabled={index === items.length - 1}
                                        className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-30"
                                    >
                                        <ChevronDown className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleDeleteItem(item.id); }}
                                        className="p-1 text-slate-400 hover:text-red-600"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
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
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-slate-300 rounded-xl text-slate-600 hover:border-blue-500 hover:text-blue-600 transition-colors"
                    >
                        <Plus className="w-5 h-5" />
                        Add Item
                    </button>

                    {showAddMenu && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-slate-200 p-2 z-10">
                            {ITEM_TYPES.map(({ type, label, icon: TypeIcon, color }) => (
                                <button
                                    key={type}
                                    onClick={() => handleAddItem(type)}
                                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-50 text-left"
                                >
                                    <div className={`p-2 rounded-lg ${color}`}>
                                        <TypeIcon className="w-4 h-4" />
                                    </div>
                                    <span className="text-slate-700">{label}</span>
                                </button>
                            ))}
                        </div>
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
                <label className="block text-sm font-medium text-slate-700 mb-1">Section Title</label>
                <input
                    type="text"
                    value={item.title || ''}
                    onChange={(e) => onUpdate({ title: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
            </div>
        );
    }

    if (item.type === 'material') {
        return (
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                    <input
                        type="text"
                        value={item.title || ''}
                        onChange={(e) => onUpdate({ title: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Content (Markdown)</label>
                    <textarea
                        value={item.content || ''}
                        onChange={(e) => onUpdate({ content: e.target.value })}
                        rows={6}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none font-mono text-sm"
                    />
                </div>
            </div>
        );
    }

    // Question types
    return (
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Question</label>
                <input
                    type="text"
                    value={item.question || ''}
                    onChange={(e) => onUpdate({ question: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
            </div>

            {item.type === 'arrange_words' && (
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Words (comma separated)
                        </label>
                        <input
                            type="text"
                            value={Array.isArray(item.options) ? item.options.join(', ') : ''}
                            onChange={(e) => onUpdate({ options: e.target.value.split(',').map(w => w.trim()) })}
                            placeholder="car, A, red, blue, run"
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Correct Answer</label>
                        <input
                            type="text"
                            value={item.correctAnswer || ''}
                            onChange={(e) => onUpdate({ correctAnswer: e.target.value })}
                            placeholder="A red car"
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                </div>
            )}

            {item.type === 'multiple_choice' && (
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Options (JSON format)
                        </label>
                        <textarea
                            value={JSON.stringify(item.options || [], null, 2)}
                            onChange={(e) => {
                                try {
                                    const parsed = JSON.parse(e.target.value);
                                    onUpdate({ options: parsed });
                                } catch {
                                    // Invalid JSON, don't update
                                }
                            }}
                            rows={4}
                            placeholder='[{"id": "a", "label": "Option A", "isCorrect": true}]'
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none font-mono text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Correct Answer ID</label>
                        <input
                            type="text"
                            value={item.correctAnswer || ''}
                            onChange={(e) => onUpdate({ correctAnswer: e.target.value })}
                            placeholder="a"
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                </div>
            )}

            <div className="flex items-center gap-4">
                <div className="flex-1">
                    <label className="block text-sm font-medium text-slate-700 mb-1">XP Reward</label>
                    <input
                        type="number"
                        value={item.xpReward || 10}
                        onChange={(e) => onUpdate({ xpReward: parseInt(e.target.value) || 10 })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                </div>
            </div>
        </div>
    );
}
