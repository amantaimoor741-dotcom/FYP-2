import type { DocumentAnalysis } from '../types/index.js';

const API_URL = 'https://openrouter.ai/api/v1/chat/completions';

const MODELS: Record<string, string> = {
  'openai/gpt-4o-mini': 'openai/gpt-4o-mini',
  'openai/gpt-4o': 'openai/gpt-4o',
  'google/gemini-2.5-flash': 'google/gemini-2.5-flash',
  'google/gemini-2.5-pro': 'google/gemini-2.5-pro',
};

function getApiKey(modelId?: string): string {
  const defaultKey = process.env.OPENROUTER_API_KEY || '';
  const key2 = process.env.OPENROUTER_API_KEY_2 || '';
  const key3 = process.env.OPENROUTER_API_KEY_3 || '';
  if (modelId === 'openai/gpt-4o') return key2 || defaultKey;
  if (modelId?.startsWith('google/')) return key3 || defaultKey;
  return defaultKey;
}

const SYSTEM_PROMPT = `You are a document analysis AI. Extract structured information from documents to generate full-stack web applications. Given a document, extract: title, description, domain classification, data entities, workflows, forms, API endpoints, permissions, features, missing features. Return ONLY valid JSON.`;

const WEBSITE_GENERATION_SYSTEM_PROMPT = `# SYSTEM ROLE & INSTRUCTION
You are an advanced, automated UI/UX and Full-Stack Frontend Engine. You will receive raw extracted text/data from a user document. Your task is to process this data internally and transform it into a premium, modern, production-grade multi-page web application using React (via CDN with Babel).

DO NOT output basic, generic, or partial boilerplate. Convert the document data into a fully functional, rich, interactive web application.

---

# PHASE 1: DATA EXTRACTION & ENRICHMENT (EXECUTE INTERNALLY BEFORE CODING)

1. EXTRACT all structured data from the document: items, services, products, prices, descriptions, categories, contacts, addresses, hours, etc.

2. ENRICH the extracted data with ADDITIONAL realistic content that a real business would need:
   - If only items + prices are given: ADD descriptions, categories (e.g., "Featured", "Classic", "Seasonal"), dietary tags, preparation time, customer ratings/reviews, related items.
   - If only name/contact given: ADD about/bio, team members, services offered, FAQs, testimonials, business hours in structured format.
   - If no pricing: ADD realistic tiered pricing (Basic/Standard/Premium or Small/Medium/Large).
   - The goal: the document is a seed — expand it into a complete business website.

---

# PHASE 2: ARCHITECTURE — MULTI-PAGE SPA USING REACT

Build a single-page application using React 18 (via CDN) with the following structure:

\`\`\`
Pages:
- Home (/): Hero section, featured items/gallery, key metrics/stats, call-to-action
- About (/about): Company story, team members, mission/values timeline
- Menu/Services (/menu): Dynamic listing with categories, filtering, search, item cards with images/descriptions/prices/tags
- Pricing (/pricing): Tiered pricing cards with feature comparison
- Contact (/contact): Contact form with validation, embedded map placeholder, business info
- FAQ (/faq): Accordion-style frequently asked questions
- Testimonials (/testimonials): Customer reviews carousel
\`\`\`

Navigation: sticky header with mobile hamburger menu, smooth scroll, active link highlighting.
Routing: Implement a simple hash-based or state-based router (no external router library needed).

---

# PHASE 3: UI & DESIGN REQUIREMENTS

1. **Design System**: Modern, cohesive color palette. Professional typography (Google Fonts via CDN). Consistent spacing, border radius, shadows. Support dark/light mode toggle.

2. **Responsive**: Full mobile/tablet/desktop responsiveness. Mobile-first approach.

3. **Animations & Micro-interactions**:
   - Fade-in/slide-in on scroll reveal
   - Hover scale/lift effects on cards
   - Smooth page transitions
   - Loading skeletons/spinners
   - Toast notifications for form submission
   - Modal for detailed item views

4. **Every interactive element MUST work**:
   - Menu filter/search: instantly filters items by category/keyword
   - Contact form: validates fields, shows success toast, stores submission in localStorage
   - FAQ accordion: clicks toggle answers
   - Pricing toggle: monthly/yearly switcher
   - Testimonial carousel: auto-rotates with manual nav dots
   - Cart/favorite buttons: working state management

---

# PHASE 4: TECHNICAL REQUIREMENTS

- React 18 via CDN: \`https://unpkg.com/react@18/umd/react.production.min.js\` and \`https://unpkg.com/react-dom@18/umd/react-dom.production.min.js\`
- Babel standalone for JSX: \`https://unpkg.com/@babel/standalone/babel.min.js\`
- Tailwind CSS via CDN: \`https://cdn.tailwindcss.com\`
- Google Fonts (Inter or Poppins) via CDN
- All state managed with React useState/useEffect hooks
- All data stored in component state (mock data defined inline)
- No external API calls — all data is client-side mock data
- Type="text/babel" for script tags using JSX

---

# OUTPUT EXPECTATION
Return ONLY a single complete HTML file containing the entire React SPA application with all CSS and JavaScript inline. The file must be fully self-contained and runnable by opening in a browser. Do NOT include any markdown formatting, code fences, or explanatory text outside the HTML. Start directly with <!DOCTYPE html>.`;

async function generate(prompt: string, systemPrompt: string, modelId?: string): Promise<string> {
  const model = MODELS[modelId || 'openai/gpt-4o-mini'] || 'openai/gpt-4o-mini';
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getApiKey(modelId)}`,
      'HTTP-Referer': 'http://localhost:4000',
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt },
      ],
      temperature: 0.2,
      max_tokens: 32000,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`OpenRouter API error ${response.status}: ${err}`);
  }

  const raw = await response.text();
  const data = JSON.parse(raw);
  const content = data.choices?.[0]?.message?.content;
  return content || '';
}

async function extractJSON<T>(text: string): Promise<T> {
  const cleaned = text.replace(/```json\s*|\s*```/g, '').trim();
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  const arrStart = cleaned.indexOf('[');
  const arrEnd = cleaned.lastIndexOf(']');
  let jsonStr: string;
  if (start !== -1 && end !== -1) jsonStr = cleaned.slice(start, end + 1);
  else if (arrStart !== -1 && arrEnd !== -1) jsonStr = cleaned.slice(arrStart, arrEnd + 1);
  else jsonStr = cleaned;
  return JSON.parse(jsonStr) as T;
}

async function generateJSON<T>(prompt: string, systemPrompt: string = SYSTEM_PROMPT, modelId?: string): Promise<T> {
  return extractJSON<T>(await generate(prompt, systemPrompt, modelId));
}

function normalizeAnalysis(raw: any): DocumentAnalysis {
  const mapKey = (key: string): string => {
    const map: Record<string, string> = {
      data_entities: 'entities', api_endpoints: 'apis', missing_features: 'missingFeatures',
      attributes: 'properties', permissions: 'permissions', data_fields: 'fields',
      submit_to: 'submitTo', first_name: 'firstName', last_name: 'lastName',
      domain_classification: 'domain',
    };
    return map[key] || key;
  };

  const mapObj = (obj: any): any => {
    if (Array.isArray(obj)) return obj.map(mapObj);
    if (obj && typeof obj === 'object') {
      const result: any = {};
      for (const [k, v] of Object.entries(obj)) {
        const mappedKey = mapKey(k);
        result[mappedKey] = Array.isArray(v) ? v.map(mapObj) : (v && typeof v === 'object' ? mapObj(v) : v);
      }
      return result;
    }
    return obj;
  };

  const mapped = mapObj(raw) as DocumentAnalysis;

  mapped.title = mapped.title || raw.title || 'Untitled';
  mapped.description = mapped.description || raw.description || '';
  mapped.domain = mapped.domain || '';
  if (!Array.isArray(mapped.entities)) mapped.entities = [];
  if (!Array.isArray(mapped.workflows)) mapped.workflows = [];
  if (!Array.isArray(mapped.forms)) mapped.forms = [];
  if (!Array.isArray(mapped.apis)) mapped.apis = [];
  if (!Array.isArray(mapped.permissions)) mapped.permissions = [];
  if (!Array.isArray(mapped.features)) mapped.features = [];
  if (!Array.isArray(mapped.missingFeatures)) mapped.missingFeatures = [];

  mapped.entities = mapped.entities.map((e: any) => {
    const props = (e.properties || []).map((p: any) => {
      if (typeof p === 'string') {
        return { name: p, type: 'string', required: true };
      }
      return { name: p.name || '', type: p.type || 'string', required: p.required !== false };
    });
    return {
      name: e.name || '',
      type: e.type || 'entity',
      properties: props,
      relations: e.relations || [],
    };
  });

  mapped.forms = mapped.forms.map((f: any) => {
    if (typeof f === 'string') {
      return { name: f, fields: [] };
    }
    return { name: f.name || '', fields: f.fields || [] };
  });

  mapped.workflows = mapped.workflows.map((w: any) => {
    if (typeof w === 'string') {
      return { name: w, steps: [] };
    }
    return { name: w.name || '', steps: w.steps || [] };
  });

  mapped.apis = mapped.apis.map((a: any) => {
    if (typeof a === 'string') {
      const parts = a.trim().split(/\s+/);
      return { method: (parts[0] || 'GET').toUpperCase(), path: parts.slice(1).join(' ') || '/', description: a, auth: false };
    }
    return { method: a.method || 'GET', path: a.path || '/', description: a.description || '', auth: a.auth !== false };
  });

  if (mapped.permissions && !Array.isArray(mapped.permissions)) {
    mapped.permissions = Object.entries(mapped.permissions).map(([role, perms]) => ({
      role,
      permissions: Array.isArray(perms) ? perms : [],
    }));
  }

  return mapped;
}

export async function analyzeDocument(text: string, modelId?: string): Promise<DocumentAnalysis> {
  try {
    const raw = await generateJSON<any>(`Document:\n${text}`, SYSTEM_PROMPT, modelId);
    return normalizeAnalysis(raw);
  } catch (error: any) {
    console.error('AI analysis failed:', error.message);
    throw new Error('Failed to analyze document: ' + error.message);
  }
}

export async function inferenceMissingFeatures(analysis: DocumentAnalysis): Promise<string[]> {
  try {
    return await generateJSON<string[]>(`Given this analysis, infer missing features:\n${JSON.stringify(analysis, null, 2)}`, SYSTEM_PROMPT);
  } catch {
    return [];
  }
}

export async function generateWebsiteHTML(text: string, modelId?: string): Promise<string> {
  const prompt = `Generate a complete React SPA website from this document content.

DOCUMENT CONTENT:
${text}

INSTRUCTIONS:
1. First, extract ALL data (items, prices, names, categories, contacts, etc.) from the document above.
2. ENRICH the data with additional realistic content needed for a complete business website (descriptions, categories, featured items, testimonials, team, FAQs, etc.).
3. Build a fully functional multi-page React SPA with: Home, About, Menu/Services, Pricing, Contact, FAQ, and Testimonials pages.
4. Use React 18 + Babel + Tailwind CSS (all via CDN).
5. EVERY button, form, filter, and interactive element MUST work with proper React state management.
6. Include smooth animations, responsive design, dark/light mode, and professional styling.
7. Start with <!DOCTYPE html>. Do NOT wrap in markdown code fences. Do NOT add any text before or after the HTML.`;
  const raw = await generate(prompt, WEBSITE_GENERATION_SYSTEM_PROMPT, modelId);
  let cleaned = raw.replace(/^```html\s*/i, '').replace(/^```\s*/i, '');
  cleaned = cleaned.replace(/```[\s\S]*$/i, '');
  const htmlMatch = cleaned.match(/(<!DOCTYPE[\s\S]*?<\/html>)/i);
  if (htmlMatch) cleaned = htmlMatch[1];
  return cleaned.trim();
}

export async function generateApplicationCode(analysis: DocumentAnalysis): Promise<any> {
  const prompt = `Generate full app code for:\n${JSON.stringify(analysis, null, 2)}\nReturn JSON with frontend, backend, databaseSchema, authConfig.`;
  return await generateJSON(prompt, SYSTEM_PROMPT);
}
