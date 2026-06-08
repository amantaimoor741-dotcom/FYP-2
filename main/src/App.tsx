import React, { useState } from 'react';
import { ClerkProvider } from '@clerk/clerk-react';
import { DemoAuthProvider } from './context/DemoAuth';
import { ProjectProvider } from './context/ProjectContext';
import type { Page } from './types';
import ErrorBoundary from './components/ErrorBoundary';
import AuraLandingPage from './pages/AuraLandingPage';
import Dashboard from './pages/Dashboard';
import UploadPage from './pages/UploadPage';
import ProcessingPage from './pages/ProcessingPage';
import PreviewPage from './pages/PreviewPage';
import SettingsPage from './pages/SettingsPage';
import AdminPanel from './pages/AdminPanel';
import { PricingPage, AboutPage, ContactPage } from './pages/MarketingPages';
import { LoginPage, SignupPage, ForgotPasswordPage } from './pages/AuthPages';

const CLERK_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || '';
const PAGE_KEY = 'doc2web_page';

export default function App() {
  const [page, setPage] = useState<Page>(() => {
    try { return (sessionStorage.getItem(PAGE_KEY) as Page) || 'landing'; } catch { return 'landing'; }
  });

  const navigate = (p: Page) => {
    setPage(p);
    try { sessionStorage.setItem(PAGE_KEY, p); } catch {}
  };

  const renderPage = () => {
    switch (page) {
      case 'login':
        return <LoginPage onNavigate={navigate} />;
      case 'signup':
        return <SignupPage onNavigate={navigate} />;
      case 'forgot-password':
        return <ForgotPasswordPage onNavigate={navigate} />;
      case 'dashboard':
        return <Dashboard onNavigate={navigate} />;
      case 'upload':
        return <UploadPage onNavigate={navigate} />;
      case 'processing':
        return <ProcessingPage onNavigate={navigate} />;
      case 'preview':
        return <PreviewPage onNavigate={navigate} />;
      case 'settings':
        return <SettingsPage onNavigate={navigate} />;
      case 'admin':
        return <AdminPanel onNavigate={navigate} />;
      case 'pricing':
        return <PricingPage onNavigate={navigate} />;
      case 'about':
        return <AboutPage onNavigate={navigate} />;
      case 'contact':
        return <ContactPage onNavigate={navigate} />;
      default:
        return <AuraLandingPage onNavigate={navigate} />;
    }
  };

  const content = (
    <ErrorBoundary>
      <DemoAuthProvider>
        <ProjectProvider>
          {renderPage()}
        </ProjectProvider>
      </DemoAuthProvider>
    </ErrorBoundary>
  );

  if (!CLERK_KEY) return content;

  return (
    <ClerkProvider publishableKey={CLERK_KEY} clerkJSVariant="headless">
      {content}
    </ClerkProvider>
  );
}
