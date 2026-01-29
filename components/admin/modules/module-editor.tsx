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
    Save,
    ChevronDown,
    ChevronUp,
    BookOpen,
    AlertTriangle,
    MessageCircleQuestion,
    Star,
} from 'lucide-react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

// Import item type components
import { ITEM_TYPES, getItemTypeConfig } from './item-types';
import { HeaderEditor } from './item-types/header-editor';
import { MaterialEditor, MaterialImageEditor, MaterialVideoEditor } from './item-types/material-editor';
import { MultipleChoiceEditor } from './item-types/multiple-choice-editor';
import { ArrangeWordsEditor } from './item-types/arrange-words-editor';
import { SelectImageEditor } from './item-types/select-image-editor';
import { McImageEditor } from './item-types/mc-image-editor';
import { QuestionImageEditor, QuestionVideoEditor } from './item-types/question-media-editor';

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
            const defaultOptions = type === 'multiple_choice' || type === 'question_image' || type === 'question_video'
                ? [{ id: 'a', label: 'Option A', isCorrect: true }, { id: 'b', label: 'Option B', isCorrect: false }]
                : type === 'arrange_words'
                    ? ['word1', 'word2', 'word3']
                    : type === 'mc_image' || type === 'select_image'
                        ? []
                        : null;

            const result = await createModuleItem({
                moduleId: module.id,
                type,
                title: type === 'header' ? 'New Section' : undefined,
                question: !['header', 'material', 'material_image', 'material_video'].includes(type) ? 'Enter your question here...' : undefined,
                content: type === 'material' ? '# Enter your content here\n\nStart writing...' : undefined,
                options: defaultOptions,
                correctAnswer: type === 'multiple_choice' || type === 'question_image' || type === 'question_video'
                    ? 'a'
                    : type === 'arrange_words'
                        ? 'word1 word2 word3'
                        : undefined,
            });

            setItems([...items, {
                id: result.id,
                moduleId: module.id,
                type,
                order: items.length + 1,
                title: type === 'header' ? 'New Section' : null,
                content: type === 'material' ? '# Enter your content here\n\nStart writing...' : null,
                question: !['header', 'material', 'material_image', 'material_video'].includes(type) ? 'Enter your question here...' : null,
                correctAnswer: type === 'multiple_choice' || type === 'question_image' || type === 'question_video'
                    ? 'a'
                    : type === 'arrange_words'
                        ? 'word1 word2 word3'
                        : null,
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
        setItems(items.map(item =>
            item.id === itemId ? { ...item, ...data } : item
        ));

        startTransition(async () => {
            await updateModuleItem(itemId, data);
        });
    };

    const handleDeleteItem = (itemId: string) => {
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

    // Group item types by category for the add menu
    const contentTypes = ITEM_TYPES.filter(t => t.category === 'content');
    const questionTypes = ITEM_TYPES.filter(t => t.category === 'question');

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Module Info */}
            <div className="lg:col-span-1">
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 sticky top-6">
                    <h2 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-primary" />
                        Module Info
                    </h2>

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
                                <p className="text-2xl font-bold text-blue-600">
                                    {items.filter(i => ['material', 'material_image', 'material_video'].includes(i.type)).length}
                                </p>
                                <p className="text-xs text-blue-600">Materials</p>
                            </div>
                            <div className="bg-green-50 rounded-lg p-3 text-center">
                                <p className="text-2xl font-bold text-green-600">
                                    {items.filter(i => !['header', 'material', 'material_image', 'material_video'].includes(i.type)).length}
                                </p>
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
                    const typeConfig = getItemTypeConfig(item.type);
                    const Icon = typeConfig?.icon || FileText;
                    const isExpanded = expandedItems.has(item.id);

                    return (
                        <div
                            key={item.id}
                            className={`bg-white rounded-xl shadow-sm border-2 overflow-hidden transition-all ${isExpanded ? 'border-blue-300' : 'border-slate-200'}`}
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
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <button
                                                onClick={(e) => e.stopPropagation()}
                                                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                                title="Delete"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                                            <AlertDialogHeader>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
                                                        <AlertTriangle className="w-5 h-5 text-destructive" />
                                                    </div>
                                                    <AlertDialogTitle>Delete Item</AlertDialogTitle>
                                                </div>
                                                <AlertDialogDescription className="pt-2">
                                                    Are you sure you want to delete this item? This action cannot be undone.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction
                                                    onClick={() => handleDeleteItem(item.id)}
                                                    className="bg-destructive hover:bg-destructive/90"
                                                >
                                                    Delete
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
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
                            <div
                                className="fixed inset-0 z-10"
                                onClick={() => setShowAddMenu(false)}
                            />
                            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-200 p-3 z-20 max-h-96 overflow-y-auto">
                                {/* Content Types */}
                                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2 px-2">Content</p>
                                <div className="grid gap-1 mb-3">
                                    {contentTypes.map(({ type, label, icon: TypeIcon, color, description }) => (
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

                                {/* Question Types */}
                                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2 px-2 pt-2 border-t border-slate-200">Questions</p>
                                <div className="grid gap-1">
                                    {questionTypes.map(({ type, label, icon: TypeIcon, color, description }) => (
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

// Item Editor Component - Routes to appropriate editor based on type
function ItemEditor({
    item,
    onUpdate,
}: {
    item: ModuleItem;
    onUpdate: (data: Partial<ModuleItem>) => void;
}) {
    switch (item.type) {
        case 'header':
            return <HeaderEditor item={item} onUpdate={onUpdate} />;

        case 'material':
            return <MaterialEditor item={item} onUpdate={onUpdate} />;

        case 'material_image':
            return <MaterialImageEditor item={item} onUpdate={onUpdate} />;

        case 'material_video':
            return <MaterialVideoEditor item={item} onUpdate={onUpdate} />;

        case 'question_image':
            return <QuestionImageEditor item={item} onUpdate={onUpdate} />;

        case 'question_video':
            return <QuestionVideoEditor item={item} onUpdate={onUpdate} />;

        default:
            // Question types with shared structure
            return <QuestionEditor item={item} onUpdate={onUpdate} />;
    }
}

// Generic Question Editor for multiple_choice, arrange_words, select_image, mc_image
function QuestionEditor({
    item,
    onUpdate,
}: {
    item: ModuleItem;
    onUpdate: (data: Partial<ModuleItem>) => void;
}) {
    const options = Array.isArray(item.options) ? item.options : [];

    return (
        <div className="space-y-4">
            <div>
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                    <MessageCircleQuestion className="w-4 h-4 text-green-500" />
                    Question
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
                    options={options as string[]}
                    correctAnswer={item.correctAnswer || ''}
                    onUpdate={onUpdate}
                />
            )}

            {item.type === 'multiple_choice' && (
                <MultipleChoiceEditor
                    options={options as Array<{ id: string; label: string; isCorrect?: boolean }>}
                    correctAnswer={item.correctAnswer || ''}
                    onUpdate={onUpdate}
                />
            )}

            {item.type === 'select_image' && (
                <SelectImageEditor
                    options={options as Array<{ id: string; imageUrl: string; label?: string }>}
                    correctAnswer={item.correctAnswer || ''}
                    onUpdate={onUpdate}
                />
            )}

            {item.type === 'mc_image' && (
                <McImageEditor
                    options={options as Array<{ id: string; imageUrl: string; label?: string }>}
                    correctAnswer={item.correctAnswer || ''}
                    onUpdate={onUpdate}
                />
            )}

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
