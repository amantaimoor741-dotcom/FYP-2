import type { DocumentAnalysis } from '../types/index.ts';

const DOMAIN_TEMPLATES: Record<string, {
  features: string[];
  entities: string[];
  workflows: string[];
}> = {
  'e-commerce': {
    features: ['product catalog', 'shopping cart', 'checkout', 'order management', 'payment processing', 'inventory management', 'user reviews', 'search & filters', 'wishlist', 'coupon/discount system'],
    entities: ['Product', 'Category', 'Cart', 'Order', 'OrderItem', 'Payment', 'User', 'Address', 'Review', 'Coupon'],
    workflows: ['browse products → add to cart → checkout → payment → order confirmation', 'admin adds product → product goes live → customer browses → purchases'],
  },
  saas: {
    features: ['user authentication', 'dashboard', 'subscription/billing', 'multi-tenant', 'role-based access', 'analytics', 'notifications', 'API keys', 'webhooks', 'audit logs'],
    entities: ['User', 'Team', 'Subscription', 'Plan', 'Invoice', 'ApiKey', 'Webhook', 'AuditLog', 'Notification'],
    workflows: ['sign up → choose plan → onboarding → use features → upgrade/downgrade', 'admin creates team → invites members → assign roles → manage billing'],
  },
  cms: {
    features: ['content editor', 'media library', 'categories/tags', 'draft/publish workflow', 'user roles', 'SEO management', 'version history', 'scheduling'],
    entities: ['Post', 'Page', 'Category', 'Tag', 'Media', 'User', 'Comment', 'Revision'],
    workflows: ['create content → edit → preview → publish → manage comments'],
  },
  dashboard: {
    features: ['data visualization', 'real-time metrics', 'filter/sort/search', 'export reports', 'user management', 'alerts', 'custom widgets'],
    entities: ['Metric', 'Report', 'Dashboard', 'Widget', 'Alert', 'User'],
    workflows: ['configure dashboard → add widgets → set filters → view metrics → export'],
  },
  social: {
    features: ['user profiles', 'posts/feeds', 'comments', 'likes/reactions', 'messaging', 'notifications', 'follow/friend system', 'sharing'],
    entities: ['User', 'Post', 'Comment', 'Like', 'Message', 'Notification', 'Follow'],
    workflows: ['create profile → post content → interact with others → receive notifications'],
  },
};

export function classifyDomain(text: string): string {
  const lower = text.toLowerCase();
  const domains = Object.keys(DOMAIN_TEMPLATES);
  
  const scores = domains.map(domain => {
    const template = DOMAIN_TEMPLATES[domain];
    let score = 0;
    for (const f of template.features) {
      if (lower.includes(f)) score += 2;
    }
    for (const e of template.entities) {
      if (lower.includes(e.toLowerCase())) score += 1;
    }
    return { domain, score };
  });

  scores.sort((a, b) => b.score - a.score);
  return scores[0]?.score > 0 ? scores[0].domain : 'custom';
}

export function inferMissingRequirements(analysis: DocumentAnalysis): string[] {
  const domain = analysis.domain || classifyDomain(analysis.description || '');
  const template = DOMAIN_TEMPLATES[domain];
  
  if (!template) return [];

  const existingFeatures = new Set(analysis.features.map(f => f.toLowerCase()));
  const missing: string[] = [];

  for (const feature of template.features) {
    if (!existingFeatures.has(feature.toLowerCase())) {
      missing.push(`Inferred: ${feature} (standard for ${domain} apps)`);
    }
  }

  if (!analysis.permissions.length) {
    missing.push('Inferred: Role-based access control with admin/user roles');
  }
  if (!analysis.apis.length) {
    missing.push('Inferred: RESTful API layer with CRUD operations');
  }

  return missing;
}

export function generateSpec(analysis: DocumentAnalysis): string {
  const domain = analysis.domain || classifyDomain(analysis.description || '');
  const missing = inferMissingRequirements(analysis);
  
  return JSON.stringify({
    applicationName: analysis.title,
    domain,
    summary: analysis.description,
    dataModel: analysis.entities,
    userFlows: analysis.workflows,
    forms: analysis.forms,
    endpoints: analysis.apis,
    permissions: analysis.permissions,
    features: [...analysis.features, ...missing],
    techStack: {
      frontend: 'React 19 + TypeScript + Tailwind CSS',
      backend: 'Node.js + Express + TypeScript',
      database: 'PostgreSQL + Prisma ORM',
      auth: 'JWT + OAuth',
    },
  }, null, 2);
}




