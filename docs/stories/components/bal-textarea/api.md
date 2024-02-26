### bal-textarea
 
#### Properties

| Property         | Attribute          | Description                                                                                                                                                                      | Type                                                                                                               | Default        |
| ---------------- | ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ | -------------- |
| `autoInvalidOff` | `auto-invalid-off` | If `true`, in Angular reactive forms the control will not be set invalid                                                                                                         | `boolean`                                                                                                          | `false`        |
| `autocapitalize` | `autocapitalize`   | Indicates whether and how the text value should be automatically capitalized as it is entered/edited by the user.                                                                | `string`                                                                                                           | `'none'`       |
| `autofocus`      | `autofocus`        | This Boolean attribute lets you specify that a form control should have input focus when the page loads.                                                                         | `boolean`                                                                                                          | `false`        |
| `clickable`      | `clickable`        | If `true` the input gets a clickable cursor style                                                                                                                                | `boolean`                                                                                                          | `false`        |
| `cols`           | `cols`             | The visible width of the text control, in average character widths. If it is specified, it must be a positive integer.                                                           | `number `, ` undefined`                                                                                            | `undefined`    |
| `debounce`       | `debounce`         | Set the amount of time, in milliseconds, to wait to trigger the `ionChange` event after each keystroke. This also impacts form bindings such as `ngModel` or `v-model`.          | `number`                                                                                                           | `0`            |
| `disabled`       | `disabled`         | If `true`, the element is not mutable, focusable, or even submitted with the form. The user can neither edit nor focus on the control, nor its form control descendants.         | `boolean`                                                                                                          | `false`        |
| `inputmode`      | `inputmode`        | A hint to the browser for which keyboard to display. Possible values: `"none"`, `"text"`, `"tel"`, `"url"`, `"email"`, `"numeric"`, `"decimal"`, and `"search"`.                 | `"decimal" `, ` "email" `, ` "none" `, ` "numeric" `, ` "search" `, ` "tel" `, ` "text" `, ` "url" `, ` undefined` | `undefined`    |
| `invalid`        | `invalid`          | If `true` the component gets a invalid style.                                                                                                                                    | `boolean`                                                                                                          | `false`        |
| `maxLength`      | `max-length`       | If the value of the type attribute is `text`, `email`, `search`, `password`, `tel`, or `url`, this attribute specifies the maximum number of characters that the user can enter. | `number `, ` undefined`                                                                                            | `undefined`    |
| `minLength`      | `min-length`       | If the value of the type attribute is `text`, `email`, `search`, `password`, `tel`, or `url`, this attribute specifies the minimum number of characters that the user can enter. | `number `, ` undefined`                                                                                            | `undefined`    |
| `name`           | `name`             | The name of the control, which is submitted with the form data.                                                                                                                  | `string`                                                                                                           | `this.inputId` |
| `placeholder`    | `placeholder`      | Instructional text that shows before the input has a value.                                                                                                                      | `string `, ` undefined`                                                                                            | `undefined`    |
| `readonly`       | `readonly`         | If `true` the element can not mutated, meaning the user can not edit the control.                                                                                                | `boolean`                                                                                                          | `false`        |
| `required`       | `required`         | If `true`, the user must fill in a value before submitting a form.                                                                                                               | `boolean`                                                                                                          | `false`        |
| `rows`           | `rows`             | The number of visible text lines for the control.                                                                                                                                | `number `, ` undefined`                                                                                            | `undefined`    |
| `value`          | `value`            | The value of the textarea.                                                                                                                                                       | `string `, ` undefined`                                                                                            | `''`           |
| `wrap`           | `wrap`             | Indicates how the control wraps text.                                                                                                                                            | `"hard" `, ` "off" `, ` "soft" `, ` undefined`                                                                     | `undefined`    |


#### Events

| Event         | Description                                | Type                               |
| ------------- | ------------------------------------------ | ---------------------------------- |
| `balBlur`     | Emitted when a keyboard input occurred.    | `CustomEvent<FocusEvent>`          |
| `balChange`   | Emitted when the input value has changed.. | `CustomEvent<string \| undefined>` |
| `balFocus`    | Emitted when the input has focus.          | `CustomEvent<FocusEvent>`          |
| `balInput`    | Emitted when a keyboard input occurred.    | `CustomEvent<string \| undefined>` |
| `balKeyPress` | Emitted when a keyboard key has pressed.   | `CustomEvent<KeyboardEvent>`       |


#### Methods

| Method            | Description                                                                                             | Type                                                             |
| ----------------- | ------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| `getInputElement` | Returns the native `<textarea>` element used under the hood.                                            | `getInputElement() => Promise<HTMLTextAreaElement \| undefined>` |
| `setFocus`        | Sets focus on the native `input` in `bal-input`. Use this method instead of the global `input.focus()`. | `setFocus() => Promise<void>`                                    |
 