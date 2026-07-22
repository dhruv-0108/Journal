import React, { useState } from 'react';
import { Sparkles, AlertCircle, Loader2, ArrowRight, User, Mail, Lock } from 'lucide-react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { auth } from '../firebase';

interface AuthPageProps {
  onSuccess: (username?: string) => void;
  onContinueGuest: (username: string) => void;
  currentGuestName?: string;
  isCloudSyncing?: boolean;
}

export const AuthPage: React.FC<AuthPageProps> = ({ 
  onSuccess, 
  onContinueGuest,
  currentGuestName = '',
  isCloudSyncing = false 
}) => {
  const [mode, setMode] = useState<'signin' | 'register' | 'guest'>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [guestName, setGuestName] = useState(currentGuestName);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (mode === 'guest') {
      if (!guestName.trim()) {
        setError('Please enter your name.');
        return;
      }
      onContinueGuest(guestName.trim());
      return;
    }

    if (!email.trim() || !password.trim()) {
      setError('Please fill in all fields.');
      return;
    }

    if (mode === 'register' && !name.trim()) {
      setError('Please enter your name for registration.');
      return;
    }

    setIsLoading(true);

    try {
      await setPersistence(auth, browserLocalPersistence);
      localStorage.setItem('sadhana_remember_me', 'true');

      if (mode === 'register') {
        // Sign up
        await createUserWithEmailAndPassword(auth, email.trim(), password.trim());
        onSuccess(name.trim());
      } else {
        // Sign in
        await signInWithEmailAndPassword(auth, email.trim(), password.trim());
        onSuccess();
      }
    } catch (err: any) {
      console.error(err);
      setIsLoading(false);
      switch (err.code) {
        case 'auth/invalid-credential':
          setError('Incorrect email or password.');
          break;
        case 'auth/email-already-in-use':
          setError('This email is already registered.');
          break;
        case 'auth/weak-password':
          setError('Password should be at least 6 characters long.');
          break;
        case 'auth/invalid-email':
          setError('Please enter a valid email address.');
          break;
        default:
          setError(err.message || 'An error occurred during authentication.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-sadhana-dark text-slate-100 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Background glow effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-sadhana-gold/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-900/5 blur-[120px] pointer-events-none" />

      {/* Main card */}
      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-5 rounded-2xl border border-white/[0.06] overflow-hidden shadow-2xl bg-[#0f0e15]/80 backdrop-blur-xl relative z-10">
        
        {/* Left Side: Branding / Sanskrit Quote */}
        <div className="col-span-1 md:col-span-2 bg-gradient-to-br from-[#1b122c] via-[#0f0e15] to-[#0a090f] p-6 sm:p-8 flex flex-col justify-between border-b md:border-b-0 md:border-r border-white/[0.06] relative">
          {/* Ambient background decoration */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.05)_0%,transparent_70%)] pointer-events-none" />
          
          {/* Logo / Header */}
          <div className="space-y-2 relative z-10">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-sadhana-gold/10 rounded-lg border border-sadhana-gold/20">
                <Sparkles className="w-5 h-5 text-sadhana-gold-accent fill-sadhana-gold-accent/15" />
              </div>
              <span className="text-sm font-semibold tracking-[0.2em] text-sadhana-gold uppercase">Sadhana</span>
            </div>
            <h1 className="text-2xl font-serif font-bold text-white pt-2 leading-tight">Your Sacred Spiritual Space</h1>
          </div>

          {/* Sanskrit Sloka */}
          <div className="space-y-4 my-8 relative z-10 text-center md:text-left">
            <p className="text-lg sm:text-xl font-serif text-sadhana-gold-accent italic leading-relaxed">
              तस्माच्छास्त्रं प्रमाणं ते कार्याकार्यव्यवस्थितौ।
            </p>
            <p className="text-xs text-slate-400 font-serif leading-relaxed">
              "Let your spiritual commitments guide your actions, transforming daily habits into sacred vows."
            </p>
          </div>

          {/* Footer Info */}
          <div className="text-[10px] text-slate-500 font-sans tracking-wide relative z-10 pt-4 border-t border-white/5">
            Cloud Backup • Offline Sync • Daily Commitment Tracking
          </div>
        </div>

        {/* Right Side: Auth Form */}
        <form onSubmit={handleSubmit} className="col-span-1 md:col-span-3 p-6 sm:p-8 flex flex-col justify-center space-y-6">
          
          {/* Header titles */}
          <div className="space-y-1">
            <h2 className="text-xl font-serif font-semibold text-white tracking-wide">
              {mode === 'signin' && 'Sign In to Journal'}
              {mode === 'register' && 'Create Your Account'}
              {mode === 'guest' && 'Enter Guest Mode'}
            </h2>
            <p className="text-xs text-slate-400">
              {mode === 'signin' && 'Access your spiritual commitments from any device.'}
              {mode === 'register' && 'Start backing up your logs and sadhanas to the cloud.'}
              {mode === 'guest' && 'Your logs will be saved locally on this browser.'}
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="p-3.5 bg-rose-950/20 border border-rose-900/40 rounded-xl flex gap-2.5 text-xs text-rose-400 font-sans items-start animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Loading Indicator */}
          {isCloudSyncing && (
            <div className="p-3.5 bg-sadhana-gold/5 border border-sadhana-gold/20 rounded-xl flex gap-2.5 text-xs text-sadhana-gold-accent font-sans items-center">
              <Loader2 className="w-4 h-4 animate-spin shrink-0" />
              <span>Synchronizing database, please wait...</span>
            </div>
          )}

          {/* Form Fields */}
          <div className="space-y-4">
            {mode === 'register' && (
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider font-sans">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Enter your name"
                    required
                    disabled={isLoading || isCloudSyncing}
                    className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-600 outline-none transition-all focus:border-sadhana-gold-accent focus:bg-black/60 font-serif"
                  />
                </div>
              </div>
            )}

            {mode !== 'guest' ? (
              <>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider font-sans">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                      disabled={isLoading || isCloudSyncing}
                      className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-600 outline-none transition-all focus:border-sadhana-gold-accent focus:bg-black/60 font-serif"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider font-sans">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                    <input
                      type="password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      disabled={isLoading || isCloudSyncing}
                      className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-600 outline-none transition-all focus:border-sadhana-gold-accent focus:bg-black/60 font-mono"
                    />
                  </div>
                </div>

                {mode === 'signin' && (
                  <div className="pt-1">
                    <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300 hover:text-white select-none">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={e => setRememberMe(e.target.checked)}
                        className="w-4 h-4 rounded border-white/20 bg-black/40 text-sadhana-gold focus:ring-sadhana-gold/50 cursor-pointer accent-sadhana-gold"
                      />
                      <span>Remember me for quick sign-in</span>
                    </label>
                  </div>
                )}
              </>
            ) : (
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider font-sans">Guest Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    value={guestName}
                    onChange={e => setGuestName(e.target.value)}
                    placeholder="Enter your name to start"
                    required
                    className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-600 outline-none transition-all focus:border-sadhana-gold-accent focus:bg-black/60 font-serif"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Submit Action */}
          <button
            type="submit"
            disabled={isLoading || isCloudSyncing}
            className="w-full py-3 bg-sadhana-gold hover:bg-sadhana-gold-accent disabled:bg-white/5 disabled:text-slate-500 disabled:border-transparent border border-transparent text-black rounded-xl font-semibold transition-all font-sans flex items-center justify-center gap-2 shadow-lg"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                {mode === 'signin' && 'Sign In'}
                {mode === 'register' && 'Create Account'}
                {mode === 'guest' && 'Enter Journal'}
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          {/* Footer Navigation Toggles */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2 text-xs">
            {mode === 'signin' && (
              <>
                <button
                  type="button"
                  onClick={() => { setMode('register'); setError(null); }}
                  className="text-slate-400 hover:text-sadhana-gold transition-colors text-left"
                >
                  Don't have an account? <span className="text-sadhana-gold font-semibold underline">Register</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setMode('guest'); setError(null); }}
                  className="text-slate-500 hover:text-slate-300 transition-colors text-left"
                >
                  Or continue as <span className="underline">Guest</span>
                </button>
              </>
            )}

            {mode === 'register' && (
              <>
                <button
                  type="button"
                  onClick={() => { setMode('signin'); setError(null); }}
                  className="text-slate-400 hover:text-sadhana-gold transition-colors text-left"
                >
                  Already registered? <span className="text-sadhana-gold font-semibold underline">Sign In</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setMode('guest'); setError(null); }}
                  className="text-slate-500 hover:text-slate-300 transition-colors text-left"
                >
                  Or continue as <span className="underline">Guest</span>
                </button>
              </>
            )}

            {mode === 'guest' && (
              <>
                <button
                  type="button"
                  onClick={() => { setMode('signin'); setError(null); }}
                  className="text-slate-400 hover:text-sadhana-gold transition-colors text-left"
                >
                  Return to <span className="text-sadhana-gold font-semibold underline">Sign In</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setMode('register'); setError(null); }}
                  className="text-slate-400 hover:text-sadhana-gold transition-colors text-left"
                >
                  Create <span className="text-sadhana-gold font-semibold underline">Account</span>
                </button>
              </>
            )}
          </div>

        </form>
      </div>
    </div>
  );
};
