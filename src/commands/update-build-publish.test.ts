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
  }, 15000);

  it('orchestrates publish command for JS change path', async () => {
    const mockUpdateProvider: UpdateProvider = {
      publish: vi.fn().mockResolvedValue({
        success: true,
        channel: 'preview',
        branch: 'preview',
        message: 'Success',
      }),
    };

    await expect(runPublish({ updateProvider: mockUpdateProvider })).resolves.not.toThrow();
  }, 15000);
});
