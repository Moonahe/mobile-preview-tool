import pc from 'picocolors';
import { loadConfig } from '../config/loader.js';
import { EasUpdateProvider } from '../providers/eas-update.js';
import { getCurrentCommitSha, getCurrentBranch } from '../git/git.js';
import type { UpdateProvider } from '../providers/types.js';

export interface UpdateCommandOptions {
  cwd?: string;
  branch?: string;
  channel?: string;
  message?: string;
  provider?: UpdateProvider;
}

export async function runUpdate(options: UpdateCommandOptions = {}): Promise<void> {
  const cwd = options.cwd || process.cwd();
  const config = loadConfig(cwd);

  const commitSha = await getCurrentCommitSha(cwd);
  const currentBranch = await getCurrentBranch(cwd);

  const branch = options.branch || config.preview.branch || 'preview';
  const channel = options.channel || config.preview.channel || 'preview';

  console.log(pc.bold('\nMobile Preview\n'));
  console.log('Classification: JavaScript');
  console.log(`Commit:         ${commitSha}`);
  console.log(`Branch:         ${currentBranch}`);
  console.log(`Target Channel: ${channel}\n`);
  console.log('Publishing EAS Update...\n');

  const provider = options.provider || new EasUpdateProvider();
  const result = await provider.publish({
    cwd,
    branch,
    channel,
    message: options.message || `Preview update for commit ${commitSha}`,
    commitSha,
  });

  if (result.success) {
    console.log(pc.green('✓ Bundle created'));
    console.log(pc.green('✓ Assets uploaded'));
    console.log(pc.green('✓ Update published\n'));
    console.log(`Update: ${commitSha}\n`);
  } else {
    console.error(pc.red(`✗ Failed to publish EAS Update: ${result.error}`));
    throw new Error(`EAS Update publish failed: ${result.error}`);
  }
}
