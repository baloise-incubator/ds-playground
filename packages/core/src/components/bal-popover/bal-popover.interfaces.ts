/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="../../interfaces.d.ts" />

namespace BalProps {
  export type BalPopoverContentRadius =
    | 'normal'
    | 'large'
    | 'none'
    | 'normal-bottom-none'
    | 'normal-top-none'
    | 'large-bottom-none'
    | 'large-top-none'
  export type BalPopoverContentColor = 'white' | 'grey'
  export type BalPopoverPlacement =
    | 'auto'
    | 'auto-start'
    | 'auto-end'
    | 'top'
    | 'left'
    | 'bottom'
    | 'right'
    | 'top-start'
    | 'top-end'
    | 'bottom-start'
    | 'bottom-end'
    | 'right-start'
    | 'right-end'
    | 'left-start'
    | 'left-end'
}

namespace BalEvents {
  export interface BalPopoverCustomEvent<T> extends CustomEvent<T> {
    detail: T
    target: HTMLBalPopoverElement
  }

  export type BalPopoverChangeDetail = boolean
  export type BalPopoverChange = BalPopoverCustomEvent<BalPopoverChangeDetail>

  export type BalPopoverWillAnimateDetail = boolean
  export type BalPopoverWillAnimate = BalPopoverCustomEvent<BalPopoverWillAnimateDetail>

  export type BalPopoverDidAnimateDetail = boolean
  export type BalPopoverDidAnimate = BalPopoverCustomEvent<BalPopoverDidAnimateDetail>
}
