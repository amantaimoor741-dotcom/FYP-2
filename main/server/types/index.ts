export interface ExtractedEntity {
  name: string;
  type: string;
  properties: { name: string; type: string; required: boolean }[];
  relations: { target: string; type: string }[];
}

export interface ExtractedWorkflow {
  name: string;
  steps: { action: string; description: string; actor: string }[];
}

export interface ExtractedForm {
  name: string;
  fields: { label: string; type: string; required: boolean; validation?: string }[];
  submitTo?: string;
}

export interface ExtractedAPI {
  method: string;
  path: string;
  description: string;
  auth: boolean;
  roles?: string[];
}

export interface ExtractedPermission {
  role: string;
  permissions: string[];
}

export interface DocumentAnalysis {
  title: string;
  description: string;
  domain: string;
  entities: ExtractedEntity[];
  workflows: ExtractedWorkflow[];
  forms: ExtractedForm[];
  apis: ExtractedAPI[];
  permissions: ExtractedPermission[];
  features: string[];
  missingFeatures: string[];
}

export interface GeneratedComponent {
  name: string;
  type: 'page' | 'component' | 'layout';
  code: string;
  path: string;
}

export interface GeneratedApp {
  id: string;
  name: string;
  frontend: GeneratedComponent[];
  backend: GeneratedComponent[];
  databaseSchema: string;
  authConfig: string;
  deploymentConfig: string;
  createdAt: string;
}

export interface Project {
  id: string;
  name: string;
  userId: string;
  status: 'uploading' | 'analyzing' | 'reasoning' | 'generating' | 'completed' | 'failed';
  documentType?: string;
  documentAnalysis?: DocumentAnalysis;
  generatedApp?: GeneratedApp;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  password: string;
  createdAt: string;
}

export interface AppError {
  error: string;
  message: string;
  status: number;
}
