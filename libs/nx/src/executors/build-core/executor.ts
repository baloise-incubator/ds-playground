import { execSync } from 'child_process'
import { promisify } from 'util'
import { BuildCoreExecutorSchema } from './schema'
import { dirname, join } from 'path'
import replace from 'replace-in-file'
import { mkdir, readFile, rm, rmdir, writeFile } from 'fs/promises'
import { copy } from 'fs-extra'

export default async function runExecutor(options: BuildCoreExecutorSchema) {
  try {
    // stencil build task
    await compile(options)

    // post build tasks
    await adjustInterfacesReference(options)
    await adjustGlobalVar(options)
    await setVersion(options)
    await createTagList(options)
    await copyToDocs(options)
    await cleanUp(options)
  } catch (error) {
    console.error(error)
    return { success: false }
  }

  return { success: true }
}

async function compile(options: BuildCoreExecutorSchema): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      const cwd = join(process.cwd(), options.projectRoot)
      execSync('npx stencil build', {
        cwd,
        encoding: 'utf-8',
        stdio: 'inherit',
      })
      return resolve()
    } catch (error) {
      return reject(error)
    }
  })
}

export async function adjustInterfacesReference(options: BuildCoreExecutorSchema) {
  const files = join(options.projectRoot, 'dist/types/**/*interfaces.d.ts')
  replace.sync({
    files: files,
    from: `/// <reference path="../../../../../src/interfaces.d.ts" />`,
    to: `/// <reference path="../../../../interfaces.d.ts" />`,
  })
  replace.sync({
    files: files,
    from: `/// <reference path="../../../../src/interfaces.d.ts" />`,
    to: `/// <reference path="../../../interfaces.d.ts" />`,
  })
  replace.sync({
    files: files,
    from: `/// <reference path="../../../src/interfaces.d.ts" />`,
    to: `/// <reference path="../../interfaces.d.ts" />`,
  })
}

async function adjustGlobalVar(options: BuildCoreExecutorSchema) {
  const files = join(options.projectRoot, 'dist/cjs/app-globals*.js')
  await replace({
    files: files,
    from: `const global =`,
    to: `const globalImport =`,
  })
  await replace({
    files: files,
    from: `const globalScripts = global.globalScript;`,
    to: `const globalScripts = globalImport.globalScript;`,
  })
}

// Reads version from package.json and saves it to the browsers window
async function setVersion(options: BuildCoreExecutorSchema) {
  const content = await readFile(join(options.projectRoot, 'package.json'), 'utf8')
  const json = JSON.parse(content)
  await replace({
    files: join(options.projectRoot, 'dist', '**/*.js'),
    from: /BAL_DEV_VERSION/g,
    to: json.version,
  })
}

// This script creates a list with all the main component tags.
export async function createTagList(options: BuildCoreExecutorSchema) {
  const content = await readFile(join('resources/data/components.json'), 'utf-8')
  const json = JSON.parse(content)
  const componentTags = json.components
    .map(component => component.tag)
    .filter(tag => !tag.startsWith('bal-doc'))
    .reduce((acc, newTag) => {
      const hasComponent = acc.some(tag => newTag.startsWith(tag))
      if (!hasComponent && newTag !== 'bal-tab-item' && newTag !== 'bal-notices') {
        acc.push(newTag)
      }
      return acc
    }, [])

  const filePath = join('resources/data/tags.json')
  await mkdir(dirname(filePath), { recursive: true })
  await writeFile(filePath, JSON.stringify(componentTags, undefined, 2))
}

async function copyToDocs(options: BuildCoreExecutorSchema) {
  await copy(join(options.projectRoot, 'www'), join('test/generated/www'))
}

async function cleanUp(options: BuildCoreExecutorSchema) {
  await rm(join(options.projectRoot, 'icons'), { recursive: true, force: true })
}
