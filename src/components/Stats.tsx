import React, { useState, useMemo, useEffect } from 'react';
import { Calendar, Award, BookOpen, Clock, Activity } from 'lucide-react';
import type { DashboardStats, SadhanaConfig, SadhanaLogs, Sankalp } from '../types';
import { getColorHex, getSankalpProgress, getOffsetDateString, MALA_REPS } from '../sadhanaUtils';

interface StatsProps {
  stats: DashboardStats;
  sadhanas: SadhanaConfig[];
  logs: SadhanaLogs;
  sankalps: Sankalp[];
}

export const Stats: React.FC<StatsProps> = ({ stats, sadhanas, logs, sankalps }) => {
  // Select which practice to view details for
  const [selectedPracticeId, setSelectedPracticeId] = useState<string>('');

  // Set initial selected practice
  useEffect(() => {
    if (sadhanas.length > 0 && (!selectedPracticeId || !sadhanas.some(s => s.id === selectedPracticeId))) {
      setSelectedPracticeId(sadhanas[0].id);
    }
  }, [sadhanas, selectedPracticeId]);

  const selectedPractice = sadhanas.find(s => s.id === selectedPracticeId);

  // Compute lifetime metrics for selected practice
  const practiceLifetimeStats = useMemo(() => {
    if (!selectedPractice) return null;

    let totalReps = 0;
    let daysCompleted = 0;

    Object.values(logs).forEach(log => {
      if (log.completed[selectedPractice.id]) {
        daysCompleted++;
      }
      totalReps += log.counts[selectedPractice.id] || 0;
    });

    const totalMalas = Math.floor(totalReps / MALA_REPS);
    const remainderReps = totalReps % MALA_REPS;

    // Total days tracked in the system
    const totalDays = Object.keys(logs).length;
    const completionRate = totalDays > 0 ? Math.round((daysCompleted / totalDays) * 100) : 0;

    // Filter vows associated with this practice
    const practiceSankalps = sankalps.filter(s => s.sadhanaId === selectedPractice.id);
    const completedSankalpsCount = practiceSankalps.filter(s => s.status === 'completed').length;
    const activeSankalpsCount = practiceSankalps.filter(s => s.status === 'active').length;
    const abandonedSankalpsCount = practiceSankalps.filter(s => s.status === 'abandoned').length;

    return {
      totalReps,
      daysCompleted,
      totalMalas,
      remainderReps,
      completionRate,
      practiceSankalps,
      completedSankalpsCount,
      activeSankalpsCount,
      abandonedSankalpsCount
    };
  }, [selectedPractice, logs, sankalps]);

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

      {/* Practice Frequency (Overall Completion Rates) */}
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

      {/* Dedicated Section: Individual Practice Insights */}
      <div className="glass-panel rounded-lg p-5 border border-white/[0.04] shadow-sm space-y-4">
        <div className="flex justify-between items-center pb-2 border-b border-white/[0.05]">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-sadhana-gold-accent" />
            <h3 className="font-serif text-white font-semibold text-sm">Practice Insights</h3>
          </div>
          {sadhanas.length > 0 && (
            <select
              value={selectedPracticeId}
              onChange={e => setSelectedPracticeId(e.target.value)}
              className="bg-sadhana-dark border border-white/10 rounded-lg px-2 py-1 text-xs text-white outline-none focus:border-sadhana-gold-accent font-sans max-w-[150px]"
            >
              {sadhanas.map(s => (
                <option key={s.id} value={s.id} className="bg-sadhana-dark text-white">
                  {s.name}
                </option>
              ))}
            </select>
          )}
        </div>

        {selectedPractice && practiceLifetimeStats ? (
          <div className="space-y-4">
            {/* Quick stats grid */}
            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="bg-white/[0.01] border border-white/[0.03] p-2.5 rounded-lg">
                <p className="text-[10px] text-slate-500 uppercase font-semibold">Total Repetitions</p>
                <p className="text-lg font-bold text-white font-mono mt-0.5">
                  {practiceLifetimeStats.totalReps.toLocaleString()}
                </p>
              </div>
              <div className="bg-white/[0.01] border border-white/[0.03] p-2.5 rounded-lg">
                <p className="text-[10px] text-slate-500 uppercase font-semibold">Total Malas</p>
                <p className="text-lg font-bold text-sadhana-gold-accent font-mono mt-0.5">
                  {selectedPractice.countType === 'mala' ? (
                    <span>
                      {practiceLifetimeStats.totalMalas} <span className="text-[10px] text-slate-400 font-sans">M & {practiceLifetimeStats.remainderReps} R</span>
                    </span>
                  ) : (
                    <span>
                      {Math.floor(practiceLifetimeStats.totalReps / MALA_REPS)} <span className="text-[10px] text-slate-500 font-sans">M</span>
                    </span>
                  )}
                </p>
              </div>
              <div className="bg-white/[0.01] border border-white/[0.03] px-3 py-2 rounded-lg col-span-2 flex justify-between items-center text-xs">
                <span className="text-slate-400">Days Performed: <strong className="text-white font-mono">{practiceLifetimeStats.daysCompleted}</strong></span>
                <span className="text-slate-400">Consistency: <strong className="text-white font-mono">{practiceLifetimeStats.completionRate}%</strong></span>
              </div>
            </div>

            {/* Associated Sankalps */}
            <div className="space-y-2 pt-2 border-t border-white/[0.03]">
              <div className="flex justify-between items-center">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Vows & Sankalps ({practiceLifetimeStats.practiceSankalps.length})
                </h4>
                <div className="flex gap-2 text-[9px] font-sans">
                  <span className="text-sadhana-emerald font-semibold">{practiceLifetimeStats.completedSankalpsCount} Done</span>
                  <span className="text-sadhana-gold-accent font-semibold">{practiceLifetimeStats.activeSankalpsCount} Active</span>
                </div>
              </div>

              {practiceLifetimeStats.practiceSankalps.length > 0 ? (
                <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                  {practiceLifetimeStats.practiceSankalps.map(s => {
                    const prog = getSankalpProgress(s, logs);
                    const isCompleted = s.status === 'completed';
                    const isAbandoned = s.status === 'abandoned';
                    
                    return (
                      <div 
                        key={s.id}
                        className="p-3 rounded-lg border border-white/[0.04] bg-white/[0.005] hover:bg-white/[0.01] space-y-2 text-xs"
                      >
                        <div className="flex justify-between items-start gap-1">
                          <span className="font-bold text-slate-200">{s.title}</span>
                          <span className={`text-[8px] px-1 py-0.2 rounded font-bold uppercase shrink-0 ${
                            isCompleted 
                              ? 'bg-sadhana-emerald/10 text-sadhana-emerald border border-sadhana-emerald/25' 
                              : isAbandoned 
                                ? 'bg-rose-950/20 text-rose-400 border border-rose-900/30'
                                : 'bg-sadhana-gold/10 text-sadhana-gold border border-sadhana-gold/25'
                          }`}>
                            {s.status}
                          </span>
                        </div>

                        <div className="text-[9px] text-slate-500 font-mono">
                          Timeline: {s.startDate} to {getOffsetDateString(s.startDate, prog.daysTotal - 1)} ({prog.daysTotal} days)
                        </div>

                        {/* Progress */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-[10px]">
                            <span className="text-slate-400">Target Met</span>
                            <span className="font-bold text-white font-mono">{prog.daysCompleted} / {prog.daysTotal} days ({prog.progressPercent}%)</span>
                          </div>
                          <div className="w-full h-1 rounded bg-white/[0.03] overflow-hidden">
                            <div 
                              className={`h-full rounded transition-all duration-500 ${
                                isCompleted ? 'bg-sadhana-emerald' : isAbandoned ? 'bg-rose-600' : 'bg-sadhana-gold-accent'
                              }`}
                              style={{ width: `${prog.progressPercent}%` }}
                            />
                          </div>
                        </div>

                        {/* Mini timeline dots */}
                        <div className="space-y-1">
                          <span className="text-[9px] text-slate-500 block uppercase tracking-wider font-sans">Daily Vow Tracker</span>
                          <div className="flex flex-wrap gap-0.5">
                            {prog.timelineDays.map((day, idx) => {
                              let dotStyle = 'bg-white/[0.02] border-white/[0.03]';
                              if (day.logged) {
                                if (day.success) {
                                  dotStyle = 'bg-sadhana-emerald border-sadhana-emerald/20 shadow-[0_0_3px_rgba(16,185,129,0.2)]';
                                } else {
                                  dotStyle = 'bg-rose-600/50 border-rose-600/20';
                                }
                              }
                              return (
                                <span 
                                  key={day.dateStr} 
                                  className={`w-2 h-2 rounded-sm border transition-all ${dotStyle}`}
                                  title={`Day ${idx + 1}: ${day.logged ? (day.success ? 'Success' : 'Missed') : 'Future/Unlogged'}`}
                                />
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-3 text-slate-600 text-[11px] border border-dashed border-white/5 rounded-lg">
                  No vows or sankalps taken for this practice.
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-6 text-slate-600 text-xs">
            No practices defined.
          </div>
        )}
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
                className="relative pl-4 border-l border-l-white/[0.04] last:border-0 pb-4 last:pb-0"
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
