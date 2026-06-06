import React from 'react';
import { useStore } from '../../store/useStore';
import { FiDownload, FiFileText, FiDatabase, FiUpload } from 'react-icons/fi';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import Papa from 'papaparse';

export const ExportCenter: React.FC = () => {
  const state = useStore();

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text('DevFlow Productivity Report', 14, 22);

    doc.setFontSize(12);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 32);

    const activeTasks = state.tasks.filter(t => t.columnId !== 'done');
    const completedTasks = state.tasks.filter(t => t.columnId === 'done');

    // Tasks Table
    (doc as any).autoTable({
      startY: 40,
      head: [['Task Title', 'Status', 'Priority']],
      body: [
        ...activeTasks.map(t => [t.title, 'Active', t.priority.toUpperCase()]),
        ...completedTasks.map(t => [t.title, 'Completed', t.priority.toUpperCase()]),
      ],
      theme: 'grid',
      headStyles: { fillColor: [40, 40, 40] }
    });

    // Goals Table
    (doc as any).autoTable({
      startY: (doc as any).lastAutoTable.finalY + 15,
      head: [['Goal', 'Period', 'Progress']],
      body: state.goals.map(g => [g.title, g.period, `${g.current}/${g.target}`]),
      theme: 'grid',
      headStyles: { fillColor: [40, 40, 40] }
    });

    doc.save('devflow-report.pdf');
  };

  const handleExportCSV = () => {
    const csvData = state.tasks.map(t => ({
      Title: t.title,
      Description: t.description,
      Status: t.columnId,
      Priority: t.priority,
      Tags: t.tags.join(', '),
      CreatedAt: new Date(t.createdAt).toLocaleDateString()
    }));

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'devflow-tasks.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportBackup = () => {
    const backupData = {
      tasks: state.tasks,
      notes: state.notes,
      events: state.events,
      goals: state.goals,
      habits: state.habits,
      settings: state.settings,
      timestamp: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `devflow-backup-${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.tasks && data.notes) {
          // Setting directly into localStorage and reloading to ensure full store rehydration 
          // (assuming standard store setup)
          const currentStoreStr = localStorage.getItem('dev-productivity-platform-store');
          if (currentStoreStr) {
            const currentStore = JSON.parse(currentStoreStr);
            currentStore.state = {
              ...currentStore.state,
              tasks: data.tasks,
              notes: data.notes,
              events: data.events || [],
              goals: data.goals || [],
              habits: data.habits || [],
              settings: data.settings || currentStore.state.settings,
            };
            localStorage.setItem('dev-productivity-platform-store', JSON.stringify(currentStore));
            alert('Backup imported successfully. The app will now reload.');
            window.location.reload();
          }
        }
      } catch (err) {
        alert('Invalid backup file format.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="glass-panel rounded-2xl p-6 shadow-xl space-y-4 md:col-span-2">
      <div className="flex items-center gap-2.5 text-xs font-bold text-neutral-350 uppercase tracking-wider mb-4">
        <FiDownload className="w-4 h-4" />
        <span>Export &amp; Backup Center</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {/* PDF Export */}
        <button
          type="button"
          onClick={handleExportPDF}
          className="flex flex-col items-center justify-center p-4 bg-neutral-900 border border-neutral-800 hover:border-neutral-600 rounded-xl transition-colors group cursor-pointer text-center"
        >
          <FiFileText className="w-6 h-6 text-neutral-400 group-hover:text-white mb-2" />
          <span className="text-xs font-bold text-neutral-200">PDF Report</span>
          <span className="text-[10px] text-neutral-500 mt-1">Tasks &amp; Goals summary</span>
        </button>

        {/* CSV Export */}
        <button
          type="button"
          onClick={handleExportCSV}
          className="flex flex-col items-center justify-center p-4 bg-neutral-900 border border-neutral-800 hover:border-neutral-600 rounded-xl transition-colors group cursor-pointer text-center"
        >
          <FiFileText className="w-6 h-6 text-neutral-400 group-hover:text-white mb-2" />
          <span className="text-xs font-bold text-neutral-200">CSV Export</span>
          <span className="text-[10px] text-neutral-500 mt-1">Spreadsheet format</span>
        </button>

        {/* JSON Backup */}
        <button
          type="button"
          onClick={handleExportBackup}
          className="flex flex-col items-center justify-center p-4 bg-neutral-900 border border-neutral-800 hover:border-neutral-600 rounded-xl transition-colors group cursor-pointer text-center"
        >
          <FiDatabase className="w-6 h-6 text-neutral-400 group-hover:text-white mb-2" />
          <span className="text-xs font-bold text-neutral-200">Export Backup</span>
          <span className="text-[10px] text-neutral-500 mt-1">Full JSON payload</span>
        </button>

        {/* JSON Import */}
        <div className="relative">
          <input 
            type="file" 
            accept=".json" 
            onChange={handleImportBackup}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            title="Import Backup"
          />
          <div className="h-full flex flex-col items-center justify-center p-4 bg-neutral-900 border border-neutral-800 hover:border-neutral-600 rounded-xl transition-colors group pointer-events-none text-center">
            <FiUpload className="w-6 h-6 text-neutral-400 group-hover:text-white mb-2" />
            <span className="text-xs font-bold text-neutral-200">Import Backup</span>
            <span className="text-[10px] text-neutral-500 mt-1">Restore from JSON</span>
          </div>
        </div>
      </div>
    </div>
  );
};
