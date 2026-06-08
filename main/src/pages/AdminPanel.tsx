import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Users, Database, Activity, Shield, AlertTriangle, Cpu, Globe } from 'lucide-react';
import { Sidebar, Button } from '../components/Shared';
import { Page } from '../types';
import { cn } from '../lib/utils';
import { api } from '../lib/api';

export default function AdminPanel({ onNavigate }: { onNavigate: (p: Page) => void }) {
  const [stats, setStats] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.getAdminStats().catch(() => ({ stats: { totalUsers: 0, totalProjects: 0, completedProjects: 0, failedProjects: 0, systemUptime: 0, memoryUsage: 0 } })),
      api.getAdminLogs().catch(() => ({ logs: [] })),
    ]).then(([s, l]) => {
      setStats(s.stats);
      setLogs(l.logs || []);
    }).finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar currentPage="admin" onNavigate={onNavigate} />
      
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-20 border-b border-white/5 px-8 flex items-center justify-between glass-dark">
          <div className="flex items-center gap-3">
            <Shield className="size-6 text-primary" />
            <h1 className="text-xl font-bold font-display">Admin Controls</h1>
            <div className="h-4 w-[1px] bg-white/10 mx-2" />
            <span className="text-[10px] bg-red-500/10 text-red-500 border border-red-500/20 px-2 py-0.5 rounded font-black tracking-widest uppercase">System Root Access</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-green-500 font-bold px-3 py-1 bg-green-500/5 border border-green-500/10 rounded-full">
              <div className="size-2 bg-green-500 rounded-full animate-pulse" />
              {stats ? `Uptime: ${Math.floor(stats.systemUptime / 3600)}h` : 'Loading...'}
            </div>
          </div>
        </header>

        <div className="p-8 space-y-8 max-w-7xl mx-auto w-full overflow-y-auto">
          {loading ? (
            <div className="text-center py-20 text-text-muted">Loading admin data...</div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { label: 'Total Users', val: String(stats?.totalUsers || 0), icon: Users, color: 'text-blue-400' },
                  { label: 'Memory Usage', val: `${stats?.memoryUsage || 0} MB`, icon: Database, color: 'text-purple-400' },
                  { label: 'System Uptime', val: `${Math.floor((stats?.systemUptime || 0) / 3600)}h`, icon: Globe, color: 'text-green-400' },
                ].map((s, i) => (
                  <div key={i} className="p-6 rounded-2xl bg-card border border-white/5 shadow-xl">
                    <div className="flex items-center justify-between mb-4">
                      <div className={cn("p-2 rounded-lg bg-white/5", s.color)}><s.icon className="size-5" /></div>
                    </div>
                    <p className="text-3xl font-display font-black">{s.val}</p>
                    <p className="text-xs text-text-muted uppercase tracking-wider font-bold mt-1">{s.label}</p>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="p-6 rounded-2xl bg-card border border-white/5 shadow-xl">
                  <h3 className="font-bold flex items-center gap-2 mb-6">
                    <Activity className="size-5 text-primary" />
                    System Logs
                  </h3>
                  <div className="space-y-4">
                    {logs.length === 0 ? (
                      <p className="text-text-muted text-sm">No logs yet</p>
                    ) : (
                      logs.map((log: any, i: number) => (
                        <div key={i} className="flex items-start gap-4 p-3 rounded-xl hover:bg-white/5 transition-all group">
                          <div className={cn("size-2 rounded-full mt-1.5 shrink-0", log.status === 'failed' ? 'bg-red-500' : log.status === 'completed' ? 'bg-green-500' : 'bg-blue-500')} />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-text-bright font-bold">{log.name}</p>
                            <p className="text-[10px] text-text-muted mt-1">{log.status} • {new Date(log.createdAt).toLocaleString()}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="p-6 rounded-2xl bg-card border border-white/5 shadow-xl">
                  <h3 className="font-bold mb-6 flex items-center gap-2">
                    <Cpu className="size-5 text-accent" />
                    Project Stats
                  </h3>
                  <div className="space-y-6">
                    {[
                      { name: 'Total Projects', value: stats?.totalProjects || 0, color: 'bg-primary' },
                      { name: 'Completed', value: stats?.completedProjects || 0, color: 'bg-green-500' },
                      { name: 'Failed', value: stats?.failedProjects || 0, color: 'bg-red-500' },
                    ].map((m, i) => (
                      <div key={i} className="space-y-2">
                        <div className="flex justify-between items-center text-sm">
                          <span className="font-medium text-text-bright">{m.name}</span>
                          <span className="font-bold">{m.value}</span>
                        </div>
                        <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                          <div className={cn("h-full", m.color)} style={{ width: `${Math.min(100, (m.value / Math.max(1, stats?.totalProjects || 1)) * 100)}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
