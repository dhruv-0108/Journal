import React, { useState } from 'react';
import { Plus, X, Calendar, Sparkles, Trash2 } from 'lucide-react';
import type { Sankalp, SadhanaConfig, SadhanaLogs } from '../types';
import { getSankalpProgress, formatDateString } from '../sadhanaUtils';

interface SankalpManagerProps {
  sankalps: Sankalp[];
  sadhanas: SadhanaConfig[];
  logs: SadhanaLogs;
  onAdd: (sankalp: Sankalp) => void;
  onUpdateStatus: (id: string, status: 'completed' | 'abandoned') => void;
  onDelete: (id: string) => void;
}

export const SankalpManager: React.FC<SankalpManagerProps> = ({
  sankalps,
  sadhanas,
  logs,
  onAdd,
  onUpdateStatus,
  onDelete
}) => {
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [sadhanaId, setSadhanaId] = useState(sadhanas[0]?.id || '');
  const [targetCount, setTargetCount] = useState(1);
  const [durationPreset, setDurationPreset] = useState<'11' | '21' | '41' | '108' | 'custom'>('41');
  const [customDuration, setCustomDuration] = useState(40);
  const [startDate, setStartDate] = useState(formatDateString(new Date()));

  const handleOpenAdd = () => {
    setTitle('');
    if (sadhanas.length > 0) setSadhanaId(sadhanas[0].id);
    setTargetCount(1);
    setDurationPreset('41');
    setStartDate(formatDateString(new Date()));
    setIsFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !sadhanaId) return;

    const duration = durationPreset === 'custom' ? customDuration : parseInt(durationPreset, 10);

    const newSankalp: Sankalp = {
      id: `sankalp_${Date.now()}`,
      title: title.trim(),
      sadhanaId,
      targetCount,
      durationDays: duration,
      startDate,
      status: 'active'
    };

    onAdd(newSankalp);
    setIsFormOpen(false);
  };

  const getSadhanaName = (id: string) => {
    const s = sadhanas.find(item => item.id === id);
    return s ? s.name : 'Unknown Practice';
  };

  const getSadhanaUnit = (id: string) => {
    const s = sadhanas.find(item => item.id === id);
    return s?.countUnit || 'Reps';
  };

  const activeSankalps = sankalps.filter(s => s.status === 'active');
  const completedSankalps = sankalps.filter(s => s.status !== 'active');

  return (
    <div className="glass-panel rounded-lg p-6 border border-white/[0.04] shadow-sm space-y-6">
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-serif text-white font-semibold">Sankalp (Spiritual Vows)</h2>
          <p className="text-xs text-slate-500 font-sans mt-0.5">
            Commit to a daily practice resolution for a specific period and watch your discipline grow.
          </p>
        </div>
        {!isFormOpen && (
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-black bg-sadhana-gold hover:bg-sadhana-gold/90 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-md"
            disabled={sadhanas.length === 0}
            style={{ opacity: sadhanas.length === 0 ? 0.5 : 1 }}
          >
            <Plus className="w-4 h-4" />
            Resolve New Vow
          </button>
        )}
      </div>

      {/* Form */}
      {isFormOpen && (
        <form onSubmit={handleSubmit} className="p-4 rounded-xl border border-white/[0.08] bg-white/[0.01] space-y-4 animate-fade-in">
          <div className="flex justify-between items-center pb-2 border-b border-white/[0.05]">
            <h3 className="text-sm font-serif font-bold text-sadhana-gold">
              Resolve a New Sadhana Vow
            </h3>
            <button 
              type="button" 
              onClick={() => setIsFormOpen(false)}
              className="text-slate-500 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Title */}
            <div className="space-y-1.5 col-span-1 md:col-span-2">
              <label className="text-xs font-semibold text-slate-400">Vow Title (Title of Sankalp)</label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. 41-Day Durga Sadhana, Daily Gayatri Vow"
                required
                className="w-full bg-sadhana-dark border border-white/10 rounded-xl px-4 py-2 text-sm text-white placeholder-slate-600 outline-none transition-all focus:border-sadhana-gold/50"
              />
            </div>

            {/* Select Sadhana */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400">Select Practice</label>
              <select
                value={sadhanaId}
                onChange={e => setSadhanaId(e.target.value)}
                className="w-full bg-sadhana-dark border border-white/10 rounded-xl px-4 py-2 text-sm text-white outline-none transition-all focus:border-sadhana-gold/50"
              >
                {sadhanas.map(s => (
                  <option key={s.id} value={s.id} className="bg-sadhana-dark text-white">
                    {s.name} {s.sanskritName ? `(${s.sanskritName})` : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Target Daily Count */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400">
                Daily Target Count ({getSadhanaUnit(sadhanaId)})
              </label>
              <input
                type="number"
                min={1}
                value={targetCount}
                onChange={e => setTargetCount(Math.max(1, parseInt(e.target.value, 10) || 1))}
                required
                className="w-full bg-sadhana-dark border border-white/10 rounded-xl px-4 py-2 text-sm text-white outline-none transition-all focus:border-sadhana-gold/50 font-mono"
              />
            </div>

            {/* Duration Presets */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400">Vow Duration (Days)</label>
              <select
                value={durationPreset}
                onChange={e => setDurationPreset(e.target.value as any)}
                className="w-full bg-sadhana-dark border border-white/10 rounded-xl px-4 py-2 text-sm text-white outline-none transition-all focus:border-sadhana-gold/50"
              >
                <option value="11">11 Days (Short discipline)</option>
                <option value="21">21 Days (Habit form)</option>
                <option value="41">41 Days (Transformation - Recommended)</option>
                <option value="108">108 Days (Complete alignment)</option>
                <option value="custom">Custom days...</option>
              </select>
            </div>

            {/* Custom Days Input */}
            {durationPreset === 'custom' && (
              <div className="space-y-1.5 animate-fade-in">
                <label className="text-xs font-semibold text-slate-400">Enter Custom Days</label>
                <input
                  type="number"
                  min={1}
                  value={customDuration}
                  onChange={e => setCustomDuration(Math.max(1, parseInt(e.target.value, 10) || 1))}
                  required
                  className="w-full bg-sadhana-dark border border-white/10 rounded-xl px-4 py-2 text-sm text-white outline-none transition-all focus:border-sadhana-gold/50 font-mono"
                />
              </div>
            )}

            {/* Start Date */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                required
                className="w-full bg-sadhana-dark border border-white/10 rounded-xl px-4 py-2 text-sm text-white outline-none transition-all focus:border-sadhana-gold/50 font-mono"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-white/[0.05]">
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-black bg-sadhana-gold hover:bg-sadhana-gold/90 rounded-xl font-sans flex items-center gap-1 shadow-lg shadow-sadhana-gold/10"
            >
              <Sparkles className="w-3.5 h-3.5 fill-black/20" />
              Begin Sacred Vow
            </button>
          </div>
        </form>
      )}

      {/* Active Sankalps */}
      <div className="space-y-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Active Resolutions
        </h3>

        {activeSankalps.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {activeSankalps.map(s => {
              const prog = getSankalpProgress(s, logs);
              const sadhanaName = getSadhanaName(s.sadhanaId);
              const unit = getSadhanaUnit(s.sadhanaId);

              return (
                <div 
                  key={s.id}
                  className="p-5 rounded-lg border border-white/[0.04] bg-white/[0.005] hover:bg-white/[0.015] flex flex-col justify-between transition-colors shadow relative overflow-hidden group"
                >
                  {/* Glowing side accent */}
                  <div className="absolute top-0 left-0 w-[3px] h-full bg-sadhana-gold" />
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <h4 className="text-base font-serif text-white font-bold tracking-wide">
                          {s.title}
                        </h4>
                        <div className="text-[10px] text-slate-500 font-sans mt-0.5 flex flex-wrap gap-x-2 gap-y-0.5 items-center">
                          <span className="text-sadhana-gold font-semibold">{sadhanaName}</span>
                          <span>•</span>
                          <span>Daily Target: {s.targetCount} {unit}</span>
                          <span>•</span>
                          <span className="flex items-center gap-0.5 font-mono"><Calendar className="w-3 h-3" /> Start: {s.startDate}</span>
                        </div>
                      </div>

                      {/* Complete Vow Early Option */}
                      <div className="flex gap-1.5 shrink-0 opacity-40 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => onUpdateStatus(s.id, 'completed')}
                          className="px-2 py-1 text-[9px] font-bold text-[#10b981] bg-[#10b981]/10 hover:bg-[#10b981]/25 border border-[#10b981]/20 rounded-md transition-colors"
                          title="Complete vow successfully"
                        >
                          Mark Complete
                        </button>
                        <button
                          onClick={() => onUpdateStatus(s.id, 'abandoned')}
                          className="px-2 py-1 text-[9px] font-bold text-slate-400 hover:text-rose-400 bg-white/5 hover:bg-rose-950/20 border border-white/10 hover:border-rose-900/20 rounded-md transition-colors"
                          title="Abandon vow"
                        >
                          Abandon
                        </button>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-baseline text-xs">
                        <span className="text-slate-400">Resolution Progress</span>
                        <div className="flex items-center gap-1 text-white font-bold font-mono">
                          <span>{prog.daysCompleted}</span>
                          <span className="text-slate-600">/</span>
                          <span>{prog.daysTotal}</span>
                          <span className="text-xs text-[#10b981] ml-1.5">({prog.progressPercent}%)</span>
                        </div>
                      </div>

                      {/* Progress bar wrapper */}
                      <div className="w-full h-2 rounded-full bg-white/[0.04] overflow-hidden border border-white/[0.02]">
                        <div 
                          className="h-full rounded-full bg-[#10b981] transition-all duration-1000"
                          style={{ width: `${prog.progressPercent}%` }}
                        />
                      </div>
                    </div>

                    {/* Commit Matrix (GitHub-style calendar dots) */}
                    <div className="space-y-1">
                      <span className="text-[10px] font-semibold text-slate-500 block uppercase tracking-wider">
                        Commitment Timeline (Days 1 to {prog.daysTotal})
                      </span>
                      <div className="flex flex-wrap gap-1 py-1">
                        {prog.timelineDays.map((day, idx) => {
                          const dateKey = day.dateStr;
                          
                          // Styling
                          let dotStyle = 'bg-white/[0.04] border-white/[0.05]';
                          let titleMsg = `Day ${idx + 1} (${dateKey}): Unlogged / Future`;
                          
                          if (day.logged) {
                            if (day.success) {
                              dotStyle = 'bg-[#10b981] border-[#10b981]/20 shadow-[0_0_5px_rgba(16,185,129,0.3)] scale-[1.05]';
                              titleMsg = `Day ${idx + 1} (${dateKey}): Met target successfully!`;
                            } else {
                              dotStyle = 'bg-rose-600/70 border-rose-600/30';
                              titleMsg = `Day ${idx + 1} (${dateKey}): Logged but missed target`;
                            }
                          }

                          return (
                            <span
                              key={dateKey}
                              className={`w-3.5 h-3.5 rounded border transition-all duration-300 ${dotStyle}`}
                              title={titleMsg}
                            />
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-6 text-center text-slate-500 border border-dashed border-white/10 rounded-lg text-xs">
            No active resolutions right now. Commit to a new Sankalp above.
          </div>
        )}
      </div>

      {/* Completed/History Section */}
      <div className="space-y-4 pt-2">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          History & Vows Archive
        </h3>

        {completedSankalps.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {completedSankalps.map(s => {
              const prog = getSankalpProgress(s, logs);
              const isCompleted = s.status === 'completed';

              return (
                <div 
                  key={s.id}
                  className="p-4 rounded-xl border border-white/[0.05] bg-white/[0.01] flex flex-col justify-between hover:bg-white/[0.02] transition-colors"
                >
                  <div className="space-y-2">
                    <div className="flex justify-between items-start gap-1">
                      <h4 className="text-sm font-semibold text-slate-200">{s.title}</h4>
                      
                      {/* Badge status */}
                      <span className={`
                        text-[9px] px-1.5 py-0.5 rounded font-bold uppercase
                        ${isCompleted 
                          ? 'bg-[#10b981]/10 text-[#10b981] border border-[#10b981]/25' 
                          : 'bg-rose-950/20 text-rose-400 border border-rose-900/30'
                        }
                      `}>
                        {s.status}
                      </span>
                    </div>

                    <div className="text-[10px] text-slate-500">
                      Practice: <span className="text-slate-400 font-semibold">{getSadhanaName(s.sadhanaId)}</span>
                    </div>

                    <div className="flex justify-between text-xs font-mono text-slate-400">
                      <span>Achieved:</span>
                      <span className="font-bold">{prog.daysCompleted} / {prog.daysTotal} days</span>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 mt-4 pt-2 border-t border-white/[0.03]">
                    <button
                      onClick={() => onDelete(s.id)}
                      className="p-1 rounded hover:bg-white/5 text-slate-500 hover:text-rose-500 transition-colors"
                      title="Delete from archive"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-4 text-center text-slate-600 text-xs">
            Archive is empty.
          </div>
        )}
      </div>

    </div>
  );
};
