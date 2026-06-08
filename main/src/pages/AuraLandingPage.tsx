import React from 'react';
import { motion } from 'motion/react';
import { 
  ChevronRight, Menu, Sparkles, Search, Check, ArrowRight, 
  Zap, Layout, Code, FileText, Smartphone, Shield, Globe
} from 'lucide-react';
import { Page } from '../types';

function LogoMark({ className = 'w-8 h-8' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 256 256" fill="currentColor">
      <path d="M 0 128 C 70.692 128 128 185.308 128 256 L 64 256 C 64 220.654 35.346 192 0 192 Z M 256 192 C 220.654 192 192 220.654 192 256 L 128 256 C 128 185.308 185.308 128 256 128 Z M 128 0 C 128 70.692 70.692 128 0 128 L 0 64 C 35.346 64 64 35.346 64 0 Z M 192 0 C 192 35.346 220.654 64 256 64 L 256 128 C 185.308 128 128 70.692 128 0 Z" />
    </svg>
  );
}

function SectionEyebrow({ label, tag }: { label: string; tag?: string }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="w-1.5 h-1.5 rounded-full bg-white" />
      <span className="text-white/50 font-medium">{label}</span>
      {tag && <span className="px-2 py-0.5 rounded-full border border-white/10 text-white/50 text-xs">{tag}</span>}
    </div>
  );
}

export default function AuraLandingPage({ onNavigate }: { onNavigate?: (p: Page) => void }) {
  const [yearly, setYearly] = React.useState(false);

  const fadeUp = (delay = 0) => ({
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] },
  });

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#0c0c0c] text-white selection:bg-brand/30">
      <svg className="absolute w-0 h-0" aria-hidden>
        <filter id="c3-noise">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
          <feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.35 0" />
          <feComposite in2="SourceGraphic" operator="in" result="noise" />
          <feBlend in="SourceGraphic" in2="noise" mode="multiply" />
        </filter>
      </svg>
      <svg className="absolute w-0 h-0" aria-hidden>
        <filter id="c3-noise-pricing">
          <feTurbulence type="fractalNoise" baseFrequency="0.5" numOctaves="2" stitchTiles="stitch" />
          <feComponentTransfer><feFuncA type="linear" slope="0.075" /></feComponentTransfer>
          <feComposite in2="SourceGraphic" operator="in" result="noise" />
          <feBlend in="SourceGraphic" in2="noise" mode="overlay" />
        </filter>
      </svg>

      <div className="fixed inset-0 z-0 pointer-events-none">
        <video autoPlay loop muted playsInline
          className="w-full h-full object-cover pointer-events-none"
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260508_064122_c4750c0e-7476-4b44-94a2-a85a65c63bf2.mp4"
        />
      </div>

      <div className="hidden md:block pointer-events-none fixed inset-y-0 left-1/2 -translate-x-[calc(50%+36rem)] w-px bg-white/10 z-[5]" />
      <div className="hidden md:block pointer-events-none fixed inset-y-0 left-1/2 translate-x-[calc(-50%+36rem)] w-px bg-white/10 z-[5]" />

      {/* NAVBAR */}
      <motion.nav
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative z-10 max-w-6xl mx-auto px-6 py-4 flex items-center justify-between"
      >
        <LogoMark className="w-8 h-8" />
        <div className="hidden md:flex gap-8">
          {['Features', 'Pricing', 'Docs', 'About'].map((link, i) => (
            <motion.a
              key={link}
              href="#"
              onClick={(e) => { e.preventDefault(); if (link === 'Pricing') { return; } if (link === 'About') { onNavigate?.('about'); } }}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 + i * 0.05 }}
              className="text-white/70 text-sm font-medium hover:text-white transition-colors"
            >
              {link}
            </motion.a>
          ))}
        </div>
        <div className="hidden md:flex items-center gap-3">
          <button onClick={() => onNavigate?.('login')} className="text-sm font-medium text-white/70 hover:text-white transition-colors px-4 py-2">
            Log in
          </button>
          <button onClick={() => onNavigate?.('signup')} className="inline-flex items-center justify-center gap-2 rounded-full bg-white text-black font-medium text-sm px-5 py-2.5 transition-all hover:bg-white/90 active:scale-[0.98]">
            Get Started <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <div className="md:hidden">
          <button className="w-10 h-10 rounded-full border border-white/10 bg-white/5 flex items-center justify-center">
            <Menu className="w-4 h-4 text-white/70" />
          </button>
        </div>
      </motion.nav>

      {/* HERO */}
      <section className="relative z-10 pt-16 md:pt-28 pb-20 text-center flex flex-col items-center px-6">
        <motion.h1 {...fadeUp(0.3)} className="text-4xl md:text-7xl font-semibold tracking-tight leading-[0.9]">
          <span className="text-white">Transform documents.</span><br />
          <span
            className="animate-shiny"
            style={{
              backgroundImage: 'linear-gradient(to right, #091020 0%, #0B2551 12.5%, #A4F4FD 32.5%, #00d2ff 50%, #0B2551 67.5%, #091020 87.5%, #091020 100%)',
              backgroundSize: '200% auto',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              color: 'transparent',
              WebkitTextFillColor: 'transparent',
              filter: 'url(#c3-noise)',
            }}
          >
            Into websites
          </span>
        </motion.h1>
        <motion.p {...fadeUp(0.5)} className="mt-8 text-white/60 max-w-md text-base leading-[1.5]">
          Doc2Web AI analyzes your PDFs and Word documents to generate stunning, responsive websites in seconds. Zero code required.
        </motion.p>
        <motion.div {...fadeUp(0.7)} className="mt-8 flex flex-col md:flex-row items-center justify-center gap-4">
          <button onClick={() => onNavigate?.('signup')} className="inline-flex items-center justify-center gap-2 rounded-full bg-white text-black font-medium text-sm px-6 py-3 transition-all hover:bg-white/90 active:scale-[0.98]">
            Start Building <ArrowRight className="w-4 h-4" />
          </button>
          <button onClick={() => onNavigate?.('dashboard')} className="rounded-full border border-white/15 text-white text-sm font-medium px-6 py-3 hover:bg-white/5 transition-colors inline-flex items-center gap-2 group">
            Dashboard <ChevronRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" />
          </button>
        </motion.div>
      </section>

      {/* FEATURES STRIP */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 py-16 md:py-20">
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: FileText, title: 'PDF & DOCX', desc: 'Upload any document — our AI extracts structure, hierarchy, and meaning.' },
            { icon: Zap, title: 'AI Analysis', desc: 'Gemini-powered layout engine understands your content and generates optimal designs.' },
            { icon: Globe, title: 'Live Preview', desc: 'See your website come to life instantly. Download the full ZIP to deploy anywhere.' },
          ].map((f, i) => (
            <motion.div key={f.title} {...fadeUp(0.4 + i * 0.15)} className="liquid-glass rounded-2xl p-6">
              <f.icon className="w-8 h-8 text-[#A4F4FD] mb-4" />
              <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
              <p className="text-sm text-white/50 leading-[1.6]">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* PREVIEW MOCKUP */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 max-w-6xl mx-auto px-6 py-16 md:py-24"
      >
        <div className="rounded-2xl overflow-hidden border border-white/10 bg-[#0e1014]/90 backdrop-blur-2xl">
          <div className="flex items-center gap-2 px-4 h-10 bg-black/40 border-b border-white/5">
            <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
            <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
            <div className="w-3 h-3 rounded-full bg-[#28c840]" />
            <span className="mx-auto text-xs text-white/50">Doc2Web — Preview</span>
          </div>
          <div className="grid grid-cols-12 h-[520px]">
            <div className="col-span-3 border-r border-white/10 bg-black/30 p-4 flex flex-col gap-4">
              <button onClick={() => onNavigate?.('upload')} className="flex items-center justify-center gap-2 rounded-lg bg-white text-black text-xs font-semibold px-3 py-2 hover:bg-white/90 transition-colors">
                <Sparkles className="w-3.5 h-3.5" /> New Project
              </button>
              <nav className="flex flex-col gap-0.5">
                {[
                  { label: 'My Projects', count: 8, active: true },
                  { label: 'Templates' },
                  { label: 'Recent' },
                  { label: 'Starred', count: 3 },
                  { label: 'Archive' },
                ].map((item) => (
                  <div
                    key={item.label}
                    className={`flex items-center justify-between px-3 py-1.5 rounded-lg text-xs cursor-pointer transition-colors ${item.active ? 'bg-white/10 text-white' : 'text-white/60 hover:bg-white/5'}`}
                    onClick={() => item.label === 'My Projects' && onNavigate?.('dashboard')}
                  >
                    <span>{item.label}</span>
                    {item.count && <span className="text-white/40">{item.count}</span>}
                  </div>
                ))}
              </nav>
              <div className="mt-auto">
                <p className="text-[10px] uppercase tracking-wider text-white/40 mb-2">Format</p>
                <div className="flex flex-col gap-1.5">
                  {[
                    { label: 'Modern', color: '#00d2ff' },
                    { label: 'Portfolio', color: '#A4F4FD' },
                    { label: 'Enterprise', color: '#10b981' },
                  ].map((l) => (
                    <div key={l.label} className="flex items-center gap-2 text-xs text-white/50">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: l.color }} /> {l.label}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="col-span-9 overflow-y-auto p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-sm font-semibold text-white">Q3 Roadmap Review</h2>
                  <p className="text-[10px] text-white/40">Generated from Q3_Roadmap_Review.pdf · 12 seconds</p>
                </div>
                <button onClick={() => onNavigate?.('preview')} className="text-[11px] text-[#00d2ff] font-medium hover:underline">Open Preview</button>
              </div>
              <div className="liquid-glass rounded-xl p-4 flex items-start gap-3 mb-6">
                <Sparkles className="w-4 h-4 text-[#A4F4FD] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-white/80">AI Analysis Complete</p>
                  <p className="text-[11px] text-white/50 mt-1 leading-[1.5]">Detected 3 sections, 12 key points, 2 action items. Layout optimized for readability.</p>
                </div>
              </div>
              <div className="bg-white/5 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#00d2ff] to-[#0B2551] flex items-center justify-center text-xs font-bold">DW</div>
                  <div>
                    <p className="text-xs font-medium text-white">Q3 Roadmap Review</p>
                    <p className="text-[10px] text-white/40">Product Team · 12 min read</p>
                  </div>
                </div>
                <div className="space-y-3 text-xs text-white/60 leading-[1.7]">
                  <p className="text-sm font-semibold text-white/80">Executive Summary</p>
                  <p>Q3 focuses on three core pillars: platform reliability, AI feature expansion, and enterprise readiness. Each pillar has dedicated ownership and measurable OKRs.</p>
                  <p className="text-sm font-semibold text-white/80 mt-4">Key Initiatives</p>
                  <ul className="list-disc pl-4 space-y-1">
                    <li>Infrastructure migration to multi-region deployment</li>
                    <li>AI-powered document analysis with real-time feedback</li>
                    <li>Enterprise SSO and role-based access control</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* FEATURE DETAIL */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 py-20 md:py-28">
        <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-start">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <SectionEyebrow label="AI Engine" tag="GPT-4o Mini" />
            <h2 className="mt-5 text-3xl md:text-5xl font-semibold tracking-tight leading-[1.02]">
              From document<br />to website.
            </h2>
            <p className="mt-6 text-white/60 text-base leading-[1.6] max-w-md">
              Upload a PDF or Word doc and our AI analyzes structure, hierarchy, and content. In seconds, you get a fully responsive website with clean code.
            </p>
            <div className="flex flex-wrap gap-2 mt-6">
              {['Semantic analysis', 'Responsive layout', 'Clean code export', 'Theme selection'].map((chip) => (
                <span key={chip} className="text-xs text-white/70 px-3 py-1.5 rounded-full border border-white/10 bg-white/[0.03]">
                  {chip}
                </span>
              ))}
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="liquid-glass rounded-2xl p-5"
          >
            <p className="text-xs text-white/40 mb-4">Processing Pipeline</p>
            <div className="flex flex-col gap-3">
              {[
                { label: 'Document Parsed', color: '#ffffff', items: ['Text extraction', 'Structure detection'] },
                { label: 'AI Analysis', color: '#e5e5e5', items: ['Content scoring', 'Layout recommendation'] },
                { label: 'Code Generation', color: '#a3a3a3', items: ['React + Tailwind', 'Responsive grid'] },
                { label: 'Ready for Export', color: '#525252', items: ['Preview · ZIP · Deploy'] },
              ].map((cat) => (
                <div key={cat.label} className="liquid-glass rounded-lg p-3">
                  <p className="text-xs font-medium mb-2" style={{ color: cat.color }}>{cat.label}</p>
                  {cat.items.map((item) => (
                    <p key={item} className="text-[11px] text-white/50">{item}</p>
                  ))}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* LOGO CLOUD */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 py-16 md:py-20 text-center">
        <p className="text-xs uppercase tracking-widest text-white/40">Trusted by innovators worldwide</p>
        <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-6">
          {['Linear', 'Vercel', 'Figma', 'Stripe', 'Ramp', 'Notion', 'Loom', 'Arc'].map((name, i) => (
            <motion.span
              key={name}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="text-sm font-semibold tracking-tight text-white/50 hover:text-white transition-colors cursor-default"
            >
              {name}
            </motion.span>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 py-20 md:py-28 border-t border-white/10">
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { quote: 'We turned our 50-page product spec into a living website in under a minute. The accuracy is remarkable.', name: 'Parker Wilf', role: 'Group Product Manager', company: 'MERCURY' },
            { quote: 'Generating pitch decks as interactive web pages has changed how we present to investors. Game changer.', name: 'Andrew von Rosenbach', role: 'Senior PM', company: 'COHERE' },
            { quote: 'Our documentation team now publishes from Google Docs directly. Zero manual HTML work.', name: 'Mathies Christensen', role: 'Engineering Manager', company: 'LUNAR' },
          ].map((t, i) => (
            <motion.figure
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="liquid-glass rounded-2xl p-6"
            >
              <blockquote className="text-sm text-white/80 leading-[1.6]">&ldquo;{t.quote}&rdquo;</blockquote>
              <figcaption className="mt-6 pt-5 border-t border-white/10">
                <p className="text-sm font-semibold text-white">{t.name}</p>
                <p className="text-xs text-white/50">{t.role}</p>
                <p className="text-xs text-white font-semibold tracking-wide mt-0.5">{t.company}</p>
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </section>

      {/* PRICING */}
      <section className="c3-pricing-section relative z-10">
        <svg className="absolute w-0 h-0" aria-hidden>
          <filter id="c3-noise">
            <feTurbulence type="fractalNoise" baseFrequency="0.5" numOctaves="2" stitchTiles="stitch" />
            <feComponentTransfer><feFuncA type="linear" slope="0.075" /></feComponentTransfer>
            <feComposite in2="SourceGraphic" operator="in" result="noise" />
            <feBlend in="SourceGraphic" in2="noise" mode="overlay" />
          </filter>
        </svg>

        <div className="c3-watermark-container">
          <div className="c3-watermark-main">
            <span className="c3-watermark-line-1">Doc to Web.</span>
            <span className="c3-watermark-line-2">Generated</span>
          </div>
        </div>

        <div className="c3-grid">
          {[
            {
              tier: 'Free',
              monthly: '$0',
              yearly: '$0',
              desc: 'For creators taking their first steps with Doc2Web.',
              features: ['3 AI generations', 'Standard themes', 'Public URL sharing', 'Community support'],
              pro: false,
            },
            {
              tier: 'Pro',
              monthly: '$19,99/m',
              yearly: '$199,99/y',
              desc: 'For professionals who need unlimited power and premium features.',
              features: ['Unlimited generations', 'All premium themes', 'ZIP code export', 'Priority AI model access', 'Custom domain support'],
              pro: true,
            },
            {
              tier: 'Enterprise',
              monthly: '$99,99/m',
              yearly: '$999,99/y',
              desc: 'For teams needing advanced controls and dedicated infrastructure.',
              features: ['Bulk document upload', 'Custom theme API', 'SLA guarantee', 'Dedicated support', 'SSO & advanced security'],
              pro: false,
            },
          ].map((plan, i) => (
            <div key={i} className={`c3-card ${plan.pro ? 'c3-card-pro' : ''}`}>
              <span className="c3-tier-small">{plan.tier}</span>
              <span className="c3-tier-large">{yearly ? plan.yearly : plan.monthly}</span>
              <p className="c3-desc">{plan.desc}</p>
              <ul className="c3-list">
                {plan.features.map((f) => (
                  <li key={f}>
                    <span className="c3-check">
                      <Check className="w-3 h-3 text-white/80" />
                    </span>
                    {f}
                  </li>
                ))}
              </ul>
              <button onClick={() => onNavigate?.(plan.tier === 'Enterprise' ? 'contact' : 'signup')} className="c3-btn">Choose Plan</button>
            </div>
          ))}
        </div>

        <div className="c3-toggle-wrap">
          <span className="text-xs text-white/50">Yearly</span>
          <button
            className={`c3-toggle ${yearly ? 'active' : ''}`}
            onClick={() => setYearly(!yearly)}
          >
            <span className="c3-toggle-knob" />
          </button>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 py-20 md:py-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="liquid-glass relative overflow-hidden rounded-3xl px-8 py-16 md:py-24 text-center"
        >
          <div
            className="absolute inset-0 pointer-events-none opacity-30"
            style={{ background: 'radial-gradient(600px circle at 50% 0%, rgba(255,255,255,0.15), transparent 70%)' }}
          />
          <div className="relative z-10">
            <h2 className="text-4xl md:text-6xl font-semibold tracking-tight leading-[1.02]">
              Ready to transform<br />your documents?
            </h2>
            <p className="mt-6 text-white/60 max-w-md mx-auto text-sm leading-[1.6]">
              Join thousands who convert PDFs and Word docs into stunning websites with AI. No code, no waiting.
            </p>
            <div className="mt-8 flex flex-col md:flex-row items-center justify-center gap-4">
              <button onClick={() => onNavigate?.('signup')} className="inline-flex items-center justify-center gap-2 rounded-full bg-white text-black font-medium text-sm px-6 py-3 transition-all hover:bg-white/90 active:scale-[0.98]">
                Get Started Free <ArrowRight className="w-4 h-4" />
              </button>
              <button onClick={() => onNavigate?.('dashboard')} className="rounded-full border border-white/15 text-white text-sm font-medium px-6 py-3 hover:bg-white/5 transition-colors inline-flex items-center gap-2 group">
                Go to Dashboard <ChevronRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" />
              </button>
            </div>
          </div>
        </motion.div>
      </section>

      {/* FOOTER */}
      <footer className="relative z-10 max-w-6xl mx-auto px-6 py-12 border-t border-white/10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-white/40">
            <LogoMark className="w-5 h-5" />
            <span>Doc2Web AI</span>
          </div>
          <div className="flex gap-6 text-xs text-white/40">
            <button onClick={() => onNavigate?.('about')} className="hover:text-white/70 transition-colors">About</button>
            <button onClick={() => onNavigate?.('contact')} className="hover:text-white/70 transition-colors">Contact</button>
            <button onClick={() => onNavigate?.('settings')} className="hover:text-white/70 transition-colors">Settings</button>
          </div>
          <p className="text-xs text-white/30">© 2026 Doc2Web AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
