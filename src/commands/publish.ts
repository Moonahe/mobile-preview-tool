import pc from 'picocolors';
import fs from 'node:fs';
import path from 'node:path';
import { loadConfig } from '../config/loader.js';
import { detectChanges } from '../detection/change-detector.js';
import { runUpdate } from './update.js';
import { runBuild } from './build.js';
import { GitHubReleasePublisher } from '../providers/github-release.js';
import { getCurrentCommitSha, getCurrentBranch } from '../git/git.js';
import type { ArtifactPublisher, BuildProvider, UpdateProvider } from '../providers/types.js';

export interface PublishCommandOptions {
  cwd?: string;
  updateProvider?: UpdateProvider;
  buildProvider?: BuildProvider;
  publisher?: ArtifactPublisher;
}

export async function runPublish(options: PublishCommandOptions = {}): Promise<void> {
  const cwd = options.cwd || process.cwd();
  const config = loadConfig(cwd);

  const detection = await detectChanges(config, cwd);
  const commitSha = await getCurrentCommitSha(cwd);
  const branch = await getCurrentBranch(cwd);

  if (detection.classification === 'javascript' || detection.classification === 'configuration') {
    // Run JS update path
    await runUpdate({
      cwd,
      provider: options.updateProvider,
    });
    return;
  }

  // Native build path
  const artifactPath = await runBuild({
    cwd,
    platform: 'android',
    provider: options.buildProvider,
  });

  if (!artifactPath || !fs.existsSync(artifactPath)) {
    console.log(pc.yellow('No artifact produced or found to publish. Skipping release upload.'));
    return;
  }

  // Create preview metadata
  const metadata = {
    commit: commitSha,
    branch,
    timestamp: new Date().toISOString(),
    classification: detection.classification,
    platform: 'android',
    artifact: 'app-preview.apk',
  };

  const publisher = options.publisher || new GitHubReleasePublisher();
  const publishResult = await publisher.publish({
    cwd,
    artifactPath,
    releaseTag: config.publish.releaseTag || 'mobile-preview',
    repository: config.publish.repository,
    metadata,
  });

  if (publishResult.success) {
    console.log(pc.green(`✓ Artifact published to release tag: ${publishResult.releaseTag}`));
    if (publishResult.downloadUrl) {
      console.log(`Download URL: ${pc.cyan(publishResult.downloadUrl)}`);
    }
  } else {
    console.error(pc.red(`✗ Failed to publish release artifact: ${publishResult.error}`));
    throw new Error(`Publish failed: ${publishResult.error}`);
  }
}
