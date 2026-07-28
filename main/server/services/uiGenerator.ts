import type { DocumentAnalysis } from '../types/index.js';

export type ThemeOption = 'modern' | 'portfolio' | 'enterprise';

export interface Wireframe {
  page: string;
  layout: string;
  sections: { type: string; order: number; description: string }[];
}

export interface DesignSystem {
  colors: { primary: string; secondary: string; accent: string; background: string; surface: string; text: string };
  typography: { heading: string; body: string; scale: number[] };
  spacing: number[];
  borderRadius: string;
  shadows: string[];
}

const themePalettes: Record<ThemeOption, DesignSystem> = {
  modern: {
    colors: { primary: '#6366F1', secondary: '#0EA5E9', accent: '#10B981', background: '#0F172A', surface: '#1E293B', text: '#F8FAFC' },
    typography: { heading: 'Inter', body: 'Inter', scale: [12, 14, 16, 18, 22, 28, 36, 44] },
    spacing: [4, 8, 16, 20, 24, 32, 40, 56],
    borderRadius: '8px',
    shadows: ['0 1px 2px rgba(0,0,0,0.3)', '0 4px 8px rgba(0,0,0,0.4)', '0 8px 16px rgba(0,0,0,0.5)'],
  },
  portfolio: {
    colors: { primary: '#FF6B35', secondary: '#E63946', accent: '#FFD166', background: '#0A0A0A', surface: '#1A1A1A', text: '#F5F5F5' },
    typography: { heading: 'Poppins', body: 'Inter', scale: [14, 16, 18, 22, 28, 36, 48, 60] },
    spacing: [4, 8, 12, 16, 24, 40, 56, 72],
    borderRadius: '16px',
    shadows: ['0 2px 8px rgba(0,0,0,0.4)', '0 8px 24px rgba(0,0,0,0.5)', '0 16px 48px rgba(0,0,0,0.6)'],
  },
  enterprise: {
    colors: { primary: '#2563EB', secondary: '#475569', accent: '#1E293B', background: '#0B1120', surface: '#162032', text: '#E2E8F0' },
    typography: { heading: 'Inter', body: 'Inter', scale: [12, 14, 16, 20, 24, 30, 38, 46] },
    spacing: [4, 8, 16, 24, 32, 40, 48, 64],
    borderRadius: '6px',
    shadows: ['0 1px 3px rgba(0,0,0,0.4)', '0 4px 12px rgba(0,0,0,0.5)', '0 8px 24px rgba(0,0,0,0.6)'],
  },
};

export function generateWireframes(analysis: DocumentAnalysis): Wireframe[] {
  const pages: Wireframe[] = [];

  pages.push({
    page: 'Landing / Home',
    layout: 'Hero + Features + CTA + Footer',
    sections: [
      { type: 'navbar', order: 1, description: 'Top navigation with logo, links, auth buttons' },
      { type: 'hero', order: 2, description: 'Headline, subtext, primary CTA button' },
      { type: 'features', order: 3, description: 'Grid of key features/benefits with icons' },
      { type: 'testimonials', order: 4, description: 'User testimonials carousel' },
      { type: 'cta', order: 5, description: 'Call-to-action section with email signup' },
      { type: 'footer', order: 6, description: 'Links, social, copyright' },
    ],
  });

  pages.push({
    page: 'Authentication',
    layout: 'Centered card layout',
    sections: [
      { type: 'form', order: 1, description: 'Login/Signup form with email, password, social auth' },
      { type: 'divider', order: 2, description: 'Or continue with social login' },
      { type: 'social-buttons', order: 3, description: 'Google/GitHub OAuth buttons' },
    ],
  });

  pages.push({
    page: 'Dashboard',
    layout: 'Sidebar + Main content area',
    sections: [
      { type: 'sidebar', order: 1, description: 'Navigation sidebar with menu items' },
      { type: 'stats', order: 2, description: 'Stats cards row (total users, revenue, etc.)' },
      { type: 'chart', order: 3, description: 'Data visualization chart' },
      { type: 'table', order: 4, description: 'Recent activity/items table' },
    ],
  });

  if (analysis.forms.length > 0) {
    for (const form of analysis.forms) {
      pages.push({
        page: `Form: ${form.name}`,
        layout: 'Card with form fields',
        sections: [
          { type: 'header', order: 1, description: `Form title: ${form.name}` },
          { type: 'form-fields', order: 2, description: form.fields.map(f => `${f.label} (${f.type})`).join(', ') },
          { type: 'submit-button', order: 3, description: 'Submit/ Save button' },
        ],
      });
    }
  }

  return pages;
}

export function generateDesignSystem(domain: string, theme?: ThemeOption): DesignSystem {
  const base = theme ? themePalettes[theme] : themePalettes.modern;

  if (!theme) {
    const domainThemes: Record<string, Partial<DesignSystem>> = {
      'e-commerce': {
        colors: { primary: '#FF6B35', secondary: '#004E89', accent: '#FFD166', background: '#0F172A', surface: '#1E293B', text: '#F1F5F9' },
        typography: { heading: 'Poppins', body: 'Inter', scale: [12, 14, 16, 20, 24, 32, 40, 48] },
        borderRadius: '12px',
      },
    };

    const domainOverrides = domainThemes[domain];
    if (domainOverrides) {
      return { ...base, ...domainOverrides, colors: { ...base.colors, ...domainOverrides.colors }, typography: { ...base.typography, ...domainOverrides.typography } };
    }
  }

  return base;
}
