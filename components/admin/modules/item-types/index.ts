import {
    Type,
    FileText,
    HelpCircle,
    ListOrdered,
    Image,
    Video,
    ImageIcon,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface ItemTypeConfig {
    type: string;
    label: string;
    icon: LucideIcon;
    color: string;
    description: string;
    category: 'content' | 'question';
}

export const ITEM_TYPES: ItemTypeConfig[] = [
    // Content types
    { type: 'header', label: 'Header', icon: Type, color: 'bg-purple-100 text-purple-600', description: 'Section divider with title', category: 'content' },
    { type: 'material', label: 'Material', icon: FileText, color: 'bg-blue-100 text-blue-600', description: 'Rich text content', category: 'content' },
    { type: 'material_image', label: 'Material (Image)', icon: ImageIcon, color: 'bg-blue-100 text-blue-600', description: 'Image-based content', category: 'content' },
    { type: 'material_video', label: 'Material (Video)', icon: Video, color: 'bg-blue-100 text-blue-600', description: 'Video-based content', category: 'content' },

    // Question types
    { type: 'multiple_choice', label: 'Multiple Choice', icon: HelpCircle, color: 'bg-green-100 text-green-600', description: 'Question with text options', category: 'question' },
    { type: 'mc_image', label: 'MC (Image Options)', icon: Image, color: 'bg-green-100 text-green-600', description: 'Question with image options', category: 'question' },
    { type: 'arrange_words', label: 'Arrange Words', icon: ListOrdered, color: 'bg-orange-100 text-orange-600', description: 'Arrange words in order', category: 'question' },
    { type: 'select_image', label: 'Select Image', icon: Image, color: 'bg-pink-100 text-pink-600', description: 'Choose correct image', category: 'question' },
    { type: 'question_image', label: 'Question (Image)', icon: ImageIcon, color: 'bg-teal-100 text-teal-600', description: 'Text question with image', category: 'question' },
    { type: 'question_video', label: 'Question (Video)', icon: Video, color: 'bg-teal-100 text-teal-600', description: 'Text question with video', category: 'question' },
];

export function getItemTypeConfig(type: string): ItemTypeConfig | undefined {
    return ITEM_TYPES.find(t => t.type === type);
}
