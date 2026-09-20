import { createFingerprintAsync, type Platform } from '@expo/fingerprint';
import fs from 'node:fs';
import path from 'node:path';
import { execa } from 'execa';
import { execEas } from '../utils/exec-eas.js';

export const FINGERPRINT_FILE_NAME = 'fingerprint';
export const FINGERPRINT_DIR = '.mobile-preview';

export async function generateFingerprint(
  cwd: string = process.cwd(),
  platforms: Platform[] = ['android', 'ios']
): Promise<string | null> {
  try {
    const fingerprintPromise = createFingerprintAsync(cwd, { platforms });
    const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 10000));
    const result = await Promise.race([fingerprintPromise, timeoutPromise]);
    if (result && typeof result === 'object' && typeof (result as any).hash === 'string') {
      return (result as any).hash;
    }
    return null;
  } catch {
    return null;
  }
}

async function getRepoSlug(cwd: string): Promise<string | null> {
  if (process.env.GITHUB_REPOSITORY) {
    return process.env.GITHUB_REPOSITORY;
  }
  try {
    const { stdout } = await execa('git', ['config', '--get', 'remote.origin.url'], { cwd });
    const match = stdout.match(/github\.com[:/]([^/]+\/[^/.]+)/);
    if (match && match[1]) {
      return match[1].replace(/\.git$/, '');
    }
  } catch {}
  return null;
}

export async function readStoredFingerprint(
  cwd: string = process.cwd(),
  releaseTag: string = 'mobile-preview'
): Promise<string | null> {
  // 1. Environment variable override
  if (process.env.MOBILE_PREVIEW_FINGERPRINT?.trim()) {
    return process.env.MOBILE_PREVIEW_FINGERPRINT.trim();
  }

  // 2. Check local action artifact / cache files in cwd and sub/parent directories
  const localPaths = [
    path.join(cwd, FINGERPRINT_DIR, FINGERPRINT_FILE_NAME),
    path.join(cwd, FINGERPRINT_DIR, 'preview.json'),
    path.join(cwd, 'demo', FINGERPRINT_DIR, FINGERPRINT_FILE_NAME),
    path.join(cwd, 'demo', FINGERPRINT_DIR, 'preview.json'),
    path.join(cwd, '..', FINGERPRINT_DIR, FINGERPRINT_FILE_NAME),
    path.join(cwd, '.mobile-preview-fingerprint'), // legacy path fallback
  ];

  for (const filePath of localPaths) {
    if (fs.existsSync(filePath)) {
      try {
        const content = fs.readFileSync(filePath, 'utf-8').trim();
        if (filePath.endsWith('.json')) {
          const parsed = JSON.parse(content);
          if (parsed?.fingerprint) return parsed.fingerprint;
        } else if (content) {
          return content;
        }
      } catch {}
    }
  }

  // 3. GitHub Action Artifacts or GitHub Release metadata (preview.json)
  try {
    const repoSlug = await getRepoSlug(cwd);
    if (repoSlug) {
      const headers: Record<string, string> = {
        'User-Agent': 'mobile-preview-cli',
      };
      if (process.env.GITHUB_TOKEN) {
        headers['Authorization'] = `token ${process.env.GITHUB_TOKEN}`;
      }

      const res = await fetch(`https://api.github.com/repos/${repoSlug}/releases/tags/${releaseTag}`, {
        headers,
        signal: AbortSignal.timeout(2500),
      });
      if (res.ok) {
        const data: any = await res.json();
        const previewAsset = data.assets?.find((a: any) => a.name === 'preview.json');
        if (previewAsset?.id) {
          const assetHeaders = {
            ...headers,
            'Accept': 'application/octet-stream',
          };
          const metaRes = await fetch(`https://api.github.com/repos/${repoSlug}/releases/assets/${previewAsset.id}`, {
            headers: assetHeaders,
            signal: AbortSignal.timeout(2500),
          });
          if (metaRes.ok) {
            const metaJson: any = await metaRes.json();
            if (metaJson?.fingerprint) {
              return metaJson.fingerprint;
            }
          }
        }
      }
    }
  } catch {}

  // 4. EAS Service metadata
  if (process.env.EXPO_TOKEN) {
    try {
      const { stdout } = await execEas(
        ['build:list', '--status', 'finished', '--limit=5', '--json', '--non-interactive'],
        { cwd, timeout: 3000 }
      );
      const builds = JSON.parse(stdout);
      if (Array.isArray(builds)) {
        for (const build of builds) {
          const fp = build.fingerprint || build.fingerprintHash;
          if (typeof fp === 'string' && fp.length > 0) {
            return fp;
          }
        }
      }
    } catch {}

    try {
      const { stdout } = await execEas(['update:list', '--limit=5', '--json', '--non-interactive'], {
        cwd,
        timeout: 3000,
      });
      const updates = JSON.parse(stdout);
      if (Array.isArray(updates)) {
        for (const update of updates) {
          const fp = update.fingerprint || update.fingerprintHash;
          if (typeof fp === 'string' && fp.length > 0) {
            return fp;
          }
        }
      }
    } catch {}
  }

  return null;
}

export function saveStoredFingerprint(cwd: string = process.cwd(), hash: string): void {
  const dirPath = path.join(cwd, FINGERPRINT_DIR);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }

  // Write plain fingerprint hash file
  const filePath = path.join(dirPath, FINGERPRINT_FILE_NAME);
  fs.writeFileSync(filePath, hash.trim() + '\n', 'utf-8');

  // Write preview.json metadata file
  const previewJsonPath = path.join(dirPath, 'preview.json');
  const metadata = {
    fingerprint: hash.trim(),
    timestamp: new Date().toISOString(),
  };
  fs.writeFileSync(previewJsonPath, JSON.stringify(metadata, null, 2), 'utf-8');
}
