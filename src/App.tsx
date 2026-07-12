import { useState, useEffect } from 'react';
import { Calendar } from './components/Calendar';
import { Stats } from './components/Stats';
import { SadhanaModal } from './components/SadhanaModal';
import { SadhanaManager } from './components/SadhanaManager';
import { SankalpManager } from './components/SankalpManager';
import { PracticeStats } from './components/PracticeStats';
import type { SadhanaStore, SadhanaDayLog, SadhanaConfig, Sankalp } from './types';
import { loadStore, saveStore, calculateDashboardStats, formatDateString, DEFAULT_SADHANA_LIST, getSankalpProgress } from './sadhanaUtils';
import { Sparkles, Compass, CalendarDays, Settings, Award, Loader2, Cloud, LogOut, BarChart3 } from 'lucide-react';

// Firebase imports
import { auth } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import type { User } from 'firebase/auth';
import { saveUserStoreToFirestore, loadUserStoreFromFirestore, mergeStores, deleteUserStoreFromFirestore } from './firebaseUtils';
import { AuthPage } from './components/AuthPage';

type TabId = 'dashboard' | 'vows' | 'practices' | 'settings';


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
  
  const [tempUsernameEdit, setTempUsernameEdit] = useState('');

  // Firebase Auth states
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showAuthPage, setShowAuthPage] = useState(false);
  const [isCloudSyncing, setIsCloudSyncing] = useState(false);
  const [showGuestGate, setShowGuestGate] = useState(false);

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
    if (confirm('Are you sure you want to sign out? Your data is securely saved in the cloud and will be cleared from this device for privacy.')) {
      // Clean up local storage and state before auth state change
      localStorage.removeItem('sadhana_journal_store_v2');
      setStore({
        username: '',
        sadhanas: [],
        sankalps: [],
        logs: {}
      });
      await signOut(auth);
    }
  };

  // Delete account handler
  const handleDeleteAccount = async () => {
    const user = auth.currentUser;
    if (!user) return;

    const step1 = confirm("WARNING: Are you absolutely sure you want to permanently delete your account? This will erase all your synced cloud sadhana logs, vows, and settings. This action is irreversible.");
    if (!step1) return;

    const step2 = prompt("To confirm deletion, please type DELETE below:");
    if (step2 !== "DELETE") {
      alert("Account deletion canceled (confirmation text did not match).");
      return;
    }

    try {
      // 1. Delete Firestore document first while authenticated
      await deleteUserStoreFromFirestore(user.uid);

      // 2. Delete Firebase Authentication user
      await user.delete();

      // 3. Clear local storage and reset state
      localStorage.removeItem('sadhana_journal_store_v2');
      setStore({
        username: '',
        sadhanas: [],
        sankalps: [],
        logs: {}
      });

      alert("Your account and all associated data have been permanently deleted.");
    } catch (error: any) {
      console.error("Account deletion failed:", error);
      if (error.code === 'auth/requires-recent-login') {
        alert("For security reasons, deleting your account requires a recent login. Please sign out, sign in again, and retry.");
      } else {
        alert(`Failed to delete account: ${error.message || error}`);
      }
    }
  };

  // Sadhana Handlers
  const handleAddSadhana = (newSadhana: SadhanaConfig) => {
    if (!currentUser) {
      setShowGuestGate(true);
      return;
    }
    updateStore(prev => ({
      ...prev,
      sadhanas: [...prev.sadhanas, newSadhana]
    }));
  };

  const handleUpdateSadhana = (updatedSadhana: SadhanaConfig) => {
    if (!currentUser) {
      setShowGuestGate(true);
      return;
    }
    updateStore(prev => ({
      ...prev,
      sadhanas: prev.sadhanas.map(s => s.id === updatedSadhana.id ? updatedSadhana : s)
    }));
  };

  const handleDeleteSadhana = (id: string) => {
    if (!currentUser) {
      setShowGuestGate(true);
      return;
    }
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

  const handleAddSankalp = (sankalpData: {
    title: string;
    practiceName: string;
    practiceType: 'stotra' | 'mantra';
    targetCount: number;
    durationDays: number;
    startDate: string;
  }) => {
    if (!currentUser) {
      setShowGuestGate(true);
      return;
    }

    updateStore(prev => {
      // Find or create the sadhana practice config
      let existingSadhana = prev.sadhanas.find(
        s => s.name.toLowerCase().trim() === sankalpData.practiceName.toLowerCase().trim() && 
             s.countType === (sankalpData.practiceType === 'mantra' ? 'mala' : 'reps')
      );

      let sadhanaId = '';
      let updatedSadhanas = [...prev.sadhanas];

      if (existingSadhana) {
        sadhanaId = existingSadhana.id;
      } else {
        sadhanaId = `sadhana_${Date.now()}`;
        const newSadhana: SadhanaConfig = {
          id: sadhanaId,
          name: sankalpData.practiceName.trim(),
          colorPreset: sankalpData.practiceType === 'mantra' ? 'purple' : 'saffron',
          hasCount: true,
          countType: sankalpData.practiceType === 'mantra' ? 'mala' : 'reps',
          countUnit: sankalpData.practiceType === 'mantra' ? 'Reps' : 'Times Recited',
          defaultCount: sankalpData.practiceType === 'mantra' ? 108 : 1
        };
        updatedSadhanas.push(newSadhana);
      }

      const newSankalp: Sankalp = {
        id: `sankalp_${Date.now()}`,
        title: sankalpData.title.trim(),
        sadhanaId,
        targetCount: sankalpData.targetCount,
        durationDays: sankalpData.durationDays,
        startDate: sankalpData.startDate,
        status: 'active'
      };

      return {
        ...prev,
        sadhanas: updatedSadhanas,
        sankalps: [...prev.sankalps, newSankalp]
      };
    });
  };

  const handleUpdateSankalpStatus = (id: string, status: 'completed' | 'abandoned') => {
    if (!currentUser) {
      setShowGuestGate(true);
      return;
    }
    updateStore(prev => ({
      ...prev,
      sankalps: prev.sankalps.map(s => s.id === id ? { ...s, status } : s)
    }));
  };

  const handleDeleteSankalp = (id: string) => {
    if (!currentUser) {
      setShowGuestGate(true);
      return;
    }
    updateStore(prev => ({
      ...prev,
      sankalps: prev.sankalps.filter(s => s.id !== id)
    }));
  };

  const handleRetrySankalp = (
    id: string,
    retryData: {
      startDate: string;
      durationDays: number;
      targetCount: number;
    }
  ) => {
    if (!currentUser) {
      setShowGuestGate(true);
      return;
    }
    updateStore(prev => {
      const updatedSankalps = prev.sankalps.map(s => {
        if (s.id !== id) return s;

        // Calculate progress for current attempt before archiving it
        const prog = getSankalpProgress(s, prev.logs);
        
        const newAttempt = {
          id: `attempt_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
          startDate: s.startDate,
          durationDays: s.durationDays,
          targetCount: s.targetCount,
          status: s.status === 'active' ? ('abandoned' as const) : (s.status as 'completed' | 'abandoned'),
          daysCompleted: prog.daysCompleted
        };

        const existingAttempts = s.attempts || [];

        return {
          ...s,
          startDate: retryData.startDate,
          durationDays: retryData.durationDays,
          targetCount: retryData.targetCount,
          status: 'active' as const,
          attempts: [...existingAttempts, newAttempt]
        };
      });

      return {
        ...prev,
        sankalps: updatedSankalps
      };
    });
  };

  // Daily Log Handlers
  const handleSaveLog = (dateStr: string, logEntry: SadhanaDayLog) => {
    if (!currentUser) {
      setShowGuestGate(true);
      return;
    }
    updateStore(prev => ({
      ...prev,
      logs: {
        ...prev.logs,
        [dateStr]: logEntry
      }
    }));
  };

  const handleDeleteLog = (dateStr: string) => {
    if (!currentUser) {
      setShowGuestGate(true);
      return;
    }
    updateStore(prev => {
      const updatedLogs = { ...prev.logs };
      delete updatedLogs[dateStr];
      return {
        ...prev,
        logs: updatedLogs
      };
    });
  };



  const handleSelectDate = (date: Date) => {
    setSelectedDate(date);
    setIsModalOpen(true);
  };

  const displaySadhanas = store.sadhanas;
  const stats = calculateDashboardStats(displaySadhanas, store.logs);
  const selectedDateStr = formatDateString(selectedDate);
  const selectedDayLog = store.logs[selectedDateStr];

  // Show full-screen loader if authenticating or syncing on startup
  if (isCloudSyncing && !store.username) {
    return (
      <div className="min-h-screen bg-sadhana-dark flex flex-col items-center justify-center gap-4 text-sadhana-gold-accent font-sans">
        <Compass className="w-16 h-16 animate-spin text-sadhana-gold" style={{ animationDuration: '6s' }} />
        <span className="text-sm font-serif tracking-[0.2em] uppercase text-slate-400">Loading Sadhana Mandala...</span>
      </div>
    );
  }

  // Render AuthPage if user needs to authenticate or is creating guest
  const needsAuth = !currentUser && (!store.username || showAuthPage);
  if (needsAuth) {
    return (
      <AuthPage
        currentGuestName={store.username}
        isCloudSyncing={isCloudSyncing}
        onSuccess={async (registeredName) => {
          setShowAuthPage(false);
          if (registeredName) {
            updateStore(prev => ({
              ...prev,
              username: registeredName
            }));
          }
        }}
        onContinueGuest={(guestName) => {
          updateStore(prev => ({
            ...prev,
            username: guestName
          }));
          setShowAuthPage(false);
        }}
      />
    );
  }

  return (
    <div className="relative min-h-screen bg-sadhana-dark text-slate-100 flex flex-col">
      
      {/* Sleek Top Navigation Bar */}
      <header className="border-b border-white/[0.04] bg-[#161514] px-4 md:px-8 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm w-full shrink-0">
        
        {/* Left Side: Brand Logo & greeting name */}
        <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-start">
          <div className="flex items-center gap-2">
            <div className="p-1 bg-sadhana-gold/10 rounded-lg border border-sadhana-gold/20">
              <Sparkles className="w-4 h-4 text-sadhana-gold-accent fill-sadhana-gold-accent/15" />
            </div>
            <span className="text-xs font-sans font-bold tracking-[0.25em] text-white uppercase">Sadhana Mandala</span>
          </div>
          
          <div className="hidden sm:block h-4 w-[1px] bg-white/10" />
          
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400 font-sans">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Hi,</span>
            <span className="font-semibold text-slate-200 font-serif">{store.username || 'Sadhaka'}</span>
          </div>
        </div>

        {/* Center: Tabs selector */}
        <nav className="flex p-0.5 rounded-xl bg-[#1e1c1a]/60 border border-white/[0.04] shadow-inner max-w-md w-full sm:w-auto justify-between items-center gap-0.5">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`
              flex-1 sm:flex-none flex items-center justify-center gap-1.5 py-1.5 px-4 text-xs font-semibold rounded-lg transition-all duration-200
              ${activeTab === 'dashboard'
                ? 'bg-sadhana-gold text-black shadow'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.01]'
              }
            `}
          >
            <CalendarDays className="w-3.5 h-3.5" />
            Dashboard
          </button>
          
          <button
            onClick={() => setActiveTab('vows')}
            className={`
              flex-1 sm:flex-none flex items-center justify-center gap-1.5 py-1.5 px-4 text-xs font-semibold rounded-lg transition-all duration-200
              ${activeTab === 'vows'
                ? 'bg-sadhana-gold text-black shadow'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.01]'
              }
            `}
          >
            <Award className="w-3.5 h-3.5" />
            Sankalps
          </button>
          
          <button
            onClick={() => setActiveTab('practices')}
            className={`
              flex-1 sm:flex-none flex items-center justify-center gap-1.5 py-1.5 px-4 text-xs font-semibold rounded-lg transition-all duration-200
              ${activeTab === 'practices'
                ? 'bg-sadhana-gold text-black shadow'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.01]'
              }
            `}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            Practices
          </button>
          
          <button
            onClick={() => setActiveTab('settings')}
            className={`
              flex-1 sm:flex-none flex items-center justify-center gap-1.5 py-1.5 px-4 text-xs font-semibold rounded-lg transition-all duration-200
              ${activeTab === 'settings'
                ? 'bg-sadhana-gold text-black shadow'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.01]'
              }
            `}
          >
            <Settings className="w-3.5 h-3.5" />
            Settings
          </button>
        </nav>

        {/* Right Side: Account status/Sync actions */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-end text-[10px] font-sans text-slate-400 shrink-0">
          {isCloudSyncing ? (
            <div className="flex items-center gap-1.5 py-1 px-2.5 rounded bg-white/[0.01] border border-white/[0.03]">
              <Loader2 className="w-3 h-3 animate-spin text-sadhana-gold-accent" />
              <span>Syncing...</span>
            </div>
          ) : currentUser ? (
            <div className="flex items-center gap-2 py-1 px-2.5 rounded bg-white/[0.01] border border-white/[0.03]">
              <span className="w-1.5 h-1.5 rounded-full bg-sadhana-emerald" />
              <span className="font-mono max-w-[120px] truncate">{currentUser.email}</span>
              <span className="text-slate-600">|</span>
              <button 
                onClick={handleSignOut}
                className="text-sadhana-gold-accent hover:text-white transition-colors"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 py-1 px-2.5 rounded bg-white/[0.01] border border-white/[0.03]">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
              <span>Guest</span>
              <span className="text-slate-600">|</span>
              <button 
                onClick={() => setShowAuthPage(true)}
                className="text-sadhana-gold-accent hover:text-white font-semibold transition-colors flex items-center gap-0.5"
              >
                <Cloud className="w-3 h-3" />
                Sign In
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Container */}
      <div className={`flex-1 max-w-7xl w-full mx-auto px-4 md:px-8 py-6 space-y-6 animate-fade-in transition-all duration-300 flex flex-col ${
        showGuestGate ? 'blur-[6px] pointer-events-none select-none' : ''
      }`}>
        
        {/* Subtle dynamic tab banner */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-white/[0.03] pb-4">
          <div>
            <h2 className="text-xs font-sans font-bold text-slate-400 uppercase tracking-widest">
              {activeTab === 'dashboard' && 'Dashboard Overview'}
              {activeTab === 'vows' && 'Vows & Resolutions'}
              {activeTab === 'practices' && 'Practice Insights'}
              {activeTab === 'settings' && 'Practice Settings'}
            </h2>
            <p className="text-[10px] text-slate-500 font-serif italic mt-0.5">"{greeting}"</p>
          </div>
        </div>

        {/* Tab 1: Dashboard */}
        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start animate-fade-in">
            {/* Calendar Grid (2 columns on large screen) */}
            <div className="lg:col-span-2">
              <Calendar 
                logs={store.logs}
                sadhanas={displaySadhanas}
                selectedDate={selectedDate}
                onSelectDate={handleSelectDate}
              />
            </div>

            {/* Statistics (1 column on large screen) */}
            <div>
              <Stats 
                stats={stats}
                sadhanas={displaySadhanas}
                logs={store.logs}
                sankalps={store.sankalps}
              />
            </div>
          </div>
        )}

        {/* Tab 2: Vows Resolutions */}
        {activeTab === 'vows' && (
          <div className="animate-fade-in">
            <SankalpManager
              sankalps={store.sankalps}
              sadhanas={displaySadhanas}
              logs={store.logs}
              onAdd={handleAddSankalp}
              onUpdateStatus={handleUpdateSankalpStatus}
              onDelete={handleDeleteSankalp}
              onRetry={handleRetrySankalp}
            />
          </div>
        )}

        {/* Tab 3: Practice Stats */}
        {activeTab === 'practices' && (
          <div className="animate-fade-in">
            <PracticeStats
              sadhanas={displaySadhanas}
              logs={store.logs}
              sankalps={store.sankalps}
            />
          </div>
        )}

        {/* Tab 3: Dynamic Sadhanas Settings */}
        {activeTab === 'settings' && (
          <div className="animate-fade-in space-y-6">
            {/* Premium Profile & Account Settings Card */}
            <div className="glass-panel rounded-2xl p-6 border border-white/[0.06] shadow-xl space-y-6">
              <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
                
                {/* Profile Detail Block */}
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left w-full sm:w-auto">
                  {/* Avatar Initials Circle */}
                  <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-sadhana-gold/20 via-purple-500/10 to-indigo-500/10 border border-sadhana-gold/30 flex items-center justify-center font-serif text-2xl font-bold text-sadhana-gold-accent shadow-inner shrink-0">
                    {(store.username || 'S').charAt(0).toUpperCase()}
                  </div>
                  
                  {/* Name and Synced indicator */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 justify-center sm:justify-start">
                      <h3 className="font-serif text-white font-bold text-lg tracking-wide">
                        {store.username || 'Sadhaka'}
                      </h3>
                      {currentUser ? (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-semibold bg-sadhana-emerald/10 text-sadhana-emerald border border-sadhana-emerald/20 uppercase tracking-wide font-sans">
                          Synced
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-semibold bg-slate-800 text-slate-400 border border-white/5 uppercase tracking-wide font-sans">
                          Guest
                        </span>
                      )}
                    </div>
                    
                    {currentUser ? (
                      <p className="text-xs text-slate-400 font-mono">{currentUser.email}</p>
                    ) : (
                      <p className="text-xs text-slate-500 font-sans italic">Data stored locally on this device</p>
                    )}
                    
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400 pt-1">
                      {currentUser ? (
                        <>
                          <span className="w-1.5 h-1.5 rounded-full bg-sadhana-emerald animate-pulse" />
                          <span>Connected to cloud backup</span>
                        </>
                      ) : (
                        <>
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                          <span>Offline storage active</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Account Actions */}
                <div className="flex flex-col gap-2 w-full md:w-auto sm:items-end justify-center">
                  {currentUser ? (
                    <>
                      <button
                        onClick={handleSignOut}
                        className="w-full sm:w-auto px-5 py-2.5 text-xs font-semibold text-rose-400 hover:text-white bg-rose-950/15 hover:bg-rose-600 border border-rose-900/30 hover:border-transparent rounded-xl transition-all duration-200 font-sans flex items-center justify-center gap-1.5 shadow"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        Sign Out Account
                      </button>
                      <button
                        onClick={handleDeleteAccount}
                        className="w-full sm:w-auto px-5 py-2.5 text-xs font-semibold text-rose-500 hover:text-white bg-transparent hover:bg-rose-600/90 border border-rose-500/30 hover:border-transparent rounded-xl transition-all duration-200 font-sans flex items-center justify-center gap-1.5 shadow"
                      >
                        Delete Account
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setShowAuthPage(true)}
                      className="px-5 py-2.5 text-xs font-semibold text-black bg-sadhana-gold hover:bg-sadhana-gold-accent rounded-xl transition-all duration-200 font-sans flex items-center justify-center gap-1.5 shadow-lg shadow-sadhana-gold/10"
                    >
                      <Cloud className="w-3.5 h-3.5" />
                      Sync with Cloud
                    </button>
                  )}
                </div>
              </div>

              {/* Editable Name fields block */}
              <div className="pt-5 border-t border-white/5 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="space-y-0.5">
                  <h4 className="text-xs font-semibold text-slate-300 font-sans">Edit Display Name</h4>
                  <p className="text-[10px] text-slate-500 font-sans">Modify your name displayed across greetings and stats.</p>
                </div>
                <div className="flex gap-2 w-full sm:w-auto items-center">
                  <input 
                    type="text" 
                    value={tempUsernameEdit} 
                    onChange={e => setTempUsernameEdit(e.target.value)}
                    className="flex-1 sm:w-60 bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-sm text-white placeholder-slate-600 outline-none focus:border-sadhana-gold-accent font-serif"
                  />
                  <button 
                    onClick={handleSaveUsernameEdit}
                    className="px-4 py-2 text-xs font-semibold text-black bg-sadhana-gold hover:bg-sadhana-gold-accent rounded-xl transition-colors font-sans shrink-0"
                  >
                    Save Changes
                  </button>
                </div>
              </div>

            </div>

            <SadhanaManager
              sadhanas={displaySadhanas}
              onAdd={handleAddSadhana}
              onUpdate={handleUpdateSadhana}
              onDelete={handleDeleteSadhana}
              isReferencedInSankalp={isReferencedInSankalp}
            />
          </div>
        )}

      </div>

      {/* Footer */}
      <footer className="max-w-6xl mx-auto px-4 py-8 mt-12 border-t border-white/[0.05] text-center space-y-2">
        <p className="text-[10px] text-slate-500 font-sans tracking-wide">
          © {new Date().getFullYear()} Sadhana Journal · Keep your practice consistent.
        </p>
        <div className="flex justify-center gap-4 text-[10px] text-slate-400 font-sans">
          <a 
            href="/privacy.html" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="hover:text-sadhana-gold transition-colors underline"
          >
            Privacy Policy
          </a>
        </div>
      </footer>

      {/* Daily Editor Modal */}
      <SadhanaModal 
        date={selectedDate}
        sadhanas={displaySadhanas}
        sankalps={store.sankalps}
        log={selectedDayLog}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveLog}
        onDelete={handleDeleteLog}
      />

      {/* Non-blurred sign-in prompt modal outside the blurred content */}
      {showGuestGate && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-[2px] animate-fade-in">
          <div className="glass-modal w-full max-w-sm p-6 rounded-2xl border border-white/[0.08] shadow-2xl space-y-5 text-center animate-scale-up">
            <div className="w-12 h-12 rounded-full bg-sadhana-gold/10 border border-sadhana-gold/20 flex items-center justify-center mx-auto">
              <Sparkles className="w-6 h-6 text-sadhana-gold-accent fill-sadhana-gold-accent/15" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-lg font-serif font-semibold text-white tracking-wide">
                Secure Your Spiritual Journey
              </h3>
              <p className="text-xs text-slate-400 font-sans leading-relaxed">
                You can calculate goals and explore the dashboard, but you need to sign in to save vows, log daily repetitions, and back up your logs to the cloud.
              </p>
            </div>

            <div className="h-[1px] w-12 mx-auto bg-white/10" />

            <div className="space-y-2.5 pt-2">
              <button
                onClick={() => {
                  setShowGuestGate(false);
                  setShowAuthPage(true);
                }}
                className="w-full py-2.5 bg-sadhana-gold hover:bg-sadhana-gold-accent text-black font-semibold rounded-xl transition-all font-sans shadow"
              >
                Sign In / Register
              </button>
              <button
                onClick={() => setShowGuestGate(false)}
                className="w-full py-2.5 bg-transparent hover:bg-white/5 border border-white/10 hover:border-white/20 text-slate-400 hover:text-white font-semibold rounded-xl transition-all font-sans"
              >
                Continue Exploring
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
