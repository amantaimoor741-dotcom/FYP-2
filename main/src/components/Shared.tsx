import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  FileUp, 
  Settings, 
  Share2, 
  ExternalLink, 
  Download, 
  LogOut, 
  HelpCircle, 
  Menu, 
  X,
  Sparkles,
  PieChart,
  User,
  ShieldCheck,
  CreditCard,
  MessageSquare
} from 'lucide-react';
import { Page } from '../types';
import { cn } from '../lib/utils';
import { useAuth } from '../context/DemoAuth';

// --- SHARED COMPONENTS ---

export function Button({ 
  className, 
  variant = 'primary', 
  size = 'md', 
  children, 
  ...props 
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { 
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'accent';
  size?: 'sm' | 'md' | 'lg' | 'icon';
}) {
  const variants = {
    primary: 'btn-gradient text-white hover:opacity-90',
    secondary: 'bg-secondary text-white hover:bg-secondary/90',
    accent: 'bg-accent text-background font-bold hover:bg-accent/90 shadow-[0_4px_12px_rgba(0,212,255,0.3)]',
    outline: 'border border-white/10 hover:bg-white/5 text-text-bright',
    ghost: 'hover:bg-white/5 text-text-muted hover:text-text-bright',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-8 py-3.5 text-base',
    icon: 'p-2.5',
  };

  return (
    <button 
      className={cn(
        'inline-flex items-center justify-center rounded-xl font-bold transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none tracking-tight',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function Sidebar({ currentPage, onNavigate }: { currentPage: Page, onNavigate: (page: Page) => void }) {
  const { signOut } = useAuth();
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'projects', label: 'My Projects', icon: Share2 },
    { id: 'templates', label: 'Templates', icon: PieChart },
    { id: 'admin', label: 'Admin Panel', icon: ShieldCheck },
  ] as const;

  const bottomItems = [
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'help', label: 'Help', icon: HelpCircle },
    { id: 'logout', label: 'Logout', icon: LogOut },
  ] as const;

  return (
    <aside className="w-60 border-r border-white/5 flex flex-col pt-8 pb-6 bg-[#0b1120] relative z-20">
      <div className="px-6 mb-10 flex items-center gap-3 group cursor-pointer" onClick={() => onNavigate('landing')}>
        <div className="size-8 rounded-lg bg-linear-135 from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/40 group-hover:rotate-12 transition-transform">
          <Sparkles className="size-5 text-white" />
        </div>
        <h2 className="font-extrabold text-xl leading-none tracking-tighter">Genisys AI</h2>
      </div>

      <div className="px-6 mb-4">
        <p className="text-[10px] uppercase font-bold text-text-muted tracking-widest">Main Menu</p>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate((item.id === 'projects' || item.id === 'templates') ? 'dashboard' : item.id as Page)}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group",
              currentPage === item.id 
                ? "bg-primary/10 text-primary border border-primary/20" 
                : "text-text-muted hover:text-text-bright hover:bg-white/5"
            )}
          >
            <item.icon className={cn("size-4", currentPage === item.id ? "text-primary" : "group-hover:scale-110 transition-transform")} />
            {item.label}
          </button>
        ))}
      </nav>

      <div className="px-4 mt-auto">
        <div className="p-4 bg-white/5 border border-white/5 rounded-2xl mb-6">
          <p className="text-[10px] text-text-muted mb-1 font-bold">Current Plan</p>
          <p className="font-extrabold text-accent text-sm tracking-tight leading-none">Pro Vision AI</p>
        </div>
        
        <div className="space-y-1">
          {bottomItems.map((item) => (
            <button
              key={item.id}
              onClick={() => { if (item.id === 'logout') { signOut(); onNavigate('landing'); } else { onNavigate(item.id as Page); } }}
              className="w-full flex items-center gap-3 px-3 py-2 pr-4 rounded-lg text-sm font-medium text-text-muted hover:text-text-bright hover:bg-white/5 transition-all"
            >
              <item.icon className="size-4" />
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}

export function Navbar({ onNavigate, transparent = false }: { onNavigate: (page: Page) => void, transparent?: boolean }) {
  return (
    <header className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-colors py-4",
      transparent ? "bg-transparent" : "glass-dark border-b border-white/5 px-6"
    )}>
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 lg:px-8">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => onNavigate('landing')}>
          <div className="size-8 rounded-lg bg-primary flex items-center justify-center">
            <Sparkles className="size-5 text-white" />
          </div>
          <h1 className="font-display font-bold text-xl">DocuWeb AI</h1>
        </div>

        <nav className="hidden md:flex items-center gap-8">
          <button onClick={() => onNavigate('pricing')} className="text-sm font-medium text-text-muted hover:text-text-bright transition-colors">Pricing</button>
          <button onClick={() => onNavigate('about')} className="text-sm font-medium text-text-muted hover:text-text-bright transition-colors">About</button>
          <button onClick={() => onNavigate('contact')} className="text-sm font-medium text-text-muted hover:text-text-bright transition-colors">Support</button>
        </nav>

        <div className="flex items-center gap-4">
          <button onClick={() => onNavigate('login')} className="text-sm font-medium text-text-muted hover:text-text-bright px-4">Log in</button>
          <Button onClick={() => onNavigate('signup')} variant="primary" size="sm">Get Started</Button>
        </div>
      </div>
    </header>
  );
}

export function Footer({ onNavigate }: { onNavigate: (p: Page) => void }) {
  return (
    <footer className="bg-background border-t border-white/5 py-12">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-10">
        <div className="col-span-2">
          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="size-6 text-primary" />
            <span className="font-display font-bold text-2xl tracking-tight">DocuWeb AI</span>
          </div>
          <p className="text-text-muted text-sm leading-relaxed max-w-xs transition-colors">
            Transforming the way businesses build websites. From document to deployment in under 60 seconds with advanced AI layout analysis.
          </p>
        </div>
        
        <div>
          <h4 className="font-semibold mb-4">Product</h4>
          <ul className="space-y-2 text-sm text-text-muted">
            <li className="hover:text-primary cursor-pointer" onClick={() => onNavigate('landing')}>Features</li>
            <li className="hover:text-primary cursor-pointer" onClick={() => onNavigate('pricing')}>Pricing</li>
            <li className="hover:text-primary cursor-pointer" onClick={() => onNavigate('about')}>Security</li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold mb-4">Company</h4>
          <ul className="space-y-2 text-sm text-text-muted">
            <li className="hover:text-primary cursor-pointer" onClick={() => onNavigate('about')}>About</li>
            <li className="hover:text-primary cursor-pointer" onClick={() => onNavigate('contact')}>Contact</li>
            <li className="hover:text-primary cursor-pointer" onClick={() => onNavigate('about')}>Privacy</li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold mb-4">Social</h4>
          <ul className="space-y-2 text-sm text-text-muted">
            <li><a href="https://twitter.com/docuweb" target="_blank" rel="noopener noreferrer" className="hover:text-primary cursor-pointer text-text-muted no-underline">Twitter</a></li>
            <li><a href="https://linkedin.com/company/docuweb" target="_blank" rel="noopener noreferrer" className="hover:text-primary cursor-pointer text-text-muted no-underline">LinkedIn</a></li>
            <li><a href="https://github.com/docuweb" target="_blank" rel="noopener noreferrer" className="hover:text-primary cursor-pointer text-text-muted no-underline">GitHub</a></li>
          </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-6 mt-12 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-xs text-text-muted">© 2026 DocuWeb AI Inc. All rights reserved.</p>
        <div className="flex gap-6 text-xs text-text-muted">
          <span className="cursor-pointer hover:text-primary transition-colors" onClick={() => onNavigate('about')}>Terms of Service</span>
          <span className="cursor-pointer hover:text-primary transition-colors" onClick={() => onNavigate('about')}>Privacy Policy</span>
          <span className="cursor-pointer hover:text-primary transition-colors" onClick={() => onNavigate('about')}>Cookies</span>
        </div>
      </div>
    </footer>
  );
}
