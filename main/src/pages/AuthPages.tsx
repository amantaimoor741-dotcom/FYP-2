import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { 
  Sparkles, 
  Mail, 
  Lock, 
  User, 
  ArrowRight, 
  ChevronLeft,
  Loader2,
  Eye,
  Chrome
} from 'lucide-react';
import { useSignIn, useSignUp } from '@clerk/clerk-react';
import { useAuth } from '../context/DemoAuth';
import { Button } from '../components/Shared';
import { Page } from '../types';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

function GoogleButton({ onSuccess }: { onSuccess: (credential: string) => void }) {
  const btnRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;
    const s = document.createElement('script');
    s.src = 'https://accounts.google.com/gsi/client';
    s.async = true;
    s.defer = true;
    s.onload = () => {
      (window as any).google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: (res: any) => onSuccess(res.credential),
      });
      if (btnRef.current) {
        (window as any).google.accounts.id.renderButton(btnRef.current, {
          type: 'standard', shape: 'pill', theme: 'outline',
          size: 'large', width: '100%', text: 'signin_with',
        });
      }
    };
    document.body.appendChild(s);
    return () => { document.body.removeChild(s); };
  }, []);

  return <div ref={btnRef} className="w-full flex justify-center" />;
}

function AuthLayout({ 
  children, 
  title, 
  subtitle, 
  onNavigate,
  showBack = false
}: { 
  children: React.ReactNode, 
  title: string, 
  subtitle: string,
  onNavigate: (p: Page) => void,
  showBack?: boolean
}) {
  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Left Decoration (Desktop) */}
      <div className="hidden md:flex flex-1 bg-primary relative items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-primary via-secondary to-accent opacity-90" />
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_30%,rgba(255,255,255,0.2),transparent)]" />
        
        <div className="relative z-10 text-center px-12">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="size-24 bg-white/20 backdrop-blur-xl rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl border border-white/30"
          >
            <Sparkles className="size-12 text-white" />
          </motion.div>
          <h2 className="text-5xl font-display font-black text-white tracking-tighter mb-4">DocuWeb AI</h2>
          <p className="text-white/80 text-lg max-w-sm mx-auto leading-relaxed">
            The world's most advanced document-to-web AI engine.
          </p>
        </div>

        {/* Floating Abstract Shapes */}
        <div className="absolute bottom-[-10%] left-[-10%] w-64 h-64 border-4 border-white/10 rounded-full" />
        <div className="absolute top-[10%] right-[-5%] w-48 h-48 border-2 border-white/5 rounded-full" />
      </div>

      {/* Right Form Side */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 md:p-16 relative">
        {showBack && (
          <button 
            onClick={() => onNavigate('landing')}
            className="absolute top-8 left-8 p-2 rounded-xl hover:bg-white/5 text-text-muted transition-colors flex items-center gap-2 text-sm"
          >
            <ChevronLeft className="size-4" /> Back to home
          </button>
        )}

        <div className="w-full max-w-md">
          <div className="mb-10">
            <h1 className="text-3xl font-display font-bold tracking-tight mb-2 text-text-bright">{title}</h1>
            <p className="text-text-muted">{subtitle}</p>
          </div>

          {children}
        </div>
      </div>
    </div>
  );
}

export function LoginPage({ onNavigate }: { onNavigate: (p: Page) => void }) {
  const { signIn, isLoaded } = useSignIn();
  const auth = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function apiLogin(email: string, password: string) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed');
    return data;
  }

  const handleGoogleSuccess = async (credential: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Google sign in failed');
      auth.signInWithToken(data.token, { id: data.userId, email: data.email, name: data.name });
      onNavigate('dashboard');
    } catch (err: any) {
      setError(err.message || 'Google sign in failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (isLoaded && signIn) {
        const result = await signIn.create({ identifier: email, password });
        if (result.status === 'complete') {
          onNavigate('dashboard');
        } else {
          setError('Additional verification required.');
        }
      } else {
        const data = await apiLogin(email, password);
        auth.signInWithToken(data.token, { id: data.userId, email: data.email, name: data.name });
        onNavigate('dashboard');
      }
    } catch (err: any) {
      setError(err.errors?.[0]?.message || err.message || 'Sign in failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout 
      title="Welcome Back" 
      subtitle="Enter your credentials or use Demo Mode below."
      onNavigate={onNavigate}
      showBack
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        {!isLoaded && <div className="p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 text-sm">Using local auth — sign in with email/password.</div>}
        {error && <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm">{error}</div>}
        <div className="space-y-2">
          <label className="text-xs font-bold text-text-muted uppercase tracking-widest pl-1">Email Address</label>
          <div className="relative group">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-text-muted group-focus-within:text-primary transition-colors" />
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com" 
              className="w-full bg-white/5 border border-white/5 rounded-xl py-4 pl-12 pr-4 focus:outline-none focus:border-primary/50 transition-all text-sm" 
            />
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between pl-1">
            <label className="text-xs font-bold text-text-muted uppercase tracking-widest">Password</label>
            <button type="button" onClick={() => onNavigate('forgot-password')} className="text-xs font-bold text-primary hover:underline">Forgot?</button>
          </div>
          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-text-muted group-focus-within:text-primary transition-colors" />
            <input 
              type="password" 
              minLength={6}
              maxLength={16}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••" 
              className="w-full bg-white/5 border border-white/5 rounded-xl py-4 pl-12 pr-4 focus:outline-none focus:border-primary/50 transition-all text-sm" 
            />
          </div>
        </div>
        <Button type="submit" className="w-full py-4 text-base font-bold rounded-xl mt-6" disabled={loading}>
          {loading ? <Loader2 className="size-5 animate-spin mx-auto" /> : <>Sign In to Account <ArrowRight className="ml-2 size-5" /></>}
        </Button>
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10" /></div>
          <div className="relative flex justify-center"><span className="bg-[#0F172A] px-4 text-xs text-text-muted">or</span></div>
        </div>
        {GOOGLE_CLIENT_ID && <GoogleButton onSuccess={handleGoogleSuccess} />}
        <button
          type="button"
          onClick={() => { auth.enableDemo(); onNavigate('dashboard'); }}
          className="w-full flex items-center justify-center gap-3 py-4 rounded-xl border-2 border-primary/40 hover:border-primary bg-primary/10 hover:bg-primary/20 transition-all font-bold text-sm text-primary shadow-lg shadow-primary/10"
        >
          <Eye className="size-5" /> Try Demo Mode (No Login Required)
        </button>
        <p className="text-center text-sm text-text-muted mt-6">
          New to DocuWeb? <button type="button" onClick={() => onNavigate('signup')} className="text-primary font-bold hover:underline">Create an account</button>
        </p>
      </form>
    </AuthLayout>
  );
}

export function SignupPage({ onNavigate }: { onNavigate: (p: Page) => void }) {
  const { signUp, isLoaded } = useSignUp();
  const auth = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function apiSignup(email: string, password: string, name: string) {
    const res = await fetch(`${API_BASE}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Sign up failed');
    return data;
  }

  const handleGoogleSuccess = async (credential: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Google sign in failed');
      auth.signInWithToken(data.token, { id: data.userId, email: data.email, name: data.name });
      onNavigate('dashboard');
    } catch (err: any) {
      setError(err.message || 'Google sign in failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (isLoaded && signUp) {
        const result = await signUp.create({ emailAddress: email, password, firstName: name });
        if (result.status === 'complete') {
          onNavigate('dashboard');
        } else if (result.status === 'missing_requirements') {
          await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
          setError('Check your email for a verification code.');
        }
      } else {
        const data = await apiSignup(email, password, name);
        auth.signInWithToken(data.token, { id: data.userId, email: data.email, name: data.name });
        onNavigate('dashboard');
      }
    } catch (err: any) {
      setError(err.errors?.[0]?.message || err.message || 'Sign up failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout 
      title="Get Started Free" 
      subtitle="Create your account and start generating in seconds."
      onNavigate={onNavigate}
      showBack
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        {!isLoaded && <div className="p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 text-sm">Using local auth — create your account below.</div>}
        {error && <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm">{error}</div>}
        <div className="space-y-2">
          <label className="text-xs font-bold text-text-muted uppercase tracking-widest pl-1">Full Name</label>
          <div className="relative group">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-text-muted group-focus-within:text-primary transition-colors" />
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe" 
              className="w-full bg-white/5 border border-white/5 rounded-xl py-4 pl-12 pr-4 focus:outline-none focus:border-primary/50 transition-all text-sm" 
            />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold text-text-muted uppercase tracking-widest pl-1">Email Address</label>
          <div className="relative group">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-text-muted group-focus-within:text-primary transition-colors" />
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com" 
              className="w-full bg-white/5 border border-white/5 rounded-xl py-4 pl-12 pr-4 focus:outline-none focus:border-primary/50 transition-all text-sm" 
            />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold text-text-muted uppercase tracking-widest pl-1">Password</label>
          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-text-muted group-focus-within:text-primary transition-colors" />
            <input 
              type="password" 
              minLength={6}
              maxLength={16}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a strong password" 
              className="w-full bg-white/5 border border-white/5 rounded-xl py-4 pl-12 pr-4 focus:outline-none focus:border-primary/50 transition-all text-sm" 
            />
          </div>
        </div>
        <Button type="submit" className="w-full py-4 text-base font-bold rounded-xl mt-6" disabled={loading}>
          {loading ? <Loader2 className="size-5 animate-spin mx-auto" /> : <>Create Free Account <ArrowRight className="ml-2 size-5" /></>}
        </Button>
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10" /></div>
          <div className="relative flex justify-center"><span className="bg-[#0F172A] px-4 text-xs text-text-muted">or</span></div>
        </div>
        {GOOGLE_CLIENT_ID && <GoogleButton onSuccess={handleGoogleSuccess} />}
        <p className="text-center text-sm text-text-muted mt-6">
          Already have an account? <button type="button" onClick={() => onNavigate('login')} className="text-primary font-bold hover:underline">Sign In</button>
        </p>
      </form>
    </AuthLayout>
  );
}
export function ForgotPasswordPage({ onNavigate }: { onNavigate: (p: Page) => void }) {
  return (
    <AuthLayout 
      title="Reset Password" 
      subtitle="We'll send you a link to get back into your account."
      onNavigate={onNavigate}
    >
      <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); }}>
        <div className="space-y-2">
          <label className="text-xs font-bold text-text-muted uppercase tracking-widest pl-1">Email Address</label>
          <div className="relative group">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-text-muted group-focus-within:text-primary transition-colors" />
            <input 
              type="email" 
              placeholder="name@company.com" 
              className="w-full bg-white/5 border border-white/5 rounded-xl py-4 pl-12 pr-4 focus:outline-none focus:border-primary/50 transition-all text-sm" 
            />
          </div>
        </div>
        <Button className="w-full py-4 text-base font-bold rounded-xl mt-6">
          Send Reset Link
        </Button>
        <p className="text-center text-sm text-text-muted mt-6">
          Remember your password? <button onClick={() => onNavigate('login')} className="text-primary font-bold hover:underline">Go back</button>
        </p>
      </form>
    </AuthLayout>
  );
}
