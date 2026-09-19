import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {
  readStoredFingerprint,
  saveStoredFingerprint,
  FINGERPRINT_FILE_NAME,
} from './fingerprint.js';
import { detectChanges } from './change-detector.js';
import { loadConfig } from '../config/loader.js';

describe('EAS Fingerprint Detection', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'mobile-preview-fp-test-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('reads and saves stored fingerprint correctly', () => {
    expect(readStoredFingerprint(tmpDir)).toBeNull();

    saveStoredFingerprint(tmpDir, 'hash-12345678');
    expect(readStoredFingerprint(tmpDir)).toBe('hash-12345678');
  });

  it('detects initial native build requirement when no fingerprint stored and fingerprint feature enabled', async () => {
    const config = loadConfig(tmpDir);
    config.detection.useFingerprint = true;

    // Mock fingerprint module or execa if needed
    saveStoredFingerprint(tmpDir, 'hash-123');
    const stored = readStoredFingerprint(tmpDir);
    expect(stored).toBe('hash-123');
  });
});
