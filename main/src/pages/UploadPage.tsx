import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileUp, 
  Upload, 
  X, 
  FileText, 
  Check, 
  Sparkles, 
  ChevronRight, 
  Info,
  Layout,
  Palette,
  Type
} from 'lucide-react';
import { Sidebar, Button } from '../components/Shared';
import { Page, Theme } from '../types';
import { cn } from '../lib/utils';
import { useProject } from '../context/ProjectContext';

export default function UploadPage({ onNavigate }: { onNavigate: (p: Page) => void }) {
  const { setProjectId } = useProject();
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState<Theme>('modern');
  const [selectedModel, setSelectedModel] = useState('openai/gpt-4o-mini');
  const [aiConfig, setAiConfig] = useState<Record<string, boolean>>({
    headings: true,
    nav: true,
    images: true,
    seo: false,
  });
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && (droppedFile.type === 'application/pdf' || droppedFile.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')) {
      setFile(droppedFile);
      setError(null);
    }
  };

  const handleGenerate = async () => {
    if (!file) return;
    setIsUploading(true);
    setError(null);
    try {
      const api = (await import('../lib/api')).api;
      const uploadRes = await api.uploadDocument(file);
      const genRes = await api.startGeneration(
        uploadRes.document.id,
        file.name.replace(/\.[^/.]+$/, ''),
        { theme: selectedTheme, config: aiConfig, model: selectedModel }
      );
      setProjectId(genRes.projectId);
      onNavigate('processing');
    } catch (err: any) {
      setError(err.message || 'Upload failed. Check that the backend server is running on port 4000.');
    } finally {
      setIsUploading(false);
    }
  };

  const themes: { id: Theme; title: string, desc: string, img: string }[] = [
    { id: 'modern', title: 'Modern SaaS', desc: 'Clean, professional, dark-mode focused UI.', img: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=400&h=250' },
    { id: 'portfolio', title: 'Creative Studio', desc: 'Bold typography with high-fidelity visuals.', img: 'https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&q=80&w=400&h=250' },
    { id: 'enterprise', title: 'Enterprise Hub', desc: 'Structured, data-dense, reliable corporate look.', img: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=400&h=250' }
  ];

  return (
    <div className="flex min-h-screen bg-background text-text-bright">
      <Sidebar currentPage="upload" onNavigate={onNavigate} />
      
      <main className="flex-1 flex flex-col items-center py-12 px-6 overflow-y-auto">
        <div className="max-w-4xl w-full">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-display font-black tracking-tight mb-4">Create New Website</h1>
            <p className="text-text-muted">Upload your document and let our AI handle the rest.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Upload Area */}
            <div className="lg:col-span-2 space-y-8">
              <div 
                className={cn(
                  "relative rounded-[24px] border-2 border-dashed transition-all p-12 text-center h-[420px] flex items-center justify-center overflow-hidden",
                  isDragging ? "border-primary bg-primary/5 scale-[1.01]" : "border-white/10 hover:border-primary bg-card",
                  file ? "border-primary/50 bg-primary/5" : ""
                )}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={onDrop}
              >
                {/* Sleek Scan Line */}
                {!file && <div className="scan-line" />}
                
                <AnimatePresence mode="wait">
                  {!file ? (
                    <motion.div
                      key="upload"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex flex-col items-center relative z-10"
                    >
                      <div className="text-5xl mb-6 grayscale hover:grayscale-0 transition-all cursor-default">📄</div>
                      <h3 className="text-2xl font-bold mb-2 tracking-tight">Upload Document</h3>
                      <p className="text-text-muted text-sm mb-12 max-w-xs mx-auto leading-relaxed">
                        Drag and drop your PDF or Word document here<br />to start the AI transformation process.
                      </p>
                      <label className="cursor-pointer">
                        <input type="file" className="hidden" onChange={(e) => { setError(null); e.target.files && setFile(e.target.files[0]); }} accept=".pdf,.docx,.txt" />
                        <span className="btn-gradient px-10 py-3 rounded-xl font-bold transition-all inline-block shadow-primary text-white">
                          Generate Website
                        </span>
                      </label>

                      <div className="mt-12 flex gap-8">
                        <div className="text-center">
                          <p className="text-xl font-extrabold">12s</p>
                          <p className="text-[10px] text-text-muted uppercase tracking-widest font-black">Avg. Build</p>
                        </div>
                        <div className="w-[1px] bg-white/10" />
                        <div className="text-center">
                          <p className="text-xl font-extrabold">99%</p>
                          <p className="text-[10px] text-text-muted uppercase tracking-widest font-black">Accuracy</p>
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="file"
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="flex flex-col items-center"
                    >
                      <div className="size-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 relative">
                        <FileText className="size-10 text-primary" />
                        <button 
                          onClick={() => setFile(null)}
                          className="absolute -top-1 -right-1 size-6 bg-red-500 rounded-full flex items-center justify-center hover:scale-110 transition-transform"
                        >
                          <X className="size-4 text-white" />
                        </button>
                      </div>
                      <h3 className="text-xl font-bold mb-1 truncate max-w-[250px]">{file.name}</h3>
                      <p className="text-text-muted text-sm mb-6">{(file.size / (1024 * 1024)).toFixed(2)} MB • Ready for processing</p>
                      <Button onClick={handleGenerate} disabled={isUploading} size="lg" className="px-12">{isUploading ? 'Uploading...' : 'Start Generation'}</Button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Theme Selection */}
              <div>
                <h3 className="text-xl font-bold mb-6 flex items-center gap-3 tracking-tighter">
                  <Palette className="size-5 text-primary" />
                  Choose Your Theme
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {themes.map((theme) => (
                    <button
                      key={theme.id}
                      onClick={() => setSelectedTheme(theme.id)}
                      className={cn(
                        "group relative rounded-2xl border transition-all text-left overflow-hidden",
                        selectedTheme === theme.id ? "border-primary ring-2 ring-primary/20" : "border-white/5 hover:border-white/10 grayscale-[0.5] hover:grayscale-0"
                      )}
                    >
                      <div className="h-28 overflow-hidden">
                        <img src={theme.img} className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500" />
                      </div>
                      <div className="p-4 bg-card">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm font-bold">{theme.title}</p>
                          {selectedTheme === theme.id && <Check className="size-4 text-primary" />}
                        </div>
                        <p className="text-[10px] text-text-muted leading-relaxed line-clamp-2">{theme.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* AI Settings / Configuration */}
            <div className="space-y-6">
              <div className="p-6 rounded-3xl bg-card border border-white/5 shadow-2xl space-y-6">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <Sparkles className="size-5 text-primary" />
                  AI Configuration
                </h3>
                
                <div className="mb-4 p-3 rounded-xl bg-white/5 border border-white/10">
                  <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest block mb-2">AI Model</label>
                  <select
                    value={selectedModel}
                    onChange={e => setSelectedModel(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-lg py-2 px-3 text-sm text-white focus:outline-none focus:border-primary/50"
                  >
                    <option value="openai/gpt-4o-mini">GPT-4o Mini (Fast)</option>
                    <option value="openai/gpt-4o">GPT-4o (Powerful)</option>
                  </select>
                </div>
                <div className="space-y-4">
                  {[
                    { id: 'headings', label: 'Detect Hierarchies' },
                    { id: 'nav', label: 'Auto-Navigation' },
                    { id: 'images', label: 'Extract Images' },
                    { id: 'seo', label: 'Meta Optimization' },
                  ].map((cfg) => (
                    <label key={cfg.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-all cursor-pointer group">
                      <span className="text-sm text-text-muted group-hover:text-text-bright transition-colors font-medium">{cfg.label}</span>
                      <div className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={aiConfig[cfg.id]}
                          onChange={() => setAiConfig(prev => ({ ...prev, [cfg.id]: !prev[cfg.id] }))}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-1 after:left-1 after:bg-text-bright after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary" />
                      </div>
                    </label>
                  ))}
                </div>

                <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-[10px] text-text-muted flex items-start gap-3">
                  <Info className="size-4 text-primary shrink-0" />
                  <p>Choosing "Meta Optimization" may increase processing time by up to 30 seconds as AI performs deeper keyword analysis.</p>
                </div>

                <hr className="border-white/5" />

                <div className="pt-2">
                  <Button 
                    className="w-full py-6 text-xl rounded-2xl flex items-center justify-center gap-3"
                    disabled={!file || isUploading}
                    onClick={handleGenerate}
                  >
                    Generate Website <ChevronRight className="size-6" />
                  </Button>
                  <p className="text-center text-[10px] text-text-muted mt-4 uppercase tracking-widest font-bold">Estimated Time: 45s</p>
                </div>
              </div>
              
              {/* Promotion / Upsell */}
              <div className="p-6 rounded-3xl bg-linear-to-br from-primary/10 to-transparent border border-primary/20 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-150 transition-transform">
                  <Layout className="size-20" />
                </div>
                <h4 className="font-bold mb-2">Need Custom Code?</h4>
                <p className="text-xs text-text-muted mb-4">Pro users can export sites directly as Framer components or Next.js projects.</p>
                <button onClick={() => onNavigate('pricing')} className="text-xs font-bold text-primary hover:underline flex items-center gap-1">Upgrade to Pro <ChevronRight className="size-3" /></button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
