describe('bal-checkbox-button', () => {
  testCheckboxButton('mobile')
  testCheckboxButton('tablet')
  testCheckboxButton('desktop')

  function testCheckboxButton(platform: 'mobile' | 'tablet' | 'desktop') {
    beforeEach(() =>
      cy
        .visit('/components/bal-checkbox/test/bal-checkbox-button.visual.html')
        .platform(platform)
        .waitForDesignSystem(),
    )

    it('basic component', () => {
      cy.getByTestId('basic').testVisual(`checkbox-button-basic-${platform}`)
      cy.getByTestId('grid').testVisual(`checkbox-button-grid-${platform}`)
      cy.getByTestId('colors').testVisual(`checkbox-button-colors-${platform}`)
    })
  }
})
