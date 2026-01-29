import type { ModuleItem } from '@/lib/actions/modules';

export interface ItemEditorProps {
    item: ModuleItem;
    onUpdate: (data: Partial<ModuleItem>) => void;
}
