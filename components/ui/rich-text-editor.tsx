'use client';

import { useRef, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// Toast UI Editor CSS
import '@toast-ui/editor/dist/toastui-editor.css';

// Dynamically import Toast UI Editor to avoid SSR issues
const ToastEditor = dynamic(
    () => import('@toast-ui/react-editor').then((mod) => mod.Editor),
    {
        ssr: false,
        loading: () => (
            <div className="animate-pulse bg-slate-100 rounded-lg h-32 flex items-center justify-center">
                <span className="text-slate-400 text-sm">Loading editor...</span>
            </div>
        )
    }
);

interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    mode?: 'minimal' | 'full';
    placeholder?: string;
    height?: string;
}

export function RichTextEditor({
    value,
    onChange,
    mode = 'full',
    placeholder = 'Start typing...',
    height = '300px',
}: RichTextEditorProps) {
    const editorRef = useRef<any>(null);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    useEffect(() => {
        if (editorRef.current) {
            const instance = editorRef.current.getInstance();
            if (instance && instance.getMarkdown() !== value) {
                instance.setMarkdown(value || '');
            }
        }
    }, [value]);

    const handleChange = () => {
        if (editorRef.current) {
            const instance = editorRef.current.getInstance();
            if (instance) {
                const markdown = instance.getMarkdown();
                onChange(markdown);
            }
        }
    };

    if (!isClient) {
        return (
            <div className="animate-pulse bg-slate-100 rounded-lg h-32 flex items-center justify-center">
                <span className="text-slate-400 text-sm">Loading editor...</span>
            </div>
        );
    }

    const toolbarItems = mode === 'minimal'
        ? [['bold', 'italic', 'strike']]
        : [
            ['heading', 'bold', 'italic', 'strike'],
            ['hr', 'quote'],
            ['ul', 'ol', 'task'],
            ['table', 'link'],
            ['code', 'codeblock'],
        ];

    return (
        <div className="rich-text-editor-wrapper">
            <ToastEditor
                ref={editorRef}
                initialValue={value || ''}
                previewStyle="vertical"
                height={mode === 'minimal' ? '150px' : height}
                initialEditType="wysiwyg"
                useCommandShortcut={true}
                toolbarItems={toolbarItems}
                placeholder={placeholder}
                onChange={handleChange}
                hideModeSwitch={mode === 'minimal'}
            />
            <style jsx global>{`
                .rich-text-editor-wrapper .toastui-editor-defaultUI {
                    border: 1px solid #e2e8f0;
                    border-radius: 0.5rem;
                    overflow: hidden;
                }
                .rich-text-editor-wrapper .toastui-editor-toolbar {
                    background: #f8fafc;
                    border-bottom: 1px solid #e2e8f0;
                }
                .rich-text-editor-wrapper .toastui-editor-ww-container {
                    background: white;
                }
                .rich-text-editor-wrapper .toastui-editor-contents {
                    font-size: 0.875rem;
                    padding: 1rem;
                }
                .rich-text-editor-wrapper .toastui-editor-contents p {
                    margin: 0.5rem 0;
                }
            `}</style>
        </div>
    );
}
