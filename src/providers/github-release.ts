import { execa } from 'execa';
import fs from 'node:fs';
import path from 'node:path';
import type { ArtifactPublisher, ArtifactOptions, ArtifactResult } from './types.js';

export class GitHubReleasePublisher implements ArtifactPublisher {
  private async getRepoSlug(cwd: string): Promise<string> {
    if (process.env.GITHUB_REPOSITORY) {
      return process.env.GITHUB_REPOSITORY;
    }
    try {
      const { stdout } = await execa('git', ['config', '--get', 'remote.origin.url'], { cwd });
      const match = stdout.match(/github\.com[:/]([^/]+\/[^/.]+)/);
      if (match && match[1]) {
        return match[1];
      }
    } catch {}
    return 'owner/repository';
  }

  async publish(options: ArtifactOptions): Promise<ArtifactResult> {
    const cwd = options.cwd || process.cwd();
    const { artifactPath, releaseTag, metadata } = options;

    if (!fs.existsSync(artifactPath)) {
      return {
        success: false,
        releaseTag,
        error: `Artifact file does not exist at path: ${artifactPath}`,
      };
    }

    try {
      // Create metadata preview.json alongside artifact
      const metaPath = path.join(path.dirname(artifactPath), 'preview.json');
      fs.writeFileSync(metaPath, JSON.stringify(metadata || {}, null, 2), 'utf-8');

      // Create or edit release using gh CLI if available
      try {
        await execa('gh', ['release', 'view', releaseTag], { cwd });
      } catch {
        // Create release if it doesn't exist
        await execa(
          'gh',
          ['release', 'create', releaseTag, '--title', 'Mobile Preview Latest', '--notes', 'Latest mobile preview artifact'],
          { cwd }
        );
      }

      // Upload assets (app-preview.apk and preview.json)
      const targetApkName = path.join(path.dirname(artifactPath), 'app-preview.apk');
      if (artifactPath !== targetApkName) {
        fs.copyFileSync(artifactPath, targetApkName);
      }

      await execa('gh', ['release', 'upload', releaseTag, targetApkName, metaPath, '--clobber'], { cwd });

      const repoSlug = await this.getRepoSlug(cwd);

      return {
        success: true,
        releaseTag,
        downloadUrl: `https://github.com/${repoSlug}/releases/download/${releaseTag}/app-preview.apk`,
      };
    } catch (err: any) {
      return {
        success: false,
        releaseTag,
        error: err.message || String(err),
      };
    }
  }
}
