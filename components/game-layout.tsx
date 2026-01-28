
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export function GameLayout({
    children,
    className,
}: {
    children: ReactNode;
    className?: string;
}) {
    return (
        <div className="flex min-h-screen flex-col bg-slate-100 font-sans text-slate-800">
            <div className={cn("mx-auto w-full max-w-md flex-1 flex flex-col bg-white shadow-xl min-h-screen", className)}>
                {children}
            </div>
        </div>
    );
}
