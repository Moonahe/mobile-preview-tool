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
  customNativePackages: string[]
): Promise<{ hasNativePackageChange: boolean; changedPackages: string[] }> {
  const currentContent = await getFileContentAtRef(cwd, 'package.json', 'HEAD');
  const baseContent = await getFileContentAtRef(cwd, 'package.json', baseRef);

  if (!currentContent || !baseContent) {
    return { hasNativePackageChange: false, changedPackages: [] };
  }

  try {
    const currentPkg = JSON.parse(currentContent);
    const basePkg = JSON.parse(baseContent);

    const currentDeps = { ...currentPkg.dependencies, ...currentPkg.devDependencies };
    const baseDeps = { ...basePkg.dependencies, ...basePkg.devDependencies };

    const allKeys = new Set([...Object.keys(currentDeps), ...Object.keys(baseDeps)]);
    const changedPackages: string[] = [];

    for (const pkgName of allKeys) {
      if (currentDeps[pkgName] !== baseDeps[pkgName]) {
        if (isKnownNativePackage(pkgName, customNativePackages)) {
          changedPackages.push(pkgName);
        }
      }
    }

    return {
      hasNativePackageChange: changedPackages.length > 0,
      changedPackages,
    };
  } catch {
    return { hasNativePackageChange: true, changedPackages: ['package.json parsing error'] };
  }
}

export async function detectExpoConfigNativeChanges(
  cwd: string,
  baseRef: string
): Promise<{ hasExpoConfigNativeChange: boolean; reason?: string }> {
  const currentAppJson = await getFileContentAtRef(cwd, 'app.json', 'HEAD');
  const baseAppJson = await getFileContentAtRef(cwd, 'app.json', baseRef);

  if (!currentAppJson || !baseAppJson) {
    // If app.json was added or deleted or not present, assume potential config native change if file changed
    return { hasExpoConfigNativeChange: false };
  }

  try {
    const currentConfig = JSON.parse(currentAppJson).expo || JSON.parse(currentAppJson);
    const baseConfig = JSON.parse(baseAppJson).expo || JSON.parse(baseAppJson);

    // Check key fields that alter native builds
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
    ];

    for (const field of nativeFields) {
      if (JSON.stringify(currentConfig[field]) !== JSON.stringify(baseConfig[field])) {
        return {
          hasExpoConfigNativeChange: true,
          reason: `Expo config native field changed: ${field}`,
        };
      }
    }

    return { hasExpoConfigNativeChange: false };
  } catch {
    return { hasExpoConfigNativeChange: true, reason: 'Failed to parse app.json' };
  }
}
