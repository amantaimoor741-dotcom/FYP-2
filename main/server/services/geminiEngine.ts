import type { DocumentAnalysis } from '../types/index.ts';

const API_URL = 'https://openrouter.ai/api/v1/chat/completions';

const MODELS: Record<string, string> = {
  'openai/gpt-4o-mini': 'openai/gpt-4o-mini',
  'openai/gpt-4o': 'openai/gpt-4o',
};

function getApiKey(modelId?: string): string {
  const defaultKey = process.env.OPENROUTER_API_KEY || '';
  const key2 = process.env.OPENROUTER_API_KEY_2 || '';
  if (modelId === 'openai/gpt-4o') return key2 || defaultKey;
  return defaultKey;
}

const SYSTEM_PROMPT = `You are a document analysis AI. Extract structured information from documents to generate full-stack web applications. Given a document, extract: title, description, domain classification, data entities, workflows, forms, API endpoints, permissions, features, missing features. Return ONLY valid JSON.`;

async function generate(prompt: string, modelId?: string): Promise<string> {
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
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.2,
      max_tokens: 16000,
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

async function generateJSON<T>(prompt: string, modelId?: string): Promise<T> {
  return extractJSON<T>(await generate(prompt, modelId));
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
    const raw = await generateJSON<any>(`${SYSTEM_PROMPT}\n\nDocument:\n${text}`, modelId);
    return normalizeAnalysis(raw);
  } catch (error: any) {
    console.error('AI analysis failed:', error.message);
    throw new Error('Failed to analyze document: ' + error.message);
  }
}

export async function inferenceMissingFeatures(analysis: DocumentAnalysis): Promise<string[]> {
  try {
    return await generateJSON<string[]>(`Given this analysis, infer missing features:\n${JSON.stringify(analysis, null, 2)}`);
  } catch {
    return [];
  }
}

export async function generateApplicationCode(analysis: DocumentAnalysis): Promise<any> {
  const prompt = `Generate full app code for:\n${JSON.stringify(analysis, null, 2)}\nReturn JSON with frontend, backend, databaseSchema, authConfig.`;
  return await generateJSON(prompt);
}
