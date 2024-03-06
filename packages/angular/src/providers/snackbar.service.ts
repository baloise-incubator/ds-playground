import { Inject, Injectable } from '@angular/core'

import type {
  BalSnackbarController,
  BalSnackbarOptions,
  Components,
} from '@baloise/ds-core/components'

import { defineCustomElement } from '@baloise/ds-core/components/bal-snackbar'
import { BalTokenSnackbar } from '@baloise/design-system-components-angular/common'

@Injectable({
  providedIn: 'root',
})
export class BalSnackbarService {
  constructor(@Inject(BalTokenSnackbar) private ctrl: BalSnackbarController) {
    defineCustomElement()
  }

  create(options: BalSnackbarOptions): Components.BalSnackbar {
    return this.ctrl.create(options)
  }

  async dismissAll(): Promise<void> {
    return this.ctrl.dismissAll()
  }
}