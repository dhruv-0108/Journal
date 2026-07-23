import type { SadhanaLogs, SadhanaConfig, AuraTier, AuraState } from './types';
import { MALA_REPS } from './sadhanaUtils';

export const AURA_TIERS: AuraTier[] = [
  {
    level: 1,
    name: 'Arambha',
    sanskritName: 'आरम्भ',
    minReps: 0,
    maxReps: 1079, // Less than 10 Malas
    primaryColor: '#cd7f66',
    secondaryColor: '#f59e0b',
    glowColor: 'rgba(205, 127, 102, 0.4)',
    description: 'The spark of spiritual practice awakens within. Early devotion begins to illuminate your subtle energy body.',
    iconName: 'Sparkles'
  },
  {
    level: 2,
    name: 'Sadhaka',
    sanskritName: 'साधक',
    minReps: 1080, // 10 Malas
    maxReps: 10799, // Less than 100 Malas
    primaryColor: '#10b981',
    secondaryColor: '#eab308',
    glowColor: 'rgba(16, 185, 129, 0.45)',
    description: 'The fire of inner discipline generates a magnetic aura field, instilling resilience, vitality, and mental clarity.',
    iconName: 'Flame'
  },
  {
    level: 3,
    name: 'Tapovan',
    sanskritName: 'तपोवन',
    minReps: 10800, // 100 Malas
    maxReps: 53999, // Less than 500 Malas
    primaryColor: '#a855f7',
    secondaryColor: '#ec4899',
    glowColor: 'rgba(168, 85, 247, 0.5)',
    description: 'Deep meditative focus creates a serene, luminous purple shield of spiritual energy shielding your presence.',
    iconName: 'Shield'
  },
  {
    level: 4,
    name: 'Siddhi',
    sanskritName: 'सिद्धि',
    minReps: 54000, // 500 Malas
    maxReps: 107999, // Less than 1,000 Malas
    primaryColor: '#06b6d4',
    secondaryColor: '#3b82f6',
    glowColor: 'rgba(6, 182, 212, 0.55)',
    description: 'Higher contemplative absorption radiates celestial warmth and divine clarity that inspires all around you.',
    iconName: 'Sun'
  },
  {
    level: 5,
    name: 'Ananda',
    sanskritName: 'आनन्द',
    minReps: 108000, // 1,000+ Malas
    maxReps: Infinity,
    primaryColor: '#fbbf24',
    secondaryColor: '#f43f5e',
    glowColor: 'rgba(251, 191, 36, 0.65)',
    description: 'Supreme mastery of sadhana. The divine golden aura shines eternally with unbounded cosmic light.',
    iconName: 'Crown'
  }
];

export const calculateAuraState = (
  logs: SadhanaLogs,
  sadhanas: SadhanaConfig[]
): AuraState => {
  let totalReps = 0;
  let activeDaysCount = 0;

  const categoryBreakdown = {
    mantraReps: 0,
    stotraReps: 0,
    chalisaReps: 0,
    otherReps: 0
  };

  const sadhanaConfigMap = new Map<string, SadhanaConfig>();
  sadhanas.forEach(s => sadhanaConfigMap.set(s.id, s));

  Object.values(logs).forEach(log => {
    let dayHasCompleted = false;

    Object.entries(log.completed).forEach(([sadhanaId, isCompleted]) => {
      if (isCompleted) {
        dayHasCompleted = true;
        const reps = log.counts[sadhanaId] || 0;
        totalReps += reps;

        const config = sadhanaConfigMap.get(sadhanaId);
        const nameLower = (config?.name || sadhanaId).toLowerCase();

        if (nameLower.includes('chalisa')) {
          categoryBreakdown.chalisaReps += reps;
        } else if (config?.countType === 'mala') {
          categoryBreakdown.mantraReps += reps;
        } else if (config?.hasCount) {
          categoryBreakdown.stotraReps += reps;
        } else {
          categoryBreakdown.otherReps += reps;
        }
      }
    });

    if (dayHasCompleted) {
      activeDaysCount++;
    }
  });

  const totalMalas = Math.floor(totalReps / MALA_REPS);

  // Find current tier based on totalReps
  let currentTierIndex = AURA_TIERS.findIndex(
    tier => totalReps >= tier.minReps && totalReps <= tier.maxReps
  );
  if (currentTierIndex === -1) {
    currentTierIndex = totalReps >= AURA_TIERS[AURA_TIERS.length - 1].minReps
      ? AURA_TIERS.length - 1
      : 0;
  }

  const currentTier = AURA_TIERS[currentTierIndex];
  const nextTier = currentTierIndex < AURA_TIERS.length - 1 ? AURA_TIERS[currentTierIndex + 1] : null;

  let progressPercent = 100;
  let repsNeededForNext = 0;

  if (nextTier) {
    const range = nextTier.minReps - currentTier.minReps;
    const progressInCurrent = totalReps - currentTier.minReps;
    progressPercent = Math.min(100, Math.max(0, Math.round((progressInCurrent / range) * 100)));
    repsNeededForNext = nextTier.minReps - totalReps;
  }

  return {
    totalReps,
    totalMalas,
    activeDaysCount,
    currentTier,
    nextTier,
    progressPercent,
    repsNeededForNext,
    categoryBreakdown
  };
};
