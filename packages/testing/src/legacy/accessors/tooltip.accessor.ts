/// <reference types="cypress" />

import { Andable, AndableMixin } from './mixins/andable'
import { Attributable, AttributableMixin } from './mixins/attributable'
import { Blurable, BlurableMixin } from './mixins/blurable'
import { Containable } from './mixins/containable'
import { Eachable, EachableMixin } from './mixins/eachable'
import { Existable, ExistableMixin } from './mixins/existable'
import { Findable, FindableMixin } from './mixins/findable'
import { Invokable, InvokableMixin } from './mixins/invokable'
import { Lengthable, LengthableMixin } from './mixins/lengthable'
import { Accessor, createAccessor, Mixin, MixinContext } from './mixins/mixins'
import { NthSelectable, NthSelectableMixin } from './mixins/nthSelectable'
import { Shouldable, ShouldableMixin } from './mixins/shouldable'
import { Thenable, ThenableMixin } from './mixins/thenable'
import { Urlable, UrlableMixin } from './mixins/urlable'
import { Visible, VisibleMixin } from './mixins/visible'
import { Waitable, WaitableMixin } from './mixins/waitable'

interface TooltipAccessorType
  extends Andable<TooltipAccessorType>,
    Containable<TooltipAccessorType>,
    Visible<TooltipAccessorType>,
    Blurable<TooltipAccessorType>,
    Existable<TooltipAccessorType>,
    Shouldable<TooltipAccessorType>,
    NthSelectable<TooltipAccessorType>,
    Attributable<TooltipAccessorType>,
    Urlable<TooltipAccessorType>,
    Findable<TooltipAccessorType>,
    Waitable<TooltipAccessorType>,
    Invokable<TooltipAccessorType>,
    Thenable<TooltipAccessorType>,
    Lengthable<TooltipAccessorType>,
    Eachable<TooltipAccessorType> {
  hover(): TooltipAccessorType
}

export const HoverMixin: Mixin = <T>({ element, creator }: MixinContext<T>) => ({
  hover: () => {
    element.click()
    return creator()
  },
})

export const HoverContainableMixin: Mixin = <T>({ creator, selector }: MixinContext<T>) => ({
  contains: (content: string) => {
    cy.get(selector).balHintFindOverlay().contains(content)
    return creator()
  },
})

export const TooltipAccessor: Accessor<TooltipAccessorType> = createAccessor<TooltipAccessorType>(
  AndableMixin,
  HoverMixin,
  HoverContainableMixin,
  VisibleMixin,
  BlurableMixin,
  ExistableMixin,
  ShouldableMixin,
  NthSelectableMixin,
  AttributableMixin,
  UrlableMixin,
  FindableMixin,
  WaitableMixin,
  InvokableMixin,
  ThenableMixin,
  LengthableMixin,
  EachableMixin,
)
