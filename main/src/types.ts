export type Page = 'landing' | 'login' | 'signup' | 'forgot-password' | 'dashboard' | 'upload' | 'processing' | 'preview' | 'admin' | 'settings' | 'about' | 'contact' | 'pricing';

export interface Project {
  id: string;
  name: string;
  createdAt: string;
  status: 'drafting' | 'processing' | 'completed' | 'published';
  type: 'pdf' | 'docx';
}

export type Theme = 'modern' | 'portfolio' | 'enterprise';
