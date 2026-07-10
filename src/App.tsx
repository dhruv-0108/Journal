import { useState, useEffect } from 'react';
import { Calendar } from './components/Calendar';
import { Stats } from './components/Stats';
import { SadhanaModal } from './components/SadhanaModal';
import { DataControls } from './components/DataControls';
import { SadhanaManager } from './components/SadhanaManager';
import { SankalpManager } from './components/SankalpManager';
import type { SadhanaStore, SadhanaDayLog, SadhanaConfig, Sankalp, SadhanaLogs } from './types';
import { loadStore, saveStore, calculateDashboardStats, formatDateString, DEFAULT_SADHANA_LIST } from './sadhanaUtils';
import { Sparkles, Compass, CalendarDays, Settings, Award, Loader2, Cloud } from 'lucide-react';

// Firebase imports
import { auth } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import type { User } from 'firebase/auth';
import { saveUserStoreToFirestore, loadUserStoreFromFirestore, mergeStores } from './firebaseUtils';
import { AuthModal } from './components/AuthModal';

type TabId = 'dashboard' | 'vows' | 'settings';

function App() {
  const [store, setStore] = useState<SadhanaStore>({
    sadhanas: DEFAULT_SADHANA_LIST,
    sankalps: [],
    logs: {}
  });

  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [greeting, setGreeting] = useState<string>('Welcome to your spiritual space');
  
  // Onboarding name states
  const [tempName, setTempName] = useState('');
  const [tempUsernameEdit, setTempUsernameEdit] = useState('');

  // Firebase Auth states
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isCloudSyncing, setIsCloudSyncing] = useState(false);

  // 1. Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        setIsCloudSyncing(true);
        // Load whatever exists in local storage
        const localStore = loadStore();
        // Fetch from Firestore cloud
        const cloudStore = await loadUserStoreFromFirestore(user.uid);
        
        let finalStore = localStore;
        if (cloudStore) {
          // Merge local logs/sadhanas with cloud backup so no offline logs are lost
          finalStore = mergeStores(localStore, cloudStore);
        }
        
        setStore(finalStore);
        saveStore(finalStore);
        await saveUserStoreToFirestore(user.uid, finalStore);
        setIsCloudSyncing(false);
      } else {
        // Guest mode - load local storage
        const loadedStore = loadStore();
        setStore(loadedStore);
      }
    });
    return () => unsubscribe();
  }, []);

  // 2. Set daily greeting based on hour of day
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 4 && hour < 8) {
      setGreeting('Brahma Muhurta – The auspicious hour of meditation');
    } else if (hour >= 8 && hour < 12) {
      setGreeting('Auspicious morning – May your practices flow with ease');
    } else if (hour >= 12 && hour < 17) {
      setGreeting('Mid-day check-in – Maintain your inner stillness');
    } else {
      setGreeting('Evening reflections – Connecting to the Divine source');
    }
  }, []);

  // Sync username edit input with store
  useEffect(() => {
    if (store.username) {
      setTempUsernameEdit(store.username);
    }
  }, [store.username]);

  // Sync utilities
  const updateStore = (updater: (prev: SadhanaStore) => SadhanaStore) => {
    setStore(prev => {
      const updated = updater(prev);
      saveStore(updated);
      if (auth.currentUser) {
        saveUserStoreToFirestore(auth.currentUser.uid, updated);
      }
      return updated;
    });
  };

  // Onboarding Name Handlers
  const handleSaveNameOnboarding = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tempName.trim()) return;
    updateStore(prev => ({
      ...prev,
      username: tempName.trim()
    }));
  };

  const handleSaveUsernameEdit = () => {
    if (!tempUsernameEdit.trim()) return;
    updateStore(prev => ({
      ...prev,
      username: tempUsernameEdit.trim()
    }));
    alert('Name updated successfully!');
  };

  // Sign out handler
  const handleSignOut = async () => {
    if (confirm('Are you sure you want to sign out? Your logs will remain saved locally on this browser.')) {
      await signOut(auth);
    }
  };

  // Sadhana Handlers
  const handleAddSadhana = (newSadhana: SadhanaConfig) => {
    updateStore(prev => ({
      ...prev,
      sadhanas: [...prev.sadhanas, newSadhana]
    }));
  };

  const handleUpdateSadhana = (updatedSadhana: SadhanaConfig) => {
    updateStore(prev => ({
      ...prev,
      sadhanas: prev.sadhanas.map(s => s.id === updatedSadhana.id ? updatedSadhana : s)
    }));
  };

  const handleDeleteSadhana = (id: string) => {
    updateStore(prev => {
      const updatedLogs = { ...prev.logs };
      Object.keys(updatedLogs).forEach(dateStr => {
        const log = { ...updatedLogs[dateStr] };
        const completed = { ...log.completed };
        const counts = { ...log.counts };
        delete completed[id];
        delete counts[id];
        updatedLogs[dateStr] = { ...log, completed, counts };
      });

      return {
        ...prev,
        sadhanas: prev.sadhanas.filter(s => s.id !== id),
        logs: updatedLogs
      };
    });
  };

  const isReferencedInSankalp = (sadhanaId: string): boolean => {
    return store.sankalps.some(s => s.sadhanaId === sadhanaId);
  };

  // Sankalp Handlers
  const handleAddSankalp = (newSankalp: Sankalp) => {
    updateStore(prev => ({
      ...prev,
      sankalps: [...prev.sankalps, newSankalp]
    }));
  };

  const handleUpdateSankalpStatus = (id: string, status: 'completed' | 'abandoned') => {
    updateStore(prev => ({
      ...prev,
      sankalps: prev.sankalps.map(s => s.id === id ? { ...s, status } : s)
    }));
  };

  const handleDeleteSankalp = (id: string) => {
    updateStore(prev => ({
      ...prev,
      sankalps: prev.sankalps.filter(s => s.id !== id)
    }));
  };

  // Daily Log Handlers
  const handleSaveLog = (dateStr: string, logEntry: SadhanaDayLog) => {
    updateStore(prev => ({
      ...prev,
      logs: {
        ...prev.logs,
        [dateStr]: logEntry
      }
    }));
  };

  const handleDeleteLog = (dateStr: string) => {
    updateStore(prev => {
      const updatedLogs = { ...prev.logs };
      delete updatedLogs[dateStr];
      return {
        ...prev,
        logs: updatedLogs
      };
    });
  };

  // Data Control Handlers
  const handleImportStore = (importedLogs: SadhanaLogs) => {
    updateStore(prev => {
      const isFullStore = 'sadhanas' in importedLogs && 'logs' in importedLogs;
      if (isFullStore) {
        return importedLogs as unknown as SadhanaStore;
      }
      return {
        ...prev,
        logs: importedLogs
      };
    });
  };

  const handleClearAllStore = () => {
    setStore({
      sadhanas: DEFAULT_SADHANA_LIST,
      sankalps: [],
      logs: {}
    });
    localStorage.removeItem('sadhana_journal_store_v2');
  };

  const handleSelectDate = (date: Date) => {
    setSelectedDate(date);
    setIsModalOpen(true);
  };

  const stats = calculateDashboardStats(store.sadhanas, store.logs);
  const selectedDateStr = formatDateString(selectedDate);
  const selectedDayLog = store.logs[selectedDateStr];

  // Render First-Time Onboarding Screen if username is missing
  if (!store.username && !isCloudSyncing) {
    return (
      <div className="min-h-screen bg-sadhana-dark flex items-center justify-center p-4">
        <form 
          onSubmit={handleSaveNameOnboarding}
          className="glass-panel w-full max-w-md p-8 rounded-lg shadow-2xl border border-white/[0.04] text-center space-y-6 animate-fade-in"
        >
          <div className="flex justify-center text-sadhana-gold-accent">
            <Compass className="w-12 h-12 animate-spin" style={{ animationDuration: '40s' }} />
          </div>
          
          <div className="space-y-2">
            <h1 className="text-3xl font-serif font-semibold text-white tracking-widest leading-none">
              SADHANA MANDALA
            </h1>
            <p className="text-[10px] text-slate-500 font-sans uppercase tracking-[0.2em] font-semibold mt-1">
              Spiritual Path Journal & Vows Tracker
            </p>
          </div>

          <div className="h-[1px] w-24 mx-auto bg-gradient-to-r from-transparent via-sadhana-gold-accent/50 to-transparent" />

          <div className="space-y-4 pt-2">
            <p className="text-sm text-slate-300 font-serif italic">
              "Welcome to your sacred space. What is your name?"
            </p>
            <input
              type="text"
              value={tempName}
              onChange={e => setTempName(e.target.value)}
              placeholder="Your name"
              required
              className="w-64 max-w-full bg-transparent border-b border-white/20 text-white text-center text-xl pb-2 focus:border-sadhana-gold-accent outline-none font-serif transition-colors"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-sadhana-gold hover:bg-sadhana-gold-accent text-black rounded-lg font-semibold transition-all font-sans shadow-lg shadow-sadhana-gold/10"
          >
            Enter Journal
          </button>

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => setIsAuthModalOpen(true)}
              className="text-xs text-slate-500 hover:text-sadhana-gold-accent transition-colors font-sans"
            >
              Already have an account? Sign In
            </button>
          </div>
        </form>

        {/* Auth Modal */}
        <AuthModal 
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          onSuccess={() => {}}
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 md:py-12 space-y-8 animate-fade-in">
      
      {/* Editorial Header */}
      <header className="text-center space-y-3 relative py-4">
        
        {/* Profile Sync Pill */}
        <div className="flex justify-center flex-wrap gap-2">
          {isCloudSyncing ? (
            <div className="text-[9px] text-slate-400 font-sans flex items-center gap-1.5 px-2.5 py-1 rounded bg-white/[0.01] border border-white/[0.03]">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-sadhana-gold-accent" />
              <span>Syncing with Cloud...</span>
            </div>
          ) : currentUser ? (
            <div className="text-[9px] text-slate-400 font-sans flex items-center gap-1.5 px-2.5 py-1 rounded bg-white/[0.01] border border-white/[0.03]">
              <span className="w-1.5 h-1.5 rounded-full bg-sadhana-emerald" />
              <span>Synced as {currentUser.email}</span>
              <span className="text-slate-600">•</span>
              <button 
                onClick={handleSignOut}
                className="text-sadhana-gold-accent hover:text-white transition-colors"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="text-[9px] text-slate-400 font-sans flex items-center gap-1.5 px-2.5 py-1 rounded bg-white/[0.01] border border-white/[0.03]">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
              <span>Guest Mode (Local Only)</span>
              <span className="text-slate-600">•</span>
              <button 
                onClick={() => setIsAuthModalOpen(true)}
                className="text-sadhana-gold-accent hover:text-white font-semibold transition-colors flex items-center gap-0.5"
              >
                <Cloud className="w-3 h-3" />
                Sign In to Sync
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center justify-center gap-2.5 text-sadhana-gold-accent pt-2">
          <span className="text-xs uppercase tracking-[0.2em] font-sans font-bold">Hi, {store.username || 'Sadhaka'}</span>
        </div>

        <h1 className="text-3xl md:text-4xl font-serif font-semibold text-white tracking-widest leading-none">
          SADHANA MANDALA
        </h1>

        {/* Divider */}
        <div className="flex items-center justify-center gap-3 py-1">
          <div className="h-[1px] w-12 md:w-24 bg-gradient-to-r from-transparent to-sadhana-gold/30" />
          <div className="w-2 h-2 rounded-full border border-sadhana-gold/40 flex items-center justify-center bg-sadhana-dark">
            <Sparkles className="w-1 h-1 text-sadhana-gold fill-sadhana-gold/20" />
          </div>
          <div className="h-[1px] w-12 md:w-24 bg-gradient-to-l from-transparent to-sadhana-gold/30" />
        </div>

        <p className="text-xs md:text-sm text-slate-400 max-w-md mx-auto italic font-medium font-serif leading-relaxed">
          "{greeting}"
        </p>
      </header>

      {/* Tabs Navigation (Flat Linen tabs) */}
      <div className="flex justify-center">
        <nav className="glass-panel flex p-1 rounded-xl border border-white/[0.04] shadow-md max-w-md w-full justify-between items-center gap-1">
          {/* Tab: Dashboard */}
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`
              flex flex-1 items-center justify-center gap-2 py-2 px-3 text-xs font-semibold rounded-lg transition-all duration-200
              ${activeTab === 'dashboard'
                ? 'bg-sadhana-gold text-black shadow'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.02]'
              }
            `}
          >
            <CalendarDays className="w-4 h-4" />
            Dashboard
          </button>

          {/* Tab: Sankalps */}
          <button
            onClick={() => setActiveTab('vows')}
            className={`
              flex flex-1 items-center justify-center gap-2 py-2 px-3 text-xs font-semibold rounded-lg transition-all duration-200
              ${activeTab === 'vows'
                ? 'bg-sadhana-gold text-black shadow'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.02]'
              }
            `}
          >
            <Award className="w-4 h-4" />
            Sankalps
          </button>

          {/* Tab: Settings */}
          <button
            onClick={() => setActiveTab('settings')}
            className={`
              flex flex-1 items-center justify-center gap-2 py-2 px-3 text-xs font-semibold rounded-lg transition-all duration-200
              ${activeTab === 'settings'
                ? 'bg-sadhana-gold text-black shadow'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.02]'
              }
            `}
          >
            <Settings className="w-4 h-4" />
            Settings
          </button>
        </nav>
      </div>

      {/* Render Active Tab */}
      <main className="transition-all duration-300">
        
        {/* Tab 1: Dashboard */}
        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start animate-fade-in">
            {/* Calendar Grid (2 columns on large screen) */}
            <div className="lg:col-span-2 h-full">
              <Calendar 
                logs={store.logs}
                sadhanas={store.sadhanas}
                selectedDate={selectedDate}
                onSelectDate={handleSelectDate}
              />
            </div>

            {/* Statistics (1 column on large screen) */}
            <div className="h-full">
              <Stats 
                stats={stats}
                sadhanas={store.sadhanas}
                logs={store.logs}
              />
            </div>
          </div>
        )}

        {/* Tab 2: Vows Resolutions */}
        {activeTab === 'vows' && (
          <div className="animate-fade-in">
            <SankalpManager
              sankalps={store.sankalps}
              sadhanas={store.sadhanas}
              logs={store.logs}
              onAdd={handleAddSankalp}
              onUpdateStatus={handleUpdateSankalpStatus}
              onDelete={handleDeleteSankalp}
            />
          </div>
        )}

        {/* Tab 3: Dynamic Sadhanas Settings */}
        {activeTab === 'settings' && (
          <div className="animate-fade-in space-y-6">
            {/* User Profile Settings Card */}
            <div className="glass-panel rounded-lg p-5 flex flex-col md:flex-row gap-4 items-center justify-between border border-white/[0.04]">
              <div>
                <h3 className="font-serif text-white font-semibold text-sm">Journal Profile</h3>
                <p className="text-xs text-slate-500 font-sans mt-0.5">Edit your name displayed in your daily greetings.</p>
              </div>
              <div className="flex gap-2 items-center w-full md:w-auto">
                <input 
                  type="text" 
                  value={tempUsernameEdit} 
                  onChange={e => setTempUsernameEdit(e.target.value)}
                  className="bg-sadhana-dark border border-white/10 rounded-lg px-4 py-2 text-sm text-white placeholder-slate-600 outline-none focus:border-sadhana-gold-accent font-serif"
                />
                <button 
                  onClick={handleSaveUsernameEdit}
                  className="px-4 py-2 text-xs font-semibold text-black bg-sadhana-gold hover:bg-sadhana-gold-accent rounded-lg transition-colors font-sans"
                >
                  Save
                </button>
              </div>
            </div>

            <SadhanaManager
              sadhanas={store.sadhanas}
              onAdd={handleAddSadhana}
              onUpdate={handleUpdateSadhana}
              onDelete={handleDeleteSadhana}
              isReferencedInSankalp={isReferencedInSankalp}
            />
          </div>
        )}

      </main>

      {/* Data Controls (Backup management) */}
      <footer>
        <DataControls 
          logs={store.logs}
          onImport={handleImportStore}
          onClear={handleClearAllStore}
        />
      </footer>

      {/* Daily Editor Modal */}
      <SadhanaModal 
        date={selectedDate}
        sadhanas={store.sadhanas}
        sankalps={store.sankalps}
        log={selectedDayLog}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveLog}
        onDelete={handleDeleteLog}
      />

      {/* Auth Modal */}
      <AuthModal 
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={() => {}}
      />

    </div>
  );
}

export default App;
