import { Platforms, waitAfterFramePaint, waitAfterIdleCallback } from '../helpers'
import { balViewport } from '../../viewports'

Cypress.Commands.add<any>('platform', platform => {
  Cypress.log({
    name: 'platform',
    displayName: 'platform',
    message: platform,
  })

  const key: Platforms = (platform as Platforms) || 'desktop'
  const viewport = balViewport[key]

  return cy
    .viewport(viewport.width, viewport.height, { log: false })
    .then(() => waitAfterFramePaint())
    .then(() => waitAfterIdleCallback())
    .wait(32)
})
