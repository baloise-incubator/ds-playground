import {
  Component,
  ComponentInterface,
  h,
  Host,
  Prop,
  Watch,
  Element,
  State,
  Method,
  Event,
  EventEmitter,
} from '@stencil/core'
import { BEM } from '../../../utils/bem'
import { stopEventBubbling } from '../../../utils/form-input'
import { Loggable, Logger, LogInstance } from '../../../utils/log'
import { FOCUS_KEYS } from '../../../utils/focus-visible'
import { isDescendant } from '../../../utils/helpers'
import { BalElementStateInfo, BalElementStateObserver, ListenToElementStates } from '../../../utils/element-states'
import { BalElementStateListener } from '../../../utils/element-states/element-states.listener'

@Component({
  tag: 'bal-radio-button',
  styleUrl: './bal-radio-button.sass',
})
export class BalRadioButton implements ComponentInterface, Loggable, BalElementStateObserver {
  @Element() el!: HTMLElement

  private keyboardMode = true

  log!: LogInstance

  @Logger('bal-radio-button')
  createLogger(log: LogInstance) {
    this.log = log
  }

  @State() interactionState: BalElementStateInfo = BalElementStateListener.DefaultState
  @State() checked = false
  @State() focused = false

  /**
   * PUBLIC PROPERTY API
   * ------------------------------------------------------
   */

  /**
   * If `true` the component gets a invalid red style.
   */
  @Prop() invalid?: boolean = undefined

  @Watch('invalid')
  invalidHandler() {
    this.updateProps('invalid', ['bal-radio', 'bal-icon', 'bal-label', 'bal-text'])
  }

  /**
   * If `true`, the element is not mutable, focusable, or even submitted with the form. The user can neither edit nor focus on the control, nor its form control descendants.
   */
  @Prop() disabled?: boolean = undefined

  @Watch('disabled')
  disabledHandler() {
    this.updateProps('disabled', ['bal-radio', 'bal-icon', 'bal-label', 'bal-text'])
  }

  /**
   * If `true` the element can not mutated, meaning the user can not edit the control.
   */
  @Prop() readonly?: boolean = undefined

  @Watch('readonly')
  readonlyHandler() {
    this.updateProps('readonly', ['bal-radio', 'bal-icon', 'bal-label', 'bal-text'])
  }

  /**
   * If `true` the component gets a invalid red style.
   */
  @Prop() color?: BalProps.BalRadioButtonColor

  /**
   * @internal
   */
  @Prop() colSize: BalProps.BalRadioGroupColumns = 1

  /**
   * @internal
   */
  @Prop() colSizeTablet: BalProps.BalRadioGroupColumns = 1

  /**
   * @internal
   */
  @Prop() colSizeMobile: BalProps.BalRadioGroupColumns = 1

  /**
   * Emitted when the toggle has focus.
   */
  @Event() balFocus!: EventEmitter<BalEvents.BalRadioButtonFocusDetail>

  /**
   * Emitted when the toggle loses focus.
   */
  @Event() balBlur!: EventEmitter<BalEvents.BalRadioButtonBlurDetail>

  /**
   * Emitted after render when element is labelled
   */
  @Event() balFormControlDidLoad!: EventEmitter<BalEvents.BalRadioButtonAriaLabelledByDetail>

  /**
   * LIFECYCLE
   * ------------------------------------------------------
   */

  connectedCallback() {
    this.triggerAllHandlers()
    this.el.addEventListener('keydown', this.onKeydown)
    this.el.addEventListener('touchstart', this.onPointerDown)
    this.el.addEventListener('mousedown', this.onPointerDown)
  }

  componentWillLoad() {
    this.triggerAllHandlers()
  }

  componentDidLoad() {
    this.balFormControlDidLoad.emit(this.el)
  }

  disconnectedCallback(): void {
    this.el.removeEventListener('keydown', this.onKeydown)
    this.el.removeEventListener('touchstart', this.onPointerDown)
    this.el.removeEventListener('mousedown', this.onPointerDown)
  }

  /**
   * LISTENERS
   * ------------------------------------------------------
   */

  @ListenToElementStates()
  elementStateListener(info: BalElementStateInfo) {
    this.interactionChildElements.forEach(element => {
      element.hovered = info.hovered
      element.pressed = info.pressed
    })
  }

  /**
   * PUBLIC METHODS
   * ------------------------------------------------------
   */

  /**
   * @internal
   */
  @Method()
  async setChecked(checked = true) {
    this.checked = checked
  }

  /**
   * PRIVATE METHODS
   * ------------------------------------------------------
   */

  private get interactionChildElements(): Array<HTMLBalLabelElement> {
    return Array.from(this.el.querySelectorAll('bal-label, bal-text, bal-icon, bal-radio'))
  }

  private triggerAllHandlers() {
    this.disabledHandler()
    this.readonlyHandler()
    this.invalidHandler()
  }

  private updateProps(key: string, selectors: string[]) {
    const value = (this as any)[key]
    if (value !== undefined) {
      this.notifyComponents<any>(selectors, input => (input[key] = value))
    }
  }

  private notifyComponents<T>(selectors: string[], callback: (component: T) => void) {
    const components = this.el.querySelectorAll<Element>(selectors.join(', '))
    components.forEach(c => callback(c as any))
  }

  /**
   * EVENT HANDLER
   * ------------------------------------------------------
   */

  private onClick = (ev: Event) => {
    if (this.disabled || this.readonly) {
      return stopEventBubbling(ev)
    }

    const element = ev.target as HTMLAnchorElement
    if (element && element.href) {
      return
    }

    const radioEl = this.el.querySelector('bal-radio')
    const targetEl = ev.target

    if (radioEl && targetEl) {
      const isCheckbox = targetEl === radioEl || isDescendant(radioEl, targetEl)
      if (!isCheckbox) {
        stopEventBubbling(ev)
        radioEl.click()
      }
    }
  }

  private onFocus = (ev: FocusEvent) => {
    if (this.disabled || this.readonly) {
      return stopEventBubbling(ev)
    }

    const radioEl = this.el.querySelector('bal-radio')
    const targetEl = ev.target

    if (this.keyboardMode) {
      this.focused = true
    }

    if (radioEl && targetEl) {
      const isCheckbox = targetEl === radioEl || isDescendant(radioEl, targetEl)
      if (isCheckbox) {
        stopEventBubbling(ev)
        radioEl.querySelector('input')?.focus()
      }
    } else {
      this.balFocus.emit()
    }
  }

  private onBlur = (ev: FocusEvent) => {
    if (this.disabled || this.readonly) {
      return stopEventBubbling(ev)
    }

    const radioEl = this.el.querySelector('bal-radio')
    const targetEl = ev.target

    this.focused = false

    if (radioEl && targetEl) {
      const isRadio = targetEl === radioEl || isDescendant(radioEl, targetEl)
      if (isRadio) {
        stopEventBubbling(ev)
        radioEl.querySelector('input')?.blur()
      }
    } else {
      this.balBlur.emit()
    }
  }

  private onPointerDown = () => (this.keyboardMode = false)

  private onKeydown = (ev: any) => (this.keyboardMode = FOCUS_KEYS.includes(ev.key))

  /**
   * RENDER
   * ------------------------------------------------------
   */

  render() {
    const block = BEM.block('radio-button')
    const disabled = !!this.disabled || !!this.readonly
    const invalid = !!this.invalid
    const color = !!this.color
    const colored = this.checked && color

    return (
      <Host
        class={{
          ...block.class(),
          ...block.modifier(`column-${this.colSize}`).class(this.colSize > 1),
          ...block.modifier(`column-tablet-${this.colSizeTablet}`).class(this.colSizeTablet > 1),
          ...block.modifier(`column-mobile-${this.colSizeMobile}`).class(this.colSizeMobile > 1),
        }}
        onClick={this.onClick}
      >
        <button
          role="radio"
          class={{
            ...block.element('native').class(),
            ...block.element('native').modifier('disabled').class(disabled),
            ...block.element('native').modifier('invalid').class(invalid),
            ...block.element('native').modifier('checked').class(this.checked),
            ...block.element('native').modifier(`colored`).class(colored),
            ...block.element('native').modifier(`color-${this.color}`).class(color),
            'bal-focusable': !this.disabled,
          }}
          disabled={disabled}
          onFocus={this.onFocus}
          onBlur={this.onBlur}
        >
          <slot></slot>
        </button>
      </Host>
    )
  }
}
