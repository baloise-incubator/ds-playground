### bal-accordion
 
#### Properties

| Property     | Attribute     | Description                                                                                                                                                             | Type      | Default   |
| ------------ | ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- | --------- |
| `active`     | `active`      | If `true` the accordion is open.                                                                                                                                        | `boolean` | `false`   |
| `card`       | `card`        | If `true` the accordion is used on the bottom of a card                                                                                                                 | `boolean` | `false`   |
| `closeIcon`  | `close-icon`  | BalIcon of the close trigger button                                                                                                                                     | `string`  | `'close'` |
| `closeLabel` | `close-label` | Label of the close trigger button                                                                                                                                       | `string`  | `''`      |
| `debounce`   | `debounce`    | Set the amount of time, in milliseconds, to wait to trigger the `balChange` event after each keystroke. This also impacts form bindings such as `ngModel` or `v-model`. | `number`  | `0`       |
| `openIcon`   | `open-icon`   | BalIcon of the open trigger button                                                                                                                                      | `string`  | `'plus'`  |
| `openLabel`  | `open-label`  | Label of the open trigger button                                                                                                                                        | `string`  | `''`      |


#### Events

| Event            | Description                                     | Type                   |
| ---------------- | ----------------------------------------------- | ---------------------- |
| `balChange`      | Emitted when the accordion has opened or closed | `CustomEvent<boolean>` |
| `balDidAnimate`  | Emitted after the animation has finished        | `CustomEvent<boolean>` |
| `balWillAnimate` | Emitted before the animation starts             | `CustomEvent<boolean>` |


#### Methods

| Method    | Description            | Type                            |
| --------- | ---------------------- | ------------------------------- |
| `dismiss` | Closes the accordion   | `dismiss() => Promise<boolean>` |
| `present` | Opens the accordion    | `present() => Promise<boolean>` |
| `toggle`  | Triggers the accordion | `toggle() => Promise<boolean>`  |
 