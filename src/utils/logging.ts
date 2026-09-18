import pc from 'picocolors';

export function logInfo(message: string): void {
  console.log(pc.blue(`ℹ ${message}`));
}

export function logSuccess(message: string): void {
  console.log(pc.green(`✓ ${message}`));
}

export function logWarn(message: string): void {
  console.log(pc.yellow(`⚠️ ${message}`));
}

export function logError(message: string): void {
  console.error(pc.red(`✗ ${message}`));
}
