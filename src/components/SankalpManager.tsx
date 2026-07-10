import React, { useState, useMemo } from 'react';
import { Plus, X, Calendar, Sparkles, Trash2, Calculator, Clock, Target } from 'lucide-react';
import type { Sankalp, SadhanaConfig, SadhanaLogs } from '../types';
import { getSankalpProgress, formatDateString, MALA_REPS, formatSadhanaCount } from '../sadhanaUtils';

interface SankalpManagerProps {
  sankalps: Sankalp[];
  sadhanas: SadhanaConfig[];
  logs: SadhanaLogs;
  onAdd: (sankalp: Sankalp) => void;
  onUpdateStatus: (id: string, status: 'completed' | 'abandoned') => void;
  onDelete: (id: string) => void;
}

// Planning mode: user knows daily capacity → calculates days needed
// OR user knows duration → calculates daily target needed
type PlanningMode = 'know-daily' | 'know-duration';

export const SankalpManager: React.FC<SankalpManagerProps> = ({
  sankalps,
  sadhanas,
  logs,
  onAdd,
  onUpdateStatus,
  onDelete
}) => {
  const [isFormOpen, setIsFormOpen] = useState(false);

  // ── Core form fields ──────────────────────────────────────────────────────
  const [title, setTitle] = useState('');
  const [sadhanaId, setSadhanaId] = useState(sadhanas[0]?.id || '');
  const [startDate, setStartDate] = useState(formatDateString(new Date()));

  // ── Planning mode ─────────────────────────────────────────────────────────
  const [planningMode, setPlanningMode] = useState<PlanningMode>('know-daily');

  // ── Mode A: "I know my daily target" fields ───────────────────────────────
  // dailyTargetStr is kept as a string so the user can freely type (no forced min clamp)
  const [dailyTargetStr, setDailyTargetStr] = useState('1');
  const [durationPreset, setDurationPreset] = useState<'11' | '21' | '41' | '108' | 'custom'>('41');
  const [customDuration, setCustomDuration] = useState(40);

  // ── Mode B: "Calculate for me" fields ────────────────────────────────────
  // totalCountStr: total REPETITIONS the user wants to complete (we convert to malas internally)
  // capacityStr: how many malas/reps they can do per day
  const [totalCountStr, setTotalCountStr] = useState('');
  const [capacityStr, setCapacityStr] = useState('');
  // For mode B, duration is either fixed (calculate days) or give days (calculate daily)
  const [modeB, setModeB] = useState<'calc-days' | 'calc-daily'>('calc-days');
  const [modeBDaysStr, setModeBDaysStr] = useState('41');

  /** Is the currently-selected practice a mala-type? */
  const selectedSadhana = sadhanas.find(s => s.id === sadhanaId);
  const isMalaType = selectedSadhana?.countType === 'mala';
  const unitLabel = isMalaType ? 'Malas' : (selectedSadhana?.countUnit || 'Reps');

  // ── Derived computations for planning mode ────────────────────────────────
  const modeADailyTarget = parseInt(dailyTargetStr, 10) || 0;
  const modeADuration = durationPreset === 'custom' ? customDuration : parseInt(durationPreset, 10);

  // Mode B: user enters REPETITIONS — we derive malas from that
  const modeBTotalReps = parseInt(totalCountStr, 10) || 0;
  // For mala-type: convert reps → malas (ceiling). For reps-type: use raw value.
  const modeBTotalMalas = isMalaType ? Math.ceil(modeBTotalReps / MALA_REPS) : modeBTotalReps;
  const modeBCapacity = parseInt(capacityStr, 10) || 0;
  const modeBDays = parseInt(modeBDaysStr, 10) || 0;

  // Mode B calc-days: given total malas + daily capacity (malas/day) → how many days?
  const calcDaysNeeded = useMemo(() => {
    if (modeBTotalMalas > 0 && modeBCapacity > 0) {
      return Math.ceil(modeBTotalMalas / modeBCapacity);
    }
    return null;
  }, [modeBTotalMalas, modeBCapacity]);

  // Mode B calc-daily: given total malas + days → what daily target (malas/day)?
  const calcDailyNeeded = useMemo(() => {
    if (modeBTotalMalas > 0 && modeBDays > 0) {
      return Math.ceil(modeBTotalMalas / modeBDays);
    }
    return null;
  }, [modeBTotalMalas, modeBDays]);

  const handleOpenAdd = () => {
    setTitle('');
    if (sadhanas.length > 0) setSadhanaId(sadhanas[0].id);
    setDailyTargetStr('1');
    setDurationPreset('41');
    setCustomDuration(40);
    setStartDate(formatDateString(new Date()));
    setPlanningMode('know-daily');
    setTotalCountStr('');
    setCapacityStr('');
    setModeB('calc-days');
    setModeBDaysStr('41');
    setIsFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !sadhanaId) return;

    let finalDailyTarget = 0;
    let finalDuration = 0;

    if (planningMode === 'know-daily') {
      finalDailyTarget = modeADailyTarget;
      finalDuration = modeADuration;
    } else {
      // Planning mode B — finalDailyTarget is in malas (for mala-type) or reps
      if (modeB === 'calc-days') {
        if (!calcDaysNeeded || modeBCapacity <= 0) return;
        finalDailyTarget = modeBCapacity;   // user's stated daily capacity (malas/day)
        finalDuration = calcDaysNeeded;
      } else {
        if (!calcDailyNeeded || modeBDays <= 0) return;
        finalDailyTarget = calcDailyNeeded; // calculated malas/day required
        finalDuration = modeBDays;
      }
    }

    if (finalDailyTarget <= 0 || finalDuration <= 0) return;

    // For mala-type sadhanas, convert entered Malas count to raw reps
    const rawTargetCount = isMalaType ? finalDailyTarget * MALA_REPS : finalDailyTarget;

    const newSankalp: Sankalp = {
      id: `sankalp_${Date.now()}`,
      title: title.trim(),
      sadhanaId,
      targetCount: rawTargetCount,
      durationDays: finalDuration,
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

  const getSadhanaConfig = (id: string): SadhanaConfig | undefined =>
    sadhanas.find(item => item.id === id);

  const activeSankalps = sankalps.filter(s => s.status === 'active');
  const completedSankalps = sankalps.filter(s => s.status !== 'active');

  // ── Shared input style ────────────────────────────────────────────────────
  const inputCls = 'w-full bg-sadhana-dark border border-white/10 rounded-xl px-4 py-2 text-sm text-white placeholder-slate-600 outline-none transition-all focus:border-sadhana-gold/50 font-mono';
  const labelCls = 'text-xs font-semibold text-slate-400';

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

      {/* ── Form ──────────────────────────────────────────────────────────── */}
      {isFormOpen && (
        <form onSubmit={handleSubmit} className="p-4 rounded-xl border border-white/[0.08] bg-white/[0.01] space-y-5 animate-fade-in">
          {/* Form header */}
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

          {/* Title + Practice */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5 col-span-1 md:col-span-2">
              <label className={labelCls}>Vow Title</label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. 41-Day Durga Sadhana, Daily Gayatri Vow"
                required
                className={inputCls.replace('font-mono', '')}
              />
            </div>

            <div className="space-y-1.5">
              <label className={labelCls}>Select Practice</label>
              <select
                value={sadhanaId}
                onChange={e => setSadhanaId(e.target.value)}
                className={inputCls}
              >
                {sadhanas.map(s => (
                  <option key={s.id} value={s.id} className="bg-sadhana-dark text-white">
                    {s.name} {s.sanskritName ? `(${s.sanskritName})` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className={labelCls}>Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                required
                className={inputCls}
              />
            </div>
          </div>

          {/* ── Planning Mode Toggle ─────────────────────────────────────── */}
          <div className="space-y-3">
            <label className={labelCls}>How would you like to plan your vow?</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPlanningMode('know-daily')}
                className={`flex items-center gap-2 p-3 rounded-xl border text-left transition-all ${
                  planningMode === 'know-daily'
                    ? 'border-sadhana-gold/60 bg-sadhana-gold/5 text-white'
                    : 'border-white/10 bg-white/[0.01] text-slate-400 hover:border-white/20'
                }`}
              >
                <div className={`p-1.5 rounded-lg shrink-0 ${planningMode === 'know-daily' ? 'bg-sadhana-gold/15 text-sadhana-gold' : 'bg-white/5 text-slate-500'}`}>
                  <Clock className="w-3.5 h-3.5" />
                </div>
                <div>
                  <p className="text-xs font-bold leading-tight">I know my daily target</p>
                  <p className="text-[10px] text-slate-500 mt-0.5 leading-snug">Set daily count & duration days directly</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPlanningMode('know-duration')}
                className={`flex items-center gap-2 p-3 rounded-xl border text-left transition-all ${
                  planningMode === 'know-duration'
                    ? 'border-purple-400/60 bg-purple-500/5 text-white'
                    : 'border-white/10 bg-white/[0.01] text-slate-400 hover:border-white/20'
                }`}
              >
                <div className={`p-1.5 rounded-lg shrink-0 ${planningMode === 'know-duration' ? 'bg-purple-500/15 text-purple-400' : 'bg-white/5 text-slate-500'}`}>
                  <Calculator className="w-3.5 h-3.5" />
                </div>
                <div>
                  <p className="text-xs font-bold leading-tight">Calculate for me</p>
                  <p className="text-[10px] text-slate-500 mt-0.5 leading-snug">Enter total goal & capacity — auto-plan</p>
                </div>
              </button>
            </div>
          </div>

          {/* ── Mode A: Know Daily Target ─────────────────────────────────── */}
          {planningMode === 'know-daily' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
              {/* Daily target */}
              <div className="space-y-1.5">
                <label className={labelCls}>
                  Daily Target
                  {isMalaType
                    ? <span className="text-purple-300"> (Malas — 1 Mala = {MALA_REPS} Reps)</span>
                    : <span> ({unitLabel})</span>
                  }
                </label>
                <input
                  type="number"
                  min={1}
                  value={dailyTargetStr}
                  onChange={e => setDailyTargetStr(e.target.value)}
                  placeholder={isMalaType ? '1' : '1'}
                  required
                  className={inputCls}
                />
                {isMalaType && modeADailyTarget > 0 && (
                  <div className="mt-1 text-[10px] text-slate-500">
                    = <span className="text-white font-semibold">{modeADailyTarget * MALA_REPS}</span> raw repetitions
                  </div>
                )}
              </div>

              {/* Duration */}
              <div className="space-y-1.5">
                <label className={labelCls}>Vow Duration (Days)</label>
                <select
                  value={durationPreset}
                  onChange={e => setDurationPreset(e.target.value as any)}
                  className={inputCls}
                >
                  <option value="11">11 Days (Short discipline)</option>
                  <option value="21">21 Days (Habit form)</option>
                  <option value="41">41 Days (Transformation - Recommended)</option>
                  <option value="108">108 Days (Complete alignment)</option>
                  <option value="custom">Custom days...</option>
                </select>
              </div>

              {durationPreset === 'custom' && (
                <div className="space-y-1.5 animate-fade-in">
                  <label className={labelCls}>Enter Custom Days</label>
                  <input
                    type="number"
                    min={1}
                    value={customDuration}
                    onChange={e => setCustomDuration(Math.max(1, parseInt(e.target.value, 10) || 1))}
                    required
                    className={inputCls}
                  />
                </div>
              )}

              {/* Summary pill */}
              {modeADailyTarget > 0 && modeADuration > 0 && (
                <div className="col-span-1 md:col-span-2 flex items-center gap-2 px-3 py-2 rounded-lg bg-sadhana-gold/[0.06] border border-sadhana-gold/15">
                  <Target className="w-3.5 h-3.5 text-sadhana-gold shrink-0" />
                  <span className="text-xs text-slate-300">
                    <span className="font-bold text-sadhana-gold">{modeADailyTarget} {unitLabel}/day</span>
                    {' '}for{' '}
                    <span className="font-bold text-white">{modeADuration} days</span>
                    {' '}→ Total:{' '}
                    <span className="font-bold text-sadhana-gold">
                      {(modeADailyTarget * modeADuration).toLocaleString()} {unitLabel}
                    </span>
                  </span>
                </div>
              )}
            </div>
          )}

          {/* ── Mode B: Calculate For Me ──────────────────────────────────── */}
          {planningMode === 'know-duration' && (
            <div className="space-y-4 animate-fade-in">
              {/* Sub-mode toggle */}
              <div className="flex rounded-xl overflow-hidden border border-white/10 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setModeB('calc-days')}
                  className={`flex-1 py-2 transition-colors ${modeB === 'calc-days' ? 'bg-purple-600/30 text-purple-300' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  How many days will I need?
                </button>
                <div className="w-px bg-white/10" />
                <button
                  type="button"
                  onClick={() => setModeB('calc-daily')}
                  className={`flex-1 py-2 transition-colors ${modeB === 'calc-daily' ? 'bg-purple-600/30 text-purple-300' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  What should my daily target be?
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Total repetitions goal (shared) */}
                <div className="space-y-1.5 col-span-1 md:col-span-2">
                  <label className={labelCls}>
                    Total Repetitions I Want to Complete
                    {isMalaType && <span className="text-purple-300"> — we'll convert to Malas for you</span>}
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={totalCountStr}
                    onChange={e => setTotalCountStr(e.target.value)}
                    placeholder={isMalaType ? 'e.g. 100000 repetitions' : 'e.g. 100'}
                    required
                    className={inputCls}
                  />
                  {isMalaType && modeBTotalReps > 0 && (
                    <div className="flex items-center gap-2 mt-1.5 px-2.5 py-1.5 rounded-lg bg-purple-600/[0.08] border border-purple-500/20">
                      <span className="text-[10px] text-slate-400">
                        <span className="text-purple-300 font-bold">{modeBTotalReps.toLocaleString()}</span> reps
                        {' '}={' '}
                        <span className="text-white font-bold">{modeBTotalMalas.toLocaleString()}</span> Mala{modeBTotalMalas !== 1 ? 's' : ''}
                        {' '}(1 Mala = {MALA_REPS} reps)
                      </span>
                    </div>
                  )}
                </div>

                {/* Mode B - calc-days: enter daily capacity in malas */}
                {modeB === 'calc-days' && (
                  <div className="space-y-1.5 col-span-1 md:col-span-2">
                    <label className={labelCls}>
                      My Daily Capacity
                      {isMalaType
                        ? <span className="text-purple-300"> (Malas/day — how many Malas can you sit for each day?)</span>
                        : <span> ({unitLabel}/day)</span>
                      }
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={capacityStr}
                      onChange={e => setCapacityStr(e.target.value)}
                      placeholder={isMalaType ? 'e.g. 5' : 'e.g. 2'}
                      required
                      className={inputCls}
                    />
                    {isMalaType && modeBCapacity > 0 && (
                      <div className="text-[10px] text-slate-500">
                        = <span className="text-white font-semibold">{(modeBCapacity * MALA_REPS).toLocaleString()}</span> repetitions per day
                      </div>
                    )}
                  </div>
                )}

                {/* Mode B - calc-daily: enter target duration */}
                {modeB === 'calc-daily' && (
                  <div className="space-y-1.5 col-span-1 md:col-span-2">
                    <label className={labelCls}>
                      Target Vow Duration (Days)
                    </label>
                    <select
                      value={modeBDaysStr}
                      onChange={e => setModeBDaysStr(e.target.value)}
                      className={inputCls}
                    >
                      <option value="11">11 Days</option>
                      <option value="21">21 Days</option>
                      <option value="41">41 Days (Recommended)</option>
                      <option value="108">108 Days</option>
                      <option value="custom">Custom...</option>
                    </select>
                    {modeBDaysStr === 'custom' && (
                      <input
                        type="number"
                        min={1}
                        value={modeBDays || ''}
                        onChange={e => setModeBDaysStr(e.target.value)}
                        placeholder="Enter days"
                        className={`${inputCls} mt-2`}
                      />
                    )}
                  </div>
                )}
              </div>

              {/* ── Result panel ─────────────────────────────────────────── */}
              {modeB === 'calc-days' && modeBTotalReps > 0 && modeBCapacity > 0 && calcDaysNeeded && (
                <div className="p-3 rounded-xl border border-purple-500/25 bg-purple-600/[0.06] space-y-3">
                  <p className="text-[10px] uppercase tracking-wider text-purple-400 font-semibold">Your Personalised Plan</p>
                  <div className="flex flex-wrap gap-4 items-start">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-white font-mono">{calcDaysNeeded}</p>
                      <p className="text-[10px] text-slate-400">Days Required</p>
                    </div>
                    <div className="w-px bg-white/10 self-stretch" />
                    <div className="text-center">
                      <p className="text-2xl font-bold text-purple-300 font-mono">{modeBCapacity}</p>
                      <p className="text-[10px] text-slate-400">Malas / day</p>
                      {isMalaType && (
                        <p className="text-[9px] text-slate-600 font-mono mt-0.5">{(modeBCapacity * MALA_REPS).toLocaleString()} reps/day</p>
                      )}
                    </div>
                    <div className="w-px bg-white/10 self-stretch" />
                    <div className="text-center">
                      <p className="text-2xl font-bold text-sadhana-gold font-mono">{modeBTotalMalas.toLocaleString()}</p>
                      <p className="text-[10px] text-slate-400">Total Malas</p>
                      {isMalaType && (
                        <p className="text-[9px] text-slate-600 font-mono mt-0.5">{modeBTotalReps.toLocaleString()} reps</p>
                      )}
                    </div>
                  </div>
                  {isMalaType && (
                    <div className="pt-2 border-t border-white/5 space-y-1">
                      <p className="text-[10px] text-slate-400">
                        <span className="text-purple-300 font-semibold">{modeBCapacity} Mala/day</span>
                        {' '}×{' '}
                        <span className="text-white font-semibold">{calcDaysNeeded} days</span>
                        {' '}={' '}
                        <span className="text-sadhana-gold font-semibold">{(modeBCapacity * calcDaysNeeded).toLocaleString()} Malas</span>
                        {' '}completed
                      </p>
                      <p className="text-[10px] text-slate-500">
                        = <span className="text-white font-semibold">{((modeBCapacity * calcDaysNeeded) * MALA_REPS).toLocaleString()}</span> total repetitions
                      </p>
                    </div>
                  )}
                </div>
              )}

              {modeB === 'calc-daily' && modeBTotalReps > 0 && modeBDays > 0 && calcDailyNeeded && (
                <div className="p-3 rounded-xl border border-purple-500/25 bg-purple-600/[0.06] space-y-3">
                  <p className="text-[10px] uppercase tracking-wider text-purple-400 font-semibold">Your Personalised Plan</p>
                  <div className="flex flex-wrap gap-4 items-start">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-purple-300 font-mono">{calcDailyNeeded}</p>
                      <p className="text-[10px] text-slate-400">Malas / day</p>
                      {isMalaType && (
                        <p className="text-[9px] text-slate-600 font-mono mt-0.5">{(calcDailyNeeded * MALA_REPS).toLocaleString()} reps/day</p>
                      )}
                    </div>
                    <div className="w-px bg-white/10 self-stretch" />
                    <div className="text-center">
                      <p className="text-2xl font-bold text-white font-mono">{modeBDays}</p>
                      <p className="text-[10px] text-slate-400">Days Duration</p>
                    </div>
                    <div className="w-px bg-white/10 self-stretch" />
                    <div className="text-center">
                      <p className="text-2xl font-bold text-sadhana-gold font-mono">{modeBTotalMalas.toLocaleString()}</p>
                      <p className="text-[10px] text-slate-400">Total Malas</p>
                      {isMalaType && (
                        <p className="text-[9px] text-slate-600 font-mono mt-0.5">{modeBTotalReps.toLocaleString()} reps</p>
                      )}
                    </div>
                  </div>
                  {isMalaType && (
                    <div className="pt-2 border-t border-white/5 space-y-1">
                      <p className="text-[10px] text-slate-400">
                        <span className="text-purple-300 font-semibold">{calcDailyNeeded} Mala/day</span>
                        {' '}×{' '}
                        <span className="text-white font-semibold">{modeBDays} days</span>
                        {' '}={' '}
                        <span className="text-sadhana-gold font-semibold">{(calcDailyNeeded * modeBDays).toLocaleString()} Malas</span>
                      </p>
                      <p className="text-[10px] text-slate-500">
                        = <span className="text-white font-semibold">{((calcDailyNeeded * modeBDays) * MALA_REPS).toLocaleString()}</span> total repetitions
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Validation hints */}
              {modeB === 'calc-days' && modeBTotalReps > 0 && modeBCapacity > 0 && !calcDaysNeeded && (
                <p className="text-xs text-rose-400">Please enter valid values above.</p>
              )}
            </div>
          )}

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

      {/* ── Active Sankalps ──────────────────────────────────────────────── */}
      <div className="space-y-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Active Resolutions
        </h3>

        {activeSankalps.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {activeSankalps.map(s => {
              const prog = getSankalpProgress(s, logs);
              const sadhanaName = getSadhanaName(s.sadhanaId);

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
                          <span>Daily Target: {formatSadhanaCount(s.targetCount, getSadhanaConfig(s.sadhanaId))}</span>
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

      {/* ── History / Archive ─────────────────────────────────────────────── */}
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
