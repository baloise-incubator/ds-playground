import { h, defineComponent, shallowRef } from 'vue'
import type { VNode } from 'vue'
import { defineCustomElement } from '@baloise/ds-core/components/bal-app'

const userComponents = shallowRef<any[]>([]) // eslint-disable-line

export const BalApp = /*@__PURE__*/ defineComponent((_, { attrs, slots }) => {
  defineCustomElement()
  return () => {
    return h(
      'bal-app',
      {
        ...attrs,
      },
      [slots.default && slots.default(), ...userComponents.value],
    )
  }
})

// @ts-expect-error:next-line
BalApp.name = 'BalApp'

/**
 * When rendering user components inside of
 * ion-modal, or ion-popover the component
 * needs to be created inside of the current application
 * context otherwise libraries such as vue-i18n or vuex
 * will not work properly.
 *
 * `userComponents` renders teleported components as children
 * of `ion-app` within the current application context.
 */
export const addTeleportedUserComponent = (component: VNode) => {
  userComponents.value = [...userComponents.value, component]
}

export const removeTeleportedUserComponent = (component: VNode) => {
  userComponents.value = userComponents.value.filter(cmp => cmp !== component)
}
