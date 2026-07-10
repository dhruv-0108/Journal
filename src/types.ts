export type SadhanaColorPreset = 'saffron' | 'crimson' | 'emerald' | 'blue' | 'purple';

export interface SadhanaConfig {
  id: string;                      // Dynamic generated ID or preset ID
  name: string;                    // English name
  sanskritName?: string;           // Sanskrit name (optional)
  description?: string;            // Description
  colorPreset: SadhanaColorPreset; // Dynamic color grouping
  hasCount: boolean;               // True if tracking count is helpful (e.g. malas or recitations)
  countUnit?: string;              // E.g. 'Malas (108x)', 'Times Recited', 'Minutes'
  defaultCount?: number;
}

export interface SadhanaDayLog {
  completed: Record<string, boolean>; // Maps sadhana.id to completion boolean
  counts: Record<string, number>;    // Maps sadhana.id to count value
  notes?: string;                     // Journal reflection notes
}

export type SadhanaLogs = Record<string, SadhanaDayLog>; // Key is YYYY-MM-DD date string

export interface Sankalp {
  id: string;
  title: string;
  sadhanaId: string;
  targetCount: number;                // Daily target count to achieve resolution
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
}

export interface TimeframeMetrics {
  sessionsCount: number;              // Total number of practices checked
  totalCounts: Record<string, number>; // Sum of counts by sadhanaId
}

export interface DashboardStats {
  today: TimeframeMetrics;
  thisWeek: TimeframeMetrics;
  thisMonth: TimeframeMetrics;
  thisYear: TimeframeMetrics;
  sadhanaCompletionRates: Record<string, number>; // maps sadhanaId to completion %
  totalDaysTracked: number;
}
