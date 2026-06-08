import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  CheckCircle2, 
  Loader2, 
  FileSearch, 
  Settings2, 
  Globe, 
  ShieldCheck,
  Cpu,
  LayoutTemplate,
  AlertCircle
} from 'lucide-react';
import { Page } from '../types';
import { cn } from '../lib/utils';
import { api } from '../lib/api';

import { useProject } from '../context/ProjectContext';

const steps = [
  { id: 'analyzing', label: 'Scanning Document Content', icon: FileSearch },
  { id: 'reasoning', label: 'Analyzing NLP & Hierarchy', icon: Settings2 },
  { id: 'generating', label: 'Generating Layout Grids', icon: LayoutTemplate },
  { id: 'completed', label: 'Optimizing Responsive Views', icon: Globe },
  { id: 'packaging', label: 'Packaging Assets & ZIP', icon: ShieldCheck },
];

const statusToStep: Record<string, number> = {
  analyzing: 0,
  reasoning: 1,
  generating: 2,
  completed: 3,
  failed: -1,
};

export default function ProcessingPage({ onNavigate }: { onNavigate: (p: Page) => void }) {
  const { projectId } = useProject();
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!projectId) {
      setError('No active generation. Please upload a document first.');
      return;
    }

    let pollTimer: ReturnType<typeof setInterval>;
    let mounted = true;

    const poll = async () => {
      try {
        const status = await api.getGenerationStatus(projectId);
        if (!mounted) return;

        const stepIdx = statusToStep[status.status] ?? 0;
        setCurrentStep(stepIdx);

        if (status.status === 'completed') {
          clearInterval(pollTimer);
          setProgress(100);
          setTimeout(() => onNavigate('preview'), 1500);
        } else if (status.status === 'failed') {
          clearInterval(pollTimer);
          setError(status.error || 'Generation failed');
        } else {
          setProgress(prev => Math.min(prev + 2, 95));
        }
      } catch (err: any) {
        if (mounted) setError(err.message);
      }
    };

    pollTimer = setInterval(poll, 2000);
    poll();

    return () => { mounted = false; clearInterval(pollTimer); };
  }, [projectId]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 overflow-hidden relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(108,99,255,0.1),transparent)] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-white/5 rounded-full opacity-20 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-white/5 rounded-full opacity-40 pointer-events-none" />

      <div className="max-w-3xl w-full text-center relative z-10">
        {error ? (
          <div className="p-8 rounded-2xl bg-red-500/10 border border-red-500/20">
            <AlertCircle className="size-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Generation Failed</h2>
            <p className="text-text-muted mb-6">{error}</p>
            <button onClick={() => onNavigate('upload')} className="px-6 py-3 bg-primary rounded-xl font-bold hover:bg-primary/90 transition-colors">
              Try Again
            </button>
          </div>
        ) : (
          <>
            <div className="relative size-64 mx-auto mb-16">
              <svg className="size-full -rotate-90">
                <circle cx="128" cy="128" r="120" className="stroke-white/5 fill-none" strokeWidth="8" />
                <motion.circle 
                  cx="128" cy="128" r="120" 
                  className="stroke-primary fill-none" 
                  strokeWidth="8" 
                  strokeDasharray="754"
                  strokeDashoffset={754 - (754 * progress) / 100}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 2 }}>
                  <Sparkles className="size-12 text-primary mb-2" />
                </motion.div>
                <span className="text-5xl font-display font-black leading-none">{progress}%</span>
                <span className="text-text-muted text-xs uppercase tracking-widest font-bold mt-2">Neural Link Active</span>
              </div>
              <div className="absolute inset-0 rotate-anim">
                <div className="size-full border-2 border-primary/20 rounded-full border-dashed" />
              </div>
            </div>

            <h1 className="text-4xl font-display font-black tracking-tight mb-4">Analyzing Your Document</h1>
            <p className="text-text-muted mb-12">Building a responsive semantic digital twin of your document.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
              {steps.map((step, idx) => (
                <motion.div 
                  key={step.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: idx <= currentStep ? 1 : 0.3, x: 0, scale: idx === currentStep ? 1.02 : 1 }}
                  className={cn(
                    "p-4 rounded-2xl border transition-all flex items-center gap-4",
                    idx === currentStep ? "bg-white/5 border-primary/30 shadow-[0_0_20px_rgba(108,99,255,0.1)]" : 
                    idx < currentStep ? "bg-primary/5 border-white/5" : "bg-white/5 border-white/5"
                  )}
                >
                  <div className={cn(
                    "size-10 rounded-xl flex items-center justify-center transition-colors",
                    idx === currentStep ? "bg-primary/20 text-primary" : 
                    idx < currentStep ? "bg-green-500/20 text-green-500" : "bg-white/5 text-text-muted"
                  )}>
                    {idx < currentStep ? <CheckCircle2 className="size-5" /> : 
                     idx === currentStep ? <Loader2 className="size-5 animate-spin" /> : 
                     <step.icon className="size-5" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold">{step.label}</p>
                    <div className="h-1 w-full bg-white/5 rounded-full mt-2 overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: idx < currentStep ? '100%' : idx === currentStep ? `${(progress % 25) * 4}%` : '0%' }}
                        className={cn("h-full", idx === currentStep ? "bg-primary" : "bg-green-500")}
                      />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="mt-12 flex items-center justify-center gap-6">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full glass border border-white/5 text-[10px] text-text-muted font-bold tracking-widest uppercase">
                <Cpu className="size-3 text-primary" />
                Node Engine Active
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full glass border border-white/5 text-[10px] text-text-muted font-bold tracking-widest uppercase">
                <Globe className="size-3 text-accent" />
                Processing
              </div>
            </div>
          </>
        )}
      </div>

      <style>{`
        .rotate-anim { animation: spin 20s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
