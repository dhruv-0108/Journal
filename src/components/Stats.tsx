import React, { useMemo } from 'react';
import { Calendar, Award, Activity, Target, Flame, Sun, Flower2 } from 'lucide-react';
import type { DashboardStats, SadhanaConfig, SadhanaLogs, Sankalp } from '../types';
import { getSankalpProgress, formatSadhanaCount } from '../sadhanaUtils';

interface StatsProps {
  stats: DashboardStats;
  sadhanas: SadhanaConfig[];
  logs: SadhanaLogs;
  sankalps: Sankalp[];
}

export const Stats: React.FC<StatsProps> = ({ stats, sadhanas, logs, sankalps }) => {
  const activeSankalps = useMemo(() => {
    return sankalps.filter(s => s.status === 'active');
  }, [sankalps]);

  const getSadhanaConfig = (sadhanaId: string) => {
    return sadhanas.find(s => s.id === sadhanaId);
  };

  const getSadhanaName = (sadhanaId: string) => {
    return getSadhanaConfig(sadhanaId)?.name || 'Unknown Practice';
  };

  // Helper to categorize a practice into Chalisa, Mantra, or Stotra
  const getSadhanaCategory = (s: SadhanaConfig): 'chalisa' | 'mantra' | 'stotra' => {
    const nameLower = s.name.toLowerCase();
    if (nameLower.includes('chalisa')) return 'chalisa';
    if (s.countType === 'mala') return 'mantra';
    return 'stotra';
  };

  // Compute the most chanted practice for Mantra, Stotra, and Chalisa categories
  const mostChanted = useMemo(() => {
    // 1. Calculate lifetime sum of counts for each sadhana
    const totals: Record<string, number> = {};
    Object.values(logs).forEach(log => {
      Object.entries(log.counts).forEach(([sadhanaId, count]) => {
        totals[sadhanaId] = (totals[sadhanaId] || 0) + (count || 0);
      });
    });

    // 2. Find max for each category
    const bestMantra = { sadhana: null as SadhanaConfig | null, count: 0 };
    const bestStotra = { sadhana: null as SadhanaConfig | null, count: 0 };
    const bestChalisa = { sadhana: null as SadhanaConfig | null, count: 0 };

    sadhanas.forEach(s => {
      const total = totals[s.id] || 0;
      if (total <= 0) return;

      const cat = getSadhanaCategory(s);
      if (cat === 'mantra') {
        if (total > bestMantra.count) {
          bestMantra.sadhana = s;
          bestMantra.count = total;
        }
      } else if (cat === 'chalisa') {
        if (total > bestChalisa.count) {
          bestChalisa.sadhana = s;
          bestChalisa.count = total;
        }
      } else { // stotra
        if (total > bestStotra.count) {
          bestStotra.sadhana = s;
          bestStotra.count = total;
        }
      }
    });

    return {
      mantra: bestMantra.sadhana ? { sadhana: bestMantra.sadhana, count: bestMantra.count } : null,
      stotra: bestStotra.sadhana ? { sadhana: bestStotra.sadhana, count: bestStotra.count } : null,
      chalisa: bestChalisa.sadhana ? { sadhana: bestChalisa.sadhana, count: bestChalisa.count } : null,
    };
  }, [sadhanas, logs]);

  const formatMilestoneCount = (count: number, unit: string) => {
    return `${count.toLocaleString()} ${unit}`;
  };

  const milestonesList = [
    mostChanted.mantra ? { type: 'Mantra', icon: <Flame className="w-3.5 h-3.5 text-sadhana-saffron" />, name: mostChanted.mantra.sadhana.name, formattedCount: formatMilestoneCount(mostChanted.mantra.count, 'Reps') } : null,
    mostChanted.stotra ? { type: 'Stotra', icon: <Sun className="w-3.5 h-3.5 text-sadhana-blue" />, name: mostChanted.stotra.sadhana.name, formattedCount: formatMilestoneCount(mostChanted.stotra.count, mostChanted.stotra.sadhana.countUnit || 'Times') } : null,
    mostChanted.chalisa ? { type: 'Chalisa', icon: <Flower2 className="w-3.5 h-3.5 text-sadhana-emerald" />, name: mostChanted.chalisa.sadhana.name, formattedCount: formatMilestoneCount(mostChanted.chalisa.count, mostChanted.chalisa.sadhana.countUnit || 'Times') } : null,
  ].filter((item): item is NonNullable<typeof item> => item !== null);

  return (
    <div className="space-y-6">
      
      {/* Most Chanted Milestones */}
      {milestonesList.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 font-sans">
            Most Chanted Milestones
          </h3>
          <div className="glass-panel rounded-lg p-4 border border-white/[0.04] bg-white/[0.005]">
            <div className={`grid gap-4 ${
              milestonesList.length === 3 ? 'grid-cols-3' : milestonesList.length === 2 ? 'grid-cols-2' : 'grid-cols-1'
            }`}>
              {milestonesList.map((m, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center gap-1 text-slate-500 font-sans uppercase text-[8px] font-bold tracking-wider">
                    {m.icon}
                    {m.type}
                  </div>
                  <div className="font-serif font-bold text-white text-xs leading-tight line-clamp-1" title={m.name}>
                    {m.name}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono font-semibold">
                    {m.formattedCount}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Timeframe Volumes Grid */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 font-sans">
          Sadhana Volumes
        </h3>
        
        <div className="grid grid-cols-2 gap-3">
          {/* Today Card */}
          <div className="glass-panel rounded-lg p-4 flex flex-col justify-between h-24 border border-white/[0.04]">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider font-sans">Today</span>
              <Activity className="w-3.5 h-3.5 text-sadhana-emerald" />
            </div>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-white font-mono">{stats.today.sessionsCount}</span>
              <span className="text-[10px] text-slate-500 font-sans">practices</span>
            </div>
          </div>

          {/* This Week Card */}
          <div className="glass-panel rounded-lg p-4 flex flex-col justify-between h-24 border border-white/[0.04]">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider font-sans">This Week</span>
              <Calendar className="w-3.5 h-3.5 text-sadhana-saffron" />
            </div>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-white font-mono">{stats.thisWeek.sessionsCount}</span>
              <span className="text-[10px] text-slate-500 font-sans">completed</span>
            </div>
          </div>

          {/* This Month Card */}
          <div className="glass-panel rounded-lg p-4 flex flex-col justify-between h-24 border border-white/[0.04]">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider font-sans">This Month</span>
              <Award className="w-3.5 h-3.5 text-sadhana-purple" />
            </div>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-white font-mono">{stats.thisMonth.sessionsCount}</span>
              <span className="text-[10px] text-slate-500 font-sans">completed</span>
            </div>
          </div>

          {/* This Year Card */}
          <div className="glass-panel rounded-lg p-4 flex flex-col justify-between h-24 border border-white/[0.04]">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider font-sans">This Year</span>
              <Award className="w-3.5 h-3.5 text-sadhana-blue" />
            </div>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-white font-mono">{stats.thisYear.sessionsCount}</span>
              <span className="text-[10px] text-slate-500 font-sans">completed</span>
            </div>
          </div>
        </div>
      </div>

      {/* Ongoing Vows Section */}
      <div className="glass-panel rounded-lg p-5 border border-white/[0.04] shadow-sm space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-white/[0.05]">
          <Target className="w-4 h-4 text-sadhana-gold-accent" />
          <h3 className="font-serif text-white font-semibold text-sm">Ongoing Vows</h3>
        </div>

        {activeSankalps.length > 0 ? (
          <div className="space-y-3">
            {activeSankalps.map(s => {
              const prog = getSankalpProgress(s, logs);
              const config = getSadhanaConfig(s.sadhanaId);
              
              return (
                <div key={s.id} className="p-3 rounded-lg border border-white/[0.04] bg-white/[0.005] space-y-2 text-xs">
                  <div className="flex justify-between items-start gap-1">
                    <span className="font-serif font-bold text-slate-200">{s.title}</span>
                    <span className="text-[8px] px-1.5 py-0.5 rounded font-bold uppercase bg-sadhana-gold/10 text-sadhana-gold border border-sadhana-gold/25 font-sans">
                      Active
                    </span>
                  </div>
                  <div className="text-[9px] text-slate-500 font-sans mt-0.5 flex flex-wrap gap-x-2 gap-y-0.5 items-center">
                    <span className="text-sadhana-gold font-semibold">{getSadhanaName(s.sadhanaId)}</span>
                    <span>•</span>
                    <span>Daily: {formatSadhanaCount(s.targetCount, config)}</span>
                  </div>
                  <div className="space-y-1 pt-1">
                    <div className="flex justify-between text-[10px]">
                      <span className="text-slate-400">Target Met</span>
                      <span className="font-bold text-white font-mono">{prog.daysCompleted} / {prog.daysTotal} days ({prog.progressPercent}%)</span>
                    </div>
                    <div className="w-full h-1.5 rounded bg-white/[0.03] overflow-hidden border border-white/[0.01]">
                      <div 
                        className="h-full rounded bg-sadhana-emerald transition-all duration-500"
                        style={{ width: `${prog.progressPercent}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-6 text-center text-slate-500 border border-dashed border-white/5 rounded-lg text-xs font-sans">
            No active vows right now. Commit to a new Sankalp in the Sankalps tab.
          </div>
        )}
      </div>

    </div>
  );
};
