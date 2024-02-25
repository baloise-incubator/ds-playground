import { SchematicsException, Tree } from '@angular-devkit/schematics'

export const addStyles = (host: Tree) => {
  const filePath = `src/styles.scss`
  const configBuffer = host.read(filePath)
  if (configBuffer === null) {
    throw new SchematicsException(`Could not find (${filePath})`)
  }
  const content = configBuffer.toString()

  if (!content.includes('@baloise/design-system-styles/css/core')) {
    const newContent =
      content +
      `
// SASS mixins and SASS variables
@import '@baloise/design-system-styles/sass/mixins';

// Resets CSS for all browser
@import '@baloise/design-system-styles/css/normalize';
@import '@baloise/design-system-styles/css/structure';

// Custom font faces
@import '@baloise/design-system-styles/css/font';

// Core CSS with CSS variables, always required
@import '@baloise/design-system-styles/css/core';

// CSS utilities classes (optional)
@import '@baloise/design-system-styles/css/utilities/background';
@import '@baloise/design-system-styles/css/utilities/border';
@import '@baloise/design-system-styles/css/utilities/elevation';
@import '@baloise/design-system-styles/css/utilities/flex';
@import '@baloise/design-system-styles/css/utilities/interaction';
@import '@baloise/design-system-styles/css/utilities/layout';
@import '@baloise/design-system-styles/css/utilities/sizing';
@import '@baloise/design-system-styles/css/utilities/spacing';
@import '@baloise/design-system-styles/css/utilities/typography';
`
    host.overwrite(filePath, newContent)
  }
}
