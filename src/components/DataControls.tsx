import React, { useRef } from 'react';
import { Download, Upload, RefreshCw, Trash2 } from 'lucide-react';
import type { SadhanaLogs } from '../types';
import { generateMockStoreData } from '../sadhanaUtils';

interface DataControlsProps {
  logs: SadhanaLogs;
  onImport: (logs: SadhanaLogs) => void;
  onClear: () => void;
}

export const DataControls: React.FC<DataControlsProps> = ({ logs, onImport, onClear }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    try {
      const dataStr = JSON.stringify(logs, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `sadhana_journal_backup_${new Date().toISOString().split('T')[0]}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
    } catch (error) {
      alert('Failed to export data: ' + error);
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleImportFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    const files = event.target.files;
    
    if (!files || files.length === 0) return;

    fileReader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const importedData = JSON.parse(content);
        
        // Basic structure check
        if (typeof importedData !== 'object' || importedData === null) {
          throw new Error('Invalid file format. Must be a JSON object.');
        }

        // Check if any keys look like dates
        const keys = Object.keys(importedData);
        if (keys.length > 0) {
          const firstKey = keys[0];
          // Check YYYY-MM-DD pattern
          if (!/^\d{4}-\d{2}-\d{2}$/.test(firstKey)) {
            throw new Error('JSON format is invalid. Keys must be YYYY-MM-DD date strings.');
          }
        }

        if (confirm(`Successfully read backup file containing ${keys.length} entries. Would you like to import and replace current logs?`)) {
          onImport(importedData);
        }
      } catch (error: any) {
        alert('Error importing file: ' + error.message);
      }
      
      // Clear input so same file can be uploaded again
      if (fileInputRef.current) fileInputRef.current.value = '';
    };

    fileReader.readAsText(files[0]);
  };

  const handleLoadMockData = () => {
    if (confirm('This will load 45 days of sample mock logs to demonstrate the calendar and statistics. Would you like to proceed?')) {
      const mock = generateMockStoreData();
      onImport(mock as any);
    }
  };

  const handleReset = () => {
    if (confirm('CRITICAL WARNING: This will permanently delete ALL your logged sadhanas and journal entries. There is no undo. Are you absolutely sure?')) {
      if (confirm('Double confirmation: Type "DELETE" in the prompt if you are sure.')) {
        onClear();
      }
    }
  };

  return (
    <div className="glass-panel rounded-lg p-5 flex flex-col md:flex-row gap-4 items-center justify-between border border-white/[0.04] shadow-sm">
      <div className="text-center md:text-left">
        <h3 className="font-serif text-white font-semibold text-sm">Data Backup & Recovery</h3>
        <p className="text-[10px] md:text-xs text-slate-500 font-sans mt-0.5">
          Backup your logs locally as a JSON file or import a previous backup.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 justify-center w-full md:w-auto">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImportFile}
          accept=".json"
          className="hidden"
        />

        {/* Load Mock Data */}
        <button
          onClick={handleLoadMockData}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-sadhana-gold hover:text-white bg-sadhana-gold/5 hover:bg-sadhana-gold/15 border border-sadhana-gold/25 hover:border-sadhana-gold/50 rounded-xl transition-all"
          title="Seed with sample data"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Load Demo Data
        </button>

        {/* Import Backup */}
        <button
          onClick={handleImportClick}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl transition-all"
          title="Upload JSON backup file"
        >
          <Upload className="w-3.5 h-3.5" />
          Import Backup
        </button>

        {/* Export Backup */}
        <button
          onClick={handleExport}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-black bg-white hover:bg-slate-100 hover:scale-[1.02] active:scale-[0.98] rounded-xl transition-all shadow-md shadow-white/5"
          title="Download JSON backup file"
          disabled={Object.keys(logs).length === 0}
          style={{ opacity: Object.keys(logs).length === 0 ? 0.5 : 1 }}
        >
          <Download className="w-3.5 h-3.5" />
          Export Backup
        </button>

        {/* Reset Data */}
        <button
          onClick={handleReset}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-500 hover:text-rose-400 bg-rose-950/15 hover:bg-rose-950/30 border border-rose-950/30 hover:border-rose-900/40 rounded-xl transition-all"
          title="Clear all logs"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Reset All
        </button>
      </div>
    </div>
  );
};
