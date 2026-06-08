import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const UPLOAD_DIR = path.join(DATA_DIR, 'uploads');
const GENERATED_DIR = path.join(DATA_DIR, 'generated');

for (const dir of [DATA_DIR, UPLOAD_DIR, GENERATED_DIR]) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

export interface StorageProvider {
  save(key: string, buffer: Buffer, mimeType?: string): Promise<string>;
  get(key: string): Promise<Buffer | null>;
  delete(key: string): Promise<void>;
  getUrl(key: string): string;
}

const localProvider: StorageProvider = {
  async save(key: string, buffer: Buffer, mimeType?: string) {
    const dir = path.dirname(path.join(DATA_DIR, key));
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(DATA_DIR, key), buffer);
    return path.join(DATA_DIR, key);
  },
  async get(key: string) {
    const p = path.join(DATA_DIR, key);
    return fs.existsSync(p) ? fs.readFileSync(p) : null;
  },
  async delete(key: string) {
    const p = path.join(DATA_DIR, key);
    if (fs.existsSync(p)) fs.unlinkSync(p);
  },
  getUrl(key: string) {
    return path.join(DATA_DIR, key);
  },
};

export const storage: StorageProvider = localProvider;

export function getUploadPath(filename: string) {
  return `uploads/${filename}`;
}

export function getGeneratedPath(projectId: string, filename: string) {
  return `generated/${projectId}/${filename}`;
}
