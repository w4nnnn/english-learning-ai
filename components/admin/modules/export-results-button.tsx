'use client';

import { useState } from 'react';
import { FileSpreadsheet, Download, Check } from 'lucide-react';
import type { StudentResult } from '@/lib/actions/user-progress';

interface ExportResultsButtonProps {
    moduleId: string;
    moduleTitle: string;
    results: StudentResult[];
}

export function ExportResultsButton({ moduleId, moduleTitle, results }: ExportResultsButtonProps) {
    const [exporting, setExporting] = useState(false);
    const [exported, setExported] = useState(false);

    const exportToCSV = () => {
        setExporting(true);

        try {
            // Get all unique questions
            const questions = results[0]?.responses.map(r => r.question) || [];

            // Build CSV headers
            const headers = [
                'No',
                'Username',
                'Status',
                'Score (%)',
                'Total Items',
                'Completed Items',
                'Started At',
                'Completed At',
                ...questions.flatMap((q, i) => [
                    `Q${i + 1}: ${q.substring(0, 50)}...`,
                    `Q${i + 1} Correct`,
                    `Q${i + 1} Attempts`
                ])
            ];

            // Build CSV rows
            const rows = results.map((result, index) => {
                const baseRow = [
                    index + 1,
                    result.username,
                    result.status,
                    result.score,
                    result.totalItems,
                    result.completedItems,
                    result.startedAt ? new Date(result.startedAt).toLocaleString('id-ID') : '-',
                    result.completedAt ? new Date(result.completedAt).toLocaleString('id-ID') : '-',
                ];

                const responseRow = result.responses.flatMap(r => [
                    r.userAnswer || '-',
                    r.isCorrect === null ? '-' : r.isCorrect ? 'Yes' : 'No',
                    r.attemptCount
                ]);

                return [...baseRow, ...responseRow];
            });

            // Convert to CSV string
            const csvContent = [
                headers.join(','),
                ...rows.map(row => 
                    row.map(cell => {
                        const cellStr = String(cell);
                        // Escape quotes and wrap in quotes if contains comma or quote
                        if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
                            return `"${cellStr.replace(/"/g, '""')}"`;
                        }
                        return cellStr;
                    }).join(',')
                )
            ].join('\n');

            // Download
            const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.setAttribute('href', url);
            link.setAttribute('download', `hasil-${moduleTitle.replace(/[^a-zA-Z0-9]/g, '-')}-${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            setExported(true);
            setTimeout(() => setExported(false), 2000);
        } catch (error) {
            console.error('Export failed:', error);
        } finally {
            setExporting(false);
        }
    };

    const exportToJSON = () => {
        setExporting(true);

        try {
            const exportData = {
                moduleId,
                moduleTitle,
                exportedAt: new Date().toISOString(),
                totalStudents: results.length,
                results: results.map(r => ({
                    ...r,
                    startedAt: r.startedAt?.toISOString(),
                    completedAt: r.completedAt?.toISOString(),
                }))
            };

            const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.setAttribute('href', url);
            link.setAttribute('download', `hasil-${moduleTitle.replace(/[^a-zA-Z0-9]/g, '-')}-${new Date().toISOString().split('T')[0]}.json`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            setExported(true);
            setTimeout(() => setExported(false), 2000);
        } catch (error) {
            console.error('Export failed:', error);
        } finally {
            setExporting(false);
        }
    };

    return (
        <div className="flex items-center gap-2">
            <button
                onClick={exportToCSV}
                disabled={exporting}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white font-medium rounded-xl shadow-md hover:shadow-lg transition-elegant disabled:opacity-50"
            >
                {exported ? (
                    <Check className="w-4 h-4" />
                ) : (
                    <FileSpreadsheet className="w-4 h-4" />
                )}
                Export CSV
            </button>
            <button
                onClick={exportToJSON}
                disabled={exporting}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl shadow-md hover:shadow-lg transition-elegant disabled:opacity-50"
            >
                {exported ? (
                    <Check className="w-4 h-4" />
                ) : (
                    <Download className="w-4 h-4" />
                )}
                Export JSON
            </button>
        </div>
    );
}
