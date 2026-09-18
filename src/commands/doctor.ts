import pc from 'picocolors';
import { execa } from 'execa';

export interface DoctorOptions {
  cwd?: string;
  timeout?: number;
}

interface DoctorCheck {
  name: string;
  check: () => Promise<boolean>;
  fixTip: string;
}

export async function runDoctor(options: DoctorOptions = {}): Promise<boolean> {
  const cwd = options.cwd || process.cwd();
  const timeout = options.timeout || 1500;

  console.log(pc.bold('\n🔍 Running Mobile Preview Environment Doctor...\n'));

  const exec = (cmd: string, args: string[]) => execa(cmd, args, { cwd, timeout });

  const checks: DoctorCheck[] = [
    {
      name: 'Node environment',
      check: async () => {
        const { stdout } = await exec('node', ['-v']);
        return Boolean(stdout);
      },
      fixTip: 'Install Node.js (version >= 18 recommended).',
    },
    {
      name: 'Git executable',
      check: async () => {
        const { stdout } = await exec('git', ['--version']);
        return Boolean(stdout);
      },
      fixTip: 'Install Git and ensure it is available in PATH.',
    },
    {
      name: 'Expo / EAS CLI',
      check: async () => {
        try {
          await exec('eas', ['--version']);
          return true;
        } catch {
          try {
            await exec('npx', ['eas-cli', '--version']);
            return true;
          } catch {
            return false;
          }
        }
      },
      fixTip: 'Install EAS CLI globally via `npm i -g eas-cli` or add `eas-cli` as a dev dependency.',
    },
    {
      name: 'Expo Authentication / EXPO_TOKEN',
      check: async () => {
        if (process.env.EXPO_TOKEN) return true;
        try {
          const { stdout } = await exec('eas', ['whoami']);
          return stdout.trim().length > 0;
        } catch {
          return false;
        }
      },
      fixTip: 'Set EXPO_TOKEN environment variable or run `eas login`.',
    },
    {
      name: 'GitHub Authentication / GITHUB_TOKEN',
      check: async () => {
        if (process.env.GITHUB_TOKEN || process.env.GH_TOKEN) return true;
        try {
          const { stdout } = await exec('gh', ['auth', 'status']);
          return Boolean(stdout);
        } catch {
          return false;
        }
      },
      fixTip: 'Set GITHUB_TOKEN environment variable or login using `gh auth login`.',
    },
    {
      name: 'Android SDK / Gradle (for local native builds)',
      check: async () => {
        if (process.env.ANDROID_HOME || process.env.ANDROID_SDK_ROOT) return true;
        try {
          await exec('./gradlew', ['--version']);
          return true;
        } catch {
          return false;
        }
      },
      fixTip: 'Set ANDROID_HOME environment variable or ensure Gradle wrapper exists.',
    },
  ];

  let allPassed = true;

  for (const c of checks) {
    try {
      const passed = await c.check();
      if (passed) {
        console.log(` ${pc.green('✓')} ${c.name}`);
      } else {
        allPassed = false;
        console.log(` ${pc.yellow('⚠️')} ${c.name}`);
        console.log(`    ${pc.gray(`Tip: ${c.fixTip}`)}`);
      }
    } catch {
      allPassed = false;
      console.log(` ${pc.red('✗')} ${c.name}`);
      console.log(`    ${pc.gray(`Tip: ${c.fixTip}`)}`);
    }
  }

  console.log('');
  if (allPassed) {
    console.log(pc.green('✓ All environment checks passed!\n'));
  } else {
    console.log(pc.yellow('⚠️ Some checks did not pass. Preview functionality may be degraded depending on configuration.\n'));
  }

  return allPassed;
}
