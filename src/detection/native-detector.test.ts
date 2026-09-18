import { describe, it, expect, vi } from 'vitest';
import { isKnownNativePackage, isPathMatchingNativeRules } from './native-detector.js';

describe('native-detector', () => {
  it('identifies known native packages accurately', () => {
    expect(isKnownNativePackage('expo-camera')).toBe(true);
    expect(isKnownNativePackage('react-native-maps')).toBe(true);
    expect(isKnownNativePackage('expo-status-bar')).toBe(false);
    expect(isKnownNativePackage('lodash')).toBe(false);
    expect(isKnownNativePackage('my-custom-native-pkg', ['my-custom-native-pkg'])).toBe(true);
  });

  it('matches paths against native rules', () => {
    const rules = ['android/**', 'ios/**', 'app.json'];
    expect(isPathMatchingNativeRules('android/app/build.gradle', rules)).toBe(true);
    expect(isPathMatchingNativeRules('ios/Podfile', rules)).toBe(true);
    expect(isPathMatchingNativeRules('app.json', rules)).toBe(true);
    expect(isPathMatchingNativeRules('src/App.tsx', rules)).toBe(false);
  });
});
