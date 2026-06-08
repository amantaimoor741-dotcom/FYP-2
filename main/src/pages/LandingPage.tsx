import React from 'react';
import { motion } from 'motion/react';
import { 
  ArrowRight, 
  Zap, 
  Layout, 
  Code, 
  Smartphone, 
  CheckCircle2, 
  FileText,
  Play,
  Star,
  Quote,
  Sparkles
} from 'lucide-react';
import { Button, Navbar, Footer } from '../components/Shared';
import { Page } from '../types';

export default function LandingPage({ onNavigate }: { onNavigate: (p: Page) => void }) {
  return (
    <div className="min-h-screen">
      <Navbar onNavigate={onNavigate} transparent />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Animated Background Blobs */}
        <div className="absolute top-0 -left-4 w-72 h-72 bg-primary/20 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob" />
        <div className="absolute top-0 -right-4 w-72 h-72 bg-secondary/20 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000" />
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-accent/20 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000" />
        
        <div className="max-w-7xl mx-auto px-6 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border border-white/10 text-xs font-semibold text-primary mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              Next-Gen AI Generation is live
            </div>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-display font-black tracking-tight mb-8 leading-[1.05]">
              Transform <span className="text-gradient">PDF & Word</span><br />
              into Stunning Websites
            </h1>
            <p className="max-w-2xl mx-auto text-text-muted text-lg md:text-xl mb-12 leading-relaxed">
              Experience the future of content conversion. Our AI analyzes your documents to generate high-performance, responsive websites with zero code.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button onClick={() => onNavigate('signup')} size="lg" className="w-full sm:w-auto h-14 text-lg">
                Generate Website Now <ArrowRight className="ml-2 size-5" />
              </Button>
              <Button onClick={() => onNavigate('dashboard')} variant="outline" size="lg" className="w-full sm:w-auto h-14 text-lg">
                <Play className="mr-2 size-5 fill-current" /> Try Demo
              </Button>
            </div>
            
            <div className="mt-16 flex items-center justify-center gap-8 opacity-50 grayscale hover:grayscale-0 transition-all">
              <span className="font-display font-bold text-xl tracking-tighter">VERCEL</span>
              <span className="font-display font-bold text-xl tracking-tighter">LINEAR</span>
              <span className="font-display font-bold text-xl tracking-tighter">STRIPE</span>
              <span className="font-display font-bold text-xl tracking-tighter">FRAMER</span>
            </div>
          </motion.div>

          {/* Product Preview */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="mt-20 relative px-4 sm:px-10 lg:px-20"
          >
            <div className="relative rounded-2xl border border-white/10 bg-card p-2 shadow-[0_0_100px_rgba(108,99,255,0.15)] overflow-hidden group">
              <div className="absolute inset-0 bg-linear-to-tr from-primary/5 to-transparent pointer-events-none" />
              <img 
                src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=2426&h=1200" 
                alt="Product Interface" 
                className="rounded-xl border border-white/5 w-full shadow-2xl group-hover:scale-[1.01] transition-transform duration-700"
                referrerPolicy="no-referrer"
              />
              {/* Floating UI Elements */}
              <div className="absolute top-10 left-10 p-4 glass rounded-xl shadow-2xl hidden md:block">
                <div className="flex items-center gap-3">
                  <div className="size-8 rounded-full bg-green-500/20 flex items-center justify-center">
                    <CheckCircle2 className="size-5 text-green-500" />
                  </div>
                  <div>
                    <p className="text-xs font-bold">Optimization Success</p>
                    <p className="text-[10px] text-text-muted">SEO & Performance score 98/100</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-card/50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">Designed for Performance</h2>
            <p className="text-text-muted max-w-2xl mx-auto">
              DocuWeb AI isn't just a converter. It's a professional-grade web engine that understands content hierarchy and design patterns.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: Zap, title: "Instant Translation", desc: "Our engine converts 100+ page documents into multi-page SPA websites in under 60 seconds." },
              { icon: Layout, title: "Layout Analysis", desc: "AI-driven detection of headers, navigation, footers, and grid systems for pixel-perfect results." },
              { icon: Code, title: "Clean Code Export", desc: "Get production-ready React or HTML/CSS code exported in a clean, maintainable ZIP file." },
              { icon: Smartphone, title: "Fully Responsive", desc: "Every generated site is automatically optimized for mobile, tablet, and desktop viewports." },
              { icon: FileText, title: "Smart Extraction", desc: "NLP-powered text processing ensures that semantic meaning and information flow are preserved." },
              { icon: Sparkles, title: "Theme Engine", desc: "Apply stunning modern layouts with one click using our high-end design preset library." }
            ].map((f, i) => (
              <motion.div 
                key={i}
                whileHover={{ y: -5 }}
                className="p-8 rounded-2xl bg-background border border-white/5 hover:border-primary/20 transition-all group"
              >
                <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary group-hover:scale-110 transition-all">
                  <f.icon className="size-6 text-primary group-hover:text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3">{f.title}</h3>
                <p className="text-text-muted text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row gap-16 items-center">
            <div className="flex-1">
              <div className="flex gap-1 mb-6 text-accent">
                {[1,2,3,4,5].map(i => <Star key={i} className="size-5 fill-current" />)}
              </div>
              <h2 className="text-4xl md:text-5xl font-display font-bold mb-8 leading-tight">
                "DocuWeb AI reduced our development timeline from <span className="text-primary italic">weeks to minutes</span>."
              </h2>
              <div className="flex items-center gap-4">
                <img src="https://i.pravatar.cc/150?u=1" className="size-14 rounded-full border-2 border-primary" />
                <div>
                  <p className="font-bold">Sarah Jenkins</p>
                  <p className="text-sm text-text-muted">CTO @ InnovateFlow</p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 flex-1">
              <div className="space-y-4">
                <div className="p-6 glass rounded-2xl mt-12">
                  <Quote className="size-8 text-primary/20 mb-4" />
                  <p className="text-sm italic mb-4 text-text-bright">"The cleanest React code export I've seen from an AI tool."</p>
                  <p className="text-xs font-bold">— Mark Thompson</p>
                </div>
                <div className="p-6 glass rounded-2xl">
                  <Quote className="size-8 text-primary/20 mb-4" />
                  <p className="text-sm italic mb-4 text-text-bright">"Perfect for rapid prototyping and internal documentation sites."</p>
                  <p className="text-xs font-bold">— Elena Rodriguez</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="p-6 glass rounded-2xl">
                  <Quote className="size-8 text-primary/20 mb-4" />
                  <p className="text-sm italic mb-4 text-text-bright">"Incredible accuracy in table and chart detection."</p>
                  <p className="text-xs font-bold">— James Wilson</p>
                </div>
                <div className="p-6 glass rounded-2xl mt-12">
                  <Quote className="size-8 text-primary/20 mb-4" />
                  <p className="text-sm italic mb-4 text-text-bright">"Game changer for our legal department. Now all policies are searchable."</p>
                  <p className="text-xs font-bold">— Priya Sharma</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="max-w-5xl mx-auto px-6">
          <div className="relative rounded-3xl overflow-hidden p-12 md:p-20 text-center">
            <div className="absolute inset-0 bg-linear-to-br from-primary via-secondary to-accent opacity-90" />
            <div className="relative z-10">
              <h2 className="text-4xl md:text-6xl font-display font-black text-white mb-8 tracking-tight">Ready to build the future?</h2>
              <p className="text-white/80 text-lg md:text-xl mb-12 max-w-2xl mx-auto">
                Join 10,000+ creators building stunning websites from their documents today.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button variant="accent" size="lg" onClick={() => onNavigate('signup')} className="w-full sm:w-auto h-14 px-10 text-xl font-bold">
                  Get Started Free
                </Button>
                <Button variant="outline" size="lg" onClick={() => onNavigate('contact')} className="w-full sm:w-auto h-14 px-10 text-xl border-white/30 text-white hover:bg-white/10">
                  Talk to Sales
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer onNavigate={onNavigate} />
    </div>
  );
}
