import { ComponentCompilerMeta } from '@stencil/core/internal'
import { generateProxies } from './output-vue'
import { PackageJSON, OutputTargetVue } from './types'

describe('generateProxies', () => {
  const components: ComponentCompilerMeta[] = []
  const pkgData: PackageJSON = {
    types: 'dist/types/index.d.ts',
  }
  const rootDir = ''
  const config = { outputTargets: [] }

  it('should include definCustomElements when both are true in the outputTarget', () => {
    const outputTarget: OutputTargetVue = {
      componentCorePackage: 'component-library',
      proxiesFile: '../component-library-vue/src/proxies.ts',
      includeDefineCustomElements: true,
    }

    const finalText = generateProxies(config, components, pkgData, outputTarget, rootDir)
    expect(finalText).toEqual(
      `/* eslint-disable */
/* tslint:disable */
/* auto-generated vue proxies */
import { defineContainer } from './vue-component-lib/utils';

import type { JSX } from 'component-library';

import { defineCustomElements } from 'component-library/dist/loader';

defineCustomElements();

`,
    )
  })

  it('should not include defineCustomElements if both are false in the outputTarget', () => {
    const outputTarget: OutputTargetVue = {
      componentCorePackage: 'component-library',
      proxiesFile: '../component-library-vue/src/proxies.ts',
      includeDefineCustomElements: false,
    }

    const finalText = generateProxies(config, components, pkgData, outputTarget, rootDir)
    expect(finalText).toEqual(
      `/* eslint-disable */
/* tslint:disable */
/* auto-generated vue proxies */
import { defineContainer } from './vue-component-lib/utils';

import type { JSX } from 'component-library';




`,
    )
  })
})
