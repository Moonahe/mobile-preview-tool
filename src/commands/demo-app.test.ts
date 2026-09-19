import { describe, it, expect, vi } from 'vitest';
import path from 'node:path';
import { loadConfig } from '../config/loader.js';
import { runDetect } from './detect.js';
import { runDoctor } from './doctor.js';

describe('Demo App Integration', () => {
  const demoPath = path.resolve(process.cwd(), 'demo');

  it('loads valid configuration from the demo app directory', () => {
    const config = loadConfig(demoPath);
    expect(config.provider).toBe('expo');
    expect(config.publish.releaseTag).toBe('mobile-preview-demo');
    expect(config.detection.nativeDependencies).toBe(true);
  });

  it('runs change detection on the demo app directory', async () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    await expect(runDetect({ cwd: demoPath, json: true })).resolves.not.toThrow();

    expect(consoleSpy).toHaveBeenCalled();
    const output = consoleSpy.mock.calls[0][0];
    const parsed = JSON.parse(output);
    expect(parsed).toHaveProperty('classification');
    expect(parsed).toHaveProperty('nativeChange');

    consoleSpy.mockRestore();
  });

  it('runs doctor health checks on the demo app directory', async () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const healthy = await runDoctor({ cwd: demoPath });
    expect(typeof healthy).toBe('boolean');
    consoleSpy.mockRestore();
  });
});
