import { execa } from 'execa';
import fs from 'node:fs';
import path from 'node:path';

export const FINGERPRINT_FILE_NAME = '.mobile-preview-fingerprint';

export async function generateFingerprint(cwd: string = process.cwd()): Promise<string | null> {
  try {
    const { stdout } = await execa('npx', ['--yes', '@expo/fingerprint', '.'], {
      cwd,
      preferLocal: true,
    });

    const parsed = JSON.parse(stdout);
    if (parsed && typeof parsed.hash === 'string') {
      return parsed.hash;
    }
    return null;
  } catch {
    return null;
  }
}

export function readStoredFingerprint(cwd: string = process.cwd()): string | null {
  const filePath = path.join(cwd, FINGERPRINT_FILE_NAME);
  if (fs.existsSync(filePath)) {
    try {
      return fs.readFileSync(filePath, 'utf-8').trim();
    } catch {
      return null;
    }
  }
  return null;
}

export function saveStoredFingerprint(cwd: string = process.cwd(), hash: string): void {
  const filePath = path.join(cwd, FINGERPRINT_FILE_NAME);
  fs.writeFileSync(filePath, hash.trim() + '\n', 'utf-8');
}
