import fs from 'node:fs';
import path from 'node:path';
import pc from 'picocolors';
import { loadConfig } from '../config/loader.js';
import { getCurrentCommitSha, getCurrentBranch } from '../git/git.js';
import { readPreviewMetadata } from '../metadata/metadata.js';

export interface StatusOptions {
  cwd?: string;
}

export async function runStatus(options: StatusOptions = {}): Promise<void> {
  const cwd = options.cwd || process.cwd();
  const config = loadConfig(cwd);

  const commitSha = await getCurrentCommitSha(cwd);
  const currentBranch = await getCurrentBranch(cwd);
  const meta = readPreviewMetadata(cwd);

  let repoName = 'unknown';
  if (pathExists(cwd, 'package.json')) {
    try {
      const pkg = JSON.parse(fsRead(cwd, 'package.json'));
      repoName = pkg.name || 'unknown';
    } catch {}
  }

  console.log(pc.bold('\nMobile Preview Status\n'));
  console.log(`Repository:     ${pc.cyan(repoName)}`);
  console.log(`Current Commit: ${pc.cyan(commitSha)}`);
  console.log(`Current Branch: ${pc.cyan(currentBranch)}`);
  console.log(`Preview Channel:${pc.cyan(config.preview.channel)}`);

  if (meta) {
    console.log(`Last update:    ${meta.timestamp || 'unknown'}`);
    console.log(`Native build:   ${meta.nativeVersion || 'latest'}`);
    console.log(`JS update:      ${meta.previewVersion || meta.commit || 'latest'}`);
  } else {
    console.log(pc.yellow('Last update metadata: No local preview.json metadata found.'));
  }
  console.log('');
}

function pathExists(cwd: string, relPath: string): boolean {
  return fs.existsSync(path.join(cwd, relPath));
}

function fsRead(cwd: string, relPath: string): string {
  return fs.readFileSync(path.join(cwd, relPath), 'utf-8');
}
