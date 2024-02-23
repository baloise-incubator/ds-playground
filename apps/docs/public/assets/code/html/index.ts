// Resets CSS for all browser
import '@baloise/design-system-styles/css/normalize.css'
import '@baloise/design-system-styles/css/structure.css'

// Custom font faces
import '@baloise/design-system-styles/css/font.css'

// Core CSS, always required
import '@baloise/design-system-styles/css/core.css'

// CSS utilities classes (optional)
import '@baloise/design-system-styles/css/utilities/all'

import { defineCustomElements } from '@baloise/ds-core/loader'
import { balSnackbarController, BalToastController } from '@baloise/ds-core'

defineCustomElements()
window.balSnackbarController = balSnackbarController
window.BalToastController = BalToastController
