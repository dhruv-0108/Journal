export type SadhanaColorPreset = 'saffron' | 'crimson' | 'emerald' | 'blue' | 'purple';

/**
 * countType determines how the count for this sadhana is interpreted:
 *   'reps'  – A plain integer (e.g. "5 Times Recited", "20 Minutes").
 *   'mala'  – Stored internally in raw repetitions; 1 Mala = 108 reps.
 *             UI shows Malas + remainder Reps (e.g. "2 Mala & 12 Reps").
 */
export type SadhanaCountType = 'reps' | 'mala';

export interface SadhanaConfig {
  id: string;                      // Dynamic generated ID or preset ID
  name: string;                    // English name
  sanskritName?: string;           // Sanskrit name (optional)
  description?: string;            // Description
  colorPreset: SadhanaColorPreset; // Dynamic color grouping
  hasCount: boolean;               // True if tracking count is helpful (e.g. malas or recitations)
  countType?: SadhanaCountType;    // 'reps' (default) or 'mala' (1 Mala = 108 reps)
  countUnit?: string;              // E.g. 'Times Recited', 'Minutes' (used for 'reps' type)
  defaultCount?: number;           // In raw reps (for mala: multiples of 108)
  performDaily?: boolean;          // If true, always show on calendar daily
}

export interface SadhanaDayLog {
  completed: Record<string, boolean>; // Maps sadhana.id to completion boolean
  counts: Record<string, number>;    // Maps sadhana.id to raw repetition count
  notes?: string;                     // Journal reflection notes
}

export type SadhanaLogs = Record<string, SadhanaDayLog>; // Key is YYYY-MM-DD date string

export interface Sankalp {
  id: string;
  title: string;
  sadhanaId: string;
  targetCount: number;                // Daily target in raw reps (for mala type: multiples of 108)
  durationDays: number;               // Length of the vow in days (e.g. 11, 21, 41, 108)
  startDate: string;                  // YYYY-MM-DD start date
  notes?: string;                     // Initial intention/notes
  status: 'active' | 'completed' | 'abandoned';
}

export interface SadhanaStore {
  username?: string;
  sadhanas: SadhanaConfig[];
  sankalps: Sankalp[];
  logs: SadhanaLogs;
  migratedToReps?: boolean;          // Guard flag so one-time migration runs only once
}

export interface TimeframeMetrics {
  sessionsCount: number;              // Total number of practices checked
  totalCounts: Record<string, number>; // Sum of raw rep counts by sadhanaId
}

export interface DashboardStats {
  today: TimeframeMetrics;
  thisWeek: TimeframeMetrics;
  thisMonth: TimeframeMetrics;
  thisYear: TimeframeMetrics;
  sadhanaCompletionRates: Record<string, number>; // maps sadhanaId to completion %
  totalDaysTracked: number;
}
