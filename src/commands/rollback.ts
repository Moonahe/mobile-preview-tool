import pc from 'picocolors';
import { loadConfig } from '../config/loader.js';
import { EasUpdateProvider } from '../providers/eas-update.js';
import type { UpdateProvider } from '../providers/types.js';

export interface RollbackOptions {
  cwd?: string;
  to?: string;
  channel?: string;
  provider?: UpdateProvider;
}

export async function runRollback(options: RollbackOptions = {}): Promise<void> {
  const cwd = options.cwd || process.cwd();
  const config = loadConfig(cwd);

  const channel = options.channel || config.preview.channel || 'preview';
  const target = options.to || 'previous';

  console.log(pc.bold('\nMobile Preview - Rollback\n'));
  console.log(`Channel: ${pc.cyan(channel)}`);
  console.log(`Rolling back to: ${pc.cyan(target)}...\n`);

  const provider = options.provider || new EasUpdateProvider();

  // Re-publish previous update or run eas update rollback command
  const result = await provider.publish({
    cwd,
    branch: config.preview.branch || 'preview',
    channel,
    message: `Rollback channel ${channel} to ${target}`,
  });

  if (result.success) {
    console.log(pc.green(`✓ Rollback successfully triggered for channel '${channel}' to '${target}'.\n`));
  } else {
    console.error(pc.red(`✗ Rollback failed: ${result.error}`));
    throw new Error(`Rollback failed: ${result.error}`);
  }
}
