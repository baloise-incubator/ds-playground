/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { join, dirname, isAbsolute, relative } from 'path'
import type { OutputTargetVue, PackageJSON } from './types'
import type { CompilerCtx, ComponentCompilerMeta, Config, OutputTargetDist } from '@stencil/core/internal'
import { createComponentDefinition } from './generate-vue-component'
import { normalizePath, readPackageJson, relativeImport, sortBy, dashToPascalCase } from './utils'

export async function vueProxyOutput(
  config: Config,
  compilerCtx: CompilerCtx,
  outputTarget: OutputTargetVue,
  components: ComponentCompilerMeta[],
) {
  const filteredComponents = getFilteredComponents(
    outputTarget.excludeComponents,
    components,
    outputTarget.includeInternalComponents,
  )
  const rootDir = config.rootDir as string
  const pkgData = await readPackageJson(rootDir)

  const finalText = generateProxies(config, filteredComponents, pkgData, outputTarget, rootDir)
  await compilerCtx.fs.writeFile(outputTarget.proxiesFile, finalText)
  await copyResources(config, outputTarget)
}

function getFilteredComponents(
  excludeComponents: string[] = [],
  cmps: ComponentCompilerMeta[],
  includeInternalComponents = false,
) {
  return sortBy<ComponentCompilerMeta>(cmps, (cmp: ComponentCompilerMeta) => cmp.tagName).filter(
    (c: ComponentCompilerMeta) =>
      !excludeComponents.includes(c.tagName) && includeInternalComponents ? true : !c.internal,
  )
}

export function generateProxies(
  config: Config,
  components: ComponentCompilerMeta[],
  pkgData: PackageJSON,
  outputTarget: OutputTargetVue,
  rootDir: string,
) {
  const distTypesDir = dirname(pkgData.types)
  const dtsFilePath = join(rootDir, distTypesDir, GENERATED_DTS)
  const componentsTypeFile = relativeImport(outputTarget.proxiesFile, dtsFilePath, '.d.ts')
  const pathToCorePackageLoader = getPathToCorePackageLoader(config, outputTarget)

  const imports = `/* eslint-disable */
/* tslint:disable */
/* auto-generated vue proxies */
import { defineContainer } from './vue-component-lib/utils';\n`

  const generateTypeImports = () => {
    if (outputTarget.componentCorePackage !== undefined) {
      return `import type { ${IMPORT_TYPES} } from '${normalizePath(outputTarget.componentCorePackage)}';\n`
    }

    return `import type { ${IMPORT_TYPES} } from '${normalizePath(componentsTypeFile)}';\n`
  }

  const typeImports = generateTypeImports()

  let sourceImports = ''
  let registerCustomElements = ''

  if (outputTarget.includeImportCustomElements && outputTarget.componentCorePackage !== undefined) {
    const cmpImports = components.map(component => {
      const pascalImport = dashToPascalCase(component.tagName)

      return `import { defineCustomElement as define${pascalImport} } from '${normalizePath(
        outputTarget.componentCorePackage!,
      )}/${outputTarget.customElementsDir || 'components'}/${component.tagName}.js';`
    })

    sourceImports = cmpImports.join('\n')
  } else if (outputTarget.includeDefineCustomElements) {
    sourceImports = `import { ${REGISTER_CUSTOM_ELEMENTS} } from '${pathToCorePackageLoader}';\n`
    registerCustomElements = `${REGISTER_CUSTOM_ELEMENTS}();`
  }

  const final: string[] = [
    imports,
    typeImports,
    sourceImports,
    registerCustomElements,
    components
      .map(
        createComponentDefinition(IMPORT_TYPES, outputTarget.componentModels, outputTarget.includeImportCustomElements),
      )
      .join('\n'),
  ]

  return final.join('\n') + '\n'
}

async function copyResources(config: Config, outputTarget: OutputTargetVue) {
  if (!config.sys || !config.sys.copy || !config.sys.glob) {
    throw new Error('stencil is not properly initialized at this step. Notify the developer')
  }
  const srcDirectory = join(__dirname, '../../../', 'vue-component-lib')
  const destDirectory = join(dirname(outputTarget.proxiesFile), 'vue-component-lib')

  return config.sys.copy(
    [
      {
        src: srcDirectory,
        dest: destDirectory,
        keepDirStructure: false,
        warn: false,
      },
    ],
    srcDirectory,
  )
}

export function getPathToCorePackageLoader(config: Config, outputTarget: OutputTargetVue) {
  const basePkg = outputTarget.componentCorePackage || ''
  const distOutputTarget = config.outputTargets?.find(o => o.type === 'dist') as OutputTargetDist

  const distAbsEsmLoaderPath =
    distOutputTarget?.esmLoaderPath && isAbsolute(distOutputTarget.esmLoaderPath)
      ? distOutputTarget.esmLoaderPath
      : null

  const distRelEsmLoaderPath =
    config.rootDir && distAbsEsmLoaderPath ? relative(config.rootDir, distAbsEsmLoaderPath) : null

  const loaderDir = outputTarget.loaderDir || distRelEsmLoaderPath || DEFAULT_LOADER_DIR
  return normalizePath(join(basePkg, loaderDir))
}

export const GENERATED_DTS = 'components.d.ts'
const IMPORT_TYPES = 'JSX'
const REGISTER_CUSTOM_ELEMENTS = 'defineCustomElements'
const DEFAULT_LOADER_DIR = '/dist/loader'
