import React, { useMemo, useState } from 'react';
import { Zap, CheckCircle2, Lock, User, UserCheck, Sparkles } from 'lucide-react';
import type { SadhanaLogs, SadhanaConfig, AuraLayer } from '../types';
import { calculateAuraState, SCRIPTURAL_AURA_LAYERS } from '../auraUtils';

interface AuraViewProps {
  logs: SadhanaLogs;
  sadhanas: SadhanaConfig[];
  username?: string;
}

// Outstretched Arms Transcendent Silhouette Component (Matching Reference Image)
const OutstretchedPersonSvg = ({ gender = 'male' }: { gender: 'male' | 'female' }) => {
  return (
    <svg 
      viewBox="0 0 340 380" 
      className="w-72 h-80 sm:w-[420px] sm:h-[480px] relative z-20 drop-shadow-[0_0_30px_rgba(255,255,255,0.95)] animate-pulse"
      style={{ animationDuration: '4.5s' }}
    >
      <defs>
        {/* Core Heart Radiance Radial Gradient */}
        <radialGradient id="heartCoreRadiance" cx="50%" cy="38%" r="45%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
          <stop offset="25%" stopColor="#38bdf8" stopOpacity="0.9" />
          <stop offset="60%" stopColor="#a855f7" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>

        <radialGradient id="bodySkinGlow" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
          <stop offset="50%" stopColor="#e2e8f0" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#94a3b8" stopOpacity="0.5" />
        </radialGradient>

        <filter id="intenseWhiteGlow" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Radiant Head Crown Halo (Prabhamandala) */}
      <circle cx="170" cy="50" r="32" fill="none" stroke="#ffffff" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.85" />
      <circle cx="170" cy="50" r="22" fill="rgba(56, 189, 248, 0.25)" stroke="#ffffff" strokeWidth="1" />

      {/* Head tilted slightly upwards */}
      <ellipse cx="170" cy="50" rx="15" ry="19" fill="url(#bodySkinGlow)" stroke="#ffffff" strokeWidth="1.5" filter="url(#intenseWhiteGlow)" />
      
      {/* Hair Bun / Top Accent */}
      {gender === 'female' ? (
        <path d="M160,33 C155,20 185,20 180,33 Z" fill="#ffffff" opacity="0.9" />
      ) : (
        <circle cx="170" cy="30" r="5" fill="#ffffff" opacity="0.9" />
      )}

      {/* Neck */}
      <path d="M165,68 L175,68 L176,80 L164,80 Z" fill="#ffffff" filter="url(#intenseWhiteGlow)" />

      {/* Torso with Blazing Heart Core Light (Matching Reference Image) */}
      <path 
        d="M170,80 C195,83 208,98 215,115 L200,195 C190,205 180,208 170,208 C160,208 150,205 140,195 L125,115 C132,98 145,83 170,80 Z" 
        fill="url(#bodySkinGlow)" 
        stroke="#ffffff" 
        strokeWidth="1.5" 
        filter="url(#intenseWhiteGlow)"
      />

      {/* OUTSTRETCHED ARMS REACHING LATERALLY (T-Pose Receptive Open Posture) */}
      {/* Left Outstretched Arm */}
      <path 
        d="M135,92 C105,98 60,110 32,118 C24,120 20,114 26,108 C58,96 108,86 142,84 Z" 
        fill="url(#bodySkinGlow)" 
        stroke="#ffffff" 
        strokeWidth="1.5" 
        filter="url(#intenseWhiteGlow)"
      />
      {/* Left Outstretched Hand & Open Fingers */}
      <path d="M28,116 C18,120 16,112 24,106 Z" fill="#ffffff" filter="url(#intenseWhiteGlow)" />

      {/* Right Outstretched Arm */}
      <path 
        d="M205,92 C235,98 280,110 308,118 C316,120 320,114 314,108 C282,96 232,86 198,84 Z" 
        fill="url(#bodySkinGlow)" 
        stroke="#ffffff" 
        strokeWidth="1.5" 
        filter="url(#intenseWhiteGlow)"
      />
      {/* Right Outstretched Hand & Open Fingers */}
      <path d="M312,116 C322,120 324,112 316,106 Z" fill="#ffffff" filter="url(#intenseWhiteGlow)" />

      {/* Legs Floating Together */}
      <path 
        d="M148,200 L152,320 L167,320 L169,200 Z" 
        fill="url(#bodySkinGlow)" 
        stroke="#ffffff" 
        strokeWidth="1.5" 
        filter="url(#intenseWhiteGlow)"
      />
      <path 
        d="M171,200 L173,320 L188,320 L192,200 Z" 
        fill="url(#bodySkinGlow)" 
        stroke="#ffffff" 
        strokeWidth="1.5" 
        filter="url(#intenseWhiteGlow)"
      />

      {/* Feet Floating Downwards */}
      <path d="M152,320 C154,334 167,334 167,320 Z" fill="#ffffff" filter="url(#intenseWhiteGlow)" />
      <path d="M173,320 C175,334 188,334 188,320 Z" fill="#ffffff" filter="url(#intenseWhiteGlow)" />

      {/* BLAZING HEART CENTER ENERGY BURST (Matching Reference Image) */}
      <circle cx="170" cy="120" r="42" fill="url(#heartCoreRadiance)" opacity="0.9" className="animate-pulse" />
      <circle cx="170" cy="120" r="16" fill="#ffffff" filter="url(#intenseWhiteGlow)" />
      <circle cx="170" cy="120" r="6" fill="#ffffff" className="animate-ping" style={{ animationDuration: '2.5s' }} />

      {/* Subtle Central Sushumna Nadi Line */}
      <line x1="170" y1="30" x2="170" y2="320" stroke="#ffffff" strokeWidth="1" strokeDasharray="4 4" opacity="0.75" />
    </svg>
  );
};

// Radiating Background Rays Component (Full Viewport Coverage)
const FullScreenStarRays = ({ color = '#38bdf8' }: { color?: string }) => {
  return (
    <div 
      className="absolute inset-0 flex items-center justify-center pointer-events-none transition-all duration-1000 animate-spin-slow opacity-50"
      style={{ animationDuration: '50s' }}
    >
      {[...Array(16)].map((_, i) => (
        <div
          key={i}
          className="absolute w-4 h-[220vh] origin-center rounded-full blur-[10px]"
          style={{
            transform: `rotate(${i * 22.5}deg)`,
            background: `linear-gradient(to top, transparent 5%, ${color} 50%, transparent 95%)`,
            opacity: 0.4
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

  return (
    <div className="w-full min-h-[calc(100vh-70px)] relative overflow-hidden bg-[#07080c] text-white flex flex-col justify-between items-center p-4 sm:p-8 animate-fade-in select-none">
      
      {/* Dynamic Full-Bleed Background Aura Fill (Spans entire website viewport) */}
      <div 
        className="absolute inset-0 pointer-events-none transition-all duration-1000 blur-[100px] opacity-60"
        style={{
          background: `radial-gradient(ellipse at center, ${activeDisplayLayer.colorHex} 0%, rgba(168,85,247,0.3) 40%, rgba(14,165,233,0.15) 70%, #07080c 100%)`
        }}
      />

      {/* Radiating Starburst Rays */}
      <FullScreenStarRays color={activeDisplayLayer.colorHex} />

      {/* ── TOP UNBOXED FLOATING HEADER ────────────────────────────────────── */}
      <div className="relative z-30 w-full max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
        
        {/* Left Title & Status */}
        <div className="text-center sm:text-left space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-widest border"
               style={{
                 borderColor: `${activeDisplayLayer.colorHex}50`,
                 backgroundColor: 'rgba(0,0,0,0.5)',
                 color: activeDisplayLayer.colorHex
               }}>
            <Zap className="w-3.5 h-3.5 animate-pulse" />
            Dwadasa Abha • 12 Scriptural Layers
          </div>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-white tracking-wide">
            {username ? `${username}'s Tejas Aura` : 'Dwadasa Tejas Aura'}
          </h2>
        </div>

        {/* Center/Right Minimal Stats Pills & Gender Toggle */}
        <div className="flex items-center gap-3 flex-wrap justify-center sm:justify-end">
          
          {/* Gender Silhouette Toggle */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-black/60 border border-white/10 backdrop-blur-md">
            <button
              onClick={() => setGender('male')}
              type="button"
              className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                gender === 'male' 
                  ? 'bg-white/20 text-white border border-white/30 shadow' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <User className="w-3 h-3" />
              Sadhak
            </button>
            <button
              onClick={() => setGender('female')}
              type="button"
              className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                gender === 'female' 
                  ? 'bg-white/20 text-white border border-white/30 shadow' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <UserCheck className="w-3 h-3" />
              Sadhika
            </button>
          </div>

          {/* Minimal Floating Stats */}
          <div className="flex items-center gap-2 text-xs font-mono bg-black/60 px-3.5 py-1.5 rounded-xl border border-white/10 backdrop-blur-md">
            <span className="text-amber-400 font-bold">{auraState.unlockedLayersCount}/12 Layers</span>
            <span className="text-slate-600">|</span>
            <span className="text-purple-300 font-bold">{auraState.totalMalas} Malas</span>
            <span className="text-slate-600">|</span>
            <span className="text-white font-bold">{auraState.totalReps.toLocaleString()} Reps</span>
          </div>

        </div>
      </div>

      {/* ── CENTER MASTERPIECE: OUTSTRETCHED SILHOUETTE & FULL-BLEED AURA ────── */}
      <div className="relative z-20 w-full flex-1 flex flex-col items-center justify-center my-4 min-h-[460px] sm:min-h-[540px]">
        
        {/* Dynamic Expanding Body-Contour Aura Halos */}
        <div className="relative flex items-center justify-center w-full h-full">
          
          {/* Render Organic Contour Halos around Outstretched Figure */}
          {SCRIPTURAL_AURA_LAYERS.map((layer) => {
            const isUnlocked = layer.layerNumber <= visualUnlockedCount;
            // Width and Height scaled dynamically to fill website viewport
            const widthPx = (220 + layer.layerNumber * 38) * (isUnlocked ? 1 : 0.95);
            const heightPx = (260 + layer.layerNumber * 32) * (isUnlocked ? 1 : 0.95);
            const zIndex = 20 - layer.layerNumber;

            return (
              <div
                key={layer.layerNumber}
                className={`absolute rounded-[140px] transition-all duration-1000 flex items-center justify-center ${
                  isUnlocked ? 'animate-pulse' : 'border-dashed opacity-10'
                }`}
                style={{
                  width: `${widthPx}px`,
                  height: `${heightPx}px`,
                  zIndex,
                  backgroundColor: isUnlocked ? `${layer.colorHex}18` : 'transparent',
                  borderColor: isUnlocked ? layer.colorHex : 'rgba(255,255,255,0.1)',
                  borderWidth: isUnlocked ? '3.5px' : '1px',
                  filter: isUnlocked 
                    ? `blur(${Math.min(22, 6 + layer.layerNumber * 1.4)}px) drop-shadow(0 0 ${16 + layer.layerNumber * 3}px ${layer.colorHex})` 
                    : 'none',
                  boxShadow: isUnlocked 
                    ? `0 0 ${25 + layer.layerNumber * 6}px ${layer.glowColor}, inset 0 0 ${20 + layer.layerNumber * 4}px ${layer.colorHex}35` 
                    : 'none',
                  animationDuration: `${3.5 + (layer.layerNumber % 4)}s`
                }}
              />
            );
          })}

          {/* Crisp Overlay Contour Lines */}
          {SCRIPTURAL_AURA_LAYERS.map((layer) => {
            if (layer.layerNumber > visualUnlockedCount) return null;
            const widthPx = 215 + layer.layerNumber * 38;
            const heightPx = 255 + layer.layerNumber * 32;

            return (
              <div
                key={`crisp_${layer.layerNumber}`}
                className="absolute rounded-[140px] pointer-events-none transition-all duration-700 opacity-50 border"
                style={{
                  width: `${widthPx}px`,
                  height: `${heightPx}px`,
                  zIndex: 22 - layer.layerNumber,
                  borderColor: layer.colorHex
                }}
              />
            );
          })}

          {/* Outstretched Figure Silhouette (Matching Reference Image) */}
          <OutstretchedPersonSvg gender={gender} />
        </div>

        {/* Minimal Unboxed Floating Layer Title & Description */}
        <div className="relative z-30 text-center max-w-xl mt-4 space-y-1.5 bg-black/60 px-6 py-4 rounded-2xl border border-white/10 backdrop-blur-md">
          <div className="flex items-center justify-center gap-2">
            <span 
              className="w-3.5 h-3.5 rounded-full inline-block shadow-md"
              style={{ backgroundColor: activeDisplayLayer.colorHex, boxShadow: `0 0 12px ${activeDisplayLayer.colorHex}` }}
            />
            <h3 className="text-xl sm:text-2xl font-serif font-bold text-white">
              Layer {activeDisplayLayer.layerNumber}: {activeDisplayLayer.name}
            </h3>
            <span className="text-sm text-slate-400 font-serif">
              ({activeDisplayLayer.sanskritName})
            </span>
          </div>

          <p className="text-xs font-semibold uppercase tracking-widest text-purple-300">
            {activeDisplayLayer.title}
          </p>

          <p className="text-xs text-slate-200 leading-relaxed font-sans max-w-md mx-auto">
            {activeDisplayLayer.meaning}
          </p>

          {isPreviewing && (
            <div className="pt-1">
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

      {/* ── BOTTOM UNBOXED FLOATING LAYER SELECTOR BAR ────────────────────────── */}
      <div className="relative z-30 w-full max-w-6xl space-y-3 pt-2">
        
        {/* Next Layer Progress Bar Overlay */}
        {auraState.nextLayer && (
          <div className="flex flex-col sm:flex-row justify-between items-center gap-2 text-xs font-mono bg-black/60 px-4 py-2 rounded-xl border border-white/10 backdrop-blur-md">
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span className="text-slate-300">
                Next: <strong className="text-white font-serif">{auraState.nextLayer.name} ({auraState.nextLayer.sanskritName})</strong>
              </span>
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="w-32 bg-white/10 rounded-full h-2 overflow-hidden border border-white/20">
                <div 
                  className="h-full bg-gradient-to-r from-purple-500 via-amber-400 to-emerald-400 rounded-full transition-all duration-700" 
                  style={{ width: `${auraState.progressPercentToNext}%` }}
                />
              </div>
              <span className="text-amber-300 font-bold">{auraState.repsNeededForNext.toLocaleString()} reps needed</span>
            </div>
          </div>
        )}

        {/* Unboxed Floating 12 Scriptural Layers Selector Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none justify-start sm:justify-center w-full">
          {SCRIPTURAL_AURA_LAYERS.map((layer) => {
            const isUnlocked = layer.layerNumber <= auraState.unlockedLayersCount;
            const isCurrentHighest = auraState.currentHighestLayer.layerNumber === layer.layerNumber;
            const isSelectedPreview = activeDisplayLayer.layerNumber === layer.layerNumber;

            return (
              <button
                key={layer.layerNumber}
                onClick={() => setPreviewLayer(layer)}
                type="button"
                className={`px-3 py-2 rounded-xl border text-left transition-all shrink-0 flex items-center gap-2 backdrop-blur-md ${
                  isSelectedPreview
                    ? 'border-sadhana-gold bg-sadhana-gold/20 text-white shadow-lg ring-1 ring-sadhana-gold'
                    : isUnlocked
                    ? 'border-white/15 bg-black/60 text-slate-200 hover:bg-white/10'
                    : 'border-white/5 bg-black/40 text-slate-500 opacity-60 hover:opacity-80'
                }`}
              >
                <span 
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: layer.colorHex, boxShadow: isUnlocked ? `0 0 6px ${layer.colorHex}` : 'none' }}
                />
                <div className="text-[11px] font-mono leading-tight">
                  <div className="font-bold flex items-center gap-1">
                    <span>L{layer.layerNumber}</span>
                    {isCurrentHighest && <span className="text-[9px] text-purple-300 font-sans uppercase">★</span>}
                    {!isCurrentHighest && isUnlocked && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                    {!isUnlocked && <Lock className="w-2.5 h-2.5 text-slate-500" />}
                  </div>
                  <div className="text-[10px] text-slate-300 font-serif font-normal">{layer.sanskritName}</div>
                </div>
              </button>
            );
          })}
        </div>

      </div>

    </div>
  );
};
