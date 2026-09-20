import { getChangedFiles, getBaseCommit } from '../git/git.js';
import {
  isPathMatchingNativeRules,
  detectPackageJsonNativeChanges,
  detectExpoConfigNativeChanges,
} from './native-detector.js';
import { generateFingerprint, readStoredFingerprint } from './fingerprint.js';
import type { MobilePreviewConfig } from '../config/schema.js';

export type DetectionClassification = 'javascript' | 'native' | 'configuration' | 'unknown';

export interface DetectionResult {
  classification: DetectionClassification;
  nativeChange: boolean;
  files: string[];
  reason: string;
}

export async function detectChanges(
  config: MobilePreviewConfig,
  cwd: string = process.cwd(),
  overrideBaseRef?: string
): Promise<DetectionResult> {
  const baseRef = overrideBaseRef || (await getBaseCommit(cwd));
  const changedFiles = await getChangedFiles(cwd, baseRef);

  // Check EAS Fingerprint if enabled
  if (config.detection.useFingerprint !== false) {
    const currentFingerprint = await generateFingerprint(cwd);
    if (currentFingerprint) {
      const storedFingerprint = await readStoredFingerprint(cwd, config.publish?.releaseTag);
      if (storedFingerprint && currentFingerprint !== storedFingerprint) {
        return {
          classification: 'native',
          nativeChange: true,
          files: changedFiles,
          reason: `EAS native fingerprint changed (${storedFingerprint.slice(0, 8)} -> ${currentFingerprint.slice(0, 8)})`,
        };
      }
    }
  }

  if (changedFiles.length === 0) {
    return {
      classification: 'javascript',
      nativeChange: false,
      files: [],
      reason: 'No files changed',
    };
  }

  const nativePaths = config.detection.nativePaths;
  const customNativePackages = config.detection.nativePackages;

  // 1. Direct native path changes
  const matchingNativeFiles = changedFiles.filter((file) => isPathMatchingNativeRules(file, nativePaths));

  // Check lockfile or package.json changes
  const hasPackageJsonChange = changedFiles.includes('package.json');
  const hasLockfileChange = changedFiles.some((f) =>
    ['package-lock.json', 'yarn.lock', 'pnpm-lock.yaml', 'bun.lockb'].includes(f)
  );

  let nativePackageChanges: string[] = [];
  if (config.detection.nativeDependencies && (hasPackageJsonChange || hasLockfileChange)) {
    const depCheck = await detectPackageJsonNativeChanges(cwd, baseRef, customNativePackages);
    if (depCheck.hasNativePackageChange) {
      nativePackageChanges = depCheck.changedPackages;
    }
  }

  // Check app.json / app.config.js/ts native field changes
  const hasExpoConfigChange = changedFiles.some((f) =>
    ['app.json', 'app.config.js', 'app.config.ts', 'expo.json'].includes(f)
  );

  let expoNativeReason: string | undefined;
  if (hasExpoConfigChange) {
    const expoCheck = await detectExpoConfigNativeChanges(cwd, baseRef);
    if (expoCheck.hasExpoConfigNativeChange) {
      expoNativeReason = expoCheck.reason;
    }
  }

  // Direct native files (android/, ios/)
  const hasDirectNativeFiles = matchingNativeFiles.some(
    (f) => f.startsWith('android/') || f.startsWith('ios/')
  );

  if (hasDirectNativeFiles || nativePackageChanges.length > 0 || expoNativeReason) {
    const reasons: string[] = [];
    if (hasDirectNativeFiles) reasons.push('Native files modified in android/ or ios/');
    if (nativePackageChanges.length > 0) reasons.push(`Native package changes: ${nativePackageChanges.join(', ')}`);
    if (expoNativeReason) reasons.push(expoNativeReason);

    return {
      classification: 'native',
      nativeChange: true,
      files: changedFiles,
      reason: reasons.join('; '),
    };
  }

  // Check if non-native config files changed
  const isOnlyConfig = changedFiles.every((f) =>
    ['.gitignore', '.prettierrc', 'README.md', 'mobile-preview.config.json', 'tsconfig.json'].includes(f)
  );

  if (isOnlyConfig) {
    return {
      classification: 'configuration',
      nativeChange: false,
      files: changedFiles,
      reason: 'Only non-code configuration files changed',
    };
  }

  // Default to javascript classification if non-native
  return {
    classification: 'javascript',
    nativeChange: false,
    files: changedFiles,
    reason: 'Only JS/TS/application assets changed',
  };
}
