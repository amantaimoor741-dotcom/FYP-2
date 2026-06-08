import React from 'react';
import { motion } from 'motion/react';
import { 
  Check, 
  ArrowRight, 
  Sparkles, 
  Zap, 
  Shield, 
  Users, 
  Globe, 
  MessageSquare
} from 'lucide-react';
import { Button, Navbar, Footer } from '../components/Shared';
import { Page } from '../types';
import { cn } from '../lib/utils';

export function PricingPage({ onNavigate }: { onNavigate: (p: Page) => void }) {
  const plans = [
    { 
      name: 'Starter', 
      price: '0', 
      desc: 'Perfect for exploring AI website generation.', 
      features: ['3 AI Generations', 'Standard Themes', 'Public URL', 'Community Support'],
      cta: 'Start for Free',
      popular: false
    },
    { 
      name: 'Professional', 
      price: '29', 
      desc: 'The complete toolkit for individual creators.', 
      features: ['Unlimited Generations', 'All Premium Themes', 'ZIP Code Export', 'Priority AI Model Access', 'Custom Domain Support'],
      cta: 'Get Started',
      popular: true
    },
    { 
      name: 'Enterprise', 
      price: '99', 
      desc: 'Advanced controls for teams and companies.', 
      features: ['Bulk Document Upload', 'Custom Theme API', 'SLA Guarantee', 'Dedicated Support', 'SSO & Advanced Security'],
      cta: 'Contact Sales',
      popular: false
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar onNavigate={onNavigate} />
      
      <div className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-7xl font-display font-black tracking-tight mb-6">Simple, Transparent <span className="text-gradient">Pricing</span></h1>
            <p className="text-text-muted text-lg max-w-2xl mx-auto">Choose the plan that fits your vision. All plans include our core AI layout engine.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan, i) => (
              <motion.div 
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={cn(
                  "p-8 rounded-3xl border flex flex-col relative overflow-hidden",
                  plan.popular ? "bg-primary border-primary shadow-2xl scale-105 z-10" : "bg-card border-white/5"
                )}
              >
                {plan.popular && (
                  <div className="absolute top-0 right-0 p-3 bg-accent text-background text-[10px] uppercase font-black tracking-widest rounded-bl-xl">
                    Most Popular
                  </div>
                )}
                
                <h3 className={cn("text-xl font-bold mb-2", plan.popular ? "text-white" : "text-text-bright")}>{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className={cn("text-4xl font-display font-black", plan.popular ? "text-white" : "text-text-bright")}>${plan.price}</span>
                  <span className={plan.popular ? "text-white/60 text-sm" : "text-text-muted text-sm"}>/month</span>
                </div>
                <p className={cn("text-sm mb-8", plan.popular ? "text-white/80" : "text-text-muted")}>{plan.desc}</p>
                
                <ul className="space-y-4 mb-10 flex-1">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-start gap-3">
                      <div className={cn("size-5 rounded-full flex items-center justify-center mt-0.5", plan.popular ? "bg-white/20 text-white" : "bg-primary/10 text-primary")}>
                        <Check className="size-3" />
                      </div>
                      <span className={cn("text-sm", plan.popular ? "text-white/90" : "text-text-muted")}>{f}</span>
                    </li>
                  ))}
                </ul>

                <Button 
                  variant={plan.popular ? 'accent' : 'outline'} 
                  className={cn("w-full py-4 text-base font-bold", !plan.popular && "bg-white/5 border-white/10 hover:bg-white/10")}
                  onClick={() => onNavigate(plan.name === 'Enterprise' ? 'contact' : 'signup')}
                >
                  {plan.cta}
                </Button>
              </motion.div>
            ))}
          </div>

          <div className="mt-20 p-10 rounded-3xl glass border border-white/5 flex flex-col md:flex-row items-center justify-between gap-8">
            <div>
              <h3 className="text-2xl font-bold mb-2">Need a custom enterprise solution?</h3>
              <p className="text-text-muted text-sm max-w-xl">We offer custom AI model training on your specific brand guidelines for high-fidelity corporate output.</p>
            </div>
            <Button variant="primary" size="lg" className="shrink-0">Let's Talk <ArrowRight className="ml-2 size-5" /></Button>
          </div>
        </div>
      </div>

      <Footer onNavigate={onNavigate} />
    </div>
  );
}

export function AboutPage({ onNavigate }: { onNavigate: (p: Page) => void }) {
  return (
    <div className="min-h-screen bg-background">
      <Navbar onNavigate={onNavigate} />
      
      <div className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-20 text-gradient">
             <h1 className="text-5xl md:text-7xl font-display font-black tracking-tighter mb-4">Paper to Pixel.</h1>
          </div>

          <div className="space-y-12">
            <section className="space-y-6">
              <h2 className="text-3xl font-bold">Our Vision</h2>
              <p className="text-text-muted text-lg leading-relaxed">
                DocuWeb AI started with a simple question: Why is website building still a manual bottleneck when AI can understand content better than ever? We set out to bridge the gap between static knowledge stores (PDFs, Docs, Papers) and the dynamic web.
              </p>
              <p className="text-text-muted text-lg leading-relaxed">
                Our mission is to democratize high-fidelity web production, allowing researchers, educators, and businesses to turn their insights into interactive experiences in seconds.
              </p>
            </section>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="p-8 rounded-3xl bg-card border border-white/5">
                  <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 text-primary">
                    <Zap className="size-6" />
                  </div>
                  <h3 className="text-xl font-bold mb-4 text-text-bright">Speed First</h3>
                  <p className="text-text-muted text-sm leading-relaxed">We optimize for the 60-second generation. No more waiting days for design mockups.</p>
               </div>
               <div className="p-8 rounded-3xl bg-card border border-white/5">
                  <div className="size-12 rounded-2xl bg-secondary/10 flex items-center justify-center mb-6 text-secondary">
                    <Shield className="size-6" />
                  </div>
                  <h3 className="text-xl font-bold mb-4 text-text-bright">Neural Accuracy</h3>
                  <p className="text-text-muted text-sm leading-relaxed">Our AI understands semantic hierarchy, not just character placement.</p>
               </div>
            </div>

            <section className="py-12 border-t border-white/5 space-y-8">
              <h2 className="text-3xl font-bold text-center">Global Impact</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center uppercase tracking-widest font-black">
                <div className="space-y-1">
                  <p className="text-4xl text-primary">10k+</p>
                  <p className="text-[10px] text-text-muted italic">Users</p>
                </div>
                <div className="space-y-1">
                  <p className="text-4xl text-secondary">500k+</p>
                  <p className="text-[10px] text-text-muted italic">Pages</p>
                </div>
                <div className="space-y-1">
                  <p className="text-4xl text-accent">99%</p>
                  <p className="text-[10px] text-text-muted italic">Accuracy</p>
                </div>
                <div className="space-y-1">
                  <p className="text-4xl text-text-bright">12s</p>
                  <p className="text-[10px] text-text-muted italic">Avg Time</p>
                </div>
              </div>
            </section>

            <section className="text-center bg-linear-to-br from-primary/10 to-transparent p-12 rounded-3xl border border-primary/20 space-y-6">
              <h2 className="text-3xl font-bold">Join the Movement</h2>
              <p className="text-text-muted max-w-md mx-auto">We're always looking for brilliant minds to help us redefine the digital document.</p>
              <Button size="lg" onClick={() => onNavigate('contact')}>Contact Us</Button>
            </section>
          </div>
        </div>
      </div>

      <Footer onNavigate={onNavigate} />
    </div>
  );
}

export function ContactPage({ onNavigate }: { onNavigate: (p: Page) => void }) {
  const [form, setForm] = React.useState({ firstName: '', lastName: '', email: '', subject: 'Product Inquiry', message: '' });
  const [status, setStatus] = React.useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email || !form.message) return;
    setStatus('sending');
    try {
      const api = (await import('../lib/api')).api;
      await api.submitContact({ name: `${form.firstName} ${form.lastName}`.trim(), email: form.email, message: `${form.subject}: ${form.message}` });
      setStatus('sent');
      setForm({ firstName: '', lastName: '', email: '', subject: 'Product Inquiry', message: '' });
    } catch { setStatus('error'); }
  };
  return (
    <div className="min-h-screen bg-background">
      <Navbar onNavigate={onNavigate} />
      
      <div className="pt-32 pb-20 px-6">
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-20">
          <div className="flex-1 space-y-10">
            <div>
              <h1 className="text-5xl font-display font-black tracking-tight mb-6 leading-[1.1]">Let's build <br /> <span className="text-gradient">something great</span>.</h1>
              <p className="text-text-muted text-lg">Have questions about DocuWeb AI? Our team is here to help you get started or discuss enterprise solutions.</p>
            </div>

            <div className="space-y-6">
              <div className="flex gap-4 p-6 rounded-2xl bg-white/5 border border-white/5 hover:border-primary/20 transition-all cursor-pointer group">
                 <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                    <MessageSquare className="size-6" />
                 </div>
                 <div>
                    <h4 className="font-bold">Live Support</h4>
                    <p className="text-sm text-text-muted">Chat with our engineering team in real-time.</p>
                 </div>
              </div>
              <div className="flex gap-4 p-6 rounded-2xl bg-white/5 border border-white/5 hover:border-secondary/20 transition-all cursor-pointer group">
                 <div className="size-12 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary group-hover:bg-secondary group-hover:text-white transition-all">
                    <Globe className="size-6" />
                 </div>
                 <div>
                    <h4 className="font-bold">Global Sales</h4>
                    <p className="text-sm text-text-muted">For high-volume licensing and partnership.</p>
                 </div>
              </div>
            </div>
          </div>

          <div className="flex-1">
             <form onSubmit={handleSubmit} className="p-8 md:p-12 rounded-3xl bg-card border border-white/5 shadow-2xl space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest">First Name</label>
                    <input type="text" value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-primary/50 text-sm" placeholder="Jane" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Last Name</label>
                    <input type="text" value={form.lastName} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-primary/50 text-sm" placeholder="Doe" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Email Address</label>
                  <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-primary/50 text-sm" placeholder="jane@company.com" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Subject</label>
                  <select value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-primary/50 text-sm">
                    <option>Product Inquiry</option>
                    <option>Technical Support</option>
                    <option>Billing Question</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Message</label>
                  <textarea rows={4} value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-primary/50 text-sm resize-none" placeholder="Tell us about your project..."></textarea>
                </div>
                <Button type="submit" className="w-full py-4 font-bold text-lg rounded-xl" disabled={status === 'sending'}>{status === 'sending' ? 'Sending...' : status === 'sent' ? 'Sent!' : status === 'error' ? 'Failed — try again' : 'Send Message'}</Button>
             </form>
          </div>
        </div>
      </div>

      <Footer onNavigate={onNavigate} />
    </div>
  );
}
