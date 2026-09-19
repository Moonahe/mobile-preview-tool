import { execa, type Options as ExecaOptions, type ExecaReturnValue } from 'execa';

export async function execEas(args: string[], options: ExecaOptions = {}): Promise<ExecaReturnValue> {
  const mergedOptions: ExecaOptions = {
    preferLocal: true,
    ...options,
  };

  try {
    return await execa('eas', args, mergedOptions);
  } catch (err: any) {
    if (err.code === 'ENOENT') {
      return await execa('npx', ['eas-cli', ...args], mergedOptions);
    }
    throw err;
  }
}
