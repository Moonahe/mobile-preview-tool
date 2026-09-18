export class MobilePreviewError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'MobilePreviewError';
  }
}
