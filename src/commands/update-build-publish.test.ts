import { describe, it, expect, vi } from 'vitest';
import { runUpdate } from './update.js';
import { runBuild } from './build.js';
import { runPublish } from './publish.js';
import type { UpdateProvider, BuildProvider } from '../providers/types.js';

describe('Update, Build, and Publish Commands', () => {
  it('runs update with mock provider successfully', async () => {
    const mockUpdateProvider: UpdateProvider = {
      publish: vi.fn().mockResolvedValue({
        success: true,
        channel: 'preview',
        branch: 'preview',
        message: 'Success',
      }),
    };

    await expect(runUpdate({ provider: mockUpdateProvider })).resolves.not.toThrow();
    expect(mockUpdateProvider.publish).toHaveBeenCalled();
  });

  it('runs build with mock build provider successfully', async () => {
    const mockBuildProvider: BuildProvider = {
      build: vi.fn().mockResolvedValue({
        success: true,
        platform: 'android',
        artifactPath: '/tmp/app-release.apk',
      }),
    };

    const path = await runBuild({ provider: mockBuildProvider });
    expect(path).toBe('/tmp/app-release.apk');
  }, 30000);

  it('orchestrates publish command for JS change path', async () => {
    const mockUpdateProvider: UpdateProvider = {
      publish: vi.fn().mockResolvedValue({
        success: true,
        channel: 'preview',
        branch: 'preview',
        message: 'Success',
      }),
    };

    await expect(runPublish({ updateProvider: mockUpdateProvider, base: 'HEAD' })).resolves.not.toThrow();
  }, 30000);

  it('orchestrates publish command for native build path when fingerprint changes', async () => {
    const mockBuildProvider: BuildProvider = {
      build: vi.fn().mockResolvedValue({
        success: true,
        platform: 'android',
        artifactPath: '/tmp/app-release.apk',
      }),
    };

    const originalFp = process.env.MOBILE_PREVIEW_FINGERPRINT;
    process.env.MOBILE_PREVIEW_FINGERPRINT = 'old-mismatched-hash-12345';

    try {
      await expect(
        runPublish({ buildProvider: mockBuildProvider, dryRun: true })
      ).resolves.not.toThrow();
    } finally {
      if (originalFp !== undefined) {
        process.env.MOBILE_PREVIEW_FINGERPRINT = originalFp;
      } else {
        delete process.env.MOBILE_PREVIEW_FINGERPRINT;
      }
    }
  }, 30000);
});
