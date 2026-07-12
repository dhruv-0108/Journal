import React, { useMemo } from 'react';
import { Flame, Shield, Flower2, Sparkles, Sun, BarChart3 } from 'lucide-react';
import type { SadhanaConfig, SadhanaColorPreset, SadhanaLogs, Sankalp } from '../types';
import { getColorHex, MALA_REPS } from '../sadhanaUtils';

interface PracticeStatsProps {
  sadhanas: SadhanaConfig[];
  logs: SadhanaLogs;
  sankalps: Sankalp[];
}

const getPresetIcon = (preset: SadhanaColorPreset) => {
  switch (preset) {
    case 'saffron': return <Sun className="w-5 h-5" />;
    case 'crimson': return <Flame className="w-5 h-5" />;
    case 'emerald': return <Flower2 className="w-5 h-5" />;
    case 'blue':    return <Shield className="w-5 h-5" />;
    case 'purple':  return <Sparkles className="w-5 h-5" />;
    default:        return <Sparkles className="w-5 h-5" />;
  }
};

const formatDisplayCount = (reps: number, sadhana: SadhanaConfig): { primary: string; secondary: string } => {
  if (sadhana.countType === 'mala') {
    const malas = Math.floor(reps / MALA_REPS);
    const rem = reps % MALA_REPS;
    return {
      primary: malas.toLocaleString(),
      secondary: rem > 0 ? `${malas}M + ${rem} Reps` : `${malas} Malas`
    };
  }
  return {
    primary: reps.toLocaleString(),
    secondary: sadhana.countUnit || 'Times'
  };
};

const PracticeCard: React.FC<{
  sadhana: SadhanaConfig;
  logs: SadhanaLogs;
  sankalps: Sankalp[];
}> = ({ sadhana, logs, sankalps }) => {
  const colorHex = getColorHex(sadhana.colorPreset);

  const stats = useMemo(() => {
    let totalReps = 0;
    let daysCompleted = 0;
    let currentStreak = 0;
    let bestStreak = 0;
    let tempStreak = 0;

    // Sort all log dates
    const allDates = Object.keys(logs).sort();
    allDates.forEach(dateStr => {
      const log = logs[dateStr];
      const did = log.completed[sadhana.id] === true;
      if (log.counts[sadhana.id] !== undefined) {
        totalReps += log.counts[sadhana.id];
      }
      if (did) {
        daysCompleted++;
        tempStreak++;
        if (tempStreak > bestStreak) bestStreak = tempStreak;
      } else {
        tempStreak = 0;
      }
    });

    // Compute current streak (from today backwards)
    const today = new Date();
    let checkDate = new Date(today);
    let streak = 0;
    for (let i = 0; i < 365; i++) {
      const ds = checkDate.toISOString().split('T')[0];
      const log = logs[ds];
      if (log && log.completed[sadhana.id]) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
    currentStreak = streak;

    const getDaysBetween = (startStr: string, endStr: string) => {
      const start = new Date(startStr + 'T00:00:00');
      const end = new Date(endStr + 'T00:00:00');
      const diffTime = end.getTime() - start.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return Math.max(0, diffDays) + 1;
    };

    const firstPracticeLogDate = allDates.find(dateStr => {
      const log = logs[dateStr];
      return log.completed[sadhana.id] === true || (log.counts[sadhana.id] || 0) > 0;
    });

    const firstSystemLogDate = allDates[0];
    const todayStr = new Date().toISOString().split('T')[0];

    let totalDaysForConsistency = 0;
    if (firstPracticeLogDate) {
      if (sadhana.performDaily && firstSystemLogDate) {
        totalDaysForConsistency = getDaysBetween(firstSystemLogDate, todayStr);
      } else {
        totalDaysForConsistency = getDaysBetween(firstPracticeLogDate, todayStr);
      }
    }

    const completionRate = totalDaysForConsistency > 0 ? Math.round((daysCompleted / totalDaysForConsistency) * 100) : 0;
    const totalDays = totalDaysForConsistency || allDates.length;
    const associatedVows = sankalps.filter(s => s.sadhanaId === sadhana.id);
    const activeVows = associatedVows.filter(s => s.status === 'active');
    const completedVows = associatedVows.filter(s => s.status === 'completed');

    return {
      totalReps,
      daysCompleted,
      completionRate,
      currentStreak,
      bestStreak,
      associatedVows,
      activeVows,
      completedVows,
      totalDays
    };
  }, [sadhana, logs, sankalps]);

  const displayCount = formatDisplayCount(stats.totalReps, sadhana);

  return (
    <div
      className="glass-panel rounded-2xl border overflow-hidden transition-all duration-300 hover:scale-[1.005]"
      style={{ borderColor: `${colorHex}18` }}
    >
      {/* Card Header */}
      <div
        className="px-5 py-4 flex items-center justify-between border-b"
        style={{ borderColor: `${colorHex}10`, background: `linear-gradient(135deg, ${colorHex}06 0%, transparent 70%)` }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center border"
            style={{ borderColor: `${colorHex}25`, backgroundColor: `${colorHex}10`, color: colorHex }}
          >
            {getPresetIcon(sadhana.colorPreset)}
          </div>
          <div>
            <h3 className="font-serif font-bold text-white text-sm leading-tight">{sadhana.name}</h3>
            {sadhana.sanskritName && (
              <p className="text-[10px] text-slate-500 font-serif mt-0.5">{sadhana.sanskritName}</p>
            )}
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          {sadhana.performDaily && (
            <span
              className="text-[9px] px-2 py-0.5 rounded-full font-semibold border font-sans"
              style={{ color: colorHex, borderColor: `${colorHex}30`, backgroundColor: `${colorHex}10` }}
            >
              Daily Practice
            </span>
          )}
          {stats.activeVows.length > 0 && (
            <span className="text-[9px] px-2 py-0.5 rounded-full font-semibold border font-sans bg-sadhana-gold/10 text-sadhana-gold border-sadhana-gold/25">
              {stats.activeVows.length} Active Vow{stats.activeVows.length > 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="p-5 space-y-5">
        {/* Top 4 stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Total Chanting */}
          <div className="col-span-2 sm:col-span-2 bg-white/[0.015] border border-white/[0.04] rounded-xl p-3">
            <p className="text-[9px] text-slate-500 uppercase font-semibold tracking-wider font-sans">
              {sadhana.countType === 'mala' ? 'Total Malas' : 'Total Count'}
            </p>
            <p className="text-2xl font-bold font-mono mt-1" style={{ color: colorHex }}>
              {displayCount.primary}
            </p>
            <p className="text-[10px] text-slate-500 font-sans mt-0.5">{displayCount.secondary}</p>
          </div>

          {/* Days Done */}
          <div className="bg-white/[0.015] border border-white/[0.04] rounded-xl p-3">
            <p className="text-[9px] text-slate-500 uppercase font-semibold tracking-wider font-sans">Days Done</p>
            <p className="text-xl font-bold text-white font-mono mt-1">{stats.daysCompleted}</p>
            <p className="text-[10px] text-slate-500 font-sans mt-0.5">of {stats.totalDays} logged</p>
          </div>

          {/* Current Streak */}
          <div className="bg-white/[0.015] border border-white/[0.04] rounded-xl p-3">
            <p className="text-[9px] text-slate-500 uppercase font-semibold tracking-wider font-sans">Streak</p>
            <p className="text-xl font-bold text-white font-mono mt-1">{stats.currentStreak}</p>
            <p className="text-[10px] text-slate-500 font-sans mt-0.5">days current</p>
          </div>
        </div>

        {/* Consistency Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400 font-sans">Consistency</span>
            <span className="font-bold font-mono" style={{ color: colorHex }}>{stats.completionRate}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-white/[0.03] border border-white/[0.02] overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-1000"
              style={{ width: `${stats.completionRate}%`, backgroundColor: colorHex, boxShadow: `0 0 8px ${colorHex}40` }}
            />
          </div>
          <div className="flex justify-between text-[9px] text-slate-600 font-sans">
            <span>Best Streak: {stats.bestStreak}d</span>
            <span>{stats.completedVows.length} vow{stats.completedVows.length !== 1 ? 's' : ''} completed</span>
          </div>
        </div>

      </div>
    </div>
  );
};

export const PracticeStats: React.FC<PracticeStatsProps> = ({ sadhanas, logs, sankalps }) => {
  // Summary totals across all practices
  const totals = useMemo(() => {
    let totalReps = 0;
    let totalDaysAny = 0;
    const logDates = Object.keys(logs);
    logDates.forEach(dateStr => {
      const log = logs[dateStr];
      let anyDone = false;
      sadhanas.forEach(s => {
        totalReps += log.counts[s.id] || 0;
        if (log.completed[s.id]) anyDone = true;
      });
      if (anyDone) totalDaysAny++;
    });
    return { totalReps, totalDaysAny, totalDays: logDates.length };
  }, [sadhanas, logs]);

  if (sadhanas.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-white/[0.02] border border-white/[0.05] flex items-center justify-center">
          <BarChart3 className="w-8 h-8 text-slate-700" />
        </div>
        <div className="space-y-1">
          <h3 className="text-sm font-serif text-slate-400">No Practices Yet</h3>
          <p className="text-xs text-slate-600 font-sans">Add a practice in Settings or resolve a new Sankalp vow to start tracking.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Summary Banner */}
      <div className="glass-panel rounded-2xl p-5 border border-white/[0.04] shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-4 h-4 text-sadhana-gold-accent" />
          <h2 className="font-serif text-white font-semibold text-sm">All Practices — Lifetime Overview</h2>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center bg-white/[0.01] border border-white/[0.03] rounded-xl p-3">
            <p className="text-[10px] text-slate-500 uppercase font-semibold tracking-wider font-sans">Practices</p>
            <p className="text-2xl font-bold text-white font-mono mt-1">{sadhanas.length}</p>
          </div>
          <div className="text-center bg-white/[0.01] border border-white/[0.03] rounded-xl p-3">
            <p className="text-[10px] text-slate-500 uppercase font-semibold tracking-wider font-sans">Days Active</p>
            <p className="text-2xl font-bold text-white font-mono mt-1">{totals.totalDaysAny}</p>
          </div>
          <div className="text-center bg-white/[0.01] border border-white/[0.03] rounded-xl p-3">
            <p className="text-[10px] text-slate-500 uppercase font-semibold tracking-wider font-sans">Total Reps</p>
            <p className="text-2xl font-bold text-sadhana-gold-accent font-mono mt-1">{totals.totalReps.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Per-Practice Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {sadhanas.map(sadhana => (
          <PracticeCard
            key={sadhana.id}
            sadhana={sadhana}
            logs={logs}
            sankalps={sankalps}
          />
        ))}
      </div>
    </div>
  );
};
