import autoprefixer from 'autoprefixer'
import { mkdir, writeFile } from 'fs/promises'
import { glob } from 'glob'
import { basename, dirname, join } from 'path'
import postcss from 'postcss'
import { compileAsync } from 'sass'
import CleanCSS from 'clean-css'

export const NEWLINE = '\n'

export const scan = async filePath => {
  // glop always returns and works with forward slashes
  return glob(filePath.replace(/\\/g, '/'))
}

export async function compileSass(file: string, options: { projectRoot: string }) {
  const fileName = basename(file).replace('.sass', '')
  const folderPath = dirname(file)
    .replace(options.projectRoot, '')
    .replace('sass', '')
    .replace(/^\/|\/$/g, '')

  const sassResult = await compileAsync(file, {
    loadPaths: ['node_modules'],
    sourceMap: true,
    sourceMapIncludeSources: true,
  })

  const postcssResult = await postcss([autoprefixer({ add: true, grid: true, flexbox: true })])
    .process(sassResult.css, {
      from: `${options.projectRoot}/css/*.css`,
      to: `${options.projectRoot}/css`,
      map: {
        inline: false,
        annotation: join(folderPath, `${fileName}.css.map`),
      },
    })
    .async()

  const cssContent = postcssResult.toString()
  const cleanResult = new CleanCSS({ compatibility: '*', level: 2 }).minify(cssContent)

  const outputPath = join('css', folderPath)
  await mkdir(join(options.projectRoot, outputPath), { recursive: true })
  await writeFile(join(options.projectRoot, outputPath, `${fileName}.css`), cssContent)
  await writeFile(join(options.projectRoot, outputPath, `${fileName}.css.map`), JSON.stringify(sassResult.sourceMap))
  await writeFile(join(options.projectRoot, outputPath, `${fileName}.min.css`), cleanResult.styles)
}
