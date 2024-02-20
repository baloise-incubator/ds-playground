import { ValueAccessorConfig, angularOutputTarget } from '@baloise/output-target-angular/dist/src/index'
import { docComponents } from './doc.components'

export const angularValueAccessorBindings: ValueAccessorConfig[] = [
  {
    elementSelectors: [
      'bal-radio-group',
      'bal-checkbox-group',
      'bal-select',
      'bal-datepicker',
      'bal-date',
      'bal-input-date',
      'bal-file-upload',
    ],
    event: 'balChange',
    targetAttr: 'value',
    type: 'select',
  },
  {
    elementSelectors: ['bal-checkbox'],
    event: 'balChange',
    targetAttr: 'checked',
    type: 'boolean',
  },
  {
    elementSelectors: ['bal-number-input', 'bal-input-stepper'],
    event: 'balInput',
    targetAttr: 'value',
    type: 'number',
  },
  {
    elementSelectors: ['bal-input', 'bal-textarea', 'bal-input-slider', 'bal-time-input'],
    event: 'balInput',
    targetAttr: 'value',
    type: 'text',
  },
]

export const AngularGenerator = () =>
  angularOutputTarget({
    componentCorePackage: '@baloise/ds-components',
    directivesMetaFile: '../components-angular/src/generated/meta.ts',
    directivesProxyFile: '../components-angular/src/generated/proxies.ts',
    directivesArrayFile: '../components-angular/src/generated/proxies-list.ts',
    valueAccessorConfigs: angularValueAccessorBindings,
    excludeComponents: [...docComponents],
    outputType: 'module',
  })

export const AngularStandaloneGenerator = () =>
  angularOutputTarget({
    componentCorePackage: '@baloise/ds-components',
    directivesMetaFile: '../components-angular/standalone/src/generated/meta.ts',
    directivesProxyFile: '../components-angular/standalone/src/generated/proxies.ts',
    directivesArrayFile: '../components-angular/standalone/src/generated/proxies-list.ts',
    valueAccessorConfigs: angularValueAccessorBindings,
    excludeComponents: [
      ...docComponents,
      'bal-checkbox-group',
      'bal-checkbox',
      'bal-date',
      'bal-datepicker',
      'bal-file-upload',
      'bal-input-date',
      'bal-input-slider',
      'bal-input-stepper',
      'bal-input',
      'bal-number-input',
      'bal-radio-group',
      'bal-select',
      'bal-textarea',
      'bal-time-input',
    ],
    outputType: 'standalone',
  })

export const AngularLegacyGenerator = () =>
  angularOutputTarget({
    componentCorePackage: '@baloise/ds-components',
    directivesMetaFile: '../components-angular/legacy/src/generated/meta.ts',
    directivesProxyFile: '../components-angular/legacy/src/generated/proxies.ts',
    directivesArrayFile: '../components-angular/legacy/src/generated/proxies-list.ts',
    valueAccessorConfigs: angularValueAccessorBindings,
    excludeComponents: [...docComponents],
    outputType: 'legacy',
  })
