## Testing

The Baloise Design System provides a collection of custom cypress commands for the components. Moreover, some basic cypress commands like `should` or `click` have been overridden to work with the components.

<a class="sb-unstyled button is-primary" href="../?path=/docs/development-testing--documentation">Go to testing guide</a>

<!-- START: human documentation -->

```ts
import { byTestId } from '@baloise/design-system-testing'

describe('Toast', () => {
  it('should ...', () => {
    cy.balToastFind().first().contains('Hi I am a default Toast! Hi I am a default Toast!')
  })
})
```

<!-- END: human documentation -->

### Commands

A list of the custom commands for this specific component.

| Command        | Description                 | Signature                                 |
| -------------- | --------------------------- | ----------------------------------------- |
| `balToastFind` | Returns the visible toasts. | (options?: Partial\<Loggable>): Chainable |


### Selectors

| Selector      | Element              |
| ------------- | -------------------- |
| `toast.main`  | Toast element.       |
| `toast.label` | Toast label element. |
| `toast.close` | Toast close element. |

