import React, { useMemo, useState } from 'react';
import { Zap, CheckCircle2, Lock, User, UserCheck } from 'lucide-react';
import type { SadhanaLogs, SadhanaConfig, AuraLayer } from '../types';
import { calculateAuraState, SCRIPTURAL_AURA_LAYERS } from '../auraUtils';

interface AuraViewProps {
  logs: SadhanaLogs;
  sadhanas: SadhanaConfig[];
  username?: string;
}

// Meditative Person Silhouette SVG Component (Male / Female in Padmasana)
const MeditativePersonSvg = ({ gender = 'male' }: { gender: 'male' | 'female' }) => {
  return (
    <svg 
      viewBox="0 0 200 240" 
      className="w-48 h-56 sm:w-60 sm:h-72 drop-shadow-[0_0_15px_rgba(255,255,255,0.8)] animate-pulse"
      style={{ animationDuration: '4s' }}
    >
      <defs>
        <radialGradient id="bodyGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
          <stop offset="60%" stopColor="#ffffff" stopOpacity="0.75" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0.4" />
        </radialGradient>
        <filter id="whiteNeonGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Halo / Head Prabhamandala */}
      <circle cx="100" cy="55" r="32" fill="none" stroke="#ffffff" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.8" />
      <circle cx="100" cy="55" r="28" fill="rgba(255,255,255,0.15)" stroke="#ffffff" strokeWidth="1" />

      {/* Head */}
      <circle cx="100" cy="55" r="18" fill="url(#bodyGlow)" stroke="#ffffff" strokeWidth="1.5" filter="url(#whiteNeonGlow)" />

      {/* Hair Bun / Shikha Accent */}
      {gender === 'female' ? (
        <path d="M90,40 C85,25 115,25 110,40 Z" fill="#ffffff" opacity="0.9" />
      ) : (
        <circle cx="100" cy="34" r="5" fill="#ffffff" opacity="0.9" />
      )}

      {/* Neck */}
      <path d="M95,72 L105,72 L106,82 L94,82 Z" fill="#ffffff" opacity="0.9" />

      {/* Torso & Shoulders (Meditative Posture) */}
      <path 
        d="M100,82 C125,85 142,98 144,120 L138,160 C125,165 115,168 100,168 C85,168 75,165 62,160 L56,120 C58,98 75,85 100,82 Z" 
        fill="url(#bodyGlow)" 
        stroke="#ffffff" 
        strokeWidth="1.5" 
        filter="url(#whiteNeonGlow)"
      />

      {/* Crossed Legs (Padmasana Base) */}
      <path 
        d="M52,145 C40,165 40,185 60,195 C80,202 120,202 140,195 C160,185 160,165 148,145 C135,175 65,175 52,145 Z" 
        fill="url(#bodyGlow)" 
        stroke="#ffffff" 
        strokeWidth="1.5" 
        filter="url(#whiteNeonGlow)"
      />

      {/* Arms & Gyan Mudra Hands resting on knees */}
      <path 
        d="M60,115 C45,135 45,165 58,185 C62,188 68,185 66,178 C56,160 58,138 68,122 Z" 
        fill="#ffffff" 
        opacity="0.9"
      />
      <path 
        d="M140,115 C155,135 155,165 142,185 C138,188 132,185 134,178 C144,160 142,138 132,122 Z" 
        fill="#ffffff" 
        opacity="0.9"
      />

      {/* Subtle Central Sushumna Energy Line */}
      <line x1="100" y1="40" x2="100" y2="190" stroke="#ffffff" strokeWidth="1" strokeDasharray="4 4" opacity="0.6" />
      
      {/* Heart Center Sparkle (Anahata Chakra Node) */}
      <circle cx="100" cy="115" r="3.5" fill="#ffffff" className="animate-ping" style={{ animationDuration: '3s' }} />
      <circle cx="100" cy="115" r="2.5" fill="#ffffff" />
    </svg>
  );
};

export const AuraView: React.FC<AuraViewProps> = ({ logs, sadhanas, username }) => {
  const auraState = useMemo(() => calculateAuraState(logs, sadhanas), [logs, sadhanas]);
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [previewLayer, setPreviewLayer] = useState<AuraLayer | null>(null);

  const activeDisplayLayer = previewLayer || auraState.currentHighestLayer;
  const isPreviewing = previewLayer !== null && previewLayer.layerNumber !== auraState.currentHighestLayer.layerNumber;

  // Max unlocked layer number for visual rendering
  const maxVisualLayer = isPreviewing ? previewLayer.layerNumber : auraState.unlockedLayersCount;

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      
      {/* Top Banner Header */}
      <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-white/[0.06] bg-gradient-to-r from-purple-950/20 via-sadhana-dark to-amber-950/20 relative overflow-hidden">
        <div 
          className="absolute -right-20 -top-20 w-80 h-80 rounded-full blur-3xl opacity-20 pointer-events-none transition-all duration-700"
          style={{ backgroundColor: activeDisplayLayer.colorHex }} 
        />
        
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 justify-between text-center md:text-left">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-widest border mb-3"
                 style={{
                   borderColor: `${activeDisplayLayer.colorHex}40`,
                   backgroundColor: `${activeDisplayLayer.colorHex}15`,
                   color: activeDisplayLayer.colorHex
                 }}>
              <Zap className="w-3.5 h-3.5 animate-pulse" />
              Dwadasa Abha • 12 Scriptural Aura Layers
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-wide">
              {username ? `${username}'s Tejas Aura` : 'Dwadasa Tejas Aura'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl mt-1 font-sans leading-relaxed">
              As described in subtle body scriptures (*Yoga Upanishads & Tantras*), your spiritual aura expands through 12 concentric energy layers as your Sadhana recitations increase.
            </p>
          </div>

          <div className="flex gap-3 shrink-0">
            <div className="glass-panel px-4 py-3 rounded-xl border border-white/10 text-center min-w-[95px]">
              <div className="text-xl font-bold font-mono text-amber-400">{auraState.unlockedLayersCount} / 12</div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider font-medium mt-0.5">Aura Layers</div>
            </div>
            <div className="glass-panel px-4 py-3 rounded-xl border border-white/10 text-center min-w-[95px]">
              <div className="text-xl font-bold font-mono text-purple-300">{auraState.totalMalas}</div>
              <div className="text-[10px] text-purple-400 uppercase tracking-wider font-medium mt-0.5">Total Malas</div>
            </div>
            <div className="glass-panel px-4 py-3 rounded-xl border border-white/10 text-center min-w-[95px]">
              <div className="text-xl font-bold font-mono text-white">{auraState.totalReps.toLocaleString()}</div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider font-medium mt-0.5">Total Reps</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Feature: HUGE Meditative Figure & 12 Concentric Scriptural Aura Layers */}
      <div className="glass-panel rounded-3xl p-6 sm:p-12 border border-white/[0.06] bg-white/[0.003] flex flex-col items-center justify-center relative overflow-hidden min-h-[560px] sm:min-h-[640px]">
        
        {/* Gender Silhouette Toggle */}
        <div className="absolute top-4 right-4 z-30 flex items-center gap-1.5 p-1 rounded-xl bg-black/40 border border-white/10 backdrop-blur-md">
          <button
            onClick={() => setGender('male')}
            type="button"
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              gender === 'male' 
                ? 'bg-white/15 text-white shadow border border-white/20' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            Sadhak (Male)
          </button>
          <button
            onClick={() => setGender('female')}
            type="button"
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              gender === 'female' 
                ? 'bg-white/15 text-white shadow border border-white/20' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            Sadhika (Female)
          </button>
        </div>

        {/* Dynamic Glow Ambient Radial Background */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div 
            className="w-[500px] h-[500px] rounded-full blur-[110px] opacity-25 transition-all duration-1000 animate-pulse"
            style={{ backgroundColor: activeDisplayLayer.colorHex }}
          />
        </div>

        {/* 12 Concentric Expanding Aura Layers Wrapper */}
        <div className="relative z-10 flex items-center justify-center my-8 w-full max-w-lg aspect-square">
          
          {/* Render 12 Concentric Ring Layers around Person */}
          {SCRIPTURAL_AURA_LAYERS.map((layer) => {
            const isUnlocked = layer.layerNumber <= maxVisualLayer;
            // Scale ring diameter progressively from 160px up to 480px
            const sizePx = 140 + layer.layerNumber * 26;
            const zIndex = 20 - layer.layerNumber;

            return (
              <div
                key={layer.layerNumber}
                className={`absolute rounded-full transition-all duration-700 flex items-center justify-center ${
                  isUnlocked ? 'animate-pulse' : 'border-dashed opacity-20'
                }`}
                style={{
                  width: `${sizePx}px`,
                  height: `${sizePx}px`,
                  zIndex,
                  borderColor: isUnlocked ? layer.colorHex : 'rgba(255,255,255,0.2)',
                  borderWidth: isUnlocked ? '2px' : '1px',
                  boxShadow: isUnlocked 
                    ? `0 0 ${15 + layer.layerNumber * 3}px ${layer.glowColor}, inset 0 0 ${10 + layer.layerNumber * 2}px ${layer.colorHex}25` 
                    : 'none',
                  animationDuration: `${3 + (layer.layerNumber % 4)}s`
                }}
              >
                {/* Ring Layer Label Badge on Top Edge */}
                {isUnlocked && (
                  <div 
                    className="absolute -top-3 text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border shadow-lg whitespace-nowrap"
                    style={{
                      backgroundColor: 'rgba(15, 17, 23, 0.9)',
                      borderColor: `${layer.colorHex}60`,
                      color: layer.colorHex
                    }}
                  >
                    L{layer.layerNumber}: {layer.name}
                  </div>
                )}
              </div>
            );
          })}

          {/* Central Meditative White Figure */}
          <div className="relative z-20 flex flex-col items-center justify-center">
            <MeditativePersonSvg gender={gender} />
          </div>
        </div>

        {/* Current Active Layer Info Card */}
        <div className="relative z-20 text-center max-w-lg mt-2 space-y-2 bg-black/40 p-4 sm:p-5 rounded-2xl border border-white/10 backdrop-blur-md">
          <div className="flex items-center justify-center gap-2">
            <span 
              className="w-3.5 h-3.5 rounded-full inline-block shadow-md"
              style={{ backgroundColor: activeDisplayLayer.colorHex, boxShadow: `0 0 10px ${activeDisplayLayer.colorHex}` }}
            />
            <h3 className="text-xl font-serif font-bold text-white">
              Layer {activeDisplayLayer.layerNumber}: {activeDisplayLayer.name}
            </h3>
            <span className="text-xs text-slate-400 font-serif">
              ({activeDisplayLayer.sanskritName})
            </span>
          </div>

          <p className="text-xs font-semibold text-purple-300 uppercase tracking-widest">
            {activeDisplayLayer.title}
          </p>

          <p className="text-xs text-slate-300 leading-relaxed font-sans max-w-md mx-auto">
            {activeDisplayLayer.meaning}
          </p>

          {isPreviewing && (
            <div className="pt-2">
              <button
                onClick={() => setPreviewLayer(null)}
                className="text-xs text-amber-400 hover:text-white underline decoration-amber-400/50 underline-offset-4 font-semibold transition-colors"
              >
                ← Return to Your Active Unlocked Aura ({auraState.currentHighestLayer.name})
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Progress to Next Scriptural Layer */}
      <div className="glass-panel rounded-2xl p-6 border border-white/[0.06] space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Aura Expansion Progress</span>
            <h4 className="text-base font-serif font-semibold text-white">
              {auraState.nextLayer 
                ? `Next Scriptural Layer: Layer ${auraState.nextLayer.layerNumber} — ${auraState.nextLayer.name} (${auraState.nextLayer.sanskritName})` 
                : 'All 12 Scriptural Aura Layers Fully Illuminated!'}
            </h4>
          </div>
          {auraState.nextLayer && (
            <span className="text-xs font-mono font-semibold text-amber-300 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
              {auraState.repsNeededForNext.toLocaleString()} reps needed to unlock Layer {auraState.nextLayer.layerNumber}
            </span>
          )}
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5">
          <div className="w-full bg-white/[0.05] rounded-full h-3.5 p-0.5 border border-white/10 overflow-hidden">
            <div 
              className="h-full rounded-full transition-all duration-700 bg-gradient-to-r from-purple-500 via-amber-400 via-emerald-400 to-cyan-400 shadow-md"
              style={{ width: `${auraState.progressPercentToNext}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] font-mono text-slate-400">
            <span>Layer {auraState.currentHighestLayer.layerNumber}: {auraState.currentHighestLayer.name}</span>
            <span className="font-bold text-white">{auraState.progressPercentToNext}%</span>
            <span>{auraState.nextLayer ? `Layer ${auraState.nextLayer.layerNumber}: ${auraState.nextLayer.name}` : 'Max Layer 12'}</span>
          </div>
        </div>
      </div>

      {/* Scriptural Dwadasa Tejas Grid (All 12 Layers) */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-sm font-serif font-bold text-white">
              Dwadasa Abha • The 12 Scriptural Aura Layers
            </h3>
            <p className="text-xs text-slate-400 font-sans mt-0.5">
              Click any layer to preview its visual energy field on the meditational figure above.
            </p>
          </div>
          <span className="text-xs font-mono text-purple-300 bg-purple-500/10 px-3 py-1 rounded-lg border border-purple-500/20">
            {auraState.unlockedLayersCount} / 12 Unlocked
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {SCRIPTURAL_AURA_LAYERS.map((layer) => {
            const isUnlocked = layer.layerNumber <= auraState.unlockedLayersCount;
            const isCurrentHighest = auraState.currentHighestLayer.layerNumber === layer.layerNumber;
            const isSelectedPreview = activeDisplayLayer.layerNumber === layer.layerNumber;

            return (
              <button
                key={layer.layerNumber}
                onClick={() => setPreviewLayer(layer)}
                type="button"
                className={`p-5 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col justify-between group ${
                  isSelectedPreview
                    ? 'border-sadhana-gold bg-sadhana-gold/10 shadow-xl shadow-sadhana-gold/10 ring-1 ring-sadhana-gold'
                    : isUnlocked
                    ? 'border-white/10 bg-white/[0.02] hover:bg-white/[0.05]'
                    : 'border-white/[0.04] bg-white/[0.003] opacity-60 hover:opacity-80'
                }`}
              >
                {/* Top Header */}
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      <span 
                        className="w-4 h-4 rounded-full shrink-0 shadow-md"
                        style={{ backgroundColor: layer.colorHex, boxShadow: isUnlocked ? `0 0 10px ${layer.colorHex}` : 'none' }}
                      />
                      <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                        Layer {layer.layerNumber}
                      </span>
                    </div>

                    {isCurrentHighest && (
                      <span className="text-[9px] px-2 py-0.5 rounded-full font-bold uppercase bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        Active Layer
                      </span>
                    )}
                    {!isCurrentHighest && isUnlocked && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    )}
                    {!isUnlocked && (
                      <Lock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    )}
                  </div>

                  <h4 className="text-base font-serif font-bold text-white group-hover:text-sadhana-gold transition-colors">
                    {layer.name} <span className="text-xs text-slate-400 font-normal font-serif">({layer.sanskritName})</span>
                  </h4>

                  <p className="text-xs font-semibold text-purple-300 mt-0.5">
                    {layer.title}
                  </p>

                  <p className="text-xs text-slate-400 leading-relaxed font-sans mt-2">
                    {layer.meaning}
                  </p>
                </div>

                {/* Bottom Threshold */}
                <div className="mt-4 pt-3 border-t border-white/[0.05] flex justify-between items-center text-xs font-mono text-slate-400">
                  <span>Requirement:</span>
                  <span className="font-bold text-white">
                    {layer.minReps === 0 ? 'Default (0 Reps)' : `${layer.minReps.toLocaleString()} Reps (${Math.floor(layer.minReps / 108)} Malas)`}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

    </div>
  );
};
