import { execa } from 'execa';
import fs from 'node:fs';
import path from 'node:path';
import type { BuildProvider, BuildOptions, BuildResult } from './types.js';

export class GradleBuildProvider implements BuildProvider {
  async build(options: BuildOptions): Promise<BuildResult> {
    const cwd = options.cwd || process.cwd();

    if (options.platform !== 'android') {
      return {
        success: false,
        platform: options.platform,
        error: 'Gradle build provider only supports Android platform',
      };
    }

    const command = options.command || './gradlew assembleRelease';
    const parts = command.split(' ');
    const cmd = parts[0];
    const args = parts.slice(1);

    const androidDir = fs.existsSync(path.join(cwd, 'android')) ? path.join(cwd, 'android') : cwd;

    try {
      await execa(cmd, args, { cwd: androidDir });

      // Detect expected APK location
      const possibleApkPaths = [
        path.join(cwd, 'android/app/build/outputs/apk/release/app-release.apk'),
        path.join(cwd, 'app/build/outputs/apk/release/app-release.apk'),
        path.join(cwd, 'android/app/build/outputs/apk/debug/app-debug.apk'),
      ];

      let artifactPath: string | undefined;
      for (const p of possibleApkPaths) {
        if (fs.existsSync(p)) {
          artifactPath = p;
          break;
        }
      }

      return {
        success: true,
        platform: 'android',
        artifactPath,
      };
    } catch (err: any) {
      return {
        success: false,
        platform: 'android',
        error: err.message || String(err),
      };
    }
  }
}
