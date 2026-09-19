import pc from 'picocolors';
import { loadConfig } from '../config/loader.js';
import { GradleBuildProvider } from '../providers/gradle-build.js';
import { EasBuildProvider } from '../providers/eas-build.js';
import type { BuildProvider } from '../providers/types.js';

export interface BuildCommandOptions {
  cwd?: string;
  platform?: 'android' | 'ios';
  provider?: BuildProvider;
  dryRun?: boolean;
}

export async function runBuild(options: BuildCommandOptions = {}): Promise<string | undefined> {
  const cwd = options.cwd || process.cwd();
  const config = loadConfig(cwd);

  const platform = options.platform || 'android';

  if (platform === 'ios' && !config.nativeBuild.ios.enabled) {
    console.log(pc.yellow('iOS native preview publishing is not enabled.'));
    return undefined;
  }

  console.log(pc.bold('\nMobile Preview\n'));
  console.log('Classification: Native');
  console.log(`Platform:       ${platform}`);
  console.log(`Provider:       ${config.nativeBuild.provider}`);
  if (options.dryRun) {
    console.log(pc.yellow('Mode:           Dry Run\n'));
  } else {
    console.log('');
  }
  console.log('Building Native Application...\n');

  let provider: BuildProvider;
  if (options.provider) {
    provider = options.provider;
  } else if (config.nativeBuild.provider === 'eas') {
    provider = new EasBuildProvider();
  } else {
    provider = new GradleBuildProvider();
  }

  const result = await provider.build({
    cwd,
    platform,
    command: config.nativeBuild.android.command,
    dryRun: options.dryRun,
  });

  if (result.success) {
    console.log(pc.green('✓ Native build completed successfully\n'));
    return result.artifactPath;
  } else {
    console.error(pc.red(`✗ Native build failed: ${result.error}`));
    throw new Error(`Native build failed: ${result.error}`);
  }
}
