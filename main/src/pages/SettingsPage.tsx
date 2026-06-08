import React from 'react';
import { motion } from 'motion/react';
import { 
  User, 
  Bell, 
  Lock, 
  CreditCard, 
  Globe, 
  Zap, 
  ShieldCheck,
  ChevronRight,
  Database,
  Key
} from 'lucide-react';
import { Sidebar, Button } from '../components/Shared';
import { Page } from '../types';
import { cn } from '../lib/utils';

export default function SettingsPage({ onNavigate }: { onNavigate: (p: Page) => void }) {
  const [settings, setSettings] = React.useState<any>(null);
  const [saving, setSaving] = React.useState(false);
  const [saved, setSaved] = React.useState(false);
  const [name, setName] = React.useState('');

  React.useEffect(() => {
    (async () => {
      try {
        const api = (await import('../lib/api')).api;
        const res = await api.getSettings();
        setSettings(res.settings || {});
        setName(res.settings?.name || '');
      } catch {}
    })();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      const api = (await import('../lib/api')).api;
      await api.updateSettings({ ...settings, name });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {} finally {
      setSaving(false);
    }
  };

  const sections = [
    { id: 'profile', label: 'My Profile', icon: User, desc: 'Update your personal info and avatar.' },
    { id: 'account', label: 'Account Security', icon: Lock, desc: 'Manage password and 2FA.' },
    { id: 'notifications', label: 'Notifications', icon: Bell, desc: 'Set your email and alert preferences.' },
    { id: 'billing', label: 'Plans & Billing', icon: CreditCard, desc: 'Manage your subscription and invoices.' },
    { id: 'api', label: 'API & Integrations', icon: Key, desc: 'Developer keys and connected apps.' },
  ];

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar currentPage="settings" onNavigate={onNavigate} />
      
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-20 border-b border-white/5 px-8 flex items-center justify-between glass-dark">
           <h1 className="text-xl font-bold font-display">Workspace Settings</h1>
        </header>

        <div className="p-8 max-w-5xl mx-auto w-full overflow-y-auto space-y-12">
          {/* Settings Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
             <aside className="lg:col-span-1 border-r border-white/5 pr-8 hidden lg:block">
                <nav className="space-y-1">
                   {sections.map(s => (
                     <button key={s.id} className={cn(
                       "w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-3",
                       s.id === 'profile' ? "bg-primary/10 text-primary" : "text-text-muted hover:text-text-bright hover:bg-white/5"
                     )}>
                        <s.icon className="size-4" />
                        {s.label}
                     </button>
                   ))}
                </nav>
             </aside>

             <div className="lg:col-span-3 space-y-10">
                {/* Profile Section */}
                <section className="space-y-6">
                   <div className="flex items-center gap-6 pb-6 border-b border-white/5">
                      <div className="relative group">
                        <img src="https://i.pravatar.cc/150?u=admin" className="size-24 rounded-3xl border-2 border-primary/20 p-1 group-hover:scale-110 transition-transform duration-500" />
                        <button className="absolute inset-0 bg-black/40 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-[10px] font-bold uppercase tracking-widest text-white">Change</button>
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold">{name || 'User'}</h2>
                        <p className="text-text-muted text-sm mb-4">Pro Plan Member • Joined May 2026</p>
                        <div className="flex gap-2">
                           <Button size="sm" variant="outline">Edit Info</Button>
                           <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-400">Delete Photo</Button>
                        </div>
                      </div>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest pl-1">Full Name</label>
                        <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-primary/50 text-sm" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest pl-1">Email Address</label>
                        <input type="email" defaultValue="admin@docuweb.ai" className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-primary/50 text-sm disabled:opacity-50" disabled />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest pl-1">Biography</label>
                        <textarea className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-primary/50 text-sm resize-none" rows={3} placeholder="Tell us about yourself..."></textarea>
                      </div>
                   </div>
                   <Button variant="primary" onClick={handleSave} disabled={saving}>
                     {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Profile Changes'}
                   </Button>
                </section>

                <hr className="border-white/5" />

                {/* Account & Billing Card */}
                <section>
                   <h3 className="text-sm font-bold uppercase tracking-widest text-text-muted mb-6">Current Subscription</h3>
                   <div className="p-8 rounded-3xl bg-linear-to-br from-primary/10 via-background to-background border border-primary/20 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden group">
                      <div className="absolute -right-10 -bottom-10 opacity-5 group-hover:scale-150 transition-transform duration-700">
                        <Zap className="size-48" />
                      </div>
                      <div className="relative z-10 flex items-center gap-6">
                        <div className="size-16 rounded-2xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20">
                          <Zap className="size-8" />
                        </div>
                        <div>
                           <div className="flex items-center gap-2 mb-1">
                              <h4 className="text-xl font-bold">DocuWeb Professional</h4>
                              <span className="text-[10px] bg-primary/20 text-primary border border-primary/20 px-2 py-0.5 rounded font-black tracking-widest uppercase">Active</span>
                           </div>
                           <p className="text-text-muted text-sm">Next billing date: June 9, 2026 ($29.00)</p>
                        </div>
                      </div>
                      <Button variant="outline" className="relative z-10 bg-white/5 border-white/10 hover:bg-white/10" onClick={() => onNavigate('pricing')}>Manage Plan</Button>
                   </div>
                </section>

                <hr className="border-white/5" />

                {/* API Info */}
                <section className="space-y-6">
                   <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold uppercase tracking-widest text-text-muted">Connected Services</h3>
                      <Button variant="ghost" size="sm">Connect New</Button>
                   </div>
                   <div className="space-y-3">
                      {[
                        { name: 'Framer Export', icon: Globe, status: 'Connected' },
                        { name: 'Vercel Deployments', icon: Database, status: 'Active' },
                        { name: 'Slack Notifications', icon: Bell, status: 'Paused' },
                      ].map((service, i) => (
                        <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-card border border-white/5 hover:bg-white/10 transition-all cursor-pointer group">
                           <div className="flex items-center gap-4">
                              <div className="size-10 rounded-lg bg-white/5 flex items-center justify-center text-text-muted group-hover:text-primary transition-colors">
                                 <service.icon className="size-5" />
                              </div>
                              <span className="font-bold text-sm">{service.name}</span>
                           </div>
                           <ChevronRight className="size-4 text-text-muted" />
                        </div>
                      ))}
                   </div>
                </section>
             </div>
          </div>
        </div>
      </main>
    </div>
  );
}
