import { AfterViewInit, Directive, ElementRef, HostListener, Injector, OnDestroy } from '@angular/core'
import { ControlValueAccessor, NgControl } from '@angular/forms'
import { Subscription } from 'rxjs'

import type { BaloiseDesignSystemAngularConfig } from '..'
import { BalTokenUserConfig, raf } from '..'

@Directive()
export class ValueAccessor implements ControlValueAccessor, AfterViewInit, OnDestroy {
  private onChange: (value: any) => void = () => {
    /**/
  }
  private onTouched: () => void = () => {
    /**/
  }

  protected lastValue: any
  private statusChanges?: Subscription

  constructor(
    protected injector: Injector,
    protected elementRef: ElementRef,
  ) {}

  writeValue(value: any): void {
    this.elementRef.nativeElement.value = this.lastValue = value === null ? '' : value
    this.onStatusChange()
  }

  /**
   * Notifies the ControlValueAccessor of a change in the value of the control.
   *
   * This is called by each of the ValueAccessor directives when we want to update
   * the status and validity of the form control. For example with text components this
   * is called when the ionInput event is fired. For select components this is called
   * when the ionChange event is fired.
   *
   * This also updates the Ionic form status classes on the element.
   *
   * @param el The component element.
   * @param value The new value of the control.
   */
  handleValueChange(ev: CustomEvent<any>): void {
    const el = ev.target as HTMLElement
    const value = ev.detail as any
    if (el === this.elementRef.nativeElement) {
      if (value !== this.lastValue) {
        this.lastValue = value
        this.onChange(value)
      }
      this.onStatusChange()
    }
  }

  @HostListener('balBlur', ['$event.target'])
  _handleBlurEvent(el: any): void {
    if (el === this.elementRef.nativeElement) {
      this.onTouched()
    }
  }

  registerOnChange(fn: (value: any) => void): void {
    this.onChange = (value: any) => {
      fn(value)
      this.onStatusChange()
    }
  }

  registerOnTouched(fn: () => void) {
    this.onTouched = () => {
      fn()
      this.onStatusChange()
    }
  }

  setDisabledState(isDisabled: boolean): void {
    this.elementRef.nativeElement.disabled = isDisabled

    const fieldComponent = findFieldComponent(this.elementRef)
    if (fieldComponent) {
      fieldComponent.disabled = isDisabled
    }
  }

  setInvalidState(isInvalid: boolean): void {
    const nativeElement = this.elementRef.nativeElement
    if (nativeElement.autoInvalidOff !== true) {
      nativeElement.invalid = isInvalid

      const fieldComponent = findFieldComponent(this.elementRef)
      if (fieldComponent) {
        fieldComponent.invalid = isInvalid
      }
    }
  }

  onStatusChange() {
    raf(() => {
      let ngControl
      try {
        ngControl = this.injector.get<NgControl>(NgControl)
      } catch {
        /* No FormControl or ngModel binding */
      }

      if (!ngControl) {
        return
      }

      let config
      try {
        config = this.injector.get<BaloiseDesignSystemAngularConfig>(BalTokenUserConfig)
      } catch {
        /* No config */
      }

      if (!config) {
        return
      }

      const { dirty, touched, invalid } = ngControl

      if (config.forms?.setInvalid !== false) {
        const invalidateOn = config.forms?.invalidateOn || 'touched'
        const isTouched = touched === true
        const isDirty = dirty === true
        const isInvalid = invalid === true
        const isReadyToValidate = invalidateOn === 'touched' ? isTouched : isDirty

        this.setInvalidState(isReadyToValidate && isInvalid)
      }
    })
  }

  ngOnDestroy(): void {
    if (this.statusChanges) {
      this.statusChanges.unsubscribe()
    }
  }

  ngAfterViewInit(): void {
    let ngControl
    try {
      ngControl = this.injector.get<NgControl>(NgControl)
    } catch {
      /* No FormControl or ngModel binding */
    }

    if (!ngControl) {
      return
    }

    // Listen for changes in validity, disabled, or pending states
    if (ngControl.statusChanges) {
      this.statusChanges = ngControl.statusChanges.subscribe(() => {
        this.onStatusChange()
      })
    }
  }
}

export const findFieldComponent = (element: ElementRef): { disabled: boolean; invalid: boolean } | undefined => {
  if (element && element.nativeElement) {
    return element.nativeElement.closest('bal-field') || undefined
  }
  return undefined
}
