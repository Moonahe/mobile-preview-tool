import pc from 'picocolors';
import { loadConfig } from '../config/loader.js';
import { detectChanges } from '../detection/change-detector.js';

export interface DetectOptions {
  cwd?: string;
  json?: boolean;
  base?: string;
}

export async function runDetect(options: DetectOptions = {}): Promise<void> {
  const cwd = options.cwd || process.cwd();
  const config = loadConfig(cwd);

  const result = await detectChanges(config, cwd, options.base);

  if (options.json) {
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  console.log(pc.bold('\nMobile Preview - Change Detection\n'));
  console.log(`Classification: ${pc.cyan(result.classification)}`);
  console.log(`Native Change:  ${result.nativeChange ? pc.yellow('Yes') : pc.green('No')}`);
  console.log(`Reason:         ${result.reason}`);
  console.log(`Changed Files (${result.files.length}):`);
  result.files.forEach((file) => console.log(`  - ${file}`));
  console.log('');
}
