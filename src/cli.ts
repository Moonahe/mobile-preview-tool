#!/usr/bin/env node
import { Command } from 'commander';
import { runInit } from './commands/init.js';
import { runDetect } from './commands/detect.js';
import { runUpdate } from './commands/update.js';
import { runBuild } from './commands/build.js';
import { runPublish } from './commands/publish.js';
import { runStatus } from './commands/status.js';
import { runDoctor } from './commands/doctor.js';
import { runRollback } from './commands/rollback.js';

const program = new Command();

program
  .name('mobile-preview')
  .description('Automated mobile preview pipeline tool for Expo/React Native applications')
  .version('0.1.0');

program
  .command('init')
  .description('Initialize mobile preview config and GitHub workflow in repository')
  .option('--yes', 'Skip prompts and use defaults')
  .action(async (options) => {
    await runInit(options);
  });

program
  .command('detect')
  .description('Detect changes between current commit and base commit')
  .option('--json', 'Output machine-readable JSON')
  .option('--base <baseRef>', 'Custom base Git ref to diff against')
  .action(async (options) => {
    await runDetect(options);
  });

program
  .command('update')
  .description('Publish JS/assets update via Expo EAS Update')
  .option('--branch <branch>', 'EAS update branch')
  .option('--channel <channel>', 'EAS update channel')
  .option('--message <message>', 'Update message')
  .action(async (options) => {
    await runUpdate(options);
  });

program
  .command('build')
  .description('Build native application (Android APK / iOS)')
  .option('--platform <platform>', 'Target platform (android or ios)', 'android')
  .action(async (options) => {
    await runBuild(options);
  });

program
  .command('publish')
  .description('Detect changes and orchestrate update or native build + release')
  .action(async () => {
    await runPublish();
  });

program
  .command('status')
  .description('Display status of mobile preview pipeline')
  .action(async () => {
    await runStatus();
  });

program
  .command('doctor')
  .description('Check CLI environment prerequisites and authentication')
  .action(async () => {
    await runDoctor();
  });

program
  .command('rollback')
  .description('Rollback preview channel or release to previous version')
  .option('--to <version>', 'Version or target commit to rollback to')
  .option('--channel <channel>', 'EAS channel')
  .action(async (options) => {
    await runRollback(options);
  });

program.parse(process.argv);
