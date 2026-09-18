import fs from 'node:fs';
import path from 'node:path';

export interface MobilePreviewMetadata {
  commit: string;
  branch: string;
  timestamp: string;
  classification: string;
  nativeVersion?: string;
  previewVersion?: string;
  platform?: string;
  artifact?: string;
}

export function writePreviewMetadata(
  cwd: string,
  metadata: MobilePreviewMetadata,
  filename: string = 'preview.json'
): string {
  const filePath = path.resolve(cwd, filename);
  fs.writeFileSync(filePath, JSON.stringify(metadata, null, 2), 'utf-8');
  return filePath;
}

export function readPreviewMetadata(
  cwd: string,
  filename: string = 'preview.json'
): MobilePreviewMetadata | null {
  const filePath = path.resolve(cwd, filename);
  if (!fs.existsSync(filePath)) {
    return null;
  }
  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
