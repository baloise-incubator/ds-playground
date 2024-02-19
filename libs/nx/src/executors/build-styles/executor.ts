import { join } from 'path'
import { rm } from 'fs/promises'
import { exec } from 'child_process'
import { promisify } from 'util'

import { BuildStylesExecutorSchema } from './schema'
import { generateBackgroundColors } from './generators/background'
import { generateBorder } from './generators/border'
import { generateElevation } from './generators/elevation'
import { generateFlex } from './generators/flex'
import { generateInteractions } from './generators/interactions'
import { generateLayout } from './generators/layout'
import { generateSizing } from './generators/sizing'
import { generateSpacing } from './generators/spacing'
import { generateTypography } from './generators/typography'

export default async function runExecutor(options: BuildStylesExecutorSchema) {
  try {
    // clean generated files
    await rm(join(options.projectRoot, 'css'), { recursive: true, force: true })
    await rm(join(options.projectRoot, 'docs'), { recursive: true, force: true })
    await rm(join(options.projectRoot, 'src/generated'), { recursive: true, force: true })

    // generate css utils
    await generateBackgroundColors(options)
    await generateBorder(options)
    await generateElevation(options)
    await generateFlex(options)
    await generateInteractions(options)
    await generateLayout(options)
    await generateSizing(options)
    await generateSpacing(options)
    await generateTypography(options)
  } catch (error) {
    console.error(error)
    return { success: false }
  }

  // create css output
  const sass = await promisify(exec)(`sass --load-path=../../node_modules --embed-sources ./sass:./css`, {
    cwd: options.projectRoot,
  })
  console.log(sass.stdout)

  const hasErrorSass = !!sass.stderr
  if (hasErrorSass) {
    console.error(sass.stderr)
    return { success: false }
  }

  const postcss = await promisify(exec)(`postcss ./css/*.css --use autoprefixer -d ./css/`, {
    cwd: options.projectRoot,
  })
  console.log(postcss.stdout)

  const hasErrorPostCss = !!postcss.stderr
  if (hasErrorPostCss) {
    console.error(postcss.stderr)
    return { success: false }
  }

  const cleanCss = await promisify(exec)(`cleancss -O2 --batch --batch-suffix .min css/**/*.css`, {
    cwd: options.projectRoot,
  })
  console.log(cleanCss.stdout)

  const hasErrorCleanCss = !!cleanCss.stderr
  if (hasErrorCleanCss) {
    console.error(cleanCss.stderr)
    return { success: false }
  }

  return { success: true }
}
