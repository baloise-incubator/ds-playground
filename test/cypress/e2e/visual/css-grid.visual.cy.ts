describe('css-grid.visual', () => {
  beforeEach(() => cy.visit('/test/css-grid.visual.html').platform('desktop'))

  it('basic', () => {
    cy.platform('desktop')
    cy.getByTestId('basic').testVisual('css-grid-basic-desktop')
    cy.getByTestId('column-sizes').testVisual('css-grid-column-sizes-desktop')
    cy.getByTestId('column-offset').testVisual('css-grid-column-offset-desktop')
    cy.getByTestId('rows').testVisual('css-grid-rows-desktop')
    cy.getByTestId('nested').testVisual('css-grid-nested-desktop')
    cy.getByTestId('space').testVisual('css-grid-space-desktop')
    cy.getByTestId('breakpoint').testVisual('css-grid-breakpoint-desktop')
    cy.getByTestId('vertical-alignment').testVisual('css-grid-vertical-alignment-desktop')
    cy.getByTestId('horizontal-alignment').testVisual('css-grid-horizontal-alignment-desktop')
    cy.getByTestId('stratch').testVisual('css-grid-stratch-desktop')

    cy.platform('tablet')
    cy.getByTestId('basic').testVisual('css-grid-basic-tablet')
    cy.getByTestId('column-sizes').testVisual('css-grid-column-sizes-tablet')
    cy.getByTestId('column-offset').testVisual('css-grid-column-offset-tablet')
    cy.getByTestId('rows').testVisual('css-grid-rows-tablet')
    cy.getByTestId('nested').testVisual('css-grid-nested-tablet')
    cy.getByTestId('space').testVisual('css-grid-space-tablet')
    cy.getByTestId('breakpoint').testVisual('css-grid-breakpoint-tablet')
    cy.getByTestId('vertical-alignment').testVisual('css-grid-vertical-alignment-tablet')
    cy.getByTestId('horizontal-alignment').testVisual('css-grid-horizontal-alignment-tablet')
    cy.getByTestId('stratch').testVisual('css-grid-stratch-tablet')

    cy.platform('mobile')
    cy.getByTestId('basic').testVisual('css-grid-basic-mobile')
    cy.getByTestId('column-sizes').testVisual('css-grid-column-sizes-mobile')
    cy.getByTestId('column-offset').testVisual('css-grid-column-offset-mobile')
    cy.getByTestId('rows').testVisual('css-grid-rows-mobile')
    cy.getByTestId('nested').testVisual('css-grid-nested-mobile')
    cy.getByTestId('space').testVisual('css-grid-space-mobile')
    cy.getByTestId('breakpoint').testVisual('css-grid-breakpoint-mobile')
    cy.getByTestId('vertical-alignment').testVisual('css-grid-vertical-alignment-mobile')
    cy.getByTestId('horizontal-alignment').testVisual('css-grid-horizontal-alignment-mobile')
    cy.getByTestId('stratch').testVisual('css-grid-stratch-mobile')
  })
})

describe('deprecated-css-grid.visual', () => {
  beforeEach(() => cy.visit('/test/deprecated/css-grid.visual.html').platform('desktop'))

  it('basic', () => {
    cy.platform('desktop')
    cy.getByTestId('basic').testVisual('css-grid-basic-desktop')
    cy.getByTestId('column-sizes').testVisual('css-grid-column-sizes-desktop')
    cy.getByTestId('column-offset').testVisual('css-grid-column-offset-desktop')
    cy.getByTestId('rows').testVisual('css-grid-rows-desktop')
    cy.getByTestId('nested').testVisual('css-grid-nested-desktop')
    cy.getByTestId('space').testVisual('css-grid-space-desktop')
    cy.getByTestId('breakpoint').testVisual('css-grid-breakpoint-desktop')
    cy.getByTestId('vertical-alignment').testVisual('css-grid-vertical-alignment-desktop')
    cy.getByTestId('horizontal-alignment').testVisual('css-grid-horizontal-alignment-desktop')
    cy.getByTestId('stratch').testVisual('css-grid-stratch-desktop')

    cy.platform('tablet')
    cy.getByTestId('basic').testVisual('css-grid-basic-tablet')
    cy.getByTestId('column-sizes').testVisual('css-grid-column-sizes-tablet')
    cy.getByTestId('column-offset').testVisual('css-grid-column-offset-tablet')
    cy.getByTestId('rows').testVisual('css-grid-rows-tablet')
    cy.getByTestId('nested').testVisual('css-grid-nested-tablet')
    cy.getByTestId('space').testVisual('css-grid-space-tablet')
    cy.getByTestId('breakpoint').testVisual('css-grid-breakpoint-tablet')
    cy.getByTestId('vertical-alignment').testVisual('css-grid-vertical-alignment-tablet')
    cy.getByTestId('horizontal-alignment').testVisual('css-grid-horizontal-alignment-tablet')
    cy.getByTestId('stratch').testVisual('css-grid-stratch-tablet')

    cy.platform('mobile')
    cy.getByTestId('basic').testVisual('css-grid-basic-mobile')
    cy.getByTestId('column-sizes').testVisual('css-grid-column-sizes-mobile')
    cy.getByTestId('column-offset').testVisual('css-grid-column-offset-mobile')
    cy.getByTestId('rows').testVisual('css-grid-rows-mobile')
    cy.getByTestId('nested').testVisual('css-grid-nested-mobile')
    cy.getByTestId('space').testVisual('css-grid-space-mobile')
    cy.getByTestId('breakpoint').testVisual('css-grid-breakpoint-mobile')
    cy.getByTestId('vertical-alignment').testVisual('css-grid-vertical-alignment-mobile')
    cy.getByTestId('horizontal-alignment').testVisual('css-grid-horizontal-alignment-mobile')
    cy.getByTestId('stratch').testVisual('css-grid-stratch-mobile')
  })
})
