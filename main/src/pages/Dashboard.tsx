import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { 
  FileUp, Search, Bell, Plus, MoreVertical, ExternalLink, Download, 
  Clock, CheckCircle, AlertCircle, FileText, Eye, Trash2, TrendingUp, Users, Activity,
  Menu
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Sidebar, Button } from '../components/Shared';
import { Page } from '../types';
import { cn } from '../lib/utils';
import { useUser } from '../context/DemoAuth';
import { api } from '../lib/api';

const chartData = [
  { name: 'Jan', value: 400 }, { name: 'Feb', value: 300 }, { name: 'Mar', value: 600 },
  { name: 'Apr', value: 800 }, { name: 'May', value: 500 }, { name: 'Jun', value: 900 },
  { name: 'Jul', value: 1100 },
];

export default function Dashboard({ onNavigate }: { onNavigate: (p: Page) => void }) {
  const { user } = useUser();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [projects, setProjects] = useState<any[]>([]);
  const [stats, setStats] = useState({ total: 0, completed: 0, processing: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getProjects().then(data => {
      setProjects(data.projects || []);
      const p = data.projects || [];
      setStats({
        total: p.length,
        completed: p.filter((x: any) => x.status === 'completed').length,
        processing: p.filter((x: any) => !['completed', 'failed'].includes(x.status)).length,
      });
    }).catch((err) => console.error('Failed to load projects:', err)).finally(() => setLoading(false));
  }, []);

  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    try {
      await api.deleteProject(id);
      setProjects(prev => prev.filter(p => p.id !== id));
      setDeleteConfirm(null);
    } catch (err) { console.error('Failed to delete project:', err); }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar currentPage="dashboard" onNavigate={onNavigate} mobileOpen={sidebarOpen} onToggleMobile={() => setSidebarOpen(false)} />
      
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="h-20 border-b border-white/5 px-4 md:px-8 flex items-center justify-between bg-[#0b1120]/50 backdrop-blur-xl sticky top-0 z-30">
          <div className="flex items-center gap-3 flex-1">
            <button onClick={() => setSidebarOpen(true)} className="md:hidden p-2 rounded-xl hover:bg-white/5 text-text-muted">
              <Menu className="size-5" />
            </button>
            <div className="relative w-full max-w-sm group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-text-muted group-focus-within:text-primary transition-colors" />
              <input type="text" placeholder="Search projects..." className="w-full bg-white/5 border border-white/5 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-primary/50 transition-all" />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2.5 rounded-xl hover:bg-white/5 text-text-muted transition-colors relative">
              <Bell className="size-5" />
              <span className="absolute top-2.5 right-2.5 size-2 bg-primary rounded-full border-2 border-background" />
            </button>
            <div className="h-8 w-[1px] bg-white/10 mx-2" />
            <div className="user-pill flex items-center gap-3 bg-card border border-white/10 px-4 py-1.5 rounded-full">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold leading-none">{user?.name || 'User'}</p>
                <p className="text-[9px] text-text-muted mt-1 uppercase tracking-wider font-bold">Account</p>
              </div>
              <div className="size-8 rounded-full bg-secondary overflow-hidden border border-white/10">
                <img src={`https://i.pravatar.cc/150?u=${user?.id || 'user'}`} className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        </header>

        <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto w-full">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-display font-extrabold tracking-tight">Dashboard Overview</h1>
              <p className="text-text-muted mt-1 text-sm">Transform documents into responsive web experiences.</p>
            </div>
            <div className="flex gap-3">
              <Button variant="primary" size="sm" onClick={() => onNavigate('upload')}>New Project <Plus className="ml-2 size-4" /></Button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: 'Total Projects', value: String(stats.total), icon: FileUp, color: 'text-primary' },
              { label: 'Completed', value: String(stats.completed), icon: Activity, color: 'text-secondary' },
              { label: 'Processing', value: String(stats.processing), icon: TrendingUp, color: 'text-accent' },
              { label: 'Status', value: stats.total > 0 ? `${Math.round(stats.completed/stats.total*100)}%` : '-', icon: CheckCircle, color: 'text-text-bright' },
            ].map((stat, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                className="p-6 rounded-2xl bg-card border border-card-border shadow-2xl relative group overflow-hidden"
              >
                <div className="absolute inset-0 bg-primary/5 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                <div className="relative flex justify-between items-start mb-4">
                  <div className={cn("p-2 rounded-lg bg-white/5", stat.color)}><stat.icon className="size-6" /></div>
                </div>
                <div className="relative">
                  <p className="text-xs text-text-muted font-bold uppercase tracking-wider mb-1">{stat.label}</p>
                  <p className="text-3xl font-display font-black">{stat.value}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 p-6 rounded-2xl bg-card border border-card-border shadow-2xl">
              <h3 className="text-lg font-bold mb-8">Project Activity</h3>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="name" fontSize={12} stroke="#94A3B8" />
                    <YAxis fontSize={12} stroke="#94A3B8" />
                    <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} itemStyle={{ color: '#fff' }} />
                    <Area type="monotone" dataKey="value" stroke="var(--color-primary)" fillOpacity={1} fill="url(#colorValue)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-card border border-card-border shadow-2xl space-y-6">
              <h3 className="text-lg font-bold">Quick Actions</h3>
              <div className="space-y-3">
                <Button className="w-full" onClick={() => onNavigate('upload')}><Plus className="size-4 mr-2" /> New Project</Button>
                <Button className="w-full" variant="outline" onClick={() => onNavigate('settings')}>Settings</Button>
                <Button className="w-full" variant="ghost" onClick={() => onNavigate('admin')}>Admin Panel</Button>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-card border border-card-border shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-lg font-bold">Recent Projects</h3>
                <p className="text-xs text-text-muted">Manage and track your latest website generations.</p>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-12 text-text-muted">Loading projects...</div>
            ) : projects.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="size-12 text-text-muted mx-auto mb-4 opacity-50" />
                <p className="text-text-muted mb-4">No projects yet. Upload a document to get started.</p>
                <Button onClick={() => onNavigate('upload')}>Create Your First Project</Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/5 text-left text-xs uppercase tracking-wider text-text-muted">
                      <th className="pb-4 font-bold px-4">Project Name</th>
                      <th className="pb-4 font-bold px-4">Date Created</th>
                      <th className="pb-4 font-bold px-4">Status</th>
                      <th className="pb-4 font-bold px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {projects.map((project: any) => (
                      <tr key={project.id} className="group hover:bg-white/5 transition-all">
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-white/5 text-blue-400">
                              <FileText className="size-5" />
                            </div>
                            <div>
                              <p className="text-sm font-bold">{project.name}</p>
                              <p className="text-[10px] text-text-muted mt-0.5 uppercase">{project.documentType || 'DOC'} SOURCE</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-sm text-text-muted">
                          <div className="flex items-center gap-2">
                            <Clock className="size-4" /> {new Date(project.createdAt).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className={cn(
                            "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase",
                            project.status === 'completed' ? "bg-green-500/10 text-green-500" :
                            project.status === 'failed' ? "bg-red-500/10 text-red-500" :
                            "bg-yellow-500/10 text-yellow-500"
                          )}>{project.status}</span>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            {project.status === 'completed' && (
                              <a href={api.downloadProject(project.id)} className="p-2 hover:bg-white/10 rounded-lg text-text-muted hover:text-primary transition-colors" title="Download ZIP">
                                <Download className="size-4" />
                              </a>
                            )}
                            <button onClick={() => setDeleteConfirm(project.id)} className="p-2 hover:bg-white/10 rounded-lg text-text-muted hover:text-red-500 transition-colors" title="Delete">
                              <Trash2 className="size-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>

      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-surface border border-white/10 rounded-2xl p-8 max-w-sm w-full mx-4 shadow-2xl">
            <h3 className="text-lg font-bold mb-2">Delete Project</h3>
            <p className="text-text-muted text-sm mb-6">Are you sure you want to delete this project? This action cannot be undone.</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 rounded-xl border border-white/10 hover:bg-white/5 text-sm font-medium transition-colors">Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="px-4 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-colors">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
