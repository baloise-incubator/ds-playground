/// <reference types="cypress" />

declare namespace Cypress {
  interface Chainable {
    /**
     * Returns the hint component of the label.
     */
    balFieldFindHint(options?: Partial<Loggable>): Chainable<JQuery>
  }
}
