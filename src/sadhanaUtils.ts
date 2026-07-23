import type { 
  SadhanaConfig, 
  SadhanaLogs, 
  SadhanaColorPreset, 
  SadhanaDayLog, 
  Sankalp, 
  SadhanaStore, 
  DashboardStats,
  TimeframeMetrics
} from './types';

/** 1 Mala = 108 repetitions (standard japa mala bead count) */
export const MALA_REPS = 108;

/**
 * Format a raw repetition count for display based on a sadhana's countType.
 * - 'reps' type → "5 Times Recited", "20 Minutes", etc.
 * - 'mala' type → "1 Mala", "2 Mala & 54 Reps", "54 Reps"
 */
export const formatSadhanaCount = (count: number, config?: SadhanaConfig): string => {
  if (!config?.hasCount) return '';
  if (config.countType === 'mala') {
    const malas = Math.floor(count / MALA_REPS);
    const reps = count % MALA_REPS;
    if (malas > 0 && reps > 0) return `${malas} Mala & ${reps} Reps`;
    if (malas > 0) return `${malas} Mala${malas > 1 ? 's' : ''}`;
    return `${reps} Reps`;
  }
  return `${count} ${config.countUnit || 'Reps'}`;
};

// Default presets
// Default presets for the frontend (empty, as users create their own)
export const DEFAULT_SADHANA_LIST: SadhanaConfig[] = [];


const STORE_LOCAL_STORAGE_KEY = 'sadhana_journal_store_v2';

/**
 * One-time migration: old logs stored mala counts as small integers (e.g. 1, 2, 3 malas).
 * We now store raw repetitions, so we multiply those small values by MALA_REPS.
 * We also ensure the default sadhana entries receive the new countType field.
 */
const migrateStoreToReps = (store: SadhanaStore): SadhanaStore => {
  if (store.migratedToReps) return store;

  // Identify mala-type sadhana IDs from current config (both preset and user-created)
  const malaSadhanaIds = new Set<string>(
    store.sadhanas
      .filter(s => s.countType === 'mala' || s.countUnit === 'Malas (108x)')
      .map(s => s.id)
  );

  const migratedSadhanas = store.sadhanas.map(s => {
    if (!s.countType) {
      const isMala = s.countUnit?.toLowerCase().includes('mala') || s.name?.toLowerCase().includes('mantra');
      return {
        ...s,
        countType: isMala ? ('mala' as const) : ('reps' as const),
        countUnit: isMala ? 'Reps' : (s.countUnit || 'Times'),
        defaultCount: isMala ? 108 : 1
      };
    }
    return s;
  });

  // Migrate log counts
  const migratedLogs: SadhanaStore['logs'] = {};
  Object.entries(store.logs).forEach(([dateStr, log]) => {
    const migratedCounts = { ...log.counts };
    malaSadhanaIds.forEach(id => {
      const val = migratedCounts[id];
      // Only multiply if the value is small (old format stored 1/2/3 malas, not 108/216)
      if (val !== undefined && val > 0 && val < MALA_REPS) {
        migratedCounts[id] = val * MALA_REPS;
      }
    });
    migratedLogs[dateStr] = { ...log, counts: migratedCounts };
  });

  // Migrate sankalp target counts
  const migratedSankalps = store.sankalps.map(s => {
    if (malaSadhanaIds.has(s.sadhanaId) && s.targetCount > 0 && s.targetCount < MALA_REPS) {
      return { ...s, targetCount: s.targetCount * MALA_REPS };
    }
    return s;
  });

  return {
    ...store,
    sadhanas: migratedSadhanas,
    sankalps: migratedSankalps,
    logs: migratedLogs,
    migratedToReps: true
  };
};

const GUEST_STORAGE_KEY = 'sadhana_journal_guest_store';

export const getLocalStorageKey = (uid?: string | null): string => {
  if (uid) {
    return `sadhana_journal_user_${uid}`;
  }
  return GUEST_STORAGE_KEY;
};

const MOCK_NOTES_LIST = new Set([
  "Chanting Sidh Kunjika Stotra before sunrise created a bubble of deep peace.",
  "Mantra japa done. Felt highly energetic and motivated today.",
  "Completed Hanuman Chalisa in the evening. Restored mental resilience.",
  "Sadhana done during Brahma Muhurta. High focus, no distractions.",
  "Offered Sri Suktam recitations during twilight. Felt a strong wave of gratitude.",
  "A quiet, simple practice session. Consistency is key.",
  "Readings complete. Documenting observations of increased mindfulness."
]);

export const purgeMockLogs = (store: SadhanaStore): SadhanaStore => {
  if (store.purgedMockLogs) return store;

  const cleanLogs: SadhanaStore['logs'] = {};
  
  Object.entries(store.logs || {}).forEach(([dateStr, log]) => {
    // If log note is in MOCK_NOTES_LIST, skip it (mock demo data)
    if (log.notes && MOCK_NOTES_LIST.has(log.notes.trim())) {
      return;
    }

    // Check if log matches mock pattern (all 5 preset items with 108/324 navarna_mantra reps)
    const keys = Object.keys(log.completed || {});
    const isMockPresetSet = keys.length === 5 && 
      keys.includes('hanuman_chalisa') && 
      keys.includes('sidhkunjika_stotra') && 
      keys.includes('navarna_mantra') && 
      keys.includes('deviatharvashirsha') && 
      keys.includes('sri_suktam');

    const navarnaCount = log.counts?.['navarna_mantra'] || 0;
    if (isMockPresetSet && (navarnaCount === 108 || navarnaCount === 324 || navarnaCount === 1 || navarnaCount === 3)) {
      return;
    }

    // Real user log entry – preserve it 100%!
    cleanLogs[dateStr] = log;
  });

  // Preserve real user sankalps, filter out fake demo sankalps
  const cleanSankalps = (store.sankalps || []).filter(
    s => s.id !== 'sankalp_durga' && s.id !== 'sankalp_hanuman'
  );

  return {
    ...store,
    sankalps: cleanSankalps,
    logs: cleanLogs,
    purgedMockLogs: true
  };
};

export const loadStore = (uid?: string | null): SadhanaStore => {
  try {
    let data: string | null = null;

    // 1. Try loading user-scoped key if logged in
    if (uid) {
      data = localStorage.getItem(`sadhana_journal_user_${uid}`);
    }

    // 2. Fallback to guest storage key
    if (!data) {
      data = localStorage.getItem(GUEST_STORAGE_KEY);
    }

    // 3. Fallback to legacy single storage key
    if (!data) {
      data = localStorage.getItem(STORE_LOCAL_STORAGE_KEY);
    }

    // 4. Fallback to old logs storage key
    if (!data) {
      const oldLogsData = localStorage.getItem('sadhana_journal_logs');
      if (oldLogsData) {
        data = JSON.stringify({
          sadhanas: DEFAULT_SADHANA_LIST,
          sankalps: [],
          logs: JSON.parse(oldLogsData),
          migratedToReps: true
        });
      }
    }

    if (data) {
      const parsed = JSON.parse(data);
      if (!parsed.sadhanas) parsed.sadhanas = [];
      if (!parsed.sankalps) parsed.sankalps = [];
      if (!parsed.logs) parsed.logs = {};
      const migrated = migrateStoreToReps(parsed);
      const purged = purgeMockLogs(migrated);
      if (uid) {
        saveStore(purged, uid);
      }
      return purged;
    }
    
    // Default initial store if no data found anywhere
    const initialStore: SadhanaStore = {
      username: '',
      sadhanas: DEFAULT_SADHANA_LIST,
      sankalps: [],
      logs: {},
      migratedToReps: true,
      purgedMockLogs: true
    };
    saveStore(initialStore, uid);
    return initialStore;
  } catch (error) {
    console.error('Failed to load store from localStorage', error);
    return {
      username: '',
      sadhanas: DEFAULT_SADHANA_LIST,
      sankalps: [],
      logs: {},
      migratedToReps: true,
      purgedMockLogs: true
    };
  }
};

export const saveStore = (store: SadhanaStore, uid?: string | null): void => {
  try {
    const key = getLocalStorageKey(uid);
    localStorage.setItem(key, JSON.stringify(store));
  } catch (error) {
    console.error('Failed to save store to localStorage', error);
  }
};

export const clearGuestStore = (): void => {
  try {
    localStorage.removeItem(GUEST_STORAGE_KEY);
    localStorage.removeItem(STORE_LOCAL_STORAGE_KEY);
  } catch (e) {
    console.error('Failed to clear guest store:', e);
  }
};


// Formats a date object to YYYY-MM-DD in local timezone
export const formatDateString = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Generate date offset relative to a given date string
export const getOffsetDateString = (dateStr: string, offsetDays: number): string => {
  const date = new Date(dateStr + 'T00:00:00');
  date.setDate(date.getDate() + offsetDays);
  return formatDateString(date);
};

// Get the date preset hex color
export const getColorHex = (preset: SadhanaColorPreset): string => {
  switch (preset) {
    case 'saffron': return '#cd7f66'; // Terracotta Saffron
    case 'crimson': return '#b55856'; // Crimson Clay
    case 'emerald': return '#768a78'; // Moss Sage
    case 'blue': return '#728196';    // Slate Grey-Blue
    case 'purple': return '#90788d';  // Muted Heather
    default: return '#a59e92';        // Muted Sand
  }
};

// Check if at least one sadhana was performed in the log entry
export const isDayCompleted = (log?: SadhanaDayLog): boolean => {
  if (!log) return false;
  return Object.values(log.completed).some(val => val === true);
};

// Timeframe calculation helper
export const calculateTimeframeMetrics = (
  logs: SadhanaLogs, 
  filterFn: (date: Date, dateStr: string) => boolean
): TimeframeMetrics => {
  let sessionsCount = 0;
  const totalCounts: Record<string, number> = {};

  Object.entries(logs).forEach(([dateStr, log]) => {
    const d = new Date(dateStr + 'T00:00:00');
    if (filterFn(d, dateStr)) {
      Object.entries(log.completed).forEach(([sadhanaId, done]) => {
        if (done) {
          sessionsCount++;
          const countVal = log.counts[sadhanaId] || 0;
          totalCounts[sadhanaId] = (totalCounts[sadhanaId] || 0) + countVal;
        }
      });
    }
  });

  return { sessionsCount, totalCounts };
};

// Vows metrics evaluator
export interface SankalpProgress {
  daysCompleted: number;  // Days where target count was met
  daysTotal: number;      // Target duration days
  progressPercent: number;// Percentage
  isSankalpActive: boolean;
  timelineDays: { dateStr: string; success: boolean; logged: boolean }[];
}

export const getSankalpProgress = (sankalp: Sankalp, logs: SadhanaLogs): SankalpProgress => {
  const duration = sankalp.durationDays;
  const startDateStr = sankalp.startDate;
  
  let daysCompleted = 0;
  const timelineDays = [];
  
  for (let i = 0; i < duration; i++) {
    const checkDateStr = getOffsetDateString(startDateStr, i);
    const log = logs[checkDateStr];
    
    let success = false;
    let logged = false;
    
    if (log) {
      logged = true;
      const isDone = log.completed[sankalp.sadhanaId] === true;
      const meetsTarget = (log.counts[sankalp.sadhanaId] || 0) >= sankalp.targetCount;
      if (isDone && meetsTarget) {
        success = true;
        daysCompleted++;
      }
    }
    
    timelineDays.push({
      dateStr: checkDateStr,
      success,
      logged
    });
  }

  const progressPercent = Math.round((daysCompleted / duration) * 100);
  const isSankalpActive = sankalp.status === 'active';

  return {
    daysCompleted,
    daysTotal: duration,
    progressPercent,
    isSankalpActive,
    timelineDays
  };
};

/**
 * Evaluates active sankalps whose duration has passed.
 * Automatically marks them 'completed' (if target days met) or 'abandoned' (if missed days).
 * Archives the uncompleted/completed attempt into `sankalp.attempts`.
 */
export const autoEvaluateExpiredSankalps = (
  sankalps: Sankalp[],
  logs: SadhanaLogs
): { updatedSankalps: Sankalp[]; changed: boolean } => {
  const todayStr = formatDateString(new Date());
  let changed = false;

  const updatedSankalps = sankalps.map(s => {
    if (s.status !== 'active') return s;

    const vowEndDate = getOffsetDateString(s.startDate, s.durationDays - 1);
    if (todayStr > vowEndDate) {
      changed = true;
      const prog = getSankalpProgress(s, logs);
      const isCompleted = prog.daysCompleted >= prog.daysTotal;
      const status: 'completed' | 'abandoned' = isCompleted ? 'completed' : 'abandoned';

      const newAttempt = {
        id: `attempt_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        startDate: s.startDate,
        durationDays: s.durationDays,
        targetCount: s.targetCount,
        status,
        daysCompleted: prog.daysCompleted
      };
      const existingAttempts = s.attempts || [];

      return {
        ...s,
        status,
        attempts: [...existingAttempts, newAttempt]
      };
    }

    return s;
  });

  return { updatedSankalps, changed };
};

/**
 * Auto-checks and restarts sankalps if a practice is logged on a date past their scheduled end date,
 * or if a practice is logged for an abandoned vow from calendar.
 * Sets `sankalp.status = 'active'` and `sankalp.startDate = dateStr`.
 */
export const autoRestartSankalpsOnLog = (
  sankalps: Sankalp[],
  logs: SadhanaLogs,
  dateStr: string,
  completedSadhanaIds: string[]
): { updatedSankalps: Sankalp[]; changed: boolean } => {
  if (!completedSadhanaIds.length) return { updatedSankalps: sankalps, changed: false };

  let changed = false;
  const updatedSankalps = sankalps.map(s => {
    if (!completedSadhanaIds.includes(s.sadhanaId)) {
      return s;
    }

    const vowEndDate = getOffsetDateString(s.startDate, s.durationDays - 1);

    // Case 1: Active vow where logging date is past the end date (dateStr > vowEndDate)
    if (s.status === 'active' && dateStr > vowEndDate) {
      changed = true;
      const prog = getSankalpProgress(s, logs);
      const newAttempt = {
        id: `attempt_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        startDate: s.startDate,
        durationDays: s.durationDays,
        targetCount: s.targetCount,
        status: 'abandoned' as const,
        daysCompleted: prog.daysCompleted
      };
      const existingAttempts = s.attempts || [];

      return {
        ...s,
        startDate: dateStr,
        status: 'active' as const,
        attempts: [...existingAttempts, newAttempt]
      };
    }

    // Case 2: Vow is abandoned and user logs a practice for this sadhana again from calendar
    if (s.status === 'abandoned') {
      changed = true;
      return {
        ...s,
        startDate: dateStr,
        status: 'active' as const
      };
    }

    return s;
  });

  return { updatedSankalps, changed };
};


export const calculateDashboardStats = (
  sadhanas: SadhanaConfig[], 
  logs: SadhanaLogs
): DashboardStats => {
  const now = new Date();
  const todayStr = formatDateString(now);

  // 1. Set up Date ranges
  
  // start of week (Monday)
  const startOfWeek = new Date(now);
  const day = startOfWeek.getDay();
  const diff = day === 0 ? 6 : day - 1; // Sunday is 0, Monday is 1...
  startOfWeek.setDate(startOfWeek.getDate() - diff);
  startOfWeek.setHours(0, 0, 0, 0);

  // start of month
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  // start of year
  const startOfYear = new Date(now.getFullYear(), 0, 1);

  // 2. Compute metrics
  const todayMetrics = calculateTimeframeMetrics(logs, (_, dateStr) => dateStr === todayStr);
  const weekMetrics = calculateTimeframeMetrics(logs, (d) => d >= startOfWeek);
  const monthMetrics = calculateTimeframeMetrics(logs, (d) => d >= startOfMonth);
  const yearMetrics = calculateTimeframeMetrics(logs, (d) => d >= startOfYear);

  // 3. Completion rates by Sadhana (percentage of total logged days)
  const allLoggedDates = Object.keys(logs);
  const totalDaysTracked = allLoggedDates.length;
  
  const completionsCount: Record<string, number> = {};
  sadhanas.forEach(s => {
    completionsCount[s.id] = 0;
  });

  Object.values(logs).forEach(log => {
    Object.entries(log.completed).forEach(([sId, done]) => {
      if (done && completionsCount[sId] !== undefined) {
        completionsCount[sId]++;
      }
    });
  });

  const sadhanaCompletionRates: Record<string, number> = {};
  sadhanas.forEach(s => {
    sadhanaCompletionRates[s.id] = totalDaysTracked > 0
      ? Math.round((completionsCount[s.id] / totalDaysTracked) * 100)
      : 0;
  });

  return {
    today: todayMetrics,
    thisWeek: weekMetrics,
    thisMonth: monthMetrics,
    thisYear: yearMetrics,
    sadhanaCompletionRates,
    totalDaysTracked
  };
};
