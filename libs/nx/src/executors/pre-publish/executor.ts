import { join } from 'path'
import { PrePublishExecutorSchema } from './schema'
import { readdir } from 'fs/promises'
import { copy } from 'fs-extra'

export default async function runExecutor(options: PrePublishExecutorSchema) {
  console.log('Executor ran for PrePublish', options)

  try {
    const packagesPath = join(options.workspaceRoot, 'packages')
    const packages = (await readdir(packagesPath, { withFileTypes: true }))
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name)

    for (let index = 0; index < packages.length; index++) {
      const packageName = packages[index]
      await copy(join(options.workspaceRoot, 'LICENSE'), join(options.workspaceRoot, 'packages', packageName, 'LICENSE'))
      await copy(join(options.workspaceRoot, 'README.md'), join(options.workspaceRoot, 'packages', packageName, 'README.md'))
    }

  } catch (error) {
    console.error(error)
    return { success: false }
  }

  return { success: true }
}
