import { execEas } from '../utils/exec-eas.js';
import type { BuildProvider, BuildOptions, BuildResult } from './types.js';

export class EasBuildProvider implements BuildProvider {
  async build(options: BuildOptions): Promise<BuildResult> {
    const cwd = options.cwd || process.cwd();
    const platform = options.platform;

    if (options.dryRun) {
      console.log(`[Dry Run] Simulated EAS build for platform '${platform}'`);
      return {
        success: true,
        platform,
        buildId: 'eas-build-simulated',
      };
    }

    try {
      const args = [
        'build',
        '--platform',
        platform,
        '--profile',
        'preview',
        '--non-interactive',
      ];

      const { stdout } = await execEas(args, { cwd });

      return {
        success: true,
        platform,
        buildId: 'eas-build-triggered',
      };
    } catch (err: any) {
      const errorMsg = err.message || String(err);
      if (errorMsg.includes('Generating a new Keystore is not supported in --non-interactive mode')) {
        return {
          success: false,
          platform,
          error: `EAS Android credentials/keystore missing on Expo Cloud. Please run 'eas build --platform android' once interactively from your terminal or run 'eas credentials' to set up keystore credentials.`,
        };
      }

      return {
        success: false,
        platform,
        error: errorMsg,
      };
    }
  }
}
