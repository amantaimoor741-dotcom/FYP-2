import fs from 'fs';
import path from 'path';

export async function parseDocument(filePath: string, mimeType: string): Promise<string> {
  const ext = path.extname(filePath).toLowerCase();

  if (ext === '.pdf' || mimeType === 'application/pdf') {
    return parsePDF(filePath);
  }
  if (ext === '.docx' || mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    return parseDOCX(filePath);
  }
  if (ext === '.txt' || mimeType === 'text/plain') {
    return fs.readFileSync(filePath, 'utf-8');
  }

  const textContent = fs.readFileSync(filePath, 'utf-8');
  return textContent;
}

async function parsePDF(filePath: string): Promise<string> {
  const { PDFParse } = await import('pdf-parse');
  const dataBuffer = fs.readFileSync(filePath);
  const parser = new PDFParse({ data: dataBuffer });
  await parser.load();
  const result = await parser.getText();
  return result.text || '';
}

async function parseDOCX(filePath: string): Promise<string> {
  const mammoth = (await import('mammoth')).default;
  const result = await mammoth.extractRawText({ path: filePath });
  return result.value;
}
