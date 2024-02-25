## Testing

The Baloise Design System provides a collection of custom cypress commands for the components. Moreover, some basic cypress commands like `should` or `click` have been overridden to work with the components.

<a class="sb-unstyled button is-primary" href="../?path=/docs/development-testing--documentation">Go to testing guide</a>

<!-- START: human documentation -->

<!-- END: human documentation -->

### Commands

A list of the custom commands for this specific component.

| Command                   | Description                        | Signature                                 |
| ------------------------- | ---------------------------------- | ----------------------------------------- |
| `balInputStepperIncrease` | Increases the value of the control | (options?: Partial\<Loggable>): Chainable |
| `balInputStepperDecrease` | Decreases the value of the control | (options?: Partial\<Loggable>): Chainable |

### Selectors

| Selector                | Element               |
| ----------------------- | --------------------- |
| `inputStepper.decrease` | Decrease button.      |
| `inputStepper.increase` | Increase button.      |
| `inputStepper.native`   | Native input element. |
| `inputStepper.text`     | Text element.         |
