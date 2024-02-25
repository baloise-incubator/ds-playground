describe('css-structure.visual', () => {
  beforeEach(() => cy.visit('/test/css-structure.visual.html').platform('desktop').waitForDesignSystem())

  it('basic', () => {
    cy.getByTestId('basic').testVisual('css-structure-basic')
    cy.getByTestId('inheritance').testVisual('css-structure-inheritance')
  })
})
