import React, { useMemo, useState } from 'react';
import { Sparkles, Flame, Shield, Sun, Crown, Zap, CheckCircle2 } from 'lucide-react';
import type { SadhanaLogs, SadhanaConfig, AuraTier } from '../types';
import { calculateAuraState, AURA_TIERS } from '../auraUtils';

interface AuraViewProps {
  logs: SadhanaLogs;
  sadhanas: SadhanaConfig[];
  username?: string;
}

const getTierIcon = (iconName: string, className = "w-6 h-6") => {
  switch (iconName) {
    case 'Sparkles': return <Sparkles className={className} />;
    case 'Flame': return <Flame className={className} />;
    case 'Shield': return <Shield className={className} />;
    case 'Sun': return <Sun className={className} />;
    case 'Crown': return <Crown className={className} />;
    default: return <Sparkles className={className} />;
  }
};

export const AuraView: React.FC<AuraViewProps> = ({ logs, sadhanas, username }) => {
  const auraState = useMemo(() => calculateAuraState(logs, sadhanas), [logs, sadhanas]);
  const [selectedPreviewTier, setSelectedPreviewTier] = useState<AuraTier | null>(null);

  const activeDisplayTier = selectedPreviewTier || auraState.currentTier;
  const isPreviewing = selectedPreviewTier !== null && selectedPreviewTier.level !== auraState.currentTier.level;

  const totalCatReps = useMemo(() => {
    const { mantraReps, stotraReps, chalisaReps, otherReps } = auraState.categoryBreakdown;
    return mantraReps + stotraReps + chalisaReps + otherReps || 1;
  }, [auraState]);

  const mantraPct = Math.round((auraState.categoryBreakdown.mantraReps / totalCatReps) * 100);
  const stotraPct = Math.round((auraState.categoryBreakdown.stotraReps / totalCatReps) * 100);
  const chalisaPct = Math.round((auraState.categoryBreakdown.chalisaReps / totalCatReps) * 100);

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      
      {/* Header Banner */}
      <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-white/[0.06] bg-gradient-to-r from-purple-900/10 via-sadhana-dark to-amber-900/10 relative overflow-hidden">
        <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full blur-3xl opacity-25 pointer-events-none"
             style={{ backgroundColor: activeDisplayTier.primaryColor }} />
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 justify-between text-center md:text-left">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-widest border mb-3"
                 style={{
                   borderColor: `${activeDisplayTier.primaryColor}40`,
                   backgroundColor: `${activeDisplayTier.primaryColor}15`,
                   color: activeDisplayTier.primaryColor
                 }}>
              <Zap className="w-3.5 h-3.5 animate-pulse" />
              Spiritual Tejas Field
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-wide">
              {username ? `${username}'s Aura` : 'Spiritual Aura'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-lg mt-1 font-sans">
              Your subtle energy radiance grows with every recitation, mala completed, and consistent daily practice.
            </p>
          </div>

          <div className="flex gap-3 shrink-0">
            <div className="glass-panel px-4 py-3 rounded-xl border border-white/10 text-center min-w-[90px]">
              <div className="text-xl font-bold text-white font-mono">{auraState.totalMalas}</div>
              <div className="text-[10px] text-purple-300 uppercase tracking-wider font-medium mt-0.5">Total Malas</div>
            </div>
            <div className="glass-panel px-4 py-3 rounded-xl border border-white/10 text-center min-w-[90px]">
              <div className="text-xl font-bold text-sadhana-gold font-mono">{auraState.totalReps.toLocaleString()}</div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider font-medium mt-0.5">Total Reps</div>
            </div>
            <div className="glass-panel px-4 py-3 rounded-xl border border-white/10 text-center min-w-[90px]">
              <div className="text-xl font-bold text-emerald-400 font-mono">{auraState.activeDaysCount}</div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider font-medium mt-0.5">Days Logged</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Aura Orb Visualizer Section */}
      <div className="glass-panel rounded-2xl p-8 sm:p-12 border border-white/[0.06] bg-white/[0.005] flex flex-col items-center justify-center relative overflow-hidden min-h-[420px]">
        
        {/* Glow backdrop blur */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div 
            className="w-96 h-96 rounded-full blur-[90px] opacity-30 transition-all duration-700 animate-pulse"
            style={{ backgroundColor: activeDisplayTier.primaryColor }}
          />
          <div 
            className="w-64 h-64 rounded-full blur-[60px] opacity-25 transition-all duration-700"
            style={{ backgroundColor: activeDisplayTier.secondaryColor }}
          />
        </div>

        {/* Central Animated Aura Orb */}
        <div className="relative z-10 flex items-center justify-center my-6">
          
          {/* Outer Pulsing Aura Ring 3 */}
          <div 
            className="absolute w-72 h-72 rounded-full border border-dashed opacity-30 animate-spin-slow"
            style={{ 
              borderColor: activeDisplayTier.primaryColor,
              boxShadow: `0 0 40px ${activeDisplayTier.glowColor}`
            }}
          />

          {/* Outer Pulsing Aura Ring 2 */}
          <div 
            className="absolute w-60 h-60 rounded-full border opacity-50 animate-ping duration-1000"
            style={{ 
              borderColor: activeDisplayTier.secondaryColor,
              animationDuration: '4s'
            }}
          />

          {/* Glowing Aura Ring 1 */}
          <div 
            className="absolute w-48 h-48 rounded-full transition-all duration-500"
            style={{ 
              background: `radial-gradient(circle, ${activeDisplayTier.glowColor} 0%, transparent 70%)`,
              boxShadow: `0 0 60px ${activeDisplayTier.glowColor}, inset 0 0 30px ${activeDisplayTier.primaryColor}40`
            }}
          />

          {/* Core Orb Container */}
          <div 
            className="w-36 h-36 rounded-full flex flex-col items-center justify-center relative z-20 border-2 transition-all duration-500 shadow-2xl backdrop-blur-md"
            style={{
              borderColor: activeDisplayTier.primaryColor,
              backgroundColor: 'rgba(15, 17, 23, 0.85)',
              boxShadow: `0 0 45px ${activeDisplayTier.glowColor}, 0 0 15px ${activeDisplayTier.primaryColor}80`
            }}
          >
            <div className="p-2 rounded-full bg-white/5 mb-1" style={{ color: activeDisplayTier.primaryColor }}>
              {getTierIcon(activeDisplayTier.iconName, "w-8 h-8 animate-pulse")}
            </div>
            <span className="text-xs font-serif font-bold tracking-widest text-slate-300">
              {activeDisplayTier.sanskritName}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-0.5">
              Level {activeDisplayTier.level}
            </span>
          </div>
        </div>

        {/* Tier Details Card */}
        <div className="relative z-10 text-center max-w-md mt-4 space-y-2">
          <div className="flex items-center justify-center gap-2">
            <h3 className="text-xl font-serif font-bold text-white">
              {activeDisplayTier.name}
            </h3>
            {isPreviewing && (
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase bg-amber-500/20 text-amber-400 border border-amber-500/30">
                Preview Mode
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            {activeDisplayTier.description}
          </p>

          {isPreviewing && (
            <button
              onClick={() => setSelectedPreviewTier(null)}
              className="mt-3 text-xs text-purple-300 hover:text-white underline decoration-purple-400/50 underline-offset-4 font-medium transition-colors"
            >
              ← Return to your Current Aura
            </button>
          )}
        </div>
      </div>

      {/* Progress to Next Tier Card */}
      <div className="glass-panel rounded-2xl p-6 border border-white/[0.06] space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Aura Advancement</span>
            <h4 className="text-base font-serif font-semibold text-white">
              {auraState.nextTier ? `Progress to Level ${auraState.nextTier.level} (${auraState.nextTier.name})` : 'Highest Spiritual Aura Reached!'}
            </h4>
          </div>
          {auraState.nextTier && (
            <span className="text-xs font-mono font-semibold text-purple-300 bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20">
              {auraState.repsNeededForNext.toLocaleString()} reps remaining
            </span>
          )}
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5">
          <div className="w-full bg-white/[0.05] rounded-full h-3.5 p-0.5 border border-white/10 overflow-hidden">
            <div 
              className="h-full rounded-full transition-all duration-700 bg-gradient-to-r from-purple-500 via-amber-400 to-emerald-400 shadow-md"
              style={{ width: `${auraState.progressPercent}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] font-mono text-slate-400">
            <span>{auraState.currentTier.name} (Lvl {auraState.currentTier.level})</span>
            <span className="font-bold text-white">{auraState.progressPercent}%</span>
            <span>{auraState.nextTier ? `${auraState.nextTier.name} (Lvl ${auraState.nextTier.level})` : 'Max Level'}</span>
          </div>
        </div>
      </div>

      {/* Energy Elemental Composition */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Sadhana Energy Composition
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          
          {/* Mantra Energy */}
          <div className="glass-panel rounded-xl p-4 border border-purple-500/20 bg-purple-500/[0.02]">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-semibold text-purple-300 flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-purple-400" />
                Mantra Japa Fire
              </span>
              <span className="text-xs font-mono font-bold text-white">{mantraPct}%</span>
            </div>
            <div className="text-lg font-bold font-mono text-white">
              {auraState.categoryBreakdown.mantraReps.toLocaleString()} <span className="text-xs text-slate-400 font-sans font-normal">reps</span>
            </div>
            <p className="text-[10px] text-slate-500 mt-1">
              {Math.floor(auraState.categoryBreakdown.mantraReps / 108)} Malas completed via Japa
            </p>
          </div>

          {/* Stotra Energy */}
          <div className="glass-panel rounded-xl p-4 border border-blue-500/20 bg-blue-500/[0.02]">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-semibold text-blue-300 flex items-center gap-1.5">
                <Sun className="w-4 h-4 text-blue-400" />
                Stotra Devotion Light
              </span>
              <span className="text-xs font-mono font-bold text-white">{stotraPct}%</span>
            </div>
            <div className="text-lg font-bold font-mono text-white">
              {auraState.categoryBreakdown.stotraReps.toLocaleString()} <span className="text-xs text-slate-400 font-sans font-normal">reps</span>
            </div>
            <p className="text-[10px] text-slate-500 mt-1">
              Recitations of sacred hymns & slokas
            </p>
          </div>

          {/* Chalisa Energy */}
          <div className="glass-panel rounded-xl p-4 border border-emerald-500/20 bg-emerald-500/[0.02]">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-semibold text-emerald-300 flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-emerald-400" />
                Chalisa Protection Shield
              </span>
              <span className="text-xs font-mono font-bold text-white">{chalisaPct}%</span>
            </div>
            <div className="text-lg font-bold font-mono text-white">
              {auraState.categoryBreakdown.chalisaReps.toLocaleString()} <span className="text-xs text-slate-400 font-sans font-normal">reps</span>
            </div>
            <p className="text-[10px] text-slate-500 mt-1">
              40-verse devotional protective chants
            </p>
          </div>

        </div>
      </div>

      {/* Aura Tiers Roadmap */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Aura Tier Milestones
          </h3>
          <span className="text-[11px] text-slate-500">Click any tier to preview its visual aura</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {AURA_TIERS.map(tier => {
            const isUnlocked = auraState.totalReps >= tier.minReps;
            const isCurrent = auraState.currentTier.level === tier.level;
            const isSelected = activeDisplayTier.level === tier.level;

            return (
              <button
                key={tier.level}
                onClick={() => setSelectedPreviewTier(tier)}
                type="button"
                className={`p-4 rounded-xl border text-left transition-all relative overflow-hidden flex flex-col justify-between ${
                  isSelected
                    ? 'border-sadhana-gold bg-sadhana-gold/10 shadow-lg shadow-sadhana-gold/10'
                    : isUnlocked
                    ? 'border-white/10 bg-white/[0.02] hover:bg-white/[0.05]'
                    : 'border-white/[0.04] bg-white/[0.005] opacity-60 hover:opacity-80'
                }`}
              >
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${tier.primaryColor}20`, color: tier.primaryColor }}>
                      {getTierIcon(tier.iconName, "w-4 h-4")}
                    </div>
                    {isCurrent && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded font-bold uppercase bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        Current
                      </span>
                    )}
                    {!isCurrent && isUnlocked && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    )}
                  </div>

                  <div className="text-xs font-serif font-bold text-white">
                    {tier.name} <span className="text-[10px] text-slate-400 font-normal">({tier.sanskritName})</span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                    Level {tier.level}
                  </div>
                </div>

                <div className="mt-4 pt-2 border-t border-white/[0.05] text-[10px] font-mono text-slate-400">
                  {tier.maxReps === Infinity ? '108,000+ Reps' : `${tier.minReps.toLocaleString()} - ${tier.maxReps.toLocaleString()} Reps`}
                </div>
              </button>
            );
          })}
        </div>
      </div>

    </div>
  );
};
