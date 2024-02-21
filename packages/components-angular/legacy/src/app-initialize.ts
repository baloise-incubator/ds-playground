/* eslint-disable @typescript-eslint/no-explicit-any */
import { NgZone } from '@angular/core'
import { initializeBaloiseDesignSystem } from '@baloise/ds-components'
import { defineCustomElements } from '@baloise/ds-components/loader'
import { raf } from '@baloise/ds-angular/common'

import type { BaloiseDesignSystemAngularConfig } from '@baloise/ds-angular/common'

export const appInitialize = (config: BaloiseDesignSystemAngularConfig, doc: Document, zone: NgZone) => {
  return (): any => {
    const win: Window | undefined = doc.defaultView as any

    if (win && typeof (window as any) !== 'undefined') {
      initializeBaloiseDesignSystem(config.defaults, undefined, win)

      const aelFn =
        '__zone_symbol__addEventListener' in (doc.body as any) ? '__zone_symbol__addEventListener' : 'addEventListener'

      return defineCustomElements(win, {
        syncQueue: true,
        raf,
        jmp: (h: any) => zone.runOutsideAngular(h),
        ael(elm, eventName, cb, opts) {
          if (elm && (elm as any)[aelFn]) {
            ;(elm as any)[aelFn](eventName, cb, opts)
          }
        },
        rel(elm, eventName, cb, opts) {
          if (elm) {
            elm.removeEventListener(eventName, cb, opts)
          }
        },
      })
    }
  }
}
