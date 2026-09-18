import { describe, it, expect, vi } from 'vitest';
import { GradleBuildProvider } from './gradle-build.js';
import { EasUpdateProvider } from './eas-update.ts';
import { GitHubReleasePublisher } from './github-release.ts';

describe('Providers Abstractions', () => {
  it('instantiates GradleBuildProvider', () => {
    const provider = new GradleBuildProvider();
    expect(provider).toBeDefined();
  });

  it('instantiates EasUpdateProvider', () => {
    const provider = new EasUpdateProvider();
    expect(provider).toBeDefined();
  });

  it('instantiates GitHubReleasePublisher', () => {
    const publisher = new GitHubReleasePublisher();
    expect(publisher).toBeDefined();
  });
});
