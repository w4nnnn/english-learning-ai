'use client';

import { useState } from 'react';
import { FileSpreadsheet, FileText, Check } from 'lucide-react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { StudentResult } from '@/lib/actions/user-progress';

interface ExportResultsButtonProps {
    moduleId: string;
    moduleTitle: string;
    results: StudentResult[];
}

// Helper to format date nicely
function formatDate(date: Date | null | undefined): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

// Helper to format status
function formatStatus(status: string): string {
    switch (status) {
        case 'completed': return 'Selesai';
        case 'in_progress': return 'Dalam Pengerjaan';
        default: return 'Belum Mulai';
    }
}

// Strip markdown formatting for clean text
function stripMarkdown(text: string): string {
    return text
        .replace(/\*\*(.*?)\*\*/g, '$1') // Bold
        .replace(/\*(.*?)\*/g, '$1') // Italic
        .replace(/`(.*?)`/g, '$1') // Code
        .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Links
        .trim();
}

export function ExportResultsButton({ moduleId, moduleTitle, results }: ExportResultsButtonProps) {
    const [exporting, setExporting] = useState(false);
    const [exportedType, setExportedType] = useState<'excel' | 'pdf' | null>(null);

    const exportToExcel = () => {
        setExporting(true);

        try {
            const questions = results[0]?.responses.map(r => stripMarkdown(r.question)) || [];

            // Create workbook
            const wb = XLSX.utils.book_new();

            // ===== Sheet 1: Ringkasan =====
            const summaryData = [
                ['LAPORAN HASIL PEMBELAJARAN'],
                [''],
                ['Judul Modul', moduleTitle],
                ['Tanggal Export', formatDate(new Date())],
                ['Total Siswa', results.length],
                ['Siswa Selesai', results.filter(r => r.status === 'completed').length],
                ['Siswa Dalam Pengerjaan', results.filter(r => r.status === 'in_progress').length],
                ['Rata-rata Nilai', `${Math.round(results.reduce((acc, r) => acc + r.score, 0) / results.length)}%`],
                [''],
                ['DAFTAR NILAI SISWA'],
                [''],
                ['No', 'Nama Siswa', 'Status', 'Nilai (%)', 'Jumlah Soal', 'Soal Dijawab', 'Waktu Mulai', 'Waktu Selesai'],
                ...results.map((r, i) => [
                    i + 1,
                    r.username,
                    formatStatus(r.status),
                    r.score,
                    r.totalItems,
                    r.completedItems,
                    formatDate(r.startedAt),
                    formatDate(r.completedAt),
                ])
            ];

            const ws1 = XLSX.utils.aoa_to_sheet(summaryData);
            
            // Set column widths
            ws1['!cols'] = [
                { wch: 5 },   // No
                { wch: 20 },  // Nama
                { wch: 18 },  // Status
                { wch: 12 },  // Nilai
                { wch: 12 },  // Jumlah Soal
                { wch: 12 },  // Soal Dijawab
                { wch: 25 },  // Waktu Mulai
                { wch: 25 },  // Waktu Selesai
            ];

            XLSX.utils.book_append_sheet(wb, ws1, 'Ringkasan');

            // ===== Sheet 2: Detail Jawaban =====
            const detailHeaders = [
                'No',
                'Nama Siswa',
                ...questions.flatMap((q, i) => [
                    `Soal ${i + 1}`,
                    `Jawaban ${i + 1}`,
                    `Benar?`,
                ])
            ];

            const detailData = [
                ['DETAIL JAWABAN SISWA'],
                [''],
                detailHeaders,
                ...results.map((r, i) => [
                    i + 1,
                    r.username,
                    ...r.responses.flatMap(resp => [
                        stripMarkdown(resp.question),
                        resp.userAnswer || '(tidak dijawab)',
                        resp.isCorrect === null ? '-' : resp.isCorrect ? 'Ya' : 'Tidak',
                    ])
                ])
            ];

            const ws2 = XLSX.utils.aoa_to_sheet(detailData);
            
            // Set column widths for detail sheet
            const detailCols = [
                { wch: 5 },   // No
                { wch: 20 },  // Nama
            ];
            questions.forEach(() => {
                detailCols.push({ wch: 30 }); // Soal
                detailCols.push({ wch: 20 }); // Jawaban
                detailCols.push({ wch: 8 });  // Benar
            });
            ws2['!cols'] = detailCols;

            XLSX.utils.book_append_sheet(wb, ws2, 'Detail Jawaban');

            // ===== Sheet 3: Per Soal =====
            const questionAnalysisData = [
                ['ANALISIS PER SOAL'],
                [''],
                ['No', 'Pertanyaan', 'Jawaban Benar', 'Total Dijawab', 'Benar', 'Salah', 'Persentase Benar'],
            ];

            questions.forEach((q, qIdx) => {
                const responses = results.map(r => r.responses[qIdx]);
                const answered = responses.filter(r => r && r.userAnswer);
                const correct = responses.filter(r => r && r.isCorrect === true);
                const wrong = responses.filter(r => r && r.isCorrect === false);
                const correctAnswer = results[0]?.responses[qIdx]?.correctAnswer || '-';
                
                questionAnalysisData.push([
                    qIdx + 1,
                    q,
                    correctAnswer,
                    answered.length,
                    correct.length,
                    wrong.length,
                    answered.length > 0 ? `${Math.round((correct.length / answered.length) * 100)}%` : '-',
                ] as any);
            });

            const ws3 = XLSX.utils.aoa_to_sheet(questionAnalysisData);
            ws3['!cols'] = [
                { wch: 5 },
                { wch: 50 },
                { wch: 25 },
                { wch: 12 },
                { wch: 8 },
                { wch: 8 },
                { wch: 15 },
            ];

            XLSX.utils.book_append_sheet(wb, ws3, 'Analisis Soal');

            // Download
            XLSX.writeFile(wb, `Hasil-${moduleTitle.replace(/[^a-zA-Z0-9]/g, '-')}-${new Date().toISOString().split('T')[0]}.xlsx`);

            setExportedType('excel');
            setTimeout(() => setExportedType(null), 2000);
        } catch (error) {
            console.error('Export failed:', error);
        } finally {
            setExporting(false);
        }
    };

    const exportToPDF = () => {
        setExporting(true);

        try {
            const doc = new jsPDF('l', 'mm', 'a4'); // Landscape
            const pageWidth = doc.internal.pageSize.getWidth();
            const questions = results[0]?.responses.map(r => stripMarkdown(r.question)) || [];

            // ===== Page 1: Cover & Summary =====
            doc.setFontSize(20);
            doc.setFont('helvetica', 'bold');
            doc.text('LAPORAN HASIL PEMBELAJARAN', pageWidth / 2, 30, { align: 'center' });

            doc.setFontSize(14);
            doc.setFont('helvetica', 'normal');
            doc.text(moduleTitle, pageWidth / 2, 42, { align: 'center' });

            doc.setFontSize(10);
            doc.text(`Tanggal Export: ${formatDate(new Date())}`, pageWidth / 2, 52, { align: 'center' });

            // Summary Box
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text('RINGKASAN', 14, 70);

            const summaryStats = [
                ['Total Siswa', `${results.length} orang`],
                ['Siswa Selesai', `${results.filter(r => r.status === 'completed').length} orang`],
                ['Siswa Dalam Pengerjaan', `${results.filter(r => r.status === 'in_progress').length} orang`],
                ['Rata-rata Nilai', `${Math.round(results.reduce((acc, r) => acc + r.score, 0) / results.length)}%`],
            ];

            autoTable(doc, {
                startY: 75,
                head: [],
                body: summaryStats,
                theme: 'grid',
                styles: { fontSize: 10 },
                columnStyles: {
                    0: { fontStyle: 'bold', cellWidth: 60 },
                    1: { cellWidth: 50 },
                },
                margin: { left: 14 },
            });

            // Student List Table
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            const tableStartY = (doc as any).lastAutoTable.finalY + 15;
            doc.text('DAFTAR NILAI SISWA', 14, tableStartY);

            autoTable(doc, {
                startY: tableStartY + 5,
                head: [['No', 'Nama Siswa', 'Status', 'Nilai', 'Selesai', 'Waktu Mulai', 'Waktu Selesai']],
                body: results.map((r, i) => [
                    i + 1,
                    r.username,
                    formatStatus(r.status),
                    `${r.score}%`,
                    `${r.completedItems}/${r.totalItems}`,
                    formatDate(r.startedAt),
                    formatDate(r.completedAt),
                ]),
                theme: 'striped',
                headStyles: { fillColor: [59, 130, 246], fontStyle: 'bold' },
                styles: { fontSize: 9 },
                columnStyles: {
                    0: { cellWidth: 12 },
                    1: { cellWidth: 35 },
                    2: { cellWidth: 35 },
                    3: { cellWidth: 20 },
                    4: { cellWidth: 20 },
                    5: { cellWidth: 45 },
                    6: { cellWidth: 45 },
                },
            });

            // ===== Page 2: Question Analysis =====
            doc.addPage();
            doc.setFontSize(16);
            doc.setFont('helvetica', 'bold');
            doc.text('ANALISIS PER SOAL', pageWidth / 2, 20, { align: 'center' });

            const questionAnalysis = questions.map((q, qIdx) => {
                const responses = results.map(r => r.responses[qIdx]);
                const answered = responses.filter(r => r && r.userAnswer);
                const correct = responses.filter(r => r && r.isCorrect === true);
                const correctAnswer = results[0]?.responses[qIdx]?.correctAnswer || '-';
                const percentage = answered.length > 0 ? Math.round((correct.length / answered.length) * 100) : 0;

                return [
                    qIdx + 1,
                    q.length > 60 ? q.substring(0, 60) + '...' : q,
                    correctAnswer.length > 30 ? correctAnswer.substring(0, 30) + '...' : correctAnswer,
                    `${correct.length}/${answered.length}`,
                    `${percentage}%`,
                ];
            });

            autoTable(doc, {
                startY: 30,
                head: [['No', 'Pertanyaan', 'Jawaban Benar', 'Benar/Total', '% Benar']],
                body: questionAnalysis,
                theme: 'striped',
                headStyles: { fillColor: [34, 197, 94], fontStyle: 'bold' },
                styles: { fontSize: 9 },
                columnStyles: {
                    0: { cellWidth: 12 },
                    1: { cellWidth: 100 },
                    2: { cellWidth: 60 },
                    3: { cellWidth: 25 },
                    4: { cellWidth: 20 },
                },
            });

            // ===== Page 3+: Detail per Student =====
            doc.addPage();
            doc.setFontSize(16);
            doc.setFont('helvetica', 'bold');
            doc.text('DETAIL JAWABAN SISWA', pageWidth / 2, 20, { align: 'center' });

            let currentY = 30;

            results.forEach((student, sIdx) => {
                // Check if we need a new page
                if (currentY > 170) {
                    doc.addPage();
                    currentY = 20;
                }

                doc.setFontSize(11);
                doc.setFont('helvetica', 'bold');
                doc.text(`${sIdx + 1}. ${student.username} - Nilai: ${student.score}% (${formatStatus(student.status)})`, 14, currentY);
                currentY += 5;

                const studentResponses = student.responses.map((r, rIdx) => [
                    rIdx + 1,
                    stripMarkdown(r.question).length > 50 ? stripMarkdown(r.question).substring(0, 50) + '...' : stripMarkdown(r.question),
                    r.userAnswer || '(tidak dijawab)',
                    r.isCorrect === null ? '-' : r.isCorrect ? 'Ya' : 'Tidak',
                ]);

                autoTable(doc, {
                    startY: currentY,
                    head: [['#', 'Soal', 'Jawaban', 'Hasil']],
                    body: studentResponses,
                    theme: 'grid',
                    headStyles: { fillColor: [100, 116, 139], fontStyle: 'bold', fontSize: 8 },
                    styles: { fontSize: 8 },
                    columnStyles: {
                        0: { cellWidth: 8 },
                        1: { cellWidth: 100 },
                        2: { cellWidth: 60 },
                        3: { cellWidth: 15, halign: 'center' },
                    },
                    margin: { left: 14, right: 14 },
                });

                currentY = (doc as any).lastAutoTable.finalY + 10;
            });

            // Footer on all pages
            const pageCount = doc.getNumberOfPages();
            for (let i = 1; i <= pageCount; i++) {
                doc.setPage(i);
                doc.setFontSize(8);
                doc.setFont('helvetica', 'normal');
                doc.text(
                    `Halaman ${i} dari ${pageCount} | ${moduleTitle}`,
                    pageWidth / 2,
                    doc.internal.pageSize.getHeight() - 10,
                    { align: 'center' }
                );
            }

            // Download
            doc.save(`Hasil-${moduleTitle.replace(/[^a-zA-Z0-9]/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`);

            setExportedType('pdf');
            setTimeout(() => setExportedType(null), 2000);
        } catch (error) {
            console.error('Export failed:', error);
        } finally {
            setExporting(false);
        }
    };

    return (
        <div className="flex items-center gap-2">
            <button
                onClick={exportToExcel}
                disabled={exporting}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white font-medium rounded-xl shadow-md hover:shadow-lg transition-elegant disabled:opacity-50"
            >
                {exportedType === 'excel' ? (
                    <Check className="w-4 h-4" />
                ) : (
                    <FileSpreadsheet className="w-4 h-4" />
                )}
                Export Excel
            </button>
            <button
                onClick={exportToPDF}
                disabled={exporting}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl shadow-md hover:shadow-lg transition-elegant disabled:opacity-50"
            >
                {exportedType === 'pdf' ? (
                    <Check className="w-4 h-4" />
                ) : (
                    <FileText className="w-4 h-4" />
                )}
                Export PDF
            </button>
        </div>
    );
}
