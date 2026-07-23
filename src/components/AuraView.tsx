import React, { useMemo, useState } from 'react';
import { Zap, CheckCircle2, Lock, User, UserCheck } from 'lucide-react';
import type { SadhanaLogs, SadhanaConfig, AuraLayer } from '../types';
import { calculateAuraState, SCRIPTURAL_AURA_LAYERS } from '../auraUtils';

interface AuraViewProps {
  logs: SadhanaLogs;
  sadhanas: SadhanaConfig[];
  username?: string;
}

// Standing Meditative Person Silhouette SVG Component
const StandingPersonSvg = ({ gender = 'male' }: { gender: 'male' | 'female' }) => {
  return (
    <svg 
      viewBox="0 0 200 320" 
      className="w-36 h-60 sm:w-48 sm:h-80 relative z-20 drop-shadow-[0_0_20px_rgba(255,255,255,0.95)] animate-pulse"
      style={{ animationDuration: '4s' }}
    >
      <defs>
        <radialGradient id="standingBodyGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
          <stop offset="70%" stopColor="#ffffff" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0.6" />
        </radialGradient>
        <filter id="neonWhiteGlow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Head Prabhamandala Halo */}
      <circle cx="100" cy="45" r="26" fill="none" stroke="#ffffff" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.85" />
      
      {/* Head */}
      <circle cx="100" cy="45" r="16" fill="url(#standingBodyGlow)" stroke="#ffffff" strokeWidth="1.5" filter="url(#neonWhiteGlow)" />
      
      {/* Hair Top Knot / Accent */}
      {gender === 'female' ? (
        <path d="M92,31 C88,18 112,18 108,31 Z" fill="#ffffff" opacity="0.9" />
      ) : (
        <circle cx="100" cy="26" r="4.5" fill="#ffffff" opacity="0.9" />
      )}

      {/* Neck */}
      <path d="M96,60 L104,60 L105,70 L95,70 Z" fill="#ffffff" filter="url(#neonWhiteGlow)" />

      {/* Torso & Shoulders */}
      <path 
        d="M100,70 C122,72 134,84 132,125 L124,175 C116,180 108,182 100,182 C92,182 84,180 76,175 L68,125 C66,84 78,72 100,70 Z" 
        fill="url(#standingBodyGlow)" 
        stroke="#ffffff" 
        strokeWidth="1.5" 
        filter="url(#neonWhiteGlow)"
      />

      {/* Standing Left & Right Arms resting at sides */}
      <path 
        d="M68,74 C60,95 56,130 58,165 C60,172 65,172 67,164 C64,135 68,100 76,82 Z" 
        fill="#ffffff" 
        filter="url(#neonWhiteGlow)"
      />
      <path 
        d="M132,74 C140,95 144,130 142,165 C140,172 135,172 133,164 C136,135 132,100 124,82 Z" 
        fill="#ffffff" 
        filter="url(#neonWhiteGlow)"
      />

      {/* Standing Legs */}
      <path 
        d="M78,175 L80,270 L96,270 L97,175 Z" 
        fill="url(#standingBodyGlow)" 
        stroke="#ffffff" 
        strokeWidth="1.5" 
        filter="url(#neonWhiteGlow)"
      />
      <path 
        d="M103,175 L104,270 L120,270 L122,175 Z" 
        fill="url(#standingBodyGlow)" 
        stroke="#ffffff" 
        strokeWidth="1.5" 
        filter="url(#neonWhiteGlow)"
      />

      {/* Feet */}
      <path d="M76,270 C76,278 94,278 96,270 Z" fill="#ffffff" filter="url(#neonWhiteGlow)" />
      <path d="M104,270 C104,278 122,278 124,270 Z" fill="#ffffff" filter="url(#neonWhiteGlow)" />

      {/* Central Sushumna Nadi Line */}
      <line x1="100" y1="30" x2="100" y2="265" stroke="#ffffff" strokeWidth="1" strokeDasharray="4 4" opacity="0.7" />

      {/* Heart Center Sparkle */}
      <circle cx="100" cy="115" r="4" fill="#ffffff" className="animate-ping" style={{ animationDuration: '3s' }} />
      <circle cx="100" cy="115" r="2.5" fill="#ffffff" />
    </svg>
  );
};

// Radiating Sunburst Starbeams Component
const StarburstRays = ({ color = '#ec4899', opacity = 0.4 }: { color?: string; opacity?: number }) => {
  return (
    <div 
      className="absolute inset-0 flex items-center justify-center pointer-events-none transition-all duration-700 animate-spin-slow opacity-60"
      style={{ animationDuration: '40s' }}
    >
      {[...Array(12)].map((_, i) => (
        <div
          key={i}
          className="absolute w-2.5 h-[140%] origin-center rounded-full blur-[6px]"
          style={{
            transform: `rotate(${i * 30}deg)`,
            background: `linear-gradient(to top, transparent 10%, ${color} 50%, transparent 90%)`,
            opacity
          }}
        />
      ))}
    </div>
  );
};

export const AuraView: React.FC<AuraViewProps> = ({ logs, sadhanas, username }) => {
  const auraState = useMemo(() => calculateAuraState(logs, sadhanas), [logs, sadhanas]);
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [previewLayer, setPreviewLayer] = useState<AuraLayer | null>(null);

  const activeDisplayLayer = previewLayer || auraState.currentHighestLayer;
  const isPreviewing = previewLayer !== null && previewLayer.layerNumber !== auraState.currentHighestLayer.layerNumber;

  const visualUnlockedCount = isPreviewing ? previewLayer.layerNumber : auraState.unlockedLayersCount;

  const containerHeightVh = Math.min(85, 50 + (visualUnlockedCount / 12) * 30);

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
              As described in subtle body scriptures (*Yoga Upanishads & Tantras*), your spiritual aura expands outwards contouring your body as your Sadhana recitations increase.
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

      {/* Main Feature: Standing White Figure & Organic Expanding Body-Contour Aura (Full Mobile/App Coverage) */}
      <div 
        className="glass-panel rounded-3xl p-4 sm:p-12 border border-white/[0.06] bg-[#0c0d12] flex flex-col items-center justify-center relative overflow-hidden transition-all duration-700 w-full"
        style={{ minHeight: `${containerHeightVh}vh` }}
      >
        
        {/* Gender Silhouette Toggle */}
        <div className="absolute top-4 right-4 z-30 flex items-center gap-1.5 p-1 rounded-xl bg-black/50 border border-white/10 backdrop-blur-md">
          <button
            onClick={() => setGender('male')}
            type="button"
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              gender === 'male' 
                ? 'bg-white/20 text-white shadow border border-white/20' 
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
                ? 'bg-white/20 text-white shadow border border-white/20' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            Sadhika (Female)
          </button>
        </div>

        {/* Ambient Radial Gradient Fill behind full screen */}
        <div 
          className="absolute inset-0 pointer-events-none transition-all duration-1000 opacity-40 blur-[80px]"
          style={{
            background: `radial-gradient(ellipse at center, ${activeDisplayLayer.colorHex} 0%, rgba(139,92,246,0.2) 45%, transparent 80%)`
          }}
        />

        {/* Radiating Starburst Beams (As shown in Reference Image) */}
        <StarburstRays color={activeDisplayLayer.colorHex} opacity={0.35} />

        {/* Dynamic Expanding Aura Field Wrapper */}
        <div className="relative z-10 flex items-center justify-center my-4 w-full h-full min-h-[380px] sm:min-h-[480px]">
          
          {/* Smooth Organic Concentric Body-Contour Aura Bands */}
          {SCRIPTURAL_AURA_LAYERS.map((layer) => {
            const isUnlocked = layer.layerNumber <= visualUnlockedCount;
            // Expand width and height based on layer number and total unlocked radius
            const widthPx = (140 + layer.layerNumber * 24) * (isUnlocked ? 1 : 0.95);
            const heightPx = (240 + layer.layerNumber * 26) * (isUnlocked ? 1 : 0.95);
            const zIndex = 20 - layer.layerNumber;

            return (
              <div
                key={layer.layerNumber}
                className={`absolute rounded-[110px] transition-all duration-1000 flex items-center justify-center ${
                  isUnlocked ? 'animate-pulse' : 'border-dashed opacity-15'
                }`}
                style={{
                  width: `${widthPx}px`,
                  height: `${heightPx}px`,
                  zIndex,
                  backgroundColor: isUnlocked ? `${layer.colorHex}15` : 'transparent',
                  borderColor: isUnlocked ? layer.colorHex : 'rgba(255,255,255,0.15)',
                  borderWidth: isUnlocked ? '3px' : '1px',
                  filter: isUnlocked 
                    ? `blur(${Math.min(18, 4 + layer.layerNumber * 1.2)}px) drop-shadow(0 0 ${12 + layer.layerNumber * 2}px ${layer.colorHex})` 
                    : 'none',
                  boxShadow: isUnlocked 
                    ? `0 0 ${20 + layer.layerNumber * 5}px ${layer.glowColor}, inset 0 0 ${15 + layer.layerNumber * 3}px ${layer.colorHex}30` 
                    : 'none',
                  animationDuration: `${3.5 + (layer.layerNumber % 4)}s`
                }}
              />
            );
          })}

          {/* Crisp Overlay Contour Rings (Unblurred inner borders matching reference image) */}
          {SCRIPTURAL_AURA_LAYERS.map((layer) => {
            if (layer.layerNumber > visualUnlockedCount) return null;
            const widthPx = 135 + layer.layerNumber * 24;
            const heightPx = 235 + layer.layerNumber * 26;

            return (
              <div
                key={`crisp_${layer.layerNumber}`}
                className="absolute rounded-[110px] pointer-events-none transition-all duration-700 opacity-60 border"
                style={{
                  width: `${widthPx}px`,
                  height: `${heightPx}px`,
                  zIndex: 22 - layer.layerNumber,
                  borderColor: layer.colorHex
                }}
              />
            );
          })}

          {/* Central Standing Luminous White Silhouette */}
          <StandingPersonSvg gender={gender} />
        </div>

        {/* Active Layer Scriptural Info Card */}
        <div className="relative z-20 text-center max-w-lg mt-4 space-y-2 bg-black/60 p-4 sm:p-5 rounded-2xl border border-white/10 backdrop-blur-md w-full">
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
              Click any layer to preview its visual energy field on the standing figure above.
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
