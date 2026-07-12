import React, { useMemo } from 'react';
import { Calendar, Award, Activity, Target } from 'lucide-react';
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

  return (
    <div className="space-y-6">
      
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
