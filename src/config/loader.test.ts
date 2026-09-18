import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { loadConfig, saveConfig } from './loader.js';

describe('Config loader', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'mobile-preview-test-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('loads default config if file does not exist', () => {
    const config = loadConfig(tmpDir);
    expect(config.provider).toBe('expo');
    expect(config.preview.channel).toBe('preview');
    expect(config.nativeBuild.provider).toBe('gradle');
    expect(config.detection.nativeDependencies).toBe(true);
  });

  it('loads and validates an existing config file', () => {
    const customConfig = {
      preview: { channel: 'custom-channel', branch: 'custom-branch' },
      detection: { nativePackages: ['expo-camera'] },
    };
    saveConfig(customConfig as any, tmpDir);

    const config = loadConfig(tmpDir);
    expect(config.preview.channel).toBe('custom-channel');
    expect(config.detection.nativePackages).toEqual(['expo-camera']);
    expect(config.nativeBuild.android.enabled).toBe(true);
  });
});
