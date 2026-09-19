export interface UpdateOptions {
  cwd?: string;
  branch: string;
  channel?: string;
  message?: string;
  commitSha?: string;
  dryRun?: boolean;
}

export interface UpdateResult {
  success: boolean;
  updateId?: string;
  channel: string;
  branch: string;
  message: string;
  error?: string;
}

export interface UpdateProvider {
  publish(options: UpdateOptions): Promise<UpdateResult>;
}

export interface BuildOptions {
  cwd?: string;
  platform: 'android' | 'ios';
  artifactType?: string;
  command?: string;
  dryRun?: boolean;
}

export interface BuildResult {
  success: boolean;
  artifactPath?: string;
  platform: 'android' | 'ios';
  buildId?: string;
  error?: string;
}

export interface BuildProvider {
  build(options: BuildOptions): Promise<BuildResult>;
}

export interface ArtifactOptions {
  cwd?: string;
  artifactPath: string;
  releaseTag: string;
  repository?: string;
  metadata?: Record<string, unknown>;
  dryRun?: boolean;
}

export interface ArtifactResult {
  success: boolean;
  downloadUrl?: string;
  releaseTag?: string;
  error?: string;
}

export interface ArtifactPublisher {
  publish(options: ArtifactOptions): Promise<ArtifactResult>;
}
