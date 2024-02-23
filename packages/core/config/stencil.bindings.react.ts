import { reactOutputTarget } from '@baloise/output-target-react/dist/src/index'
import { docComponents } from './doc.components'

export const ReactGenerator = () =>
  reactOutputTarget({
    componentCorePackage: '@baloise/ds-core',
    proxiesFile: '../react/src/generated/proxies.ts',
    includeDefineCustomElements: true,
    excludeComponents: docComponents,
  })