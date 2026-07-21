import React, { useState, useMemo } from 'react';
import { Plus, X, Calendar, Sparkles, Trash2, Target, RotateCcw, Edit2, AlertTriangle } from 'lucide-react';
import type { Sankalp, SadhanaConfig, SadhanaLogs } from '../types';
import { getSankalpProgress, formatDateString, MALA_REPS, formatSadhanaCount, getOffsetDateString } from '../sadhanaUtils';

interface SankalpManagerProps {
  sankalps: Sankalp[];
  sadhanas: SadhanaConfig[];
  logs: SadhanaLogs;
  onAdd: (sankalpData: {
    title: string;
    practiceName: string;
    practiceType: 'stotra' | 'mantra';
    targetCount: number;
    durationDays: number;
    startDate: string;
  }) => void;
  onUpdateStatus: (id: string, status: 'completed' | 'abandoned') => void;
  onDelete: (id: string) => void;
  onRetry: (id: string, retryData: {
    startDate: string;
    durationDays: number;
    targetCount: number;
  }) => void;
  onUpdateStartDate?: (id: string, newStartDate: string) => void;
}

type GoalUnit   = 'mala' | 'reps';        // only relevant for mala-type practices
type DailyUnit  = 'mala' | 'reps';        // only relevant for mala-type practices
type CalcSub    = 'calc-days' | 'calc-daily';

export const SankalpManager: React.FC<SankalpManagerProps> = ({
  sankalps, sadhanas, logs, onAdd, onUpdateStatus, onDelete, onRetry, onUpdateStartDate
}) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDateSankalpId, setEditingDateSankalpId] = useState<string | null>(null);
  const [editDateVal, setEditDateVal] = useState<string>('');

  // ── Core fields ──────────────────────────────────────────────────────────
  const [title, setTitle]       = useState('');
  const [startDate, setStartDate] = useState(formatDateString(new Date()));
  const [practiceType, setPracticeType] = useState<'stotra' | 'mantra'>('stotra');

  // ── Goal (Step 2) ────────────────────────────────────────────────────────
  const [goalStr,  setGoalStr]  = useState('');          // raw string the user types
  const [goalUnit, setGoalUnit] = useState<GoalUnit>('mala'); // toggle for mala-type only

  // ── Planning mode (Step 3) ───────────────────────────────────────────────
  const [calcSub,      setCalcSub]      = useState<CalcSub>('calc-days');
  const [capacityStr,  setCapacityStr]  = useState('');   // daily capacity for calc-days
  const [capUnit,      setCapUnit]      = useState<DailyUnit>('mala');
  const [modeBDaysStr, setModeBDaysStr] = useState('41'); // duration for calc-daily

  // ── Retry States ─────────────────────────────────────────────────────────
  const [retryingSankalpId, setRetryingSankalpId] = useState<string | null>(null);
  const [retryStartDate, setRetryStartDate] = useState(formatDateString(new Date()));
  const [retryDuration, setRetryDuration] = useState(41);
  const [retryTarget, setRetryTarget] = useState(1);

  // ── Derived: selected sadhana metadata ───────────────────────────────────
  const isMalaType      = practiceType === 'mantra';
  const repUnit         = isMalaType ? 'Reps' : 'Times';

  // ── Derived: goal in both units ───────────────────────────────────────────
  const goalVal = parseInt(goalStr, 10) || 0;

  const goalMalas = useMemo(() => {
    if (!isMalaType || goalVal <= 0) return goalVal;
    return goalUnit === 'mala' ? goalVal : Math.ceil(goalVal / MALA_REPS);
  }, [isMalaType, goalVal, goalUnit]);

  const goalReps = useMemo(() => {
    if (!isMalaType || goalVal <= 0) return goalVal;
    return goalUnit === 'mala' ? goalVal * MALA_REPS : goalVal;
  }, [isMalaType, goalVal, goalUnit]);

  // ── Derived: capacity ────────────────────────────────────────────────────
  const capVal   = parseInt(capacityStr, 10) || 0;
  const capMalas = useMemo(() => {
    if (!isMalaType || capVal <= 0) return capVal;
    return capUnit === 'mala' ? capVal : Math.ceil(capVal / MALA_REPS);
  }, [isMalaType, capVal, capUnit]);
  const capReps = useMemo(() => {
    if (!isMalaType || capVal <= 0) return capVal;
    return capUnit === 'mala' ? capVal * MALA_REPS : capVal;
  }, [isMalaType, capVal, capUnit]);

  const modeBDays = parseInt(modeBDaysStr, 10) || 0;

  // calc-days: days = ceil(goal / daily-capacity)
  const calcDaysNeeded = useMemo(() => {
    const g = isMalaType ? goalMalas : goalVal;
    const d = isMalaType ? capMalas  : capVal;
    if (g > 0 && d > 0) return Math.ceil(g / d);
    return null;
  }, [isMalaType, goalMalas, goalVal, capMalas, capVal]);

  // calc-daily: daily = ceil(goal / days)
  const calcDailyMalas = useMemo(() => {
    if (goalMalas > 0 && modeBDays > 0 && isMalaType) return Math.ceil(goalMalas / modeBDays);
    return null;
  }, [goalMalas, modeBDays, isMalaType]);

  const calcDailyReps = useMemo(() => {
    if (!isMalaType && goalVal > 0 && modeBDays > 0) return Math.ceil(goalVal / modeBDays);
    return null;
  }, [isMalaType, goalVal, modeBDays]);

  // ── Reset form ────────────────────────────────────────────────────────────
  const handleOpenAdd = () => {
    setTitle(''); setGoalStr(''); setGoalUnit('mala');
    setPracticeType('stotra');
    setStartDate(formatDateString(new Date()));
    setCalcSub('calc-days');
    setCapacityStr(''); setCapUnit('mala'); setModeBDaysStr('41');
    setIsFormOpen(true);
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || goalVal <= 0) return;

    let finalDailyMalas = 0;   // malas/day (for mala-type) OR reps/day (for reps-type)
    let finalDuration   = 0;

    if (calcSub === 'calc-days') {
      if (!calcDaysNeeded || (isMalaType ? capMalas : capVal) <= 0) return;
      finalDailyMalas = isMalaType ? capMalas : capVal;
      finalDuration   = calcDaysNeeded;
    } else {
      const daily = isMalaType ? calcDailyMalas : calcDailyReps;
      if (!daily || modeBDays <= 0) return;
      finalDailyMalas = daily;
      finalDuration   = modeBDays;
    }

    if (finalDailyMalas <= 0 || finalDuration <= 0) return;

    // Store raw reps internally
    const rawTargetCount = isMalaType ? finalDailyMalas * MALA_REPS : finalDailyMalas;

    onAdd({
      title: title.trim(),
      practiceName: title.trim(),
      practiceType,
      targetCount: rawTargetCount,
      durationDays: finalDuration,
      startDate
    });
    setIsFormOpen(false);
  };

  const handleStartRetryClick = (s: Sankalp) => {
    setRetryingSankalpId(s.id);
    setRetryStartDate(formatDateString(new Date()));
    setRetryDuration(s.durationDays);
    setRetryTarget(s.targetCount);
  };

  const handleSaveRetry = (s: Sankalp) => {
    onRetry(s.id, {
      startDate: retryStartDate || formatDateString(new Date()),
      durationDays: retryDuration || s.durationDays,
      targetCount: retryTarget || s.targetCount
    });
    setRetryingSankalpId(null);
  };

  const getSadhanaName   = (id: string) => sadhanas.find(s => s.id === id)?.name ?? 'Unknown Practice';
  const getSadhanaConfig = (id: string): SadhanaConfig | undefined => sadhanas.find(s => s.id === id);

  const activeSankalps    = sankalps.filter(s => s.status === 'active');
  
  // History lists completed/abandoned vows AND active vows that have at least one previous attempt
  const sankalpsInHistory = useMemo(() => {
    return sankalps.filter(s => s.status !== 'active' || (s.attempts && s.attempts.length > 0));
  }, [sankalps]);

  // ── Shared styles ──────────────────────────────────────────────────────────
  const inputCls  = 'w-full bg-sadhana-dark border border-white/10 rounded-xl px-4 py-2 text-sm text-white placeholder-slate-600 outline-none transition-all focus:border-sadhana-gold/50 font-mono';
  const labelCls  = 'text-xs font-semibold text-slate-400 block mb-1.5';
  const toggleBtn = (active: boolean, accent: 'gold' | 'purple') =>
    `px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
      active
        ? accent === 'gold'
          ? 'bg-sadhana-gold/15 text-sadhana-gold border border-sadhana-gold/30'
          : 'bg-purple-500/15 text-purple-300 border border-purple-500/30'
        : 'bg-white/[0.03] text-slate-500 border border-white/10 hover:border-white/20 hover:text-slate-300'
    }`;

  // ── Unit toggle for mala-type ─────────────────────────────────────────────
  const UnitToggle = ({
    value, onChange, accent = 'purple'
  }: { value: DailyUnit; onChange: (v: DailyUnit) => void; accent?: 'gold' | 'purple' }) => (
    <div className="flex gap-1 mt-2">
      <button type="button" onClick={() => onChange('mala')} className={toggleBtn(value === 'mala', accent)}>
        Mala
      </button>
      <button type="button" onClick={() => onChange('reps')} className={toggleBtn(value === 'reps', accent)}>
        {repUnit}
      </button>
    </div>
  );

  const ConversionBadge = ({ malas, reps }: { malas: number; reps: number }) => (
    <div className="flex items-center gap-2 mt-2 px-2.5 py-1.5 rounded-lg bg-purple-600/[0.08] border border-purple-500/20">
      <span className="text-[10px] text-slate-400">
        <span className="text-purple-300 font-bold">{reps.toLocaleString()}</span> {repUnit}
        {' = '}
        <span className="text-white font-bold">{malas.toLocaleString()}</span> Mala{malas !== 1 ? 's' : ''}
        <span className="text-slate-600"> (1 Mala = {MALA_REPS} reps)</span>
      </span>
    </div>
  );

  return (
    <div className="glass-panel rounded-lg p-6 border border-white/[0.04] shadow-sm space-y-6">
      
      {/* ── Header ────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-serif text-white font-semibold">Sankalp (Spiritual Vows)</h2>
          <p className="text-xs text-slate-500 font-sans mt-0.5">
            Commit to a daily practice resolution for a specific period and watch your discipline grow.
          </p>
        </div>
        {!isFormOpen && (
          <button
            onClick={handleOpenAdd}
            className="flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-black bg-sadhana-gold hover:bg-sadhana-gold/90 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-md self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            Resolve New Vow
          </button>
        )}
      </div>

      {/* ── Form ──────────────────────────────────────────────────────── */}
      {isFormOpen && (
        <form onSubmit={handleSubmit} className="p-4 rounded-xl border border-white/[0.08] bg-white/[0.01] space-y-5 animate-fade-in">

          {/* Form header */}
          <div className="flex justify-between items-center pb-2 border-b border-white/[0.05]">
            <h3 className="text-sm font-serif font-bold text-sadhana-gold">Resolve a New Sadhana Vow</h3>
            <button type="button" onClick={() => setIsFormOpen(false)} className="text-slate-500 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* ── Step 1: Core Info ─────────────────────────────────────── */}
          <div className="space-y-1">
            <p className="text-[10px] uppercase tracking-widest text-slate-600 font-semibold">Step 1 — Vow Details</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="col-span-1 md:col-span-2">
              <label className={labelCls}>Vow Title / Sadhana Name</label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. 41-Day Surya Upasna, Hanuman Chalisa Vow"
                required
                className={`${inputCls} font-sans`}
              />
            </div>
            <div>
              <label className={labelCls}>Practice Type</label>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => { setPracticeType('stotra'); setGoalStr(''); setCapacityStr(''); }}
                  className={`flex-1 text-center py-2 rounded-xl text-xs font-semibold border transition-all ${
                    practiceType === 'stotra'
                      ? 'bg-sadhana-gold/15 text-sadhana-gold border-sadhana-gold/30'
                      : 'bg-white/[0.03] text-slate-500 border border-white/10 hover:border-white/20 hover:text-slate-300'
                  }`}
                >
                  Stotra (Reps)
                </button>
                <button
                  type="button"
                  onClick={() => { setPracticeType('mantra'); setGoalStr(''); setCapacityStr(''); }}
                  className={`flex-1 text-center py-2 rounded-xl text-xs font-semibold border transition-all ${
                    practiceType === 'mantra'
                      ? 'bg-purple-500/15 text-purple-300 border-purple-500/30'
                      : 'bg-white/[0.03] text-slate-500 border border-white/10 hover:border-white/20 hover:text-slate-300'
                  }`}
                >
                  Mantra (Mala)
                </button>
              </div>
            </div>
            <div>
              <label className={labelCls}>Start Date</label>
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
                required className={inputCls} />
            </div>
          </div>

          {/* ── Step 2: Your Goal ─────────────────────────────────────── */}
          <div className="space-y-1 pt-1 border-t border-white/[0.04]">
            <p className="text-[10px] uppercase tracking-widest text-slate-600 font-semibold">Step 2 — Your Goal</p>
          </div>
          <div>
            <label className={labelCls}>
              {isMalaType
                ? 'How many do you want to complete? (enter in Malas or Repetitions)'
                : `Total times you want to recite (${repUnit})`
              }
            </label>
            <div className="flex gap-2 items-start">
              <div className="flex-1">
                <input
                  type="number"
                  min={1}
                  value={goalStr}
                  onChange={e => setGoalStr(e.target.value)}
                  placeholder={isMalaType
                    ? goalUnit === 'mala' ? 'e.g. 1000 Malas' : 'e.g. 108000 repetitions'
                    : 'e.g. 100'
                  }
                  required
                  className={inputCls}
                />
                {/* Conversion badge for mala-type */}
                {isMalaType && goalVal > 0 && (
                  goalUnit === 'mala'
                    ? <ConversionBadge malas={goalVal} reps={goalVal * MALA_REPS} />
                    : <ConversionBadge malas={goalMalas} reps={goalVal} />
                )}
              </div>
              {/* Unit toggle — only for mala-type */}
              {isMalaType && (
                <div className="flex flex-col gap-1 pt-0.5">
                  <button type="button" onClick={() => setGoalUnit('mala')}
                    className={toggleBtn(goalUnit === 'mala', 'gold')}>Mala</button>
                  <button type="button" onClick={() => setGoalUnit('reps')}
                    className={toggleBtn(goalUnit === 'reps', 'gold')}>{repUnit}</button>
                </div>
              )}
            </div>
          </div>

          {/* ── Step 3: Plan your schedule ────────────────────────────── */}
          <div className="space-y-1 pt-1 border-t border-white/[0.04]">
            <p className="text-[10px] uppercase tracking-widest text-slate-600 font-semibold">Step 3 — Plan Your Schedule</p>
          </div>

          <div className="space-y-4">
            {/* Sub-mode toggle */}
            <div className="flex rounded-xl overflow-hidden border border-white/10 text-xs font-semibold">
              <button type="button" onClick={() => setCalcSub('calc-days')}
                className={`flex-1 py-2 transition-colors ${calcSub === 'calc-days' ? 'bg-purple-600/30 text-purple-300 font-bold' : 'text-slate-500 hover:text-slate-300'}`}>
                How many days will I need?
              </button>
              <div className="w-px bg-white/10" />
              <button type="button" onClick={() => setCalcSub('calc-daily')}
                className={`flex-1 py-2 transition-colors ${calcSub === 'calc-daily' ? 'bg-purple-600/30 text-purple-300 font-bold' : 'text-slate-500 hover:text-slate-300'}`}>
                What's my daily target?
              </button>
            </div>

            {/* Goal reminder */}
            {goalVal > 0 ? (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.02] border border-white/[0.06]">
                <Target className="w-3 h-3 text-sadhana-gold shrink-0" />
                <span className="text-[10px] text-slate-400">
                  Your goal:{' '}
                  {isMalaType ? (
                    <>
                      <span className="text-sadhana-gold font-bold">{goalMalas.toLocaleString()} Malas</span>
                      <span className="text-slate-600"> ({goalReps.toLocaleString()} reps)</span>
                    </>
                  ) : (
                    <span className="text-sadhana-gold font-bold">{goalVal.toLocaleString()} {repUnit}</span>
                  )}
                </span>
              </div>
            ) : (
              <p className="text-[10px] text-amber-400/80">
                ⚠ Enter your goal in Step 2 above to calculate your plan.
              </p>
            )}

            {/* calc-days: capacity input */}
            {calcSub === 'calc-days' && (
              <div>
                <label className={labelCls}>
                  My Daily Capacity
                  {isMalaType
                    ? <span className="text-purple-300 font-normal"> — how many can you do per day?</span>
                    : <span className="text-slate-500 font-normal"> ({repUnit}/day)</span>
                  }
                </label>
                <input
                  type="number"
                  min={1}
                  value={capacityStr}
                  onChange={e => setCapacityStr(e.target.value)}
                  placeholder={isMalaType ? (capUnit === 'mala' ? 'e.g. 5 Malas' : 'e.g. 540 reps') : 'e.g. 2'}
                  required={calcSub === 'calc-days'}
                  className={inputCls}
                />
                {isMalaType && <UnitToggle value={capUnit} onChange={setCapUnit} accent="purple" />}
                {isMalaType && capVal > 0 && (
                  capUnit === 'mala'
                    ? <p className="text-[10px] text-slate-500 mt-1.5">= <span className="text-white font-semibold">{capReps.toLocaleString()}</span> reps/day</p>
                    : <p className="text-[10px] text-slate-500 mt-1.5">= <span className="text-white font-semibold">{capMalas.toLocaleString()}</span> Mala{capMalas !== 1 ? 's' : ''}/day</p>
                )}
              </div>
            )}

            {/* calc-daily: duration input */}
            {calcSub === 'calc-daily' && (
              <div>
                <label className={labelCls}>Target Vow Duration (Days)</label>
                <select value={modeBDaysStr} onChange={e => setModeBDaysStr(e.target.value)} className={inputCls}>
                  <option value="11">11 Days</option>
                  <option value="21">21 Days</option>
                  <option value="41">41 Days (Recommended)</option>
                  <option value="108">108 Days</option>
                  <option value="custom">Custom...</option>
                </select>
                {modeBDaysStr === 'custom' && (
                  <input type="number" min={1} value={modeBDays || ''}
                    onChange={e => setModeBDaysStr(e.target.value)}
                    placeholder="Enter days" className={`${inputCls} mt-2`} />
                )}
              </div>
            )}

            {/* ── Result panel: calc-days ─────────────────────────── */}
            {calcSub === 'calc-days' && goalVal > 0 && capVal > 0 && calcDaysNeeded && (
              <div className="p-3 rounded-xl border border-purple-500/25 bg-purple-600/[0.06] space-y-3">
                <p className="text-[10px] uppercase tracking-wider text-purple-400 font-semibold">Your Personalised Plan</p>
                <div className="flex flex-col sm:flex-row sm:flex-wrap gap-4 sm:gap-5 items-start">
                  <div>
                    <p className="text-2xl font-bold text-white font-mono">{calcDaysNeeded}</p>
                    <p className="text-[10px] text-slate-400">Days Required</p>
                  </div>
                  <div className="hidden sm:block w-px bg-white/10 self-stretch" />
                  <div>
                    {isMalaType ? (
                      <>
                        <p className="text-2xl font-bold text-purple-300 font-mono">{capMalas}</p>
                        <p className="text-[10px] text-slate-400">Malas / day</p>
                        <p className="text-[9px] text-slate-600 font-mono mt-0.5">{capReps.toLocaleString()} reps/day</p>
                      </>
                    ) : (
                      <>
                        <p className="text-2xl font-bold text-purple-300 font-mono">{capVal}</p>
                        <p className="text-[10px] text-slate-400">{repUnit} / day</p>
                      </>
                    )}
                  </div>
                  <div className="hidden sm:block w-px bg-white/10 self-stretch" />
                  <div>
                    {isMalaType ? (
                      <>
                        <p className="text-2xl font-bold text-sadhana-gold font-mono">{goalMalas.toLocaleString()}</p>
                        <p className="text-[10px] text-slate-400">Total Malas</p>
                        <p className="text-[9px] text-slate-600 font-mono mt-0.5">{goalReps.toLocaleString()} reps</p>
                      </>
                    ) : (
                      <>
                        <p className="text-2xl font-bold text-sadhana-gold font-mono">{goalVal.toLocaleString()}</p>
                        <p className="text-[10px] text-slate-400">Total {repUnit}</p>
                      </>
                    )}
                  </div>
                </div>
                {isMalaType && (
                  <div className="pt-2 border-t border-white/5 space-y-0.5">
                    <p className="text-[10px] text-slate-400">
                      <span className="text-purple-300 font-semibold">{capMalas} Mala/day</span>
                      {' × '}
                      <span className="text-white font-semibold">{calcDaysNeeded} days</span>
                      {' = '}
                      <span className="text-sadhana-gold font-semibold">{(capMalas * calcDaysNeeded).toLocaleString()} Malas</span>
                    </p>
                    <p className="text-[10px] text-slate-500">
                      = <span className="text-white font-semibold">{(capMalas * calcDaysNeeded * MALA_REPS).toLocaleString()}</span> total repetitions
                    </p>
                  </div>
                )}
                <div className="pt-2 border-t border-white/5 text-[10px] text-slate-400">
                  Vow runs from <span className="text-white font-semibold">{startDate}</span> to <span className="text-white font-semibold">{getOffsetDateString(startDate, calcDaysNeeded - 1)}</span>
                </div>
              </div>
            )}

            {/* ── Result panel: calc-daily ────────────────────────── */}
            {calcSub === 'calc-daily' && goalVal > 0 && modeBDays > 0 && (isMalaType ? calcDailyMalas : calcDailyReps) && (
              <div className="p-3 rounded-xl border border-purple-500/25 bg-purple-600/[0.06] space-y-3">
                <p className="text-[10px] uppercase tracking-wider text-purple-400 font-semibold">Your Personalised Plan</p>
                <div className="flex flex-col sm:flex-row sm:flex-wrap gap-4 sm:gap-5 items-start">
                  <div>
                    {isMalaType && calcDailyMalas ? (
                      <>
                        <p className="text-2xl font-bold text-purple-300 font-mono">{calcDailyMalas}</p>
                        <p className="text-[10px] text-slate-400">Malas / day needed</p>
                        <p className="text-[9px] text-slate-600 font-mono mt-0.5">{(calcDailyMalas * MALA_REPS).toLocaleString()} reps/day</p>
                      </>
                    ) : (
                      <>
                        <p className="text-2xl font-bold text-purple-300 font-mono">{calcDailyReps}</p>
                        <p className="text-[10px] text-slate-400">{repUnit} / day needed</p>
                      </>
                    )}
                  </div>
                  <div className="hidden sm:block w-px bg-white/10 self-stretch" />
                  <div>
                    <p className="text-2xl font-bold text-white font-mono">{modeBDays}</p>
                    <p className="text-[10px] text-slate-400">Days Duration</p>
                  </div>
                  <div className="hidden sm:block w-px bg-white/10 self-stretch" />
                  <div>
                    {isMalaType ? (
                      <>
                        <p className="text-2xl font-bold text-sadhana-gold font-mono">{goalMalas.toLocaleString()}</p>
                        <p className="text-[10px] text-slate-400">Total Malas</p>
                        <p className="text-[9px] text-slate-600 font-mono mt-0.5">{goalReps.toLocaleString()} reps</p>
                      </>
                    ) : (
                      <>
                        <p className="text-2xl font-bold text-sadhana-gold font-mono">{goalVal.toLocaleString()}</p>
                        <p className="text-[10px] text-slate-400">Total {repUnit}</p>
                      </>
                    )}
                  </div>
                </div>
                {isMalaType && calcDailyMalas && (
                  <div className="pt-2 border-t border-white/5 space-y-0.5">
                    <p className="text-[10px] text-slate-400">
                      <span className="text-purple-300 font-semibold">{calcDailyMalas} Mala/day</span>
                      {' × '}
                      <span className="text-white font-semibold">{modeBDays} days</span>
                      {' = '}
                      <span className="text-sadhana-gold font-semibold">{(calcDailyMalas * modeBDays).toLocaleString()} Malas</span>
                    </p>
                    <p className="text-[10px] text-slate-500">
                      = <span className="text-white font-semibold">{(calcDailyMalas * modeBDays * MALA_REPS).toLocaleString()}</span> total repetitions
                    </p>
                  </div>
                )}
                <div className="pt-2 border-t border-white/5 text-[10px] text-slate-400">
                  Vow runs from <span className="text-white font-semibold">{startDate}</span> to <span className="text-white font-semibold">{getOffsetDateString(startDate, modeBDays - 1)}</span>
                </div>
              </div>
            )}
          </div>

          {/* ── Submit ────────────────────────────────────────────────── */}
          <div className="flex justify-end gap-3 pt-4 border-t border-white/[0.05]">
            <button type="button" onClick={() => setIsFormOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white">
              Cancel
            </button>
            <button type="submit"
              className="px-5 py-2 text-xs font-semibold text-black bg-sadhana-gold hover:bg-sadhana-gold/90 rounded-xl font-sans flex items-center gap-1 shadow-lg shadow-sadhana-gold/10">
              <Sparkles className="w-3.5 h-3.5 fill-black/20" />
              Begin Sacred Vow
            </button>
          </div>
        </form>
      )}

      {/* ── Active Sankalps ──────────────────────────────────────────── */}
      <div className="space-y-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Active Resolutions</h3>
        {activeSankalps.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {activeSankalps.map(s => {
              const prog = getSankalpProgress(s, logs);
              const isRetrying = retryingSankalpId === s.id;
              const todayStr = formatDateString(new Date());
              const vowEndDate = getOffsetDateString(s.startDate, s.durationDays - 1);
              const isExpired = todayStr > vowEndDate && prog.daysCompleted < prog.daysTotal;
              const isEditingDate = editingDateSankalpId === s.id;

              if (isRetrying) {
                return (
                  <div key={s.id}
                    className="p-5 rounded-lg border border-sadhana-gold/25 bg-white/[0.015] flex flex-col justify-between transition-colors shadow relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-[3px] h-full bg-sadhana-gold" />
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h4 className="text-sm font-serif text-white font-bold tracking-wide">Restart Vow: {s.title}</h4>
                        <button type="button" onClick={() => setRetryingSankalpId(null)} className="text-slate-500 hover:text-white">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">Start Date</label>
                          <input type="date" value={retryStartDate} onChange={e => setRetryStartDate(e.target.value)} className="w-full bg-sadhana-dark border border-white/10 rounded-lg p-2 text-xs text-white" />
                        </div>
                        <div>
                          <label className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">Duration (Days)</label>
                          <input type="number" min="1" value={retryDuration} onChange={e => setRetryDuration(parseInt(e.target.value, 10) || 1)} className="w-full bg-sadhana-dark border border-white/10 rounded-lg p-2 text-xs text-white font-mono" />
                        </div>
                        <div>
                          <label className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">Daily Target ({isMalaType ? 'Reps' : 'Times'})</label>
                          <input type="number" min="1" value={retryTarget} onChange={e => setRetryTarget(parseInt(e.target.value, 10) || 1)} className="w-full bg-sadhana-dark border border-white/10 rounded-lg p-2 text-xs text-white font-mono" />
                        </div>
                      </div>
                      
                      <div className="flex justify-end gap-2 pt-2 border-t border-white/[0.04]">
                        <button onClick={() => setRetryingSankalpId(null)} className="px-3 py-1.5 text-[10px] font-semibold text-slate-400 hover:text-white">
                          Cancel
                        </button>
                        <button onClick={() => handleSaveRetry(s)} className="px-4 py-1.5 text-[10px] font-semibold text-black bg-sadhana-gold hover:bg-sadhana-gold/90 rounded-xl flex items-center gap-1 shadow-lg shadow-sadhana-gold/10">
                          <RotateCcw className="w-3 h-3" />
                          Begin Attempt #{ (s.attempts?.length || 0) + 2 }
                        </button>
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <div key={s.id}
                  className="p-5 rounded-lg border border-white/[0.04] bg-white/[0.005] hover:bg-white/[0.015] flex flex-col justify-between transition-colors shadow relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-[3px] h-full bg-sadhana-gold" />
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div>
                        <h4 className="text-base font-serif text-white font-bold tracking-wide">{s.title}</h4>
                        <div className="text-[10px] text-slate-500 font-sans mt-0.5 flex flex-wrap gap-x-2 gap-y-0.5 items-center">
                          <span className="text-sadhana-gold font-semibold">{getSadhanaName(s.sadhanaId)}</span>
                          <span>•</span>
                          <span>Daily: {formatSadhanaCount(s.targetCount, getSadhanaConfig(s.sadhanaId))}</span>
                          <span>•</span>
                          <span className="flex items-center gap-0.5 font-mono"><Calendar className="w-3 h-3" /> {s.startDate}</span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1.5 shrink-0 opacity-100 sm:opacity-40 sm:group-hover:opacity-100 transition-opacity">
                        <button onClick={() => onUpdateStatus(s.id, 'completed')}
                          className="px-2 py-1 text-[9px] font-bold text-[#10b981] bg-[#10b981]/10 hover:bg-[#10b981]/25 border border-[#10b981]/20 rounded-md transition-colors">
                          Mark Complete
                        </button>
                        <button onClick={() => onUpdateStatus(s.id, 'abandoned')}
                          className="px-2 py-1 text-[9px] font-bold text-slate-400 hover:text-rose-400 bg-white/5 hover:bg-rose-950/20 border border-white/10 hover:border-rose-900/20 rounded-md transition-colors">
                          Abandon
                        </button>
                        <button onClick={() => { setEditingDateSankalpId(s.id); setEditDateVal(s.startDate); }}
                          className="px-2 py-1 text-[9px] font-bold text-slate-300 hover:text-white bg-white/5 hover:bg-white/15 border border-white/10 rounded-md transition-colors flex items-center gap-0.5"
                          title="Change Vow Start Date">
                          <Edit2 className="w-2.5 h-2.5" />
                          Edit Date
                        </button>
                        <button onClick={() => handleStartRetryClick(s)}
                          className="px-2 py-1 text-[9px] font-bold text-sadhana-gold bg-sadhana-gold/10 hover:bg-sadhana-gold/25 border border-sadhana-gold/20 rounded-md transition-colors flex items-center gap-0.5">
                          <RotateCcw className="w-2.5 h-2.5" />
                          Retry
                        </button>
                      </div>
                    </div>

                    {/* Expired Vow Notice Banner */}
                    {isExpired && !isEditingDate && (
                      <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                        <div className="flex items-start gap-2 text-amber-300">
                          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
                          <div>
                            <p className="font-semibold">Vow Period Ended ({vowEndDate})</p>
                            <p className="text-[10px] text-amber-300/80">Timeframe elapsed with missed days. You can restart or change start date.</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
                          <button
                            onClick={() => onRetry(s.id, { startDate: todayStr, durationDays: s.durationDays, targetCount: s.targetCount })}
                            className="px-2.5 py-1.5 text-[10px] font-bold text-black bg-sadhana-gold hover:bg-sadhana-gold/90 rounded-lg transition-all flex items-center gap-1 shadow"
                          >
                            <RotateCcw className="w-3 h-3" />
                            Restart Today
                          </button>
                          <button
                            onClick={() => { setEditingDateSankalpId(s.id); setEditDateVal(s.startDate); }}
                            className="px-2.5 py-1.5 text-[10px] font-semibold text-slate-300 hover:text-white bg-white/10 hover:bg-white/20 border border-white/10 rounded-lg transition-colors flex items-center gap-1"
                          >
                            <Edit2 className="w-3 h-3" />
                            Edit Date
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Inline Start Date Editor */}
                    {isEditingDate && (
                      <div className="p-3 bg-white/[0.02] border border-sadhana-gold/30 rounded-xl space-y-2 animate-fade-in">
                        <div className="flex justify-between items-center text-xs font-semibold text-sadhana-gold">
                          <span>Update Start Date for Vow</span>
                          <button onClick={() => setEditingDateSankalpId(null)} className="text-slate-500 hover:text-white">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
                          <input
                            type="date"
                            value={editDateVal}
                            onChange={e => setEditDateVal(e.target.value)}
                            className="flex-1 bg-sadhana-dark border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white outline-none focus:border-sadhana-gold/50 font-mono"
                          />
                          <div className="flex gap-1.5">
                            <button
                              onClick={() => {
                                if (editDateVal && onUpdateStartDate) {
                                  onUpdateStartDate(s.id, editDateVal);
                                }
                                setEditingDateSankalpId(null);
                              }}
                              className="px-3 py-1.5 text-xs font-bold text-black bg-sadhana-gold hover:bg-sadhana-gold/90 rounded-lg transition-colors"
                            >
                              Save Date
                            </button>
                            <button
                              onClick={() => setEditingDateSankalpId(null)}
                              className="px-3 py-1.5 text-xs font-semibold text-slate-400 hover:text-white"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                        <p className="text-[10px] text-slate-500">
                          Shifting the start date will recalculate your progress starting from the new date.
                        </p>
                      </div>
                    )}

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
                      <div className="w-full h-2 rounded-full bg-white/[0.04] overflow-hidden border border-white/[0.02]">
                        <div className="h-full rounded-full bg-[#10b981] transition-all duration-1000"
                          style={{ width: `${prog.progressPercent}%` }} />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-semibold text-slate-500 block uppercase tracking-wider">
                        Commitment Timeline (Days 1–{prog.daysTotal})
                      </span>
                      <div className="flex flex-wrap gap-1 py-1">
                        {prog.timelineDays.map((day, idx) => {
                          let dotStyle = 'bg-white/[0.04] border-white/[0.05]';
                          let timelineTitle = `Day ${idx + 1} (${day.dateStr}): Future`;

                          if (day.success) {
                            dotStyle = 'bg-[#10b981] border-[#10b981]/20 shadow-[0_0_5px_rgba(16,185,129,0.3)] scale-[1.05]';
                            timelineTitle = `Day ${idx + 1} (${day.dateStr}): Met target!`;
                          } else if (day.dateStr < todayStr) {
                            // Any past day in the vow where target was not met is a missed day (red)
                            dotStyle = 'bg-rose-600/80 border-rose-600/40 shadow-[0_0_4px_rgba(225,29,72,0.2)]';
                            timelineTitle = `Day ${idx + 1} (${day.dateStr}): Missed day`;
                          } else if (day.dateStr === todayStr) {
                            if (day.logged) {
                              dotStyle = 'bg-rose-600/80 border-rose-600/40';
                              timelineTitle = `Day ${idx + 1} (${day.dateStr}): Logged but missed target`;
                            } else {
                              dotStyle = 'bg-sadhana-gold/20 border-sadhana-gold/50 animate-pulse';
                              timelineTitle = `Day ${idx + 1} (${day.dateStr}): Today (Pending)`;
                            }
                          }

                          return <span key={day.dateStr} className={`w-3.5 h-3.5 rounded border transition-all duration-300 ${dotStyle}`} title={timelineTitle} />;
                        })}
                      </div>
                      <div className="flex flex-wrap items-center gap-3 pt-1 text-[9px] text-slate-500">
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-[#10b981]" /> Completed</span>
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-rose-600/80" /> Missed</span>
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-sadhana-gold/20 border border-sadhana-gold/50" /> Today</span>
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-white/[0.04] border border-white/[0.1]" /> Future</span>
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

      {/* ── History & Vows Archive ───────────────────────────────────── */}
      <div className="space-y-4 pt-2">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">History & Vows Archive</h3>
        {sankalpsInHistory.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sankalpsInHistory.map(s => {
              const prog = getSankalpProgress(s, logs);
              const isActive = s.status === 'active';
              const isCompleted = s.status === 'completed';
              const hasAttempts = s.attempts && s.attempts.length > 0;
              const totalTries = (s.attempts?.length || 0) + 1;
              const isRetrying = retryingSankalpId === s.id;

              if (isRetrying) {
                return (
                  <div key={s.id}
                    className="p-4 rounded-xl border border-sadhana-gold/25 bg-white/[0.015] space-y-4">
                    <div className="flex justify-between items-center border-b border-white/[0.05] pb-2">
                      <h4 className="text-xs font-serif font-bold text-white">Restart Vow: {s.title}</h4>
                      <button type="button" onClick={() => setRetryingSankalpId(null)} className="text-slate-500 hover:text-white">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <label className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">Start Date</label>
                        <input type="date" value={retryStartDate} onChange={e => setRetryStartDate(e.target.value)} className="w-full bg-sadhana-dark border border-white/10 rounded-lg p-2 text-xs text-white" />
                      </div>
                      <div>
                        <label className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">Duration (Days)</label>
                        <input type="number" min="1" value={retryDuration} onChange={e => setRetryDuration(parseInt(e.target.value, 10) || 1)} className="w-full bg-sadhana-dark border border-white/10 rounded-lg p-2 text-xs text-white font-mono" />
                      </div>
                      <div>
                        <label className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">Daily Target ({getSadhanaConfig(s.sadhanaId)?.countType === 'mala' ? 'Reps' : 'Times'})</label>
                        <input type="number" min="1" value={retryTarget} onChange={e => setRetryTarget(parseInt(e.target.value, 10) || 1)} className="w-full bg-sadhana-dark border border-white/10 rounded-lg p-2 text-xs text-white font-mono" />
                      </div>
                    </div>
                    
                    <div className="flex justify-end gap-2 pt-2 border-t border-white/[0.04]">
                      <button onClick={() => setRetryingSankalpId(null)} className="px-3 py-1.5 text-[10px] font-semibold text-slate-400 hover:text-white">
                        Cancel
                      </button>
                      <button onClick={() => handleSaveRetry(s)} className="px-4 py-1.5 text-[10px] font-semibold text-black bg-sadhana-gold hover:bg-sadhana-gold/90 rounded-xl flex items-center gap-1 shadow-lg shadow-sadhana-gold/10">
                        <RotateCcw className="w-3 h-3" />
                        Begin Try #{totalTries + 1}
                      </button>
                    </div>
                  </div>
                );
              }

              return (
                <div key={s.id}
                  className="p-4 rounded-xl border border-white/[0.05] bg-white/[0.01] flex flex-col justify-between hover:bg-white/[0.02] transition-colors">
                  <div className="space-y-3">
                    <div className="flex justify-between items-start gap-1">
                      <h4 className="text-sm font-semibold text-slate-200">{s.title}</h4>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                        isActive
                          ? 'bg-sadhana-gold/10 text-sadhana-gold border border-sadhana-gold/25'
                          : isCompleted 
                            ? 'bg-[#10b981]/10 text-[#10b981] border border-[#10b981]/25' 
                            : 'bg-rose-950/20 text-rose-400 border border-rose-900/30'
                      }`}>{isActive ? 'Active' : s.status}</span>
                    </div>
                    <div className="text-[10px] text-slate-500">
                      Practice: <span className="text-slate-400 font-semibold">{getSadhanaName(s.sadhanaId)}</span>
                    </div>

                    {/* Vow tries summary label */}
                    <div className="text-[10px] text-slate-400">
                      Attempts: <span className="text-white font-bold font-mono">{totalTries} {totalTries === 1 ? 'try' : 'tries'}</span>
                    </div>

                    {/* Collapsible / list previous tries */}
                    {hasAttempts && (
                      <div className="mt-2 pt-2 border-t border-white/[0.03] space-y-2">
                        <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider">Previous Attempts</span>
                        <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                          {s.attempts!.map((attempt, index) => {
                            const attemptEndDate = getOffsetDateString(attempt.startDate, attempt.durationDays - 1);
                            const attemptProgPercent = Math.round((attempt.daysCompleted / attempt.durationDays) * 100);
                            return (
                              <div key={attempt.id} className="p-2 rounded-lg border border-white/[0.02] bg-white/[0.002] text-[9px] space-y-0.5">
                                <div className="flex justify-between items-center">
                                  <span className="font-semibold text-slate-400">Try #{index + 1}</span>
                                  <span className={`text-[7px] px-1 rounded uppercase font-bold ${
                                    attempt.status === 'completed' ? 'bg-[#10b981]/10 text-[#10b981]' : 'bg-rose-950/20 text-rose-400'
                                  }`}>{attempt.status}</span>
                                </div>
                                <p className="text-slate-600 font-mono text-[8px]">{attempt.startDate} to {attemptEndDate} ({attempt.durationDays}d)</p>
                                <div className="flex justify-between text-slate-500 font-mono">
                                  <span>Achieved:</span>
                                  <span>{attempt.daysCompleted} / {attempt.durationDays} days ({attemptProgPercent}%)</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Current/Final attempt results inside History Card */}
                    <div className="mt-2 pt-2 border-t border-white/[0.03] space-y-1 bg-white/[0.005] p-2 rounded-lg">
                      <div className="flex justify-between items-center text-[9px]">
                        <span className="text-slate-400 font-semibold">
                          {isActive ? `Ongoing Try #${totalTries}` : `Final Try #${totalTries}`}
                        </span>
                        <span className="text-slate-500 font-mono">{s.startDate} → {getOffsetDateString(s.startDate, s.durationDays - 1)}</span>
                      </div>
                      <div className="flex justify-between text-xs font-mono text-slate-400">
                        <span>Target met:</span>
                        <span className="font-bold text-white">{prog.daysCompleted} / {prog.daysTotal} days ({prog.progressPercent}%)</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end items-center gap-2 mt-4 pt-2 border-t border-white/[0.03]">
                    {!isActive && (
                      <button onClick={() => handleStartRetryClick(s)}
                        className="px-2 py-1 text-[9px] font-bold text-sadhana-gold bg-sadhana-gold/10 hover:bg-sadhana-gold/25 border border-sadhana-gold/20 rounded-md transition-colors flex items-center gap-0.5"
                        title="Start a new try of this vow">
                        <RotateCcw className="w-2.5 h-2.5" />
                        Restart Vow
                      </button>
                    )}
                    <button onClick={() => onDelete(s.id)}
                      className="p-1.5 rounded hover:bg-white/5 text-slate-500 hover:text-rose-500 transition-colors" title="Delete from archive">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-4 text-center text-slate-600 text-xs">Archive is empty.</div>
        )}
      </div>
    </div>
  );
};
