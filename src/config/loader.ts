import fs from 'node:fs';
import path from 'node:path';
import { MobilePreviewConfigSchema, type MobilePreviewConfig } from './schema.js';

export const CONFIG_FILE_NAME = 'mobile-preview.config.json';

export function loadConfig(cwd: string = process.cwd(), customPath?: string): MobilePreviewConfig {
  const configPath = customPath
    ? path.resolve(cwd, customPath)
    : path.resolve(cwd, CONFIG_FILE_NAME);

  if (!fs.existsSync(configPath)) {
    // Return default configuration if config file does not exist
    return MobilePreviewConfigSchema.parse({});
  }

  try {
    const rawContent = fs.readFileSync(configPath, 'utf-8');
    const json = JSON.parse(rawContent);
    return MobilePreviewConfigSchema.parse(json);
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error(`Invalid JSON in configuration file: ${configPath}`);
    }
    throw error;
  }
}

export function saveConfig(config: Partial<MobilePreviewConfig>, cwd: string = process.cwd(), customPath?: string): string {
  const configPath = customPath
    ? path.resolve(cwd, customPath)
    : path.resolve(cwd, CONFIG_FILE_NAME);

  const validated = MobilePreviewConfigSchema.parse(config);
  fs.writeFileSync(configPath, JSON.stringify(validated, null, 2) + '\n', 'utf-8');
  return configPath;
}
