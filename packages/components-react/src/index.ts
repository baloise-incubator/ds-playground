import { initialize } from '@baloise/ds-components'
import type { BalConfig } from '@baloise/ds-components'

interface BaloiseDesignSystemReactConfig {
  defaults?: BalConfig
}

export const useBaloiseDesignSystem = (config: BaloiseDesignSystemReactConfig = {}) => {
  initialize(config.defaults)
}

export * from './generated/proxies'
