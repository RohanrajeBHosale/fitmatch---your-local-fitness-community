
import React, { useState } from 'react';
import { Dumbbell, Mail, Lock, Chrome, Apple, ArrowRight, Github } from 'lucide-react';
import { storageService } from '../services/storage';
import { User } from '../types';

interface AuthProps {
  onAuthSuccess: (user: User) => void;
}

const Auth: React.FC<AuthProps> = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Simulate network delay
    // Use async callback to await promises returned from storageService
    setTimeout(async () => {
      if (isLogin) {
        const user = await storageService.login(email);
        if (user) {
          onAuthSuccess(user);
        } else {
          setError('Invalid email or password. Try registering!');
        }
      } else {
        const user = await storageService.register(email, password);
        if (user) {
          await storageService.login(email);
          onAuthSuccess(user);
        } else {
          setError('This email is already registered.');
        }
      }
      setLoading(false);
    }, 800);
  };

  const handleSocial = (provider: string) => {
    setLoading(true);
    // Use async callback to await promises returned from storageService
    setTimeout(async () => {
      const email = `${provider.toLowerCase()}@example.com`;
      let user = await storageService.login(email);
      if (!user) {
        user = await storageService.register(email, 'social_pass');
      }
      await storageService.login(email);
      if (user) {
        onAuthSuccess(user);
      }
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 bg-slate-900 z-[200] flex flex-col max-w-md mx-auto overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/20 blur-[100px] -translate-y-1/2 translate-x-1/2 rounded-full"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 blur-[100px] translate-y-1/2 -translate-x-1/2 rounded-full"></div>

      <div className="relative z-10 flex-1 flex flex-col px-8 pt-20 pb-12">
        <div className="mb-12">
          <div className="bg-emerald-500 w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20 mb-6">
            <Dumbbell className="text-white w-7 h-7" />
          </div>
          <h1 className="text-4xl font-black text-white leading-tight">
            {isLogin ? 'Welcome back to' : 'Join the club at'}<br/>
            <span className="text-emerald-500 underline decoration-white/20 underline-offset-8">FitMatch.</span>
          </h1>
          <p className="text-slate-400 mt-4 font-medium">
            {isLogin ? 'Pick up right where you left your gains.' : 'Start finding your local fitness community today.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-emerald-500 transition-colors" />
              <input 
                type="email" 
                required
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl pl-12 pr-6 py-4 text-white font-medium outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all"
              />
            </div>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-emerald-500 transition-colors" />
              <input 
                type="password" 
                required
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl pl-12 pr-6 py-4 text-white font-medium outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all"
              />
            </div>
          </div>

          {error && <p className="text-rose-500 text-xs font-bold text-center">{error}</p>}

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-white text-slate-900 font-black py-4 rounded-2xl flex items-center justify-center gap-2 transition-all hover:bg-emerald-500 hover:text-white active:scale-95 disabled:opacity-50"
          >
            {loading ? (
              <div className="w-6 h-6 border-4 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                {isLogin ? 'Log In' : 'Sign Up'}
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8">
          <div className="relative flex items-center gap-4 mb-8">
            <div className="flex-1 h-px bg-slate-800"></div>
            <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Or continue with</span>
            <div className="flex-1 h-px bg-slate-800"></div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <button onClick={() => handleSocial('Google')} className="p-4 bg-slate-800 border border-slate-700 rounded-2xl flex items-center justify-center hover:bg-slate-700 transition-colors">
              <Chrome className="w-5 h-5 text-white" />
            </button>
            <button onClick={() => handleSocial('Apple')} className="p-4 bg-slate-800 border border-slate-700 rounded-2xl flex items-center justify-center hover:bg-slate-700 transition-colors">
              <Apple className="w-5 h-5 text-white" />
            </button>
            <button onClick={() => handleSocial('MagicLink')} className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center hover:bg-emerald-500/20 transition-colors">
              <span className="text-emerald-500 font-black text-xs">Link</span>
            </button>
          </div>
        </div>

        <div className="mt-auto text-center pt-8">
          <p className="text-slate-500 text-sm font-medium">
            {isLogin ? "Don't have an account?" : "Already a member?"}{' '}
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="text-emerald-500 font-bold hover:underline"
            >
              {isLogin ? 'Create Account' : 'Log In'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
