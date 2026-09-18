import { describe, it, expect, vi } from 'vitest';
import { runStatus } from './status.js';
import { runDoctor } from './doctor.js';
import { runRollback } from './rollback.js';
import type { UpdateProvider } from '../providers/types.js';

describe('Utility Commands', () => {
  it('runs status command without throwing', async () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    await expect(runStatus()).resolves.not.toThrow();
    consoleSpy.mockRestore();
  });

  it('runs doctor command', async () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const result = await runDoctor();
    expect(typeof result).toBe('boolean');
    consoleSpy.mockRestore();
  });

  it('runs rollback command with mock provider', async () => {
    const mockUpdateProvider: UpdateProvider = {
      publish: vi.fn().mockResolvedValue({
        success: true,
        channel: 'preview',
        branch: 'preview',
        message: 'Success',
      }),
    };

    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    await expect(runRollback({ provider: mockUpdateProvider, to: '186' })).resolves.not.toThrow();
    expect(mockUpdateProvider.publish).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});
