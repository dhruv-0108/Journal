import React, { useState } from 'react';
import { X, Sparkles, AlertCircle, Loader2 } from 'lucide-react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    if (!email.trim() || !password.trim()) {
      setError('Please fill in all fields.');
      setIsLoading(false);
      return;
    }

    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email.trim(), password.trim());
      } else {
        await signInWithEmailAndPassword(auth, email.trim(), password.trim());
      }
      setIsLoading(false);
      onSuccess();
      onClose();
    } catch (err: any) {
      setIsLoading(false);
      // Map standard firebase auth errors to human readable strings
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-[2px] animate-fade-in">
      {/* Modal Card */}
      <form 
        onSubmit={handleSubmit}
        className="glass-modal w-full max-w-sm p-6 rounded-lg shadow-2xl relative space-y-5 animate-slide-up"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Title */}
        <div className="text-center space-y-1">
          <h2 className="text-lg font-serif font-semibold text-white tracking-wider flex items-center justify-center gap-1.5">
            <Sparkles className="w-4 h-4 text-sadhana-gold-accent fill-sadhana-gold-accent/15" />
            {isSignUp ? 'Create Vow Account' : 'Cloud Sync Login'}
          </h2>
          <p className="text-[10px] text-slate-500 font-sans mt-0.5">
            {isSignUp ? 'Register to back up your journal and settings' : 'Sign in to access your logs from any device'}
          </p>
        </div>

        <div className="h-[1px] w-12 mx-auto bg-white/10" />

        {/* Errors */}
        {error && (
          <div className="p-3 bg-rose-950/15 border border-rose-900/30 rounded-lg flex gap-2 text-xs text-rose-400 font-sans">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Inputs */}
        <div className="space-y-3.5">
          <div className="space-y-1.5">
            <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider font-sans">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              disabled={isLoading}
              className="w-full bg-sadhana-dark border border-white/10 rounded-lg px-3.5 py-2 text-sm text-white placeholder-slate-600 outline-none transition-colors focus:border-sadhana-gold-accent font-serif"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider font-sans">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              disabled={isLoading}
              className="w-full bg-sadhana-dark border border-white/10 rounded-lg px-3.5 py-2 text-sm text-white placeholder-slate-600 outline-none transition-colors focus:border-sadhana-gold-accent font-mono"
            />
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-2.5 bg-sadhana-gold hover:bg-sadhana-gold-accent disabled:bg-sadhana-card border border-transparent disabled:border-white/5 text-black disabled:text-slate-500 rounded-lg font-semibold transition-all font-sans flex items-center justify-center gap-1.5 shadow"
        >
          {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
          {isSignUp ? 'Create Account' : 'Sign In'}
        </button>

        {/* Toggle Sign In / Sign Up */}
        <div className="text-center">
          <button
            type="button"
            disabled={isLoading}
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError(null);
            }}
            className="text-[11px] text-slate-500 hover:text-sadhana-gold-accent transition-colors font-sans"
          >
            {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Register"}
          </button>
        </div>
      </form>
    </div>
  );
};
