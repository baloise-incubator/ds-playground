import { findPropertyValuesByTag } from '../../support/a11y.utils'

describe('bal-badge', () => {
  context('a11y', () => {
    beforeEach(() => cy.platform('desktop').pageA11y('/components/bal-badge/test/bal-badge.a11y.html'))

    describe('have the AA standard', () => {
      it('basic', () => {
        cy.getByTestId('basic').testA11y()
      })

      testColorA11y()
      testSizeA11y()
    })
  })
})

function testColorA11y() {
  const colors = findPropertyValuesByTag('bal-badge', 'color')
  for (let index = 0; index < colors.length; index++) {
    const color = colors[index]
    it(`color ${color}`, () => {
      cy.getByTestId('basic').setProperty('color', color).testA11y()
    })
  }
}

function testSizeA11y() {
  const sizes = findPropertyValuesByTag('bal-badge', 'size')
  for (let index = 0; index < sizes.length; index++) {
    const size = sizes[index]
    it(`size ${size}`, () => {
      cy.getByTestId('basic').setProperty('size', size).testA11y()
    })
  }
}
