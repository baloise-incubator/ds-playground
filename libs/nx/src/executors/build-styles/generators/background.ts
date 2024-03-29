import { BuildStylesExecutorSchema } from '../schema'
import * as utils from './utils'

export const generateBackgroundColors = async (options: BuildStylesExecutorSchema) => {
  const tokens = await utils.getTokens({ token: 'color.background', ...options })
  const props = utils.toProps({ tokens, prefix: 'bg', replace: 'color-background-' })

  const tokensAlias = await utils.getTokens({ token: 'color.alias', ...options })
  const propsAlias = utils.toProps({ tokens: tokensAlias, prefix: 'bg', replace: 'color' })

  const tokensBase = await utils.getTokens({ token: 'color.base', ...options })
  const propsBase = utils.toProps({ tokens: tokensBase, prefix: 'bg', replace: 'color' })

  // merge colors
  for (const key in propsAlias) {
    if (!Object.keys(props).includes(key)) {
      props[key] = propsAlias[key]
    }
  }

  // merge colors
  for (const key in propsBase) {
    if (!Object.keys(props).includes(key)) {
      props[key] = propsBase[key]
    }
  }

  const docs = utils.jsonClass({
    property: 'background',
    values: {
      ...props,
      ['bg-transparent']: 'transparent',
    },
  })

  const rules = utils.styleClass({
    property: 'background',
    values: {
      ...props,
      ['bg-transparent']: 'transparent',
    },
    important: true,
    responsive: false,
    states: true,
    breakpoints: utils.minBreakpoints,
  })

  // inverted styles
  const rulesPrimary = utils.styleClass({
    property: 'color',
    values: {
      'bg-primary': `var(--bal-color-white)`,
      'bg-primary-3': `var(--bal-color-white)`,
      'bg-primary-4': `var(--bal-color-white)`,
      'bg-primary-5': `var(--bal-color-white)`,
      'bg-primary-6': `var(--bal-color-white)`,
    },
    important: false,
    responsive: false,
    states: true,
    breakpoints: utils.minBreakpoints,
  })

  /**
   * EXPORT
   * ------------------------------------------------------------------------------------------
   */

  return utils.save(
    'background',
    options.projectRoot,
    utils.merge({
      docs: [docs],
      rules: [rules, rulesPrimary],
    }),
  )
}
