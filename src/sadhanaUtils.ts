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

export interface MasterSadhanaEntry extends SadhanaConfig {
  category: 'stotra' | 'chalisa' | 'mantra' | '108 names' | '12 names' | '1008 names';
  deityType: 'devi' | 'devta';
}

// Master database structured with category and deityType segregation
export const MASTER_SADHANA_DATABASE: MasterSadhanaEntry[] = [
  {
    id: 'hanuman_chalisa',
    name: 'Hanuman Chalisa',
    sanskritName: 'हनुमान चालीसा',
    description: 'Devotional hymn dedicated to Lord Hanuman, invoking physical/mental strength and courage.',
    colorPreset: 'saffron',
    hasCount: true,
    countType: 'reps',
    countUnit: 'Times Recited',
    defaultCount: 1,
    category: 'chalisa',
    deityType: 'devta'
  },
  {
    id: 'sidhkunjika_stotra',
    name: 'Sidh Kunjika Stotra',
    sanskritName: 'सिद्ध कुंजिका स्तोत्र',
    description: 'A powerful, foundational stotra from the Durga Saptashati, representing shakti and spiritual protection.',
    colorPreset: 'crimson',
    hasCount: true,
    countType: 'reps',
    countUnit: 'Times Recited',
    defaultCount: 1,
    category: 'stotra',
    deityType: 'devi'
  },
  {
    id: 'deviatharvashirsha',
    name: 'Devi Atharvashirsha',
    sanskritName: 'देवी अथर्वशीर्ष',
    description: 'Vedic text praising the Divine Mother as the absolute source of creation.',
    colorPreset: 'blue',
    hasCount: true,
    countType: 'reps',
    countUnit: 'Times Recited',
    defaultCount: 1,
    category: 'stotra',
    deityType: 'devi'
  },
  {
    id: 'sri_suktam',
    name: 'Sri Suktam',
    sanskritName: 'श्री सूक्तम्',
    description: 'Rigvedic hymn invoking Divine Grace, inner light, abundance, and spiritual prosperity.',
    colorPreset: 'emerald',
    hasCount: true,
    countType: 'reps',
    countUnit: 'Times Recited',
    defaultCount: 1,
    category: 'stotra',
    deityType: 'devi'
  },
  {
    id: 'lalita_sahasranama',
    name: 'Lalita Sahasranama',
    sanskritName: 'ललिता सहस्रनाम',
    description: 'A sacred text reciting the thousand names of the Hindu Mother Goddess Lalita Tripurasundari.',
    colorPreset: 'crimson',
    hasCount: true,
    countType: 'reps',
    countUnit: 'Times Recited',
    defaultCount: 1,
    category: '1008 names',
    deityType: 'devi'
  },
  {
    id: 'vishnu_sahasranama',
    name: 'Vishnu Sahasranama',
    sanskritName: 'विष्णु सहस्रनाम',
    description: 'A list of 1,000 names of Lord Vishnu, invoking cosmic order, protection, and spiritual evolution.',
    colorPreset: 'blue',
    hasCount: true,
    countType: 'reps',
    countUnit: 'Times Recited',
    defaultCount: 1,
    category: '1008 names',
    deityType: 'devta'
  },
  {
    id: 'shiva_tandava',
    name: 'Shiva Tandava Stotram',
    sanskritName: 'शिव ताण्डव स्तोत्रम्',
    description: 'A powerful stotra composed by Ravana, describing Lord Shiva\'s ecstatic and powerful cosmic dance.',
    colorPreset: 'purple',
    hasCount: true,
    countType: 'reps',
    countUnit: 'Times Recited',
    defaultCount: 1,
    category: 'stotra',
    deityType: 'devta'
  },
  {
    id: 'durga_chalisa',
    name: 'Durga Chalisa',
    sanskritName: 'दुर्गा चालीसा',
    description: 'Forty devotional verses dedicated to Goddess Durga, invoking maternal protection and strength.',
    colorPreset: 'crimson',
    hasCount: true,
    countType: 'reps',
    countUnit: 'Times Recited',
    defaultCount: 1,
    category: 'chalisa',
    deityType: 'devi'
  },
  {
    id: 'kanakadhara_stotra',
    name: 'Kanakadhara Stotram',
    sanskritName: 'कनकधारा स्तोत्रम्',
    description: 'Composed by Adi Shankara, invoking Goddess Lakshmi for abundance, grace, and prosperity.',
    colorPreset: 'emerald',
    hasCount: true,
    countType: 'reps',
    countUnit: 'Times Recited',
    defaultCount: 1,
    category: 'stotra',
    deityType: 'devi'
  },
  {
    id: 'aditya_hrudaya',
    name: 'Aditya Hrudaya Stotram',
    sanskritName: 'आदित्य हृदय स्तोत्रम्',
    description: 'A dynamic hymn addressed to the Sun God, recited by Sage Agastya to Lord Rama before the battle.',
    colorPreset: 'saffron',
    hasCount: true,
    countType: 'reps',
    countUnit: 'Times Recited',
    defaultCount: 1,
    category: 'stotra',
    deityType: 'devta'
  },
  {
    id: 'navarna_mantra',
    name: 'Navarna Mantra',
    sanskritName: 'नवार्ण मंत्र',
    description: 'A transformative, rhythmic cosmic chant (Aim Hreem Kleem...) to balance inner spiritual forces.',
    colorPreset: 'purple',
    hasCount: true,
    countType: 'mala',
    countUnit: 'Reps',
    defaultCount: 108,
    category: 'mantra',
    deityType: 'devi'
  },
  {
    id: 'gayatri_mantra',
    name: 'Gayatri Mantra',
    sanskritName: 'गायत्री मंत्र',
    description: 'A highly revered Vedic chant invoking solar consciousness, wisdom, and spiritual illumination.',
    colorPreset: 'saffron',
    hasCount: true,
    countType: 'mala',
    countUnit: 'Reps',
    defaultCount: 108,
    category: 'mantra',
    deityType: 'devi'
  },
  {
    id: 'maha_mrityunjaya',
    name: 'Maha Mrityunjaya Mantra',
    sanskritName: 'महामृत्युंजय मंत्र',
    description: 'A powerful life-restoring mantra of Lord Shiva, invoking rejuvenation, protection, and liberation.',
    colorPreset: 'purple',
    hasCount: true,
    countType: 'mala',
    countUnit: 'Reps',
    defaultCount: 108,
    category: 'mantra',
    deityType: 'devta'
  },
  {
    id: 'shiva_panchakshari',
    name: 'Shiva Panchakshari Mantra',
    sanskritName: 'शिव पंचाक्षरी मंत्र',
    description: 'The sacred five-syllable chant "Om Namah Shivaya" expressing devotion, purity, and surrender to Shiva.',
    colorPreset: 'blue',
    hasCount: true,
    countType: 'mala',
    countUnit: 'Reps',
    defaultCount: 108,
    category: 'mantra',
    deityType: 'devta'
  },
  {
    id: 'hare_krishna_mahama',
    name: 'Hare Krishna Mahamantra',
    sanskritName: 'हरे कृष्ण महामंत्र',
    description: 'A 16-word vaishnava mahamantra dedicated to Lord Krishna and Lord Rama, fostering divine love and joy.',
    colorPreset: 'saffron',
    hasCount: true,
    countType: 'mala',
    countUnit: 'Reps',
    defaultCount: 108,
    category: 'mantra',
    deityType: 'devta'
  },
  {
    id: 'om_namo_bhagavate',
    name: 'Om Namo Bhagavate Vasudevaya',
    sanskritName: 'ॐ नमो भगवते वासुदेवाय',
    description: 'Twelve-syllable liberation mantra dedicated to Lord Vishnu, fostering inner devotion and surrender.',
    colorPreset: 'blue',
    hasCount: true,
    countType: 'mala',
    countUnit: 'Reps',
    defaultCount: 108,
    category: 'mantra',
    deityType: 'devta'
  },
  {
    id: 'ganesh_mantra',
    name: 'Ganesh Maha Mantra',
    sanskritName: 'गणेश महामंत्र',
    description: 'Obstacle-removing mantra "Om Gam Ganapataye Namaha" invoking auspicious beginnings and success.',
    colorPreset: 'saffron',
    hasCount: true,
    countType: 'mala',
    countUnit: 'Reps',
    defaultCount: 108,
    category: 'mantra',
    deityType: 'devta'
  },
  {
    id: 'durga_mantra',
    name: 'Durga Mantra (Om Dum Durgayei)',
    sanskritName: 'दुर्गा मंत्र (ॐ दुं दुर्गायै नमः)',
    description: 'Devotional protective mantra invoking the armor and victory of Goddess Durga.',
    colorPreset: 'crimson',
    hasCount: true,
    countType: 'mala',
    countUnit: 'Reps',
    defaultCount: 108,
    category: 'mantra',
    deityType: 'devi'
  }
];

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
    const preset = MASTER_SADHANA_DATABASE.find(d => d.id === s.id);
    if (preset && !s.countType) {
      return { ...s, countType: preset.countType };
    }
    // Old navarna stored as 'Malas (108x)' unit – upgrade it
    if (s.countUnit === 'Malas (108x)' && !s.countType) {
      return { ...s, countType: 'mala' as const, countUnit: 'Reps', defaultCount: 108 };
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

export const loadStore = (): SadhanaStore => {
  try {
    const data = localStorage.getItem(STORE_LOCAL_STORAGE_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      if (!parsed.sadhanas) parsed.sadhanas = [];
      parsed.sadhanas = parsed.sadhanas.filter((s: any) => s.id.startsWith('sadhana_'));
      if (!parsed.sankalps) parsed.sankalps = [];
      if (!parsed.logs) parsed.logs = {};
      // Run one-time migration to raw reps
      const migrated = migrateStoreToReps(parsed);
      if (!parsed.migratedToReps) {
        saveStore(migrated); // persist migration immediately
      }
      return migrated;
    }
    
    // Fallback/Migration check from old format
    const oldLogsData = localStorage.getItem('sadhana_journal_logs');
    const initialLogs = oldLogsData ? JSON.parse(oldLogsData) : {};
    
    const initialStore: SadhanaStore = {
      sadhanas: DEFAULT_SADHANA_LIST,
      sankalps: [],
      logs: initialLogs,
      migratedToReps: true  // Fresh store – no migration needed
    };
    saveStore(initialStore);
    return initialStore;
  } catch (error) {
    console.error('Failed to load store from localStorage', error);
    return {
      sadhanas: DEFAULT_SADHANA_LIST,
      sankalps: [],
      logs: {},
      migratedToReps: true
    };
  }
};

export const saveStore = (store: SadhanaStore): void => {
  try {
    localStorage.setItem(STORE_LOCAL_STORAGE_KEY, JSON.stringify(store));
  } catch (error) {
    console.error('Failed to save store to localStorage', error);
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

export const generateMockStoreData = (): SadhanaStore => {
  const store: SadhanaStore = {
    username: 'Dhruv',
    sadhanas: DEFAULT_SADHANA_LIST,
    sankalps: [
      {
        id: 'sankalp_durga',
        title: '41-Day Durga Saptashati vow',
        sadhanaId: 'sidhkunjika_stotra',
        targetCount: 1,
        durationDays: 41,
        startDate: getOffsetDateString(formatDateString(new Date()), -30), // Started 30 days ago
        status: 'active'
      },
      {
        id: 'sankalp_hanuman',
        title: '21-Day Hanuman Vow',
        sadhanaId: 'hanuman_chalisa',
        targetCount: 1,
        durationDays: 21,
        startDate: getOffsetDateString(formatDateString(new Date()), -40), // Started 40 days ago (completed)
        status: 'completed'
      }
    ],
    logs: {}
  };

  const today = new Date();
  
  // Seed past 45 days of logs
  for (let i = 0; i < 45; i++) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    const dateStr = formatDateString(d);

    // Seed logs: 80% consistency
    if (Math.random() > 0.20) {
      const completed: Record<string, boolean> = {
        hanuman_chalisa: Math.random() > 0.3,
        sidhkunjika_stotra: Math.random() > 0.4, // Keep high to match Durga Vow
        navarna_mantra: Math.random() > 0.3,
        deviatharvashirsha: Math.random() > 0.7,
        sri_suktam: Math.random() > 0.6
      };

      const counts: Record<string, number> = {
        hanuman_chalisa: completed.hanuman_chalisa ? 1 : 0,
        sidhkunjika_stotra: completed.sidhkunjika_stotra ? 1 : 0,
        // navarna_mantra is mala-type – store raw reps (108 = 1 Mala, 324 = 3 Malas)
        navarna_mantra: completed.navarna_mantra ? (Math.random() > 0.6 ? 324 : 108) : 0,
        deviatharvashirsha: completed.deviatharvashirsha ? 1 : 0,
        sri_suktam: completed.sri_suktam ? 1 : 0
      };

      const notesList = [
        "Chanting Sidh Kunjika Stotra before sunrise created a bubble of deep peace.",
        "Mantra japa done. Felt highly energetic and motivated today.",
        "Completed Hanuman Chalisa in the evening. Restored mental resilience.",
        "Sadhana done during Brahma Muhurta. High focus, no distractions.",
        "Offered Sri Suktam recitations during twilight. Felt a strong wave of gratitude.",
        "A quiet, simple practice session. Consistency is key.",
        "Readings complete. Documenting observations of increased mindfulness."
      ];

      const notes = Math.random() > 0.4 ? notesList[Math.floor(Math.random() * notesList.length)] : undefined;

      store.logs[dateStr] = {
        completed,
        counts,
        notes
      };
    }
  }

  return store;
};
