import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {
  readStoredFingerprint,
  saveStoredFingerprint,
} from './fingerprint.js';

describe('EAS Fingerprint Detection', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'mobile-preview-fp-test-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('reads and saves stored fingerprint correctly', async () => {
    expect(await readStoredFingerprint(tmpDir)).toBeNull();

    saveStoredFingerprint(tmpDir, 'hash-12345678');
    expect(await readStoredFingerprint(tmpDir)).toBe('hash-12345678');
  });
});
