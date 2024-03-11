#!/usr/bin/env node

import prompts from 'prompts'
import replace from 'replace-in-file'
import path from 'path'
import fs from 'fs'
import fsp from 'fs/promises'
import { tsquery } from '@phenomnomnominal/tsquery'
import { load } from 'cheerio'
import { glob } from 'glob'

// ================================================================================
// MAIN
// ================================================================================
const main = async () => {
  const log = logger('Styles Migration')
  const response = await prompts([
    {
      type: 'multiselect',
      name: 'targets',
      message: 'What do you want to migrate',
      choices: [
        {
          title: 'html templates (*.html)',
          value: 'HTML',
          selected: true,
        },
        {
          title: 'Global stylesheet',
          value: 'GLOBAL_STYLES',
          selected: true,
        },
        {
          title: 'inline templates (angular - *.ts)',
          value: 'INLINE',
          selected: true,
        },
        {
          title: 'mixin imports (angular - *.scss)',
          value: 'SCSS',
          selected: true,
        },
        {
          title: 'css variables (*.scss)',
          value: 'CSS_VARIABLES',
          selected: true,
        },
      ],
      instructions: false,
    },
    {
      type: (_prev, { targets }) =>
        targets.includes('HTML') || targets.includes('INLINE') || targets.includes('SCSS') ? 'text' : null,
      name: 'pathToComponentFiles',
      message: 'Where are your html template files located?',
      initial: path.join('src', 'app'),
    },
    {
      type: (_prev, { targets }) => (targets.includes('CSS_VARIABLES') ? 'text' : null),
      name: 'pathToStylesheets',
      message: 'Where are your scss style files located?',
      initial: path.join('src'),
    },
    {
      type: (_prev, { targets }) => (targets.includes('GLOBAL_STYLES') ? 'text' : null),
      name: 'pathGlobalStylesheet',
      message: 'Where is your global stylesheet located, with the imports?',
      initial: path.join('src', 'styles.scss'),
    },
    {
      type: (_prev, { targets }) =>
        targets.includes('GLOBAL_STYLES') || targets.includes('HTML') || targets.includes('INLINE')
          ? 'multiselect'
          : null,
      name: 'utils',
      message: 'Which css utilities do you want to migrate?',
      choices: [
        { value: 'border & radius', selected: true },
        { value: 'color', selected: true },
        { value: 'display', selected: true },
        { value: 'flex', selected: true },
        { value: 'opacity & shadow', selected: true },
        { value: 'spacing', selected: true },
        { value: 'typography', selected: true },
      ],
      instructions: false,
    },
  ])

  log.info()
  log.start()
  log.info()

  const { targets, utils, pathGlobalStylesheet, pathToComponentFiles, pathToStylesheets } = response

  const filePath = path.join(process.cwd(), `${(pathToComponentFiles || 'src/app').trim()}`)
  const globalStyleSheetPath = path.join(process.cwd(), `${(pathGlobalStylesheet || 'src/styles.scss').trim()}`)

  const isDirectory = await isDirectoryFn({ filePath })
  const directoryPath = isDirectory ? filePath : path.dirname(filePath)

  let isFile = false
  if ((targets.includes('HTML') || targets.includes('SCSS') || targets.includes('INLINE')) && !isDirectory) {
    try {
      isFile = await isFileFn({ filePath })
    } catch (error) {
      log.fail(`Could not find directory or file at ${filePath}`, error)
      return exit()
    }
  }

  let doesGlobalStylesheetExist = false
  if (targets.includes('GLOBAL_STYLES')) {
    try {
      doesGlobalStylesheetExist = await isFileFn({
        filePath: globalStyleSheetPath,
      })
    } catch (error) {
      log.info(`Could not find global stylesheet at ${globalStyleSheetPath}`, error)
    }
  }

  const extension = path.extname(filePath)
  const context = {
    log,
    isDirectory,
    directoryPath,
    isFile,
    filePath,
    extension,
    utils,
    targets,
    globalStyleSheetPath,
  }

  if (targets.includes('SCSS') && (isDirectory || (isFile && extension === '.scss'))) {
    await migrateComponentStylesSheet(context)
  }

  if (
    targets.includes('GLOBAL_STYLES') &&
    doesGlobalStylesheetExist &&
    (path.extname(globalStyleSheetPath) === '.scss' || path.extname(globalStyleSheetPath) === '.sass')
  ) {
    await migrateGlobalStyleSheet(context)
  }

  if (targets.includes('INLINE') || targets.includes('HTML')) {
    const utilReplacers = filterReplacers(context)

    if (targets.includes('INLINE')) {
      await migrateInlineTemplates({ ...context, utilReplacers })
    }

    if (targets.includes('HTML')) {
      await migrateHtmlFiles({ ...context, utilReplacers })
    }
  }

  if (targets.includes('CSS_VARIABLES')) {
    const stylePath = path.join(process.cwd(), `${(pathToStylesheets || 'src').trim()}`)
    const isDirectoryStyle = await isDirectoryFn({ filePath: stylePath })
    const directoryPathStyle = isDirectoryStyle ? stylePath : path.dirname(stylePath)
    await migrateCSSVariables({
      ...context,
      filePath: stylePath,
      isDirectory: isDirectoryStyle,
      directoryPath: directoryPathStyle,
    })
  }

  log.succeed()
  return done()
}

async function migrateComponentStylesSheet({ log, isDirectory, directoryPath, filePath }) {
  const files = []
  if (isDirectory) {
    const relativePath = path.relative(process.cwd(), directoryPath)
    files.push(path.join(relativePath, '**', '*.scss').replace(/\\/g, '/'))
    files.push(path.join(relativePath, '**', '*.sass').replace(/\\/g, '/'))
  } else {
    const relativePath = path.relative(process.cwd(), filePath)
    files.push(relativePath.replace(/\\/g, '/'))
  }

  try {
    const result = await replace({
      files,
      from: [new RegExp(`@baloise/(ds-css|design-system-css)/sass/mixins`, 'g')],
      to: ['@baloise/ds-styles/sass/mixins'],
      allowEmptyPaths: true,
    })
    printResult({ result, log })
  } catch (error) {
    log.info()
    log.fail(error)
    return Promise.reject()
  } finally {
    return Promise.resolve()
  }
}

async function migrateCSSVariables({ log, isDirectory, directoryPath, filePath }) {
  const files = []
  if (isDirectory) {
    const relativePath = path.relative(process.cwd(), directoryPath)
    files.push(path.join(relativePath, '**', '*.sass').replace(/\\/g, '/'))
    files.push(path.join(relativePath, '**', '*.scss').replace(/\\/g, '/'))
  } else {
    const relativePath = path.relative(process.cwd(), filePath)
    files.push(relativePath.replace(/\\/g, '/'))
  }

  try {
    const result = await replace({
      files,
      from: [
        ...replacementsCSSVariablesColors.from,
        ...replacementsCSSVariablesVarious.from,
        ...replacementsCSSVariablesSpace.from,
        ...replacementsCSSVariablesTextSize.from,
        ...replacementsCSSVariablesInvertedWhite.from,
        ...replacementsCSSVariablesInvertedPrimary.from,
      ],
      to: [
        ...replacementsCSSVariablesColors.to,
        ...replacementsCSSVariablesVarious.to,
        ...replacementsCSSVariablesSpace.to,
        ...replacementsCSSVariablesTextSize.to,
        ...replacementsCSSVariablesInvertedWhite.to,
        ...replacementsCSSVariablesInvertedPrimary.to,
      ],
      allowEmptyPaths: true,
    })
    printResult({ result, log })
  } catch (error) {
    log.info()
    log.fail(error)
    return Promise.reject()
  } finally {
    return Promise.resolve()
  }
}

async function migrateGlobalStyleSheet({ globalStyleSheetPath, log }) {
  const files = globalStyleSheetPath.replace(/\\/g, '/')
  try {
    const result = await replace({
      files,
      from: [
        new RegExp(`@baloise/(ds-css|design-system-css)/(sass|css)/baloise-design-system.sass`, 'g'),
        new RegExp(`@baloise/(ds-css|design-system-css)/(sass|css)/baloise-design-system`, 'g'),

        new RegExp(`@baloise/(ds-css|design-system-css)/sass/mixins`, 'g'),
        new RegExp(`@baloise/(ds-css|design-system-css)/(sass|css)/normalize`, 'g'),
        new RegExp(`@baloise/(ds-css|design-system-css)/(sass|css)/structure`, 'g'),
        new RegExp(`@baloise/(ds-css|design-system-css)/(sass|css)/font`, 'g'),
        new RegExp(`@baloise/(ds-css|design-system-css)/(sass|css)/core`, 'g'),

        `// Deprecated styles will be removed with the next breaking version (optional)`,
        new RegExp(`@import '@baloise/(ds-css|design-system-css)/(sass|css)/legacy';`, 'g'), // deprecated
        new RegExp(`@import '@baloise/(ds-css|design-system-css)/(sass|css)/grid';`, 'g'), // included in core

        new RegExp(`@baloise/(ds-css|design-system-css)/(sass|css)/display`, 'g'),
        new RegExp(`@baloise/(ds-css|design-system-css)/(sass|css)/flex`, 'g'),
        new RegExp(`@baloise/(ds-css|design-system-css)/(sass|css)/spacing`, 'g'),
        new RegExp(`@baloise/(ds-css|design-system-css)/(sass|css)/typography`, 'g'),
        new RegExp(`@baloise/(ds-css|design-system-css)/(sass|css)/color`, 'g'),
        new RegExp(`@baloise/(ds-css|design-system-css)/(sass|css)/border`, 'g'),
        new RegExp(`@baloise/(ds-css|design-system-css)/(sass|css)/radius`, 'g'),
        new RegExp(`@baloise/(ds-css|design-system-css)/(sass|css)/opacity`, 'g'),
        new RegExp(`@baloise/(ds-css|design-system-css)/(sass|css)/shadow`, 'g'),
      ],
      to: [
        '@baloise/ds-styles/sass/all',
        '@baloise/ds-styles/sass/all',

        '@baloise/ds-styles/sass/mixins',
        '@baloise/ds-styles/css/normalize',
        '@baloise/ds-styles/css/structure',
        '@baloise/ds-styles/css/font',
        '@baloise/ds-styles/css/core',
        '',
        '',
        '',
        '@baloise/ds-styles/css/utilities/layout',
        '@baloise/ds-styles/css/utilities/flex',
        '@baloise/ds-styles/css/utilities/spacing',
        '@baloise/ds-styles/css/utilities/typography',
        '@baloise/ds-styles/css/utilities/background',
        '@baloise/ds-styles/css/utilities/border',
        '@baloise/ds-styles/css/utilities/border',
        '@baloise/ds-styles/css/utilities/elevation',
        '@baloise/ds-styles/css/utilities/elevation',
      ],
      allowEmptyPaths: true,
    })
    printResult({ result, log })
    let lines = (await fsp.readFile(files, 'utf-8')).split(/\r?\n/)
    lines.push(`@import '@baloise/ds-styles/css/utilities/interaction';`)
    lines.push(`@import '@baloise/ds-styles/css/utilities/sizing';`)
    lines = lines.reduce((acc, line) => {
      if (line.length === 0) {
        if (acc[acc.length - 1].length === 0) {
          return acc
        }
        return [...acc, line]
      }
      return acc.indexOf(line) >= 0 ? acc : [...acc, line]
    }, [])
    await fsp.writeFile(files, lines.join('\r\n'))
  } catch (error) {
    log.info()
    log.fail(error)
    return Promise.reject()
  } finally {
    return Promise.resolve()
  }
}

async function migrateInlineTemplates({ filePath, log, utilReplacers }) {
  // check if path is directly one file
  const isFile = filePath.endsWith('.ts')
  let pathToFiles = filePath
  if (!isFile) {
    pathToFiles = path.join(filePath, '**', '*.ts')
  }

  const files = await glob(pathToFiles)
  const inlineTemplateFiles = []
  for (let index = 0; index < files.length; index++) {
    const file = files[index]
    const content = await fsp.readFile(file, 'utf-8')
    if (content.includes('@Component') && content.includes('template: `')) {
      inlineTemplateFiles.push(file)
    }
  }

  for (let index = 0; index < inlineTemplateFiles.length; index++) {
    const file = inlineTemplateFiles[index]
    const content = await fsp.readFile(file, 'utf-8')
    let newContent = content
    tsquery.replace(content, 'PropertyAssignment', node => {
      if (node.name.getText() === 'template') {
        const originalTemplate = node.getChildAt(2).getFullText().trim().slice(1, -1)

        const template = replaceHtml({
          template: originalTemplate,
          from: utilReplacers.from,
          to: utilReplacers.to,
        })

        if (template !== originalTemplate) {
          newContent = newContent.replace(originalTemplate, template)
        }
      }

      // return undefined does not replace anything
      return undefined
    })

    if (content !== newContent) {
      await fsp.writeFile(file, newContent)
      log.list(file.replace(process.cwd(), ''))
    }
  }
}

async function migrateHtmlFiles({ filePath, log, utilReplacers }) {
  // check if path is directly one file
  const isFile = filePath.trim().endsWith('.html')
  let files = filePath.replace(/\\/g, '/')
  if (!isFile) {
    files = path.join(`${files}`, '**', '*.html'.replace(/\\/g, '/'))
  }

  try {
    const results = [
      await replace({
        files,
        processor: input => {
          const $ = load(input)
          let content = input
          $('[class]').each((index, element) => {
            const classes = $(element).attr('class').split(' ')

            const modifiedClasses = classes.map(className => {
              for (let index = 0; index < utilReplacers.from.length; index++) {
                const oldClassName = utilReplacers.from[index]
                const replacement = utilReplacers.to[index]
                if (className.match(escapeRegex(oldClassName))) {
                  return className.replace(oldClassName, replacement)
                }
              }
              return className
            })

            content = content.replace(`class="${classes.join(' ')}"`, `class="${modifiedClasses.join(' ')}"`)
          })

          return content
        },
        allowEmptyPaths: true,
      }),
    ]

    let changedFiles = results
      .flat()
      .filter(result => result.hasChanged)
      .map(result => result.file.replace(process.cwd(), ''))

    changedFiles = changedFiles.filter((item, index) => changedFiles.indexOf(item) === index)

    if (changedFiles.length > 0) {
      changedFiles.forEach(file => log.list(file))
    }
    log.info()
  } catch (error) {
    log.info()
    log.fail(error)
    return Promise.reject()
  } finally {
    return Promise.resolve()
  }
}

// ================================================================================
// UTILITIES
// ================================================================================

function filterReplacers({ utils }) {
  const from = []
  const to = []

  if (utils.includes('border & radius')) {
    from.push(replacementsBorder.from)
    from.push(replacementsRadius.from)
    to.push(replacementsBorder.to)
    to.push(replacementsRadius.to)
  }

  if (utils.includes('color')) {
    from.push(replacementsColors.from)
    to.push(replacementsColors.to)
  }

  if (utils.includes('flex')) {
    from.push(replacementsFlex.from)
    to.push(replacementsFlex.to)
  }

  if (utils.includes('display')) {
    from.push(replacementsDisplay.from)
    to.push(replacementsDisplay.to)
  }

  from.push(replacementsGrid.from)
  to.push(replacementsGrid.to)

  if (utils.includes('opacity & shadow')) {
    from.push(replacementsOpacity.from)
    to.push(replacementsOpacity.to)
    from.push(replacementsShadow.from)
    to.push(replacementsShadow.to)
  }

  if (utils.includes('spacing')) {
    from.push(replacementsSpacing.from)
    to.push(replacementsSpacing.to)
  }

  if (utils.includes('typography')) {
    from.push(replacementsTypography.from)
    to.push(replacementsTypography.to)
  }

  from.push(replacementsCore.from)
  to.push(replacementsCore.to)
  from.push(replacementsZIndex.from)
  to.push(replacementsZIndex.to)
  from.push(replacementsSizing.from)
  to.push(replacementsSizing.to)

  return { from: from.flat(), to: to.flat() }
}

function replaceHtml({ template, from, to }) {
  const $ = load(template)
  let newTemplate = template
  $('[class]').each((index, element) => {
    const classes = $(element).attr('class').split(' ')

    const modifiedClasses = classes.map(className => {
      for (let index = 0; index < from.length; index++) {
        const oldClassName = from[index]
        const replacement = to[index]
        if (className.match(escapeRegex(oldClassName))) {
          return className.replace(oldClassName, replacement)
        }
      }
      return className
    })

    newTemplate = newTemplate.replace(`class="${classes.join(' ')}"`, `class="${modifiedClasses.join(' ')}"`)
  })

  return newTemplate
}

function printResult({ result, log }) {
  // filter for only change files and return the path
  let changedFiles = result
    .flat()
    .filter(result => result.hasChanged)
    .map(result => result.file.replace(process.cwd(), ''))

  // remove duplications
  changedFiles = changedFiles.filter((item, index) => changedFiles.indexOf(item) === index)

  if (changedFiles.length > 0) {
    changedFiles.forEach(file => log.list(file))
  }
}

async function isDirectoryFn({ filePath }) {
  try {
    const isDirectory = fs.lstatSync(filePath).isDirectory()
    return Promise.resolve(isDirectory)
  } catch (error) {
    return Promise.resolve(false)
  }
}

async function isFileFn({ filePath }) {
  try {
    const isFile = fs.lstatSync(filePath).isFile()
    return Promise.resolve(isFile)
  } catch (error) {
    return Promise.reject(error)
  }
}

function escapeRegex(string) {
  if (typeof string === 'string') {
    return string.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&')
  }
  return string
}

const breakpointClasses = className => ({
  from: allBreakpoints.map(b => new RegExp(`is-${className}${b ? `-${b}` : ''}`, 'g')),
  to: allBreakpoints.map(b => `${b ? `${b}:` : ''}${className}`),
})

const spacingClasses = (oldClassName, newClassName) => ({
  from: allSpacingValues.map(s => new RegExp(`${oldClassName}${s ? `-${s}` : ''}`, 'g')),
  to: allSpacingValues.map(s => `${newClassName}${s ? `-${s}` : ''}`),
})

const exit = () => process.exit(1)
const done = () => process.exit(0)
const log = (message, ...args) => console.log(message, ...args)
const logger = subject => {
  let startTime = new Date()

  return {
    info: (message, ...args) => {
      console.log(message || '', ...args)
    },
    start: message => {
      startTime = new Date()
      log('⏳ ', `${subject} \x1b[90mstarted ...\x1b[0m`, message || '')
    },
    succeed: message => {
      const endTime = new Date()
      const duration = endTime - startTime
      const seconds = parseFloat(duration / 1000).toFixed(2)
      log('✅ ', `\x1b[32m${subject} \x1b[90mfinished in ${seconds}sec\x1b[0m`, message || '')
    },
    fail: message => {
      const endTime = new Date()
      const duration = endTime - startTime
      const seconds = parseFloat(duration / 1000).toFixed(2)
      log('❌ ', `\x1b[31m${subject} \x1b[90mfailed after ${seconds}sec\x1b[0m`)
      if (message) {
        console.error(message)
      }
      exit()
    },
    list: message => {
      console.log('\x1b[90mUPDATE\x1b[0m', message)
    },
  }
}

// const minBreakpoints = ['', 'mobile', 'tablet', 'desktop', 'widescreen']

const allBreakpoints = [
  'tablet-only',
  'desktop-only',
  'high-definition-only',
  'widescreen-only',
  'mobile',
  'tablet',
  'touch',
  'desktop',
  'high-definition',
  'widescreen',
  'fullhd',
  '',
]

const allSpacingValues = [
  'auto',
  'none',
  'xx-small',
  'x-small',
  'small',
  'normal',
  'medium',
  'xxxx-large',
  'xxx-large',
  'xx-large',
  'x-large',
  'large',
]

// ================================================================================
// MAPPINGS & REPLACEMENTS
// ================================================================================

const invertedTextWhite = {
  from: [
    /has-text-black-inverted/g,
    /has-text-grey-5-inverted/g,
    /has-text-grey-6-inverted/g,
    /has-text-blue-4-inverted/g,
    /has-text-blue-5-inverted/g,
    /has-text-blue-6-inverted/g,
    /has-text-light-blue-4-inverted/g,
    /has-text-light-blue-5-inverted/g,
    /has-text-light-blue-6-inverted/g,
    /has-text-purple-4-inverted/g,
    /has-text-purple-5-inverted/g,
    /has-text-purple-6-inverted/g,
    /has-text-green-6-inverted/g,
    /has-text-yellow-6-inverted/g,
    /has-text-red-4-inverted/g,
    /has-text-red-5-inverted/g,
    /has-text-red-6-inverted/g,
    /has-text-info-3-inverted/g,
    /has-text-info-4-inverted/g,
    /has-text-info-5-inverted/g,
    /has-text-info-6-inverted/g,
    /has-text-success-3-inverted/g,
    /has-text-success-4-inverted/g,
    /has-text-success-5-inverted/g,
    /has-text-success-6-inverted/g,
    /has-text-danger-3-inverted/g,
    /has-text-danger-4-inverted/g,
    /has-text-danger-5-inverted/g,
    /has-text-danger-6-inverted/g,
    /has-text-primary-4-inverted/g,
    /has-text-primary-5-inverted/g,
    /has-text-primary-6-inverted/g,
    /has-text-primary-inverted/g,
    /has-text-blue-inverted/g,
    /has-text-info-inverted/g,
    /has-text-success-inverted/g,
    /has-text-danger-inverted/g,
  ],
  to: [
    'text-white',
    'text-white',
    'text-white',
    'text-white',
    'text-white',
    'text-white',
    'text-white',
    'text-white',
    'text-white',
    'text-white',
    'text-white',
    'text-white',
    'text-white',
    'text-white',
    'text-white',
    'text-white',
    'text-white',
    'text-white',
    'text-white',
    'text-white',
    'text-white',
    'text-white',
    'text-white',
    'text-white',
    'text-white',
    'text-white',
    'text-white',
    'text-white',
    'text-white',
    'text-white',
    'text-white',
    'text-white',
    'text-white',
    'text-white',
    'text-white',
    'text-white',
    'text-white',
  ],
}

const invertedTextPrimary = {
  from: [
    /has-text-transparent-inverted/g,
    /has-text-white-inverted/g,
    /has-text-grey-1-inverted/g,
    /has-text-grey-2-inverted/g,
    /has-text-grey-3-inverted/g,
    /has-text-grey-4-inverted/g,
    /has-text-blue-1-inverted/g,
    /has-text-blue-2-inverted/g,
    /has-text-blue-3-inverted/g,
    /has-text-light-blue-1-inverted/g,
    /has-text-light-blue-2-inverted/g,
    /has-text-light-blue-3-inverted/g,
    /has-text-purple-1-inverted/g,
    /has-text-purple-2-inverted/g,
    /has-text-purple-3-inverted/g,
    /has-text-green-1-inverted/g,
    /has-text-green-2-inverted/g,
    /has-text-green-3-inverted/g,
    /has-text-green-4-inverted/g,
    /has-text-green-5-inverted/g,
    /has-text-yellow-1-inverted/g,
    /has-text-yellow-2-inverted/g,
    /has-text-yellow-3-inverted/g,
    /has-text-yellow-4-inverted/g,
    /has-text-yellow-5-inverted/g,
    /has-text-red-1-inverted/g,
    /has-text-red-2-inverted/g,
    /has-text-red-3-inverted/g,
    /has-text-info-1-inverted/g,
    /has-text-info-2-inverted/g,
    /has-text-success-1-inverted/g,
    /has-text-success-2-inverted/g,
    /has-text-warning-1-inverted/g,
    /has-text-warning-2-inverted/g,
    /has-text-warning-3-inverted/g,
    /has-text-warning-4-inverted/g,
    /has-text-warning-5-inverted/g,
    /has-text-warning-6-inverted/g,
    /has-text-danger-1-inverted/g,
    /has-text-danger-2-inverted/g,
    /has-text-primary-1-inverted/g,
    /has-text-primary-2-inverted/g,
    /has-text-primary-3-inverted/g,
    /has-text-grey-inverted/g,
    /has-text-light-blue-inverted/g,
    /has-text-purple-inverted/g,
    /has-text-green-inverted/g,
    /has-text-yellow-inverted/g,
    /has-text-red-inverted/g,
    /has-text-warning-inverted/g,
  ],
  to: [
    'text-primary',
    'text-primary',
    'text-primary',
    'text-primary',
    'text-primary',
    'text-primary',
    'text-primary',
    'text-primary',
    'text-primary',
    'text-primary',
    'text-primary',
    'text-primary',
    'text-primary',
    'text-primary',
    'text-primary',
    'text-primary',
    'text-primary',
    'text-primary',
    'text-primary',
    'text-primary',
    'text-primary',
    'text-primary',
    'text-primary',
    'text-primary',
    'text-primary',
    'text-primary',
    'text-primary',
    'text-primary',
    'text-primary',
    'text-primary',
    'text-primary',
    'text-primary',
    'text-primary',
    'text-primary',
    'text-primary',
    'text-primary',
    'text-primary',
    'text-primary',
    'text-primary',
    'text-primary',
    'text-primary',
    'text-primary',
    'text-primary',
    'text-primary',
    'text-primary',
    'text-primary',
    'text-primary',
    'text-primary',
    'text-primary',
    'text-primary',
  ],
}

const textSizeLegacy = {
  from: [
    /is-size-display-2/g,
    /is-size-display/g,
    /is-size-1/g,
    /is-size-2/g,
    /is-size-3/g,
    /is-size-4/g,
    /is-size-5/g,
    /is-size-6/g,
    /is-size-7/g,
    /is-size-8/g,
  ],
  to: [
    'text-xxxx-large',
    'text-xxxxx-large',
    'text-xxx-large',
    'text-xx-large',
    'text-x-large',
    'text-large',
    'text-medium',
    'text-normal',
    'text-small',
    'text-x-small',
  ],
}

const textColor = {
  from: [
    /has-text-primary/g,
    /has-text-white/g,
    /has-text-black/g,
    /has-text-grey-dark/g,
    /has-text-grey/g,
    /has-text-grey-light/g,
    /has-text-light-blue/g,
    /has-text-light-blue-light/g,
    /has-text-info-light/g,
    /has-text-primary-dark/g,
    /has-text-primary-light/g,
    /has-text-success/g,
    /has-text-info/g,
    /has-text-warning/g,
    /has-text-danger/g,
    /has-text-danger-dark/g,
    /has-text-danger-darker/g,
  ],
  to: [
    'text-primary',
    'text-white',
    'text-black',
    'text-grey-dark',
    'text-grey',
    'text-grey-light',
    'text-primary-hovered',
    'text-inverted-hovered',
    'text-inverted-pressed',
    'text-primary-pressed',
    'text-primary-light',
    'text-success',
    'text-info',
    'text-warning',
    'text-danger',
    'text-danger-hovered',
    'text-danger-pressed',
  ],
}

const textAlignment = {
  from: [
    /has-text-centered-desktop/g,
    /has-text-centered-tablet/g,
    /has-text-centered-mobile/g,
    /has-text-centered/g,
    /has-text-justified-desktop/g,
    /has-text-justified-tablet/g,
    /has-text-justified-mobile/g,
    /has-text-justified/g,
    /has-text-left-desktop/g,
    /has-text-left-tablet/g,
    /has-text-left-mobile/g,
    /has-text-left/g,
    /has-text-right-desktop/g,
    /has-text-right-tablet/g,
    /has-text-right-mobile/g,
    /has-text-right/g,
  ],
  to: [
    'desktop:text-align-center',
    'tablet:text-align-center',
    'mobile:text-align-center',
    'text-align-center',
    'desktop:text-align-justify',
    'tablet:text-align-justify',
    'mobile:text-align-justify',
    'text-align-justify',
    'desktop:text-align-left',
    'tablet:text-align-left',
    'mobile:text-align-left',
    'text-align-left',
    'desktop:text-align-right',
    'tablet:text-align-right',
    'mobile:text-align-right',
    'text-align-right',
  ],
}

const marginAndPadding = () => {
  const props = ['m', 'p']
  const orientation = ['', '', 'x', 'y', 't', 'r', 'b', 'l']
  const sizes = [
    'none',
    'xx-small',
    'x-small',
    'small',
    'normal',
    'medium',
    'large',
    'x-large',
    'xx-large',
    'xxx-large',
    'xxxx-large',
  ]
  const fromResults = []
  const toResults = []
  props.forEach(p => {
    orientation.forEach(o => {
      sizes.forEach((s, i) => {
        fromResults.push(new RegExp(`${p}${o ? '-' + o : ''}-${i}`, 'g'))
        toResults.push(`${p}${o ? '-' + o : ''}-${s}`)
      })
    })
  })
  return {
    from: fromResults,
    to: toResults,
  }
}

const ColSizes = [
  'is-narrow',
  'is-full',
  'is-three-quarters',
  'is-two-thirds',
  'is-half',
  'is-one-third',
  'is-one-quarter',
  'is-one-fifth',
  'is-two-fifths',
  'is-three-fifths',
  'is-four-fifths',
  'is-offset-three-quarters',
  'is-offset-two-thirds',
  'is-offset-half',
  'is-offset-one-third',
  'is-offset-one-quarter',
  'is-offset-one-fifth',
  'is-offset-two-fifths',
  'is-offset-three-fifths',
  'is-offset-four-fifths',
  'is-10',
  'is-offset-10',
  'is-11',
  'is-offset-11',
  'is-12',
  'is-offset-12',
  'is-0',
  'is-offset-0',
  'is-1',
  'is-offset-1',
  'is-2',
  'is-offset-2',
  'is-3',
  'is-offset-3',
  'is-4',
  'is-offset-4',
  'is-5',
  'is-offset-5',
  'is-6',
  'is-offset-6',
  'is-7',
  'is-offset-7',
  'is-8',
  'is-offset-8',
  'is-8',
  'is-offset-9',
]

const replacementsGrid = {
  from: [
    /(?<!-)columns/g,
    /(?<!-)\bcolumn\b/g,
    ...ColSizes.map(className => new RegExp(`${className}-mobile`, 'g')),
    ...ColSizes.map(className => new RegExp(`${className}-tablet`, 'g')),
    ...ColSizes.map(className => new RegExp(`${className}-touch`, 'g')),
    ...ColSizes.map(className => new RegExp(`${className}-desktop`, 'g')),
    ...ColSizes.map(className => new RegExp(`${className}-widescreen`, 'g')),
    ...ColSizes.map(className => new RegExp(`${className}-fullhd`, 'g')),
  ],
  to: [
    'grid',
    'col',
    ...ColSizes.map(className => `mobile:${className}`, 'g'),
    ...ColSizes.map(className => `tablet:${className}`, 'g'),
    ...ColSizes.map(className => `touch:${className}`, 'g'),
    ...ColSizes.map(className => `desktop:${className}`, 'g'),
    ...ColSizes.map(className => `widescreen:${className}`, 'g'),
    ...ColSizes.map(className => `fullhd:${className}`, 'g'),
  ],
}

const replacementsBorder = {
  from: [/has-border-light-blue/g, /has-border-primary-dark/g, /has-border/g],
  to: ['border-primary-hovered', 'border-primary-pressed', 'border'],
}

const replacementsColors = {
  from: [/has-background-blue/g, /has-background/g, ...invertedTextWhite.from, ...invertedTextPrimary.from],
  to: ['bg-primary', 'bg', ...invertedTextWhite.to, ...invertedTextPrimary.to],
}

const replacementsCore = {
  from: [/is-vertical-align/g, /is-clickable/g, /is-list/g],
  to: ['vertical-align', 'cursor-pointer', 'list'],
}

const replacementsDisplay = {
  from: [
    ...breakpointClasses('inline-block').from,
    ...breakpointClasses('inline-flex').from,
    ...breakpointClasses('block').from,
    ...breakpointClasses('flex').from,
    ...breakpointClasses('inline').from,
    ...breakpointClasses('hidden').from,
    /is-vertical-align-top/g,
    /is-vertical-align-middle/g,
    /is-vertical-align-bottom/g,
  ],
  to: [
    ...breakpointClasses('inline-block').to,
    ...breakpointClasses('inline-flex').to,
    ...breakpointClasses('block').to,
    ...breakpointClasses('flex').to,
    ...breakpointClasses('inline').to,
    ...breakpointClasses('hidden').to,
    'vertical-align-top',
    'vertical-align-middle',
    'vertical-align-bottom',
  ],
}

const replacementsFlex = {
  from: [
    /is-flex-direction/g,
    /is-flex-wrap-nowrap/g,
    /is-flex-wrap-wrap-reverse/g,
    /is-flex-wrap-wrap/g,
    /is-justify-content-flex/g,
    /is-justify-content-left/g,
    /is-justify-content-right/g,
    /is-justify-content/g,
    /is-align-content-flex/g,
    /is-align-content/g,
    /is-align-items-flex/g,
    /is-align-items-self/g,
    /is-align-items/g,
    /is-align-self-flex/g,
    /is-align-self/g,
    /is-flex-1/g,
    /is-flex-auto/g,
    /is-flex-initial/g,
    /is-flex-none/g,
    /is-flex-grow-0/g,
    /is-flex-shrink-0/g,
    /is-flex-grow-1/g,
    /is-flex-shrink-1/g,
    ...spacingClasses('fg', 'gap').from,
  ],
  to: [
    'flex-direction',
    'flex-nowrap',
    'flex-wrap-reverse',
    'flex-wrap',
    'justify-content',
    'justify-content-start',
    'justify-content-end',
    'justify-content',
    'align-content',
    'align-content',
    'align-items',
    'align-items',
    'align-items',
    'align-self',
    'align-self',
    'flex-1',
    'flex-auto',
    'flex-initial',
    'flex-none',
    'flex-initial',
    'flex-initial',
    'flex-1',
    'flex-1',
    ...spacingClasses('fg', 'gap').to,
  ],
}

const replacementsOpacity = {
  from: [/has-opacity-100/g, /has-opacity-10/g, /has-opacity-1/g, /has-opacity/g],
  to: ['opacity-100', 'opacity-10', 'opacity-100', 'opacity'],
}

const replacementsRadius = {
  from: [/has-radius/g],
  to: ['radius'],
}

const replacementsShadow = {
  from: [/has-shadow/g, /has-text-shadow/g, /has-button-shadow/g],
  to: ['shadow', 'text-shadow', 'text-shadow-normal'],
}

const replacementsSpacing = {
  from: [/is-marginless/g, /is-paddingless/g, ...marginAndPadding().from],
  to: ['m-none', 'p-none', ...marginAndPadding().to],
}

const replacementsTypography = {
  from: [
    /has-text-weight/g,
    /is-white-space-normal/g,
    /has-no-wrap/g,
    /is-white-space-nowrap/g,
    /is-capitalized/g,
    /is-lowercase/g,
    /is-uppercase/g,
    /is-family-text/g,
    /is-family-title/g,
    ...textAlignment.from,
    ...textSizeLegacy.from,
    ...textColor.from,
    /has-text/g,
    /is-size/g,
  ],
  to: [
    'font-weight',
    'white-space-normal',
    'white-space-nowrap',
    'white-space-nowrap',
    'capitalize',
    'lowercase',
    'uppercase',
    'font-family-text',
    'font-family-title',
    ...textAlignment.to,
    ...textSizeLegacy.to,
    ...textColor.to,
    'text',
    'text',
  ],
}

const replacementsZIndex = {
  from: [/has-z-index/g],
  to: ['z-index'],
}

const replacementsSizing = {
  from: [/is-fullheight/g, /is-fullwidth/g],
  to: ['h-full', 'w-full'],
}

const replacementsCSSVariablesColors = {
  from: [
    /var\(--bal-color-border-primary-dark\)/g,
    /var\(--bal-color-border-light-blue\)/g,
    /var\(--bal-color-border-danger-dark\)/g,
    /var\(--bal-color-border-danger-darker\)/g,
    /var\(--bal-color-blue-1\)/g,
    /var\(--bal-color-blue-2\)/g,
    /var\(--bal-color-blue-3\)/g,
    /var\(--bal-color-blue-4\)/g,
    /var\(--bal-color-blue-5\)/g,
    /var\(--bal-color-blue-6\)/g,
    /var\(--bal-color-blue\)/g,
    /var\(--bal-color-transparent\)/g,
    /var\(--bal-color-text-light-blue\)/g,
    /var\(--bal-color-text-light-blue-light\)/g,
    /var\(--bal-color-text-info-light\)/g,
    /var\(--bal-color-text-primary-dark\)/g,
    /var\(--bal-color-text-danger-light\)/g,
    /var\(--bal-color-text-danger-dark\)/g,
  ],
  to: [
    'var(--bal-color-border-primary-pressed)',
    'var(--bal-color-border-primary-hovered)',
    'var(--bal-color-border-danger-hovered)',
    'var(--bal-color-border-danger-pressed)',
    'var(--bal-color-primary-1)',
    'var(--bal-color-primary-2)',
    'var(--bal-color-primary-3)',
    'var(--bal-color-primary-4)',
    'var(--bal-color-primary-5)',
    'var(--bal-color-primary-6)',
    'var(--bal-color-primary)',
    'transparent',
    'var(--bal-color-text-primary-hovered)',
    'var(--bal-color-text-inverted-hovered)',
    'var(--bal-color-text-inverted-pressed)',
    'var(--bal-color-text-primary-pressed)',
    'var(--bal-color-text-danger-hovered)',
    'var(--bal-color-text-danger-pressed)',
  ],
}

const replacementsCSSVariablesVarious = {
  from: [
    /var\(--bal-border-width-none\)/g,
    /var\(--bal-container-max-width\)/g,
    /var\(--bal-weight-bold\)/g,
    /var\(--bal-weight-regular\)/g,
    /var\(--bal-weight-light\)/g,
    /var\(--bal-radius-none\)/g,
    /var\(--bal-shadow-none\)/g,
    /var\(--bal-text-shadow-none\)/g,
  ],
  to: [
    '0',
    'var(--bal-container-size-normal)',
    'var(--bal-font-weight-bold)',
    'var(--bal-font-weight-regular)',
    'var(--bal-font-weight-light)',
    '0',
    'none',
    'none',
  ],
}

const replacementsCSSVariablesSpace = {
  from: [
    /var\(--bal-space-auto\)/g,
    /var\(--bal-space-tablet-auto\)/g,
    /var\(--bal-space-desktop-auto\)/g,
    /var\(--bal-space-none\)/g,
    /var\(--bal-space-tablet-none\)/g,
    /var\(--bal-space-desktop-none\)/g,
    /var\(--bal-space-tablet-xx-small\)/g,
    /var\(--bal-space-tablet-x-small\)/g,
    /var\(--bal-space-tablet-small\)/g,
    /var\(--bal-space-tablet-normal\)/g,
    /var\(--bal-space-tablet-medium\)/g,
    /var\(--bal-space-tablet-large\)/g,
    /var\(--bal-space-tablet-x-large\)/g,
    /var\(--bal-space-tablet-xx-large\)/g,
    /var\(--bal-space-tablet-xxx-large\)/g,
    /var\(--bal-space-tablet-xxxx-large\)/g,
    /var\(--bal-space-desktop-xx-small\)/g,
    /var\(--bal-space-desktop-x-small\)/g,
    /var\(--bal-space-desktop-small\)/g,
    /var\(--bal-space-desktop-normal\)/g,
    /var\(--bal-space-desktop-medium\)/g,
    /var\(--bal-space-desktop-large\)/g,
    /var\(--bal-space-desktop-x-large\)/g,
    /var\(--bal-space-desktop-xx-large\)/g,
    /var\(--bal-space-desktop-xxx-large\)/g,
    /var\(--bal-space-desktop-xxxx-large\)/g,
  ],
  to: [
    'auto',
    'auto',
    'auto',
    '0',
    '0',
    '0',
    'var(--bal-space-xx-small-tablet)',
    'var(--bal-space-x-small-tablet)',
    'var(--bal-space-small-tablet)',
    'var(--bal-space-normal-tablet)',
    'var(--bal-space-medium-tablet)',
    'var(--bal-space-large-tablet)',
    'var(--bal-space-x-large-tablet)',
    'var(--bal-space-xx-large-tablet)',
    'var(--bal-space-xxx-large-tablet)',
    'var(--bal-space-xxxx-large-tablet)',
    'var(--bal-space-xx-small-desktop)',
    'var(--bal-space-x-small-desktop)',
    'var(--bal-space-small-desktop)',
    'var(--bal-space-normal-desktop)',
    'var(--bal-space-medium-desktop)',
    'var(--bal-space-large-desktop)',
    'var(--bal-space-x-large-desktop)',
    'var(--bal-space-xx-large-desktop)',
    'var(--bal-space-xxx-large-desktop)',
    'var(--bal-space-xxxx-large-desktop)',
  ],
}

const replacementsCSSVariablesTextSize = {
  from: [
    /var\(--bal-size-x-small\)/g,
    /var\(--bal-size-small\)/g,
    /var\(--bal-size-normal\)/g,
    /var\(--bal-size-medium\)/g,
    /var\(--bal-size-xxxxx-large\)/g,
    /var\(--bal-size-xxxx-large\)/g,
    /var\(--bal-size-xxx-large\)/g,
    /var\(--bal-size-xx-large\)/g,
    /var\(--bal-size-x-large\)/g,
    /var\(--bal-size-large\)/g,
    /var\(--bal-size-tablet-x-small\)/g,
    /var\(--bal-size-tablet-small\)/g,
    /var\(--bal-size-tablet-normal\)/g,
    /var\(--bal-size-tablet-medium\)/g,
    /var\(--bal-size-tablet-xxxxx-large\)/g,
    /var\(--bal-size-tablet-xxxx-large\)/g,
    /var\(--bal-size-tablet-xxx-large\)/g,
    /var\(--bal-size-tablet-xx-large\)/g,
    /var\(--bal-size-tablet-x-large\)/g,
    /var\(--bal-size-tablet-large\)/g,
    /var\(--bal-size-desktop-x-small\)/g,
    /var\(--bal-size-desktop-small\)/g,
    /var\(--bal-size-desktop-normal\)/g,
    /var\(--bal-size-desktop-medium\)/g,
    /var\(--bal-size-desktop-xxxxx-large\)/g,
    /var\(--bal-size-desktop-xxxx-large\)/g,
    /var\(--bal-size-desktop-xxx-large\)/g,
    /var\(--bal-size-desktop-xx-large\)/g,
    /var\(--bal-size-desktop-x-large\)/g,
    /var\(--bal-size-desktop-large\)/g,
  ],
  to: [
    'var(--bal-text-size-x-small)',
    'var(--bal-text-size-small)',
    'var(--bal-text-size-normal)',
    'var(--bal-text-size-medium)',
    'var(--bal-text-size-xxxxx-large)',
    'var(--bal-text-size-xxxx-large)',
    'var(--bal-text-size-xxx-large)',
    'var(--bal-text-size-xx-large)',
    'var(--bal-text-size-x-large)',
    'var(--bal-text-size-large)',
    'var(--bal-text-size-x-small-tablet)',
    'var(--bal-text-size-small-tablet)',
    'var(--bal-text-size-normal-tablet)',
    'var(--bal-text-size-medium-tablet)',
    'var(--bal-text-size-xxxxx-large-tablet)',
    'var(--bal-text-size-xxxx-large-tablet)',
    'var(--bal-text-size-xxx-large-tablet)',
    'var(--bal-text-size-xx-large-tablet)',
    'var(--bal-text-size-x-large-tablet)',
    'var(--bal-text-size-large-tablet)',
    'var(--bal-text-size-x-small-desktop)',
    'var(--bal-text-size-small-desktop)',
    'var(--bal-text-size-normal-desktop)',
    'var(--bal-text-size-medium-desktop)',
    'var(--bal-text-size-xxxxx-large-desktop)',
    'var(--bal-text-size-xxxx-large-desktop)',
    'var(--bal-text-size-xxx-large-desktop)',
    'var(--bal-text-size-xx-large-desktop)',
    'var(--bal-text-size-x-large-desktop)',
    'var(--bal-text-size-large-desktop)',
  ],
}

const replacementsCSSVariablesInvertedWhite = {
  from: [
    /var\(--bal-color-black-inverted\)/g,
    /var\(--bal-color-grey-5-inverted\)/g,
    /var\(--bal-color-grey-6-inverted\)/g,
    /var\(--bal-color-blue-4-inverted\)/g,
    /var\(--bal-color-blue-5-inverted\)/g,
    /var\(--bal-color-blue-6-inverted\)/g,
    /var\(--bal-color-light-blue-4-inverted\)/g,
    /var\(--bal-color-light-blue-5-inverted\)/g,
    /var\(--bal-color-light-blue-6-inverted\)/g,
    /var\(--bal-color-purple-4-inverted\)/g,
    /var\(--bal-color-purple-5-inverted\)/g,
    /var\(--bal-color-purple-6-inverted\)/g,
    /var\(--bal-color-green-6-inverted\)/g,
    /var\(--bal-color-yellow-6-inverted\)/g,
    /var\(--bal-color-red-4-inverted\)/g,
    /var\(--bal-color-red-5-inverted\)/g,
    /var\(--bal-color-red-6-inverted\)/g,
    /var\(--bal-color-info-3-inverted\)/g,
    /var\(--bal-color-info-4-inverted\)/g,
    /var\(--bal-color-info-5-inverted\)/g,
    /var\(--bal-color-info-6-inverted\)/g,
    /var\(--bal-color-success-3-inverted\)/g,
    /var\(--bal-color-success-4-inverted\)/g,
    /var\(--bal-color-success-5-inverted\)/g,
    /var\(--bal-color-success-6-inverted\)/g,
    /var\(--bal-color-danger-3-inverted\)/g,
    /var\(--bal-color-danger-4-inverted\)/g,
    /var\(--bal-color-danger-5-inverted\)/g,
    /var\(--bal-color-danger-6-inverted\)/g,
    /var\(--bal-color-primary-4-inverted\)/g,
    /var\(--bal-color-primary-5-inverted\)/g,
    /var\(--bal-color-primary-6-inverted\)/g,
    /var\(--bal-color-primary-inverted\)/g,
    /var\(--bal-color-blue-inverted\)/g,
    /var\(--bal-color-info-inverted\)/g,
    /var\(--bal-color-success-inverted\)/g,
    /var\(--bal-color-danger-inverted\)/g,
  ],
  to: [
    'var(--bal-color-white)',
    'var(--bal-color-white)',
    'var(--bal-color-white)',
    'var(--bal-color-white)',
    'var(--bal-color-white)',
    'var(--bal-color-white)',
    'var(--bal-color-white)',
    'var(--bal-color-white)',
    'var(--bal-color-white)',
    'var(--bal-color-white)',
    'var(--bal-color-white)',
    'var(--bal-color-white)',
    'var(--bal-color-white)',
    'var(--bal-color-white)',
    'var(--bal-color-white)',
    'var(--bal-color-white)',
    'var(--bal-color-white)',
    'var(--bal-color-white)',
    'var(--bal-color-white)',
    'var(--bal-color-white)',
    'var(--bal-color-white)',
    'var(--bal-color-white)',
    'var(--bal-color-white)',
    'var(--bal-color-white)',
    'var(--bal-color-white)',
    'var(--bal-color-white)',
    'var(--bal-color-white)',
    'var(--bal-color-white)',
    'var(--bal-color-white)',
    'var(--bal-color-white)',
    'var(--bal-color-white)',
    'var(--bal-color-white)',
    'var(--bal-color-white)',
    'var(--bal-color-white)',
    'var(--bal-color-white)',
    'var(--bal-color-white)',
    'var(--bal-color-white)',
  ],
}

const replacementsCSSVariablesInvertedPrimary = {
  from: [
    /var\(--bal-color-transparent-inverted\)/g,
    /var\(--bal-color-white-inverted\)/g,
    /var\(--bal-color-grey-1-inverted\)/g,
    /var\(--bal-color-grey-2-inverted\)/g,
    /var\(--bal-color-grey-3-inverted\)/g,
    /var\(--bal-color-grey-4-inverted\)/g,
    /var\(--bal-color-blue-1-inverted\)/g,
    /var\(--bal-color-blue-2-inverted\)/g,
    /var\(--bal-color-blue-3-inverted\)/g,
    /var\(--bal-color-light-blue-1-inverted\)/g,
    /var\(--bal-color-light-blue-2-inverted\)/g,
    /var\(--bal-color-light-blue-3-inverted\)/g,
    /var\(--bal-color-purple-1-inverted\)/g,
    /var\(--bal-color-purple-2-inverted\)/g,
    /var\(--bal-color-purple-3-inverted\)/g,
    /var\(--bal-color-green-1-inverted\)/g,
    /var\(--bal-color-green-2-inverted\)/g,
    /var\(--bal-color-green-3-inverted\)/g,
    /var\(--bal-color-green-4-inverted\)/g,
    /var\(--bal-color-green-5-inverted\)/g,
    /var\(--bal-color-yellow-1-inverted\)/g,
    /var\(--bal-color-yellow-2-inverted\)/g,
    /var\(--bal-color-yellow-3-inverted\)/g,
    /var\(--bal-color-yellow-4-inverted\)/g,
    /var\(--bal-color-yellow-5-inverted\)/g,
    /var\(--bal-color-red-1-inverted\)/g,
    /var\(--bal-color-red-2-inverted\)/g,
    /var\(--bal-color-red-3-inverted\)/g,
    /var\(--bal-color-info-1-inverted\)/g,
    /var\(--bal-color-info-2-inverted\)/g,
    /var\(--bal-color-success-1-inverted\)/g,
    /var\(--bal-color-success-2-inverted\)/g,
    /var\(--bal-color-warning-1-inverted\)/g,
    /var\(--bal-color-warning-2-inverted\)/g,
    /var\(--bal-color-warning-3-inverted\)/g,
    /var\(--bal-color-warning-4-inverted\)/g,
    /var\(--bal-color-warning-5-inverted\)/g,
    /var\(--bal-color-warning-6-inverted\)/g,
    /var\(--bal-color-danger-1-inverted\)/g,
    /var\(--bal-color-danger-2-inverted\)/g,
    /var\(--bal-color-primary-1-inverted\)/g,
    /var\(--bal-color-primary-2-inverted\)/g,
    /var\(--bal-color-primary-3-inverted\)/g,
    /var\(--bal-color-grey-inverted\)/g,
    /var\(--bal-color-light-blue-inverted\)/g,
    /var\(--bal-color-purple-inverted\)/g,
    /var\(--bal-color-green-inverted\)/g,
    /var\(--bal-color-yellow-inverted\)/g,
    /var\(--bal-color-red-inverted\)/g,
    /var\(--bal-color-warning-inverted\)/g,
  ],
  to: [
    'var(--bal-color-primary)',
    'var(--bal-color-primary)',
    'var(--bal-color-primary)',
    'var(--bal-color-primary)',
    'var(--bal-color-primary)',
    'var(--bal-color-primary)',
    'var(--bal-color-primary)',
    'var(--bal-color-primary)',
    'var(--bal-color-primary)',
    'var(--bal-color-primary)',
    'var(--bal-color-primary)',
    'var(--bal-color-primary)',
    'var(--bal-color-primary)',
    'var(--bal-color-primary)',
    'var(--bal-color-primary)',
    'var(--bal-color-primary)',
    'var(--bal-color-primary)',
    'var(--bal-color-primary)',
    'var(--bal-color-primary)',
    'var(--bal-color-primary)',
    'var(--bal-color-primary)',
    'var(--bal-color-primary)',
    'var(--bal-color-primary)',
    'var(--bal-color-primary)',
    'var(--bal-color-primary)',
    'var(--bal-color-primary)',
    'var(--bal-color-primary)',
    'var(--bal-color-primary)',
    'var(--bal-color-primary)',
    'var(--bal-color-primary)',
    'var(--bal-color-primary)',
    'var(--bal-color-primary)',
    'var(--bal-color-primary)',
    'var(--bal-color-primary)',
    'var(--bal-color-primary)',
    'var(--bal-color-primary)',
    'var(--bal-color-primary)',
    'var(--bal-color-primary)',
    'var(--bal-color-primary)',
    'var(--bal-color-primary)',
    'var(--bal-color-primary)',
    'var(--bal-color-primary)',
    'var(--bal-color-primary)',
    'var(--bal-color-primary)',
    'var(--bal-color-primary)',
    'var(--bal-color-primary)',
    'var(--bal-color-primary)',
    'var(--bal-color-primary)',
    'var(--bal-color-primary)',
    'var(--bal-color-primary)',
  ],
}

main()
