import { z } from 'zod';

export const PreviewConfigSchema = z.object({
  channel: z.string().default('preview'),
  branch: z.string().default('preview'),
  platforms: z.array(z.enum(['android', 'ios'])).default(['android', 'ios']),
});

export const AndroidBuildConfigSchema = z.object({
  enabled: z.boolean().default(true),
  artifact: z.string().default('apk'),
  command: z.string().optional(),
});

export const IosBuildConfigSchema = z.object({
  enabled: z.boolean().default(false),
  artifact: z.string().optional(),
  command: z.string().optional(),
});

export const NativeBuildConfigSchema = z.object({
  provider: z.enum(['gradle', 'eas']).default('gradle'),
  android: AndroidBuildConfigSchema.default({}),
  ios: IosBuildConfigSchema.default({}),
});

export const PublishConfigSchema = z.object({
  provider: z.enum(['github-release', 'http', 's3', 'custom']).default('github-release'),
  repository: z.string().default('auto'),
  releaseTag: z.string().default('mobile-preview'),
});

export const DetectionConfigSchema = z.object({
  nativePaths: z.array(z.string()).default([
    'android/**',
    'ios/**',
    '**/android/**',
    '**/ios/**',
    '**/app.config.js',
    '**/app.config.ts',
    '**/app.json',
    '**/expo.json',
    'app.config.js',
    'app.config.ts',
    'app.json',
    'expo.json',
  ]),
  nativeDependencies: z.boolean().default(true),
  nativePackages: z.array(z.string()).default([]),
  useFingerprint: z.boolean().default(true),
});

export const MobilePreviewConfigSchema = z.object({
  $schema: z.string().optional(),
  provider: z.enum(['expo']).default('expo'),
  appDirectory: z.string().default('.'),
  preview: PreviewConfigSchema.default({}),
  nativeBuild: NativeBuildConfigSchema.default({}),
  publish: PublishConfigSchema.default({}),
  detection: DetectionConfigSchema.default({}),
});

export type PreviewConfig = z.infer<typeof PreviewConfigSchema>;
export type AndroidBuildConfig = z.infer<typeof AndroidBuildConfigSchema>;
export type IosBuildConfig = z.infer<typeof IosBuildConfigSchema>;
export type NativeBuildConfig = z.infer<typeof NativeBuildConfigSchema>;
export type PublishConfig = z.infer<typeof PublishConfigSchema>;
export type DetectionConfig = z.infer<typeof DetectionConfigSchema>;
export type MobilePreviewConfig = z.infer<typeof MobilePreviewConfigSchema>;
