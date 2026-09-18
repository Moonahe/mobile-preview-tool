import fs from 'node:fs';
import path from 'node:path';
import pc from 'picocolors';
import { saveConfig, CONFIG_FILE_NAME } from '../config/loader.js';
import type { MobilePreviewConfig } from '../config/schema.js';

export interface InitOptions {
  cwd?: string;
  yes?: boolean;
}

export function generateGitHubWorkflowYaml(): string {
  return `name: Mobile Preview

on:
  push:
    branches:
      - '**'

concurrency:
  group: mobile-preview-\${{ github.ref }}
  cancel-in-progress: true

jobs:
  preview:
    runs-on: ubuntu-latest

    permissions:
      contents: write

    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - uses: actions/setup-node@v4
        with:
          node-version: 22

      - run: npm ci

      - name: Run Mobile Preview Detection
        run: npx mobile-preview detect --json

      - name: Mobile Preview Publish
        run: npx mobile-preview publish
        env:
          EXPO_TOKEN: \${{ secrets.EXPO_TOKEN }}
          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}
`;
}

export async function runInit(options: InitOptions = {}): Promise<void> {
  const cwd = options.cwd || process.cwd();

  console.log(pc.bold(pc.cyan('\n🚀 Initializing Mobile Preview Pipeline...\n')));

  const hasPackageJson = fs.existsSync(path.join(cwd, 'package.json'));
  const hasAppJson = fs.existsSync(path.join(cwd, 'app.json'));
  const hasAppConfigJs = fs.existsSync(path.join(cwd, 'app.config.js'));
  const hasAppConfigTs = fs.existsSync(path.join(cwd, 'app.config.ts'));

  const isExpo = hasPackageJson && (hasAppJson || hasAppConfigJs || hasAppConfigTs);

  if (!isExpo) {
    console.log(pc.yellow('⚠️  Warning: Expo project structure not explicitly detected, but continuing setup.'));
  } else {
    console.log(pc.green('✓ Detected Expo application directory.'));
  }

  const initialConfig: Partial<MobilePreviewConfig> = {
    provider: 'expo',
    appDirectory: '.',
    preview: {
      channel: 'preview',
      branch: 'preview',
      platforms: ['android', 'ios'],
    },
    nativeBuild: {
      provider: 'gradle',
      android: { enabled: true, artifact: 'apk' },
      ios: { enabled: false },
    },
    publish: {
      provider: 'github-release',
      repository: 'auto',
      releaseTag: 'mobile-preview',
    },
    detection: {
      nativePaths: [
        'android/**',
        'ios/**',
        'app.config.js',
        'app.config.ts',
        'app.json',
        'expo.json',
      ],
      nativeDependencies: true,
      nativePackages: [],
    },
  };

  const configPath = saveConfig(initialConfig, cwd);
  console.log(pc.green(`✓ Created ${CONFIG_FILE_NAME}`));

  const workflowDir = path.join(cwd, '.github', 'workflows');
  if (!fs.existsSync(workflowDir)) {
    fs.mkdirSync(workflowDir, { recursive: true });
  }

  const workflowPath = path.join(workflowDir, 'mobile-preview.yml');
  fs.writeFileSync(workflowPath, generateGitHubWorkflowYaml(), 'utf-8');
  console.log(pc.green(`✓ Created .github/workflows/mobile-preview.yml`));

  console.log(pc.bold(pc.magenta('\n📋 Next Steps & Required Secrets:')));
  console.log('Ensure the following environment secrets are set in your GitHub Repository settings:');
  console.log(`  ${pc.cyan('EXPO_TOKEN')}    - Token from expo.dev for publishing EAS Updates / Builds.`);
  console.log(`  ${pc.cyan('GITHUB_TOKEN')}  - GitHub Actions token with 'contents: write' permission.`);
  console.log('\nInitialization complete! You can now commit mobile-preview.config.json and .github/workflows/mobile-preview.yml\n');
}
