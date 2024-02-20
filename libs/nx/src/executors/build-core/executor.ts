import { exec } from 'child_process';
import { promisify } from 'util';
import { BuildCoreExecutorSchema } from './schema'

export default async function runExecutor(options: BuildCoreExecutorSchema) {
  console.log('Executor ran for BuildCore', options)

  const { stdout, stderr } = await promisify(exec)(
    `stencil build`
  );
  console.log(stdout);
  console.error(stderr);

  const success = !stderr;
  return { success };
}
