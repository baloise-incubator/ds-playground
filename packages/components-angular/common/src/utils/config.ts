import type { BalConfig } from '@baloise/ds-components'

export interface BaloiseDesignSystemAngularConfig {
  defaults?: BalConfig
  forms?: {
    setInvalid?: boolean
    invalidateOn?: 'touched' | 'dirty'
  }
}
