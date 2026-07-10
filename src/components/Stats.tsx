import React from 'react';
import { Calendar, Award, BookOpen, Clock, Activity } from 'lucide-react';
import type { DashboardStats, SadhanaConfig, SadhanaLogs } from '../types';
import { getColorHex } from '../sadhanaUtils';

interface StatsProps {
  stats: DashboardStats;
  sadhanas: SadhanaConfig[];
  logs: SadhanaLogs;
}

export const Stats: React.FC<StatsProps> = ({ stats, sadhanas, logs }) => {
  // Extract recent logs with notes
  const notesTimeline = Object.entries(logs)
    .filter(([_, log]) => log.notes && log.notes.trim().length > 0)
    .map(([dateStr, log]) => ({
      dateStr,
      notes: log.notes!,
      completedSadhanas: Object.entries(log.completed)
        .filter(([_, done]) => done === true)
        .map(([id]) => sadhanas.find(s => s.id === id))
        .filter((s): s is SadhanaConfig => s !== undefined)
    }))
    .sort((a, b) => b.dateStr.localeCompare(a.dateStr))
    .slice(0, 5); // Show last 5 journal entries

  // Formatting date helper for timeline
  const formatTimelineDate = (dateStr: string) => {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      
      {/* Timeframe Volumes Grid */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-sadhana-gold-dark font-sans">
          Sadhana Volumes
        </h3>
        
        <div className="grid grid-cols-2 gap-3">
          {/* Today Card */}
          <div className="glass-panel glass-panel-hover rounded-lg p-4 flex flex-col justify-between h-24 border border-white/[0.04]">
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
          <div className="glass-panel glass-panel-hover rounded-lg p-4 flex flex-col justify-between h-24 border border-white/[0.04]">
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
          <div className="glass-panel glass-panel-hover rounded-lg p-4 flex flex-col justify-between h-24 border border-white/[0.04]">
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
          <div className="glass-panel glass-panel-hover rounded-lg p-4 flex flex-col justify-between h-24 border border-white/[0.04]">
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

      {/* Completion Rates */}
      <div className="glass-panel rounded-lg p-5 border border-white/[0.04] shadow-sm">
        
        <div className="flex items-center gap-2 mb-4">
          <Award className="w-4 h-4 text-sadhana-gold-accent" />
          <h3 className="font-serif text-white font-semibold text-sm">Practice Frequency</h3>
        </div>

        {sadhanas.length > 0 ? (
          <div className="space-y-4">
            {sadhanas.map(s => {
              const percentage = stats.sadhanaCompletionRates[s.id] || 0;
              const hex = getColorHex(s.colorPreset);

              return (
                <div key={s.id} className="space-y-1.5">
                  <div className="flex justify-between items-baseline text-xs">
                    <span className="font-medium text-slate-200">{s.name}</span>
                    <span className="text-white font-bold font-mono text-[11px]">{percentage}%</span>
                  </div>
                  
                  {/* Progress bar container */}
                  <div className="w-full h-1.5 rounded bg-white/[0.02] overflow-hidden border border-white/[0.01]">
                    <div 
                      className="h-full rounded transition-all duration-1000"
                      style={{ 
                        width: `${percentage}%`,
                        backgroundColor: hex
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-4 text-center text-slate-600 text-xs">
            No practices defined.
          </div>
        )}

        <div className="mt-4 pt-3 border-t border-white/[0.03] text-[9px] text-center text-slate-500 font-sans">
          Based on {stats.totalDaysTracked} total tracked days.
        </div>
      </div>

      {/* Recent Reflections Timeline */}
      <div className="glass-panel rounded-lg p-5 border border-white/[0.04]">
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="w-4 h-4 text-sadhana-gold-accent" />
          <h3 className="font-serif text-white font-semibold text-sm">Reflections Log</h3>
        </div>

        {notesTimeline.length > 0 ? (
          <div className="space-y-4 max-h-72 overflow-y-auto pr-1">
            {notesTimeline.map((item) => (
              <div 
                key={item.dateStr}
                className="relative pl-4 border-l border-white/[0.04] last:border-0 pb-4 last:pb-0"
              >
                {/* Timeline node */}
                <div className="absolute left-[-2.5px] top-1.5 w-1.5 h-1.5 rounded-full bg-sadhana-gold-accent" />
                
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-serif font-bold text-sadhana-gold-accent">{formatTimelineDate(item.dateStr)}</span>
                  </div>
                  
                  {/* Sadhanas completed on that day tags */}
                  <div className="flex flex-wrap gap-1 py-0.5">
                    {item.completedSadhanas.map(s => {
                      const hex = getColorHex(s.colorPreset);
                      return (
                        <span 
                          key={s.id} 
                          className="text-[9px] px-1.5 py-0.5 rounded font-semibold text-white/90"
                          style={{
                            backgroundColor: `${hex}15`,
                            border: `1px solid ${hex}25`,
                          }}
                        >
                          {s.name}
                        </span>
                      );
                    })}
                  </div>

                  <p className="text-xs text-slate-400 italic bg-white/[0.005] border border-white/[0.02] p-2.5 rounded-md leading-relaxed mt-1 font-serif">
                    "{item.notes}"
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-6 text-center text-slate-500 text-xs flex flex-col items-center justify-center gap-2 font-sans">
            <Clock className="w-6 h-6 text-slate-700 animate-pulse" />
            <p>No journal reflections written yet.</p>
            <p className="text-[9px] text-slate-600">Select any day on the calendar to log and write notes.</p>
          </div>
        )}
      </div>

    </div>
  );
};
