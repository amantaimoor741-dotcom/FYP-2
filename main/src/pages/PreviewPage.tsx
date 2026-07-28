import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Laptop, Smartphone, Tablet, Download, ChevronLeft, Share2, Globe, ExternalLink } from 'lucide-react';
import { Button } from '../components/Shared';
import { Page } from '../types';
import { cn } from '../lib/utils';
import { api } from '../lib/api';
import { useProject } from '../context/ProjectContext';

type Device = 'desktop' | 'tablet' | 'mobile';

export default function PreviewPage({ onNavigate }: { onNavigate: (p: Page) => void }) {
  const [device, setDevice] = useState<Device>('desktop');
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { projectId } = useProject();

  useEffect(() => {
    if (projectId) {
      api.getGenerationResult(projectId).then(data => {
        setProject(data);
      }).catch((err) => console.error('Failed to load project result:', err)).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [projectId]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="h-16 border-b border-white/5 px-6 flex items-center justify-between glass-dark sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <button onClick={() => onNavigate('dashboard')} className="p-2 hover:bg-white/5 rounded-lg text-text-muted transition-colors">
            <ChevronLeft className="size-5" />
          </button>
          <div className="h-4 w-[1px] bg-white/10 mx-2" />
          <h1 className="font-bold text-sm">Preview: {project?.name || 'Project'}</h1>
          <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded border border-primary/20 uppercase tracking-widest">Generated</span>
        </div>

        <div className="hidden md:flex items-center bg-white/5 rounded-xl p-1 gap-1">
          {[
            { id: 'desktop' as Device, icon: Laptop },
            { id: 'tablet' as Device, icon: Tablet },
            { id: 'mobile' as Device, icon: Smartphone },
          ].map((item) => (
            <button key={item.id} onClick={() => setDevice(item.id)}
              className={cn("p-2 rounded-lg transition-all", device === item.id ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-text-muted hover:text-text-bright hover:bg-white/5")}
            ><item.icon className="size-4" /></button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          {project?.outputPath && (
            <a href={api.downloadProject(projectId || '')} target="_blank" rel="noopener noreferrer">
              <Button size="sm" variant="accent" className="font-bold">
                <Download className="size-4 mr-2" /> Download ZIP
              </Button>
            </a>
          )}
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <aside className="hidden md:flex w-80 border-r border-white/5 glass-dark flex-col">
          <div className="p-6 space-y-8 flex-1 overflow-y-auto">
            {loading ? (
              <div className="text-center py-12 text-text-muted">Loading...</div>
            ) : !project ? (
              <div className="text-center py-12">
                <Globe className="size-12 text-text-muted mx-auto mb-4 opacity-50" />
                <p className="text-text-muted text-sm">No generated project to preview. Upload and generate a project first.</p>
              </div>
            ) : (
              <>
                <div className="space-y-6">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-text-muted">Project Details</h3>
                  <div className="space-y-3">
                    <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                      <p className="text-[10px] text-text-muted uppercase tracking-wider">Name</p>
                      <p className="text-sm font-bold mt-1">{project.name}</p>
                    </div>
                    <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                      <p className="text-[10px] text-text-muted uppercase tracking-wider">Status</p>
                      <p className="text-sm font-bold mt-1 text-green-500">{project.status}</p>
                    </div>
                    <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                      <p className="text-[10px] text-text-muted uppercase tracking-wider">Document Type</p>
                      <p className="text-sm font-bold mt-1 uppercase">{project.documentType || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {project.documentAnalysis && (
                  <div className="space-y-6">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-text-muted">Analysis Summary</h3>
                    <div className="space-y-2">
                      <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                        <p className="text-[10px] text-text-muted uppercase tracking-wider">Domain</p>
                        <p className="text-sm font-bold mt-1 capitalize">{project.documentAnalysis.domain || 'General'}</p>
                      </div>
                      <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                        <p className="text-[10px] text-text-muted uppercase tracking-wider">Entities Found</p>
                        <p className="text-sm font-bold mt-1">{(project.documentAnalysis.entities || []).length}</p>
                      </div>
                      <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                        <p className="text-[10px] text-text-muted uppercase tracking-wider">Features</p>
                        <p className="text-sm mt-1">{(project.documentAnalysis.features || []).join(', ')}</p>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="p-6 border-t border-white/5">
            <Button className="w-full" variant="primary" onClick={() => onNavigate('dashboard')}>
              Back to Dashboard <ExternalLink className="ml-2 size-4" />
            </Button>
          </div>
        </aside>

        <main className="flex-1 bg-black/40 relative flex items-center justify-center p-2 md:p-4">
          <motion.div layout transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className={cn(
              "bg-white shadow-[0_0_100px_rgba(108,99,255,0.1)] rounded-2xl overflow-hidden",
              device === 'desktop' ? "w-full h-full max-w-5xl" : 
              device === 'tablet' ? "w-[768px] h-[90%]" : "w-[390px] h-[80%]"
            )}
          >
            <div className="h-10 bg-gray-100 border-b border-gray-200 flex items-center px-4 gap-2">
              <div className="flex gap-1.5">
                <div className="size-2.5 rounded-full bg-red-400" />
                <div className="size-2.5 rounded-full bg-yellow-400" />
                <div className="size-2.5 rounded-full bg-green-400" />
              </div>
              <div className="flex-1 max-w-md mx-auto bg-white rounded-md border border-gray-300 h-6 flex items-center px-3 text-[10px] text-gray-500 gap-2">
                <Globe className="size-3" />
                {project?.name ? `generated.app/${project.name.toLowerCase().replace(/\s+/g, '-')}` : 'preview'}
              </div>
            </div>

            <div className="overflow-y-auto h-[calc(100%-40px)] bg-white text-gray-900 font-sans">
              {loading ? (
                <div className="flex items-center justify-center h-full text-gray-400">Loading preview...</div>
              ) : project?.previewUrl ? (
                <iframe src={project.previewUrl} className="w-full h-full border-0" title="Preview" />
              ) : project?.documentAnalysis ? (
                <div className="text-center max-w-lg mx-auto py-12">
                  <h2 className="text-3xl font-bold mb-4">{project.documentAnalysis.title || project.name}</h2>
                  <p className="text-gray-600 mb-8">{project.documentAnalysis.description}</p>
                  <div className="grid grid-cols-2 gap-4 text-left">
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <p className="text-xs text-gray-500 uppercase font-bold mb-1">Domain</p>
                      <p className="font-semibold capitalize">{project.documentAnalysis.domain}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <p className="text-xs text-gray-500 uppercase font-bold mb-1">Entities</p>
                      <p className="font-semibold">{project.documentAnalysis.entities?.length || 0}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-xl col-span-2">
                      <p className="text-xs text-gray-500 uppercase font-bold mb-1">Features</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {(project.documentAnalysis.features || []).slice(0, 6).map((f: string, i: number) => (
                          <span key={i} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">{f}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">Preview will appear here once the site is generated</div>
              )}
              {project?.outputPath && (
                <div className="absolute bottom-4 right-4">
                  <a href={api.downloadProject(projectId || '')} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary/90 transition-colors shadow-lg">
                    <Download className="size-4" /> Download ZIP
                  </a>
                </div>
              )}
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
}
