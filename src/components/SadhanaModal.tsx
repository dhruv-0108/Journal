import React, { useState, useEffect } from 'react';
import { X, Flame, Shield, Flower2, Sparkles, Sun, Trash2, Check, Plus, Minus } from 'lucide-react';
import type { SadhanaDayLog, SadhanaConfig, SadhanaColorPreset, Sankalp } from '../types';
import { getColorHex, getOffsetDateString } from '../sadhanaUtils';

interface SadhanaModalProps {
  date: Date;
  sadhanas: SadhanaConfig[];
  sankalps: Sankalp[];
  log?: SadhanaDayLog;
  isOpen: boolean;
  onClose: () => void;
  onSave: (dateStr: string, log: SadhanaDayLog) => void;
  onDelete: (dateStr: string) => void;
}

// Icon mapping based on color preset
const getPresetIcon = (preset: SadhanaColorPreset) => {
  switch (preset) {
    case 'saffron': return <Sun className="w-5 h-5" />;
    case 'crimson': return <Flame className="w-5 h-5" />;
    case 'emerald': return <Flower2 className="w-5 h-5" />;
    case 'blue': return <Shield className="w-5 h-5" />;
    case 'purple': return <Sparkles className="w-5 h-5" />;
    default: return <Sparkles className="w-5 h-5" />;
  }
};

export const SadhanaModal: React.FC<SadhanaModalProps> = ({
  date,
  sadhanas,
  sankalps,
  log,
  isOpen,
  onClose,
  onSave,
  onDelete
}) => {
  const dateStr = date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Format date key YYYY-MM-DD
  const formatDateKey = (d: Date): string => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const dateKey = formatDateKey(date);

  // Local state for editing (dynamic keys)
  const [completed, setCompleted] = useState<Record<string, boolean>>({});
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [notes, setNotes] = useState<string>('');

  // Sync state when log changes, date changes, or sadhanas list changes
  useEffect(() => {
    const initialCompleted: Record<string, boolean> = {};
    const initialCounts: Record<string, number> = {};

    sadhanas.forEach(s => {
      initialCompleted[s.id] = log?.completed[s.id] || false;
      initialCounts[s.id] = log?.counts[s.id] ?? s.defaultCount ?? 1;
    });

    setCompleted(initialCompleted);
    setCounts(initialCounts);
    setNotes(log?.notes || '');
  }, [log, date, sadhanas]);

  if (!isOpen) return null;

  const handleToggle = (id: string) => {
    setCompleted(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleIncrement = (id: string) => {
    setCounts(prev => ({
      ...prev,
      [id]: (prev[id] || 0) + 1
    }));
  };

  const handleDecrement = (id: string) => {
    setCounts(prev => ({
      ...prev,
      [id]: Math.max(1, (prev[id] || 1) - 1)
    }));
  };

  const handleSave = () => {
    // Construct safe output
    const cleanCompleted: Record<string, boolean> = {};
    const cleanCounts: Record<string, number> = {};

    sadhanas.forEach(s => {
      cleanCompleted[s.id] = completed[s.id] || false;
      cleanCounts[s.id] = counts[s.id] ?? s.defaultCount ?? 1;
    });

    onSave(dateKey, {
      completed: cleanCompleted,
      counts: cleanCounts,
      notes: notes.trim() || undefined
    });
    onClose();
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to clear the logs for this day?')) {
      onDelete(dateKey);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-[2px] animate-fade-in">
      <div className="glass-modal w-full max-w-lg rounded-lg overflow-hidden shadow-2xl animate-slide-up flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="flex justify-between items-center p-5 border-b border-white/[0.08] bg-white/[0.02]">
          <div>
            <h3 className="text-lg md:text-xl font-serif text-white font-semibold">
              Daily Sadhana Journal
            </h3>
            <p className="text-xs md:text-sm text-sadhana-gold font-sans font-medium mt-0.5">
              {dateStr}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center border border-white/10 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-grow">
          {/* Sadhana Checklist */}
          <div className="space-y-4">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Sadhana Practices
            </h4>
            
            {sadhanas.length > 0 ? (
              <div className="space-y-2">
                {sadhanas.map(s => {
                  const isChecked = completed[s.id] || false;
                  const count = counts[s.id] ?? 1;
                  const colorHex = getColorHex(s.colorPreset);

                  // Find if there is an active Sankalp vow for this sadhana on the selected day
                  const activeVow = sankalps.find(v => 
                    v.sadhanaId === s.id && 
                    v.status === 'active' &&
                    dateKey >= v.startDate &&
                    dateKey <= getOffsetDateString(v.startDate, v.durationDays - 1)
                  );

                  return (
                    <div 
                      key={s.id}
                      className="p-3 rounded-xl border flex flex-col gap-3 transition-all duration-300 border-white/[0.04] bg-white/[0.01] hover:bg-white/[0.03]"
                      style={{
                        borderColor: isChecked ? `${colorHex}30` : undefined,
                        backgroundColor: isChecked ? `${colorHex}03` : undefined
                      }}
                    >
                      <div className="flex items-center justify-between">
                        {/* Checkbox & Label */}
                        <button
                          onClick={() => handleToggle(s.id)}
                          className="flex items-center gap-3 text-left flex-grow"
                        >
                          {/* Checkbox */}
                          <div 
                            className={`w-5 h-5 rounded-sm border flex items-center justify-center transition-all text-transparent`}
                            style={{
                              borderColor: isChecked ? colorHex : 'rgba(255, 255, 255, 0.15)',
                              backgroundColor: isChecked ? colorHex : 'transparent',
                              color: isChecked ? '#000000' : undefined,
                              boxShadow: isChecked ? `0 0 8px ${colorHex}25` : undefined
                            }}
                          >
                            <Check className="w-3.5 h-3.5 stroke-[3px]" />
                          </div>
                          
                          <div className="flex items-center gap-2">
                            {/* Icon Wrapper */}
                            <div 
                              className="w-8 h-8 rounded-md flex items-center justify-center border transition-all"
                              style={{
                                borderColor: isChecked ? `${colorHex}30` : 'rgba(255, 255, 255, 0.05)',
                                backgroundColor: isChecked ? `${colorHex}10` : 'rgba(255, 255, 255, 0.01)',
                                color: isChecked ? colorHex : '#8e96a3'
                              }}
                            >
                              {getPresetIcon(s.colorPreset)}
                            </div>
                            <div>
                              <div className="text-sm font-semibold text-white flex items-center gap-2">
                                {s.name}
                                {s.sanskritName && (
                                  <span className="text-[10px] font-normal text-slate-500 font-serif">
                                    {s.sanskritName}
                                  </span>
                                )}
                              </div>
                              {s.description && (
                                <p className="text-[10px] text-slate-500 leading-normal max-w-[280px]">
                                  {s.description}
                                </p>
                              )}
                              {activeVow && (
                                <div className="text-[10px] font-bold text-sadhana-gold flex items-center gap-1 mt-1">
                                  <span>🎯 Daily Vow Target: {activeVow.targetCount} {s.countUnit || 'Reps'}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </button>
                      </div>

                      {/* Count adjustor (visible when checked) */}
                      {isChecked && s.hasCount && (
                        <div className="flex items-center justify-between pl-9 pr-2 py-1 bg-white/[0.01] rounded-lg border border-white/[0.04] animate-fade-in">
                          <span className="text-xs text-slate-400 font-medium">
                            {s.countUnit || 'Reps'}
                          </span>
                          
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => handleDecrement(s.id)}
                              className="w-6 h-6 rounded bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
                              type="button"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            
                            <input
                              type="number"
                              min={1}
                              value={count}
                              onChange={e => {
                                const val = Math.max(1, parseInt(e.target.value, 10) || 1);
                                setCounts(prev => ({ ...prev, [s.id]: val }));
                              }}
                              className="w-14 bg-sadhana-dark border border-white/10 rounded px-1.5 py-0.5 text-center text-sm font-bold text-white outline-none focus:border-sadhana-gold/50 font-mono"
                            />
                            
                            <button
                              onClick={() => handleIncrement(s.id)}
                              className="w-6 h-6 rounded bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
                              type="button"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-6 text-center text-slate-500 text-xs">
                No practices defined. Set up practices in settings first.
              </div>
            )}
          </div>

          {/* Reflections/Notes Section */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
              Reflections & Spiritual Insights
            </label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="How did you feel? Focus level, energy levels, timeframe (Brahma Muhurta), or details about the mantras chanting..."
              className="w-full h-24 bg-sadhana-dark border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-slate-600 outline-none transition-all duration-200 focus:border-sadhana-gold-accent font-serif resize-none"
            />
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-5 border-t border-white/[0.08] bg-white/[0.01] flex justify-between items-center gap-3">
          {log ? (
            <button
              onClick={handleDelete}
              className="flex items-center gap-2 px-3 py-2 text-xs md:text-sm font-semibold text-rose-400 hover:text-rose-300 bg-rose-950/15 hover:bg-rose-950/30 border border-rose-900/20 hover:border-rose-900/40 rounded-lg transition-colors"
              title="Delete log entry"
            >
              <Trash2 className="w-4 h-4" />
              Clear Day
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs md:text-sm font-semibold text-slate-400 hover:text-white bg-transparent hover:bg-white/5 rounded-lg border border-transparent transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 text-xs md:text-sm font-semibold text-black bg-sadhana-gold hover:bg-sadhana-gold-accent rounded-lg font-sans shadow transition-colors"
            >
              Save Log
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
