import { execa } from 'execa';

export async function getCurrentCommitSha(cwd: string = process.cwd()): Promise<string> {
  try {
    const { stdout } = await execa('git', ['rev-parse', '--short', 'HEAD'], { cwd });
    return stdout.trim();
  } catch {
    return 'unknown';
  }
}

export async function getCurrentBranch(cwd: string = process.cwd()): Promise<string> {
  try {
    const { stdout } = await execa('git', ['rev-parse', '--abbrev-ref', 'HEAD'], { cwd });
    return stdout.trim();
  } catch {
    return 'unknown';
  }
}

export async function getBaseCommit(cwd: string = process.cwd(), customBase?: string): Promise<string> {
  if (customBase) return customBase;

  try {
    // Try HEAD~1 first
    const { stdout: head1 } = await execa('git', ['rev-parse', 'HEAD~1'], { cwd });
    return head1.trim();
  } catch {
    try {
      // Fallback to origin/main or origin/master if available
      const { stdout: main } = await execa('git', ['rev-parse', 'origin/main'], { cwd });
      return main.trim();
    } catch {
      return 'HEAD';
    }
  }
}

export async function getChangedFiles(cwd: string = process.cwd(), baseRef?: string): Promise<string[]> {
  const base = baseRef || (await getBaseCommit(cwd));
  try {
    // Diff against base commit
    const { stdout } = await execa('git', ['diff', '--name-only', `${base}...HEAD`], { cwd });
    if (!stdout.trim()) {
      // Fall back to simple diff between base and HEAD
      const { stdout: simpleDiff } = await execa('git', ['diff', '--name-only', base, 'HEAD'], { cwd });
      return simpleDiff.split('\n').map((f) => f.trim()).filter(Boolean);
    }
    return stdout.split('\n').map((f) => f.trim()).filter(Boolean);
  } catch {
    try {
      // Fall back to uncommitted + HEAD diff
      const { stdout: status } = await execa('git', ['diff', '--name-only', 'HEAD'], { cwd });
      return status.split('\n').map((f) => f.trim()).filter(Boolean);
    } catch {
      return [];
    }
  }
}

export async function getFileContentAtRef(cwd: string, filepath: string, ref: string): Promise<string | null> {
  try {
    const { stdout } = await execa('git', ['show', `${ref}:${filepath}`], { cwd });
    return stdout;
  } catch {
    return null;
  }
}
