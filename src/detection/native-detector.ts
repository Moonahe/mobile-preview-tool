import { minimatch } from 'minimatch';
import { getFileContentAtRef } from '../git/git.js';
import type { DetectionConfig } from '../config/schema.js';

const DEFAULT_KNOWN_NATIVE_PACKAGES = [
  'react-native',
  'expo',
  'expo-camera',
  'expo-location',
  'expo-av',
  'expo-file-system',
  'expo-image-picker',
  'expo-contacts',
  'expo-sqlite',
  'expo-sensors',
  'expo-notifications',
  'expo-local-authentication',
  'expo-media-library',
  'expo-barcode-scanner',
  'expo-device',
  'expo-haptics',
  'expo-tracking-transparency',
  'expo-crypto',
  'expo-secure-store',
  'react-native-maps',
  'react-native-svg',
  'react-native-reanimated',
  'react-native-gesture-handler',
  'react-native-screens',
  'react-native-safe-area-context',
  'react-native-vector-icons',
  'react-native-webview',
  'react-native-linear-gradient',
  '@react-native-async-storage/async-storage',
  '@react-native-community/netinfo',
  '@react-native-community/datetimepicker',
  '@react-native-community/slider',
];

export function isKnownNativePackage(packageName: string, customNativePackages: string[] = []): boolean {
  if (customNativePackages.includes(packageName)) return true;
  if (DEFAULT_KNOWN_NATIVE_PACKAGES.includes(packageName)) return true;

  // Convention based checks
  if (packageName.startsWith('expo-') && packageName !== 'expo-status-bar') return true;
  if (packageName.startsWith('react-native-')) return true;
  if (packageName.startsWith('@react-native-')) return true;
  if (packageName.startsWith('@react-native-community/')) return true;

  return false;
}

export function isPathMatchingNativeRules(filePath: string, nativePaths: string[]): boolean {
  return nativePaths.some((pattern) => minimatch(filePath, pattern, { dot: true }));
}

export async function detectPackageJsonNativeChanges(
  cwd: string,
  baseRef: string,
  customNativePackages: string[],
  changedFiles: string[] = []
): Promise<{ hasNativePackageChange: boolean; changedPackages: string[] }> {
  const pkgFiles = changedFiles.filter((f) => f.endsWith('package.json'));
  const filesToCheck = pkgFiles.length > 0 ? pkgFiles : ['package.json'];

  const changedPackages: string[] = [];

  for (const pkgFile of filesToCheck) {
    const currentContent = await getFileContentAtRef(cwd, pkgFile, 'HEAD');
    const baseContent = await getFileContentAtRef(cwd, pkgFile, baseRef);

    if (!currentContent || !baseContent) continue;

    try {
      const currentPkg = JSON.parse(currentContent);
      const basePkg = JSON.parse(baseContent);

      const currentDeps = { ...currentPkg.dependencies, ...currentPkg.devDependencies };
      const baseDeps = { ...basePkg.dependencies, ...basePkg.devDependencies };

      const allKeys = new Set([...Object.keys(currentDeps), ...Object.keys(baseDeps)]);

      for (const pkgName of allKeys) {
        if (currentDeps[pkgName] !== baseDeps[pkgName]) {
          if (isKnownNativePackage(pkgName, customNativePackages)) {
            changedPackages.push(pkgName);
          }
        }
      }
    } catch {
      changedPackages.push(`${pkgFile} parsing error`);
    }
  }

  return {
    hasNativePackageChange: changedPackages.length > 0,
    changedPackages,
  };
}

export async function detectExpoConfigNativeChanges(
  cwd: string,
  baseRef: string,
  changedFiles: string[] = []
): Promise<{ hasExpoConfigNativeChange: boolean; reason?: string }> {
  const expoConfigFiles = changedFiles.filter((f) =>
    f.endsWith('app.json') || f.endsWith('app.config.js') || f.endsWith('app.config.ts') || f.endsWith('expo.json')
  );

  const filesToCheck = expoConfigFiles.length > 0 ? expoConfigFiles : ['app.json'];

  for (const configFile of filesToCheck) {
    const currentContent = await getFileContentAtRef(cwd, configFile, 'HEAD');
    const baseContent = await getFileContentAtRef(cwd, configFile, baseRef);

    if (!currentContent || !baseContent) {
      if (currentContent || baseContent) {
        return {
          hasExpoConfigNativeChange: true,
          reason: `Expo config file created or deleted: ${configFile}`,
        };
      }
      continue;
    }

    try {
      const currentParsed = JSON.parse(currentContent);
      const baseParsed = JSON.parse(baseContent);
      const currentConfig = currentParsed.expo || currentParsed;
      const baseConfig = baseParsed.expo || baseParsed;

      // Check key fields that alter native builds or OTA updates
      const nativeFields = [
        'sdkVersion',
        'plugins',
        'android',
        'ios',
        'scheme',
        'userInterfaceStyle',
        'orientation',
        'icon',
        'splash',
        'notification',
        'updates',
        'runtimeVersion',
        'extra',
        'jsEngine',
        'experiments',
      ];

      for (const field of nativeFields) {
        if (JSON.stringify(currentConfig[field]) !== JSON.stringify(baseConfig[field])) {
          return {
            hasExpoConfigNativeChange: true,
            reason: `Expo config native field changed in ${configFile}: ${field}`,
          };
        }
      }
    } catch {
      return { hasExpoConfigNativeChange: true, reason: `Failed to parse ${configFile}` };
    }
  }

  return { hasExpoConfigNativeChange: false };
}
