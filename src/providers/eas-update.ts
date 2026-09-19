import { execEas } from '../utils/exec-eas.js';
import type { UpdateProvider, UpdateOptions, UpdateResult } from './types.js';

export class EasUpdateProvider implements UpdateProvider {
  async publish(options: UpdateOptions): Promise<UpdateResult> {
    const cwd = options.cwd || process.cwd();
    const branch = options.branch || 'preview';
    const message = options.message || `Update for commit ${options.commitSha || 'HEAD'}`;

    try {
      const args = ['update', '--branch', branch, '--message', message, '--non-interactive'];
      const { stdout } = await execEas(args, { cwd });

      return {
        success: true,
        channel: options.channel || branch,
        branch,
        message: 'EAS update published successfully',
      };
    } catch (err: any) {
      return {
        success: false,
        channel: options.channel || branch,
        branch,
        message: 'Failed to publish EAS update',
        error: err.message || String(err),
      };
    }
  }
}
