import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { runInit } from './init.js';
import { runDetect } from './detect.js';

describe('Init and Detect Commands', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'mobile-preview-cmd-test-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('runs init command creating config and workflow files', async () => {
    await runInit({ cwd: tmpDir });

    expect(fs.existsSync(path.join(tmpDir, 'mobile-preview.config.json'))).toBe(true);
    expect(fs.existsSync(path.join(tmpDir, '.github/workflows/mobile-preview.yml'))).toBe(true);
  });

  it('runs detect command with json option without error', async () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    await runDetect({ cwd: tmpDir, json: true });

    expect(consoleSpy).toHaveBeenCalled();
    const output = consoleSpy.mock.calls[0][0];
    const parsed = JSON.parse(output);
    expect(parsed).toHaveProperty('classification');
    expect(parsed).toHaveProperty('nativeChange');

    consoleSpy.mockRestore();
  }, 15000);
});
