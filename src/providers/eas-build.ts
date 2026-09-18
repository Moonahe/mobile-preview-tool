import { execa } from 'execa';
import type { BuildProvider, BuildOptions, BuildResult } from './types.js';

export class EasBuildProvider implements BuildProvider {
  async build(options: BuildOptions): Promise<BuildResult> {
    const cwd = options.cwd || process.cwd();
    const platform = options.platform;

    try {
      const args = [
        'build',
        '--platform',
        platform,
        '--profile',
        'preview',
        '--non-interactive',
      ];

      const { stdout } = await execa('eas', args, { cwd });

      return {
        success: true,
        platform,
        buildId: 'eas-build-triggered',
      };
    } catch (err: any) {
      return {
        success: false,
        platform,
        error: err.message || String(err),
      };
    }
  }
}
