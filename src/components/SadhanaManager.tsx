import React, { useState } from 'react';
import { Plus, Edit2, Trash2, X, Check, Repeat, Circle } from 'lucide-react';
import type { SadhanaConfig, SadhanaColorPreset, SadhanaCountType } from '../types';
import { getColorHex, MALA_REPS } from '../sadhanaUtils';

interface SadhanaManagerProps {
  sadhanas: SadhanaConfig[];
  onAdd: (sadhana: SadhanaConfig) => void;
  onUpdate: (sadhana: SadhanaConfig) => void;
  onDelete: (id: string) => void;
  isReferencedInSankalp: (id: string) => boolean;
}

const COLOR_PRESETS: { value: SadhanaColorPreset; label: string; bg: string }[] = [
  { value: 'saffron', label: 'Saffron (Energy)', bg: 'bg-[#f97316]' },
  { value: 'crimson', label: 'Crimson (Shakti)', bg: 'bg-[#ef4444]' },
  { value: 'emerald', label: 'Emerald (Growth)', bg: 'bg-[#10b981]' },
  { value: 'blue', label: 'Royal Blue (Infinity)', bg: 'bg-[#3b82f6]' },
  { value: 'purple', label: 'Purple (Lotus)', bg: 'bg-[#a855f7]' }
];

export const SadhanaManager: React.FC<SadhanaManagerProps> = ({
  sadhanas,
  onAdd,
  onUpdate,
  onDelete,
  isReferencedInSankalp
}) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [sanskritName, setSanskritName] = useState('');
  const [description, setDescription] = useState('');
  const [colorPreset, setColorPreset] = useState<SadhanaColorPreset>('saffron');
  const [hasCount, setHasCount] = useState(true);
  const [countType, setCountType] = useState<SadhanaCountType>('reps');
  const [countUnit, setCountUnit] = useState('Times Recited');
  const [performDaily, setPerformDaily] = useState(true);

  const resetForm = () => {
    setName('');
    setSanskritName('');
    setDescription('');
    setColorPreset('saffron');
    setHasCount(true);
    setCountType('reps');
    setCountUnit('Times Recited');
    setPerformDaily(true);
    setEditingId(null);
    setIsFormOpen(false);
  };

  const handleOpenAdd = () => {
    resetForm();
    setIsFormOpen(true);
  };

  const handleOpenEdit = (s: SadhanaConfig) => {
    setEditingId(s.id);
    setName(s.name);
    setSanskritName(s.sanskritName || '');
    setDescription(s.description || '');
    setColorPreset(s.colorPreset);
    setHasCount(s.hasCount);
    setCountType(s.countType || 'reps');
    setCountUnit(s.countUnit || 'Times Recited');
    setPerformDaily(s.performDaily ?? false);
    setIsFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const data: SadhanaConfig = {
      id: editingId || `sadhana_${Date.now()}`,
      name: name.trim(),
      sanskritName: sanskritName.trim() || undefined,
      description: description.trim() || undefined,
      colorPreset,
      hasCount,
      countType: hasCount ? countType : undefined,
      countUnit: (hasCount && countType === 'reps') ? (countUnit.trim() || 'Times Recited') : undefined,
      defaultCount: hasCount ? (countType === 'mala' ? MALA_REPS : 1) : undefined,
      performDaily
    };

    if (editingId) {
      onUpdate(data);
    } else {
      onAdd(data);
    }
    resetForm();
  };

  const handleDelete = (id: string, name: string) => {
    if (isReferencedInSankalp(id)) {
      alert(`Cannot delete "${name}" because it is currently linked to an active or completed Sankalp vow. Delete the Sankalp first.`);
      return;
    }

    if (confirm(`Are you sure you want to delete "${name}"? All previous daily logs for this practice will be removed from display.`)) {
      onDelete(id);
    }
  };

  return (
    <div className="glass-panel rounded-lg p-6 border border-white/[0.04] shadow-sm space-y-6">
      
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-serif text-white font-semibold">Sadhana Practices</h2>
          <p className="text-xs text-slate-500 font-sans mt-0.5">
            Configure your spiritual routine and add custom habits.
          </p>
        </div>
        {!isFormOpen && (
          <button
            onClick={handleOpenAdd}
            className="flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-black bg-sadhana-gold hover:bg-sadhana-gold/90 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-md self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            Add Custom Practice
          </button>
        )}
      </div>

      {/* Form Section */}
      {isFormOpen && (
        <form onSubmit={handleSubmit} className="p-4 rounded-xl border border-white/[0.08] bg-white/[0.01] space-y-4 animate-fade-in">
          <div className="flex justify-between items-center pb-2 border-b border-white/[0.05]">
            <h3 className="text-sm font-serif font-bold text-sadhana-gold">
              {editingId ? 'Edit Sadhana Practice' : 'Create Custom Sadhana Practice'}
            </h3>
            <button 
              type="button" 
              onClick={resetForm}
              className="text-slate-500 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* English Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400">English Name *</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Pranayama, Gayatri Mantra"
                required
                className="w-full bg-sadhana-dark border border-white/10 rounded-xl px-4 py-2 text-sm text-white placeholder-slate-600 outline-none transition-all focus:border-sadhana-gold/50"
              />
            </div>

            {/* Sanskrit Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400">Sanskrit / Script Name (Optional)</label>
              <input
                type="text"
                value={sanskritName}
                onChange={e => setSanskritName(e.target.value)}
                placeholder="e.g. प्राणायाम, गायत्री मंत्र"
                className="w-full bg-sadhana-dark border border-white/10 rounded-xl px-4 py-2 text-sm text-white placeholder-slate-600 outline-none transition-all focus:border-sadhana-gold/50"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-400">Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Describe the method, mantra, context, or benefit..."
              className="w-full h-16 bg-sadhana-dark border border-white/10 rounded-xl px-4 py-2 text-sm text-white placeholder-slate-600 outline-none transition-all focus:border-sadhana-gold/50 resize-none"
            />
          </div>

          {/* Count Toggle & Mode */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
            
            {/* Has Count Checkbox */}
            <button
              type="button"
              onClick={() => setHasCount(!hasCount)}
              className="flex items-center gap-3 text-left py-2"
            >
              <div className={`
                w-5 h-5 rounded border flex items-center justify-center transition-all
                ${hasCount 
                  ? 'bg-sadhana-gold border-sadhana-gold text-black shadow-[0_0_8px_rgba(245,158,11,0.2)]' 
                  : 'border-white/20 text-transparent'
                }
              `}>
                <Check className="w-3.5 h-3.5 stroke-[3px]" />
              </div>
              <div>
                <div className="text-xs font-semibold text-white">Track Repetitions / Quantities</div>
                <p className="text-[10px] text-slate-500">Track counts like rounds (malas), minutes, or recitations.</p>
              </div>
            </button>

            {/* Count Unit (only for reps mode) */}
            {hasCount && countType === 'reps' && (
              <div className="space-y-1.5 animate-fade-in">
                <label className="text-xs font-semibold text-slate-400">Unit of Count</label>
                <input
                  type="text"
                  value={countUnit}
                  onChange={e => setCountUnit(e.target.value)}
                  placeholder="e.g. Minutes, Times Recited"
                  required
                  className="w-full bg-sadhana-dark border border-white/10 rounded-xl px-4 py-2 text-sm text-white placeholder-slate-600 outline-none transition-all focus:border-sadhana-gold/50"
                />
              </div>
            )}
          </div>

          {/* Count Mode selector (only shown when hasCount is enabled) */}
          {hasCount && (
            <div className="space-y-2 animate-fade-in">
              <label className="text-xs font-semibold text-slate-400 block">Count Mode</label>
              <div className="flex flex-col sm:flex-row gap-3">
                {/* Simple Reps option */}
                <button
                  type="button"
                  onClick={() => setCountType('reps')}
                  className={`
                    flex-1 flex items-center gap-2.5 px-4 py-3 rounded-xl border text-left transition-all
                    ${countType === 'reps'
                      ? 'border-sadhana-gold/60 bg-sadhana-gold/8 text-white'
                      : 'border-white/10 bg-white/[0.01] text-slate-400 hover:text-white hover:border-white/20'
                    }
                  `}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${countType === 'reps' ? 'bg-sadhana-gold/15 text-sadhana-gold' : 'bg-white/5 text-slate-500'}`}>
                    <Repeat className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold">Simple Repetitions</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Count in times recited, minutes, etc.</div>
                  </div>
                  {countType === 'reps' && <Check className="w-3.5 h-3.5 ml-auto text-sadhana-gold stroke-[3px] shrink-0" />}
                </button>

                {/* Mala Chanting option */}
                <button
                  type="button"
                  onClick={() => setCountType('mala')}
                  className={`
                    flex-1 flex items-center gap-2.5 px-4 py-3 rounded-xl border text-left transition-all
                    ${countType === 'mala'
                      ? 'border-purple-500/60 bg-purple-500/8 text-white'
                      : 'border-white/10 bg-white/[0.01] text-slate-400 hover:text-white hover:border-white/20'
                    }
                  `}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${countType === 'mala' ? 'bg-purple-500/15 text-purple-400' : 'bg-white/5 text-slate-500'}`}>
                    <Circle className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold">Mala Chanting</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">1 Mala = {MALA_REPS} repetitions</div>
                  </div>
                  {countType === 'mala' && <Check className="w-3.5 h-3.5 ml-auto text-purple-400 stroke-[3px] shrink-0" />}
                </button>
              </div>
            </div>
          )}

          {/* Perform Daily Option */}
          <div className="border-t border-white/5 pt-3">
            <button
              type="button"
              onClick={() => setPerformDaily(!performDaily)}
              className="flex items-center gap-3 text-left py-2"
            >
              <div className={`
                w-5 h-5 rounded border flex items-center justify-center transition-all
                ${performDaily 
                  ? 'bg-sadhana-gold border-sadhana-gold text-black shadow-[0_0_8px_rgba(245,158,11,0.2)]' 
                  : 'border-white/20 text-transparent'
                }
              `}>
                <Check className="w-3.5 h-3.5 stroke-[3px]" />
              </div>
              <div>
                <div className="text-xs font-semibold text-white">Perform Daily (Always on Calendar)</div>
                <p className="text-[10px] text-slate-500">Show this practice in the daily journal on all calendar dates, even outside vow ranges.</p>
              </div>
            </button>
          </div>

          {/* Color Preset Selector */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400 block">Psychology & Visual Color Preset</label>
            <div className="flex flex-wrap gap-4 pt-1">
              {COLOR_PRESETS.map(p => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setColorPreset(p.value)}
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center transition-all border-2 relative group
                    ${colorPreset === p.value 
                      ? 'border-white scale-110 shadow-lg shadow-white/10' 
                      : 'border-transparent hover:border-white/30'
                    }
                  `}
                  title={p.label}
                >
                  <span className={`w-7 h-7 rounded-full ${p.bg}`} />
                  {colorPreset === p.value && (
                    <span className="absolute -bottom-5 text-[8px] text-slate-400 font-medium scale-90 whitespace-nowrap">
                      {p.value.toUpperCase()}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-white/[0.05]">
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-black bg-sadhana-gold hover:bg-sadhana-gold/90 rounded-xl font-sans"
            >
              {editingId ? 'Save Changes' : 'Create Sadhana'}
            </button>
          </div>
        </form>
      )}

      {/* List Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sadhanas.map(s => {
          const colorHex = getColorHex(s.colorPreset);
          const isPreset = ['hanuman_chalisa', 'sidhkunjika_stotra', 'navarna_mantra', 'deviatharvashirsha', 'sri_suktam'].includes(s.id);

          return (
            <div
              key={s.id}
              className="p-4 rounded-xl border border-white/[0.06] bg-white/[0.02] flex flex-col justify-between hover:border-white/10 transition-colors"
            >
              <div>
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <h3 className="text-sm font-semibold text-white flex items-center gap-1.5">
                      {s.name}
                      {s.sanskritName && (
                        <span className="text-[10px] text-slate-500 font-serif font-normal">
                          {s.sanskritName}
                        </span>
                      )}
                    </h3>
                    <p className="text-[10px] text-slate-500 font-sans mt-0.5 leading-normal max-h-12 overflow-hidden text-ellipsis">
                      {s.description || 'No description provided.'}
                    </p>
                  </div>
                  {/* Color Preset Badge */}
                  <span 
                    className="w-3.5 h-3.5 rounded-full shrink-0" 
                    style={{ backgroundColor: colorHex, boxShadow: `0 0 8px ${colorHex}50` }}
                    title={`Color preset: ${s.colorPreset}`}
                  />
                </div>

                <div className="flex flex-wrap gap-1.5 mt-3">
                  {s.hasCount && (
                    <span className="inline-block text-[10px] rounded font-mono">
                      {s.countType === 'mala' ? (
                        <span className="bg-purple-500/10 text-purple-300 border border-purple-500/20 px-2 py-0.5 rounded">
                          🙿 Mala Chanting
                        </span>
                      ) : (
                        <span className="bg-white/[0.04] text-slate-400 border border-white/5 px-2 py-0.5 rounded">
                          Unit: {s.countUnit || 'Reps'}
                        </span>
                      )}
                    </span>
                  )}

                  {s.performDaily && (
                    <span className="inline-block text-[10px] bg-sadhana-gold/10 text-sadhana-gold border border-sadhana-gold/25 px-2 py-0.5 rounded font-sans font-semibold">
                      Daily Practice
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 mt-4 pt-2 border-t border-white/[0.03]">
                <button
                  onClick={() => handleOpenEdit(s)}
                  className="p-1.5 rounded hover:bg-white/5 text-slate-500 hover:text-white transition-colors"
                  title="Edit practice details"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(s.id, s.name)}
                  className="p-1.5 rounded hover:bg-white/5 text-slate-500 hover:text-rose-500 transition-colors"
                  title={isPreset ? 'Original Preset Practice' : 'Delete practice'}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
