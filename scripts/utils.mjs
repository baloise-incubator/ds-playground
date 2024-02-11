import { spawn } from 'node:child_process'
import { glob } from 'glob'
import fs from 'fs'
import fse from 'fs-extra'
import path from 'path'

export const NEWLINE = '\n'

export const scan = async filePath => {
  // glop always returns and works with forward slashes
  return glob(filePath.replace(/\\/g, '/'))
}

export const makeDir = async filePath => {
  return new Promise((resolve, reject) => {
    if (fs.existsSync(filePath)) {
      return resolve()
    }
    fs.mkdir(filePath, err => {
      if (err) {
        return reject(err)
      }
      resolve()
    })
  })
}

export const readFile = async filePath => {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        return reject(err)
      }
      resolve(data)
    })
  })
}

export const writeFile = async (filePath, data) => {
  return new Promise((resolve, reject) => {
    var dirname = path.dirname(filePath)
    fs.mkdir(dirname, { recursive: true }, mkdirError => {
      if (mkdirError) {
        return reject(mkdirError)
      }

      fs.writeFile(filePath, data, err => {
        if (err) {
          return reject(err)
        }
        resolve()
      })
    })
  })
}

export const copy = async (srcDir, destDir) => {
  return fse.copy(srcDir, destDir)
}

export const exec = (command, args = []) => {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args)
    let outputError = []
    let output = []

    child.on('error', error => reject(error.message))
    child.on('exit', code => {
      if (code > 0) {
        reject([...output, '--------------------------------------', ...outputError].join('\n'))
      } else {
        resolve({ code, output })
      }
    })

    child.stdout.on('data', data => {
      output.push(`${data}`.trimEnd())
    })

    child.stderr.on('data', data => {
      outputError.push(`${data}`.trimEnd())
    })
  })
}

export const exit = () => process.exit(1)
export const done = () => process.exit(0)

export const log = (message, ...args) => console.log(message, ...args)
export const start = message => log('⏳ ', `${message}...`)
export const succeed = message => log('✅ ', message)
export const fail = (message, error) => {
  console.log()
  log('❌ ', message)
  if (error) {
    console.log()
    console.error(error)
  }
  exit()
}

export const logger = subject => {
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
    fail: (message, ...args) => {
      const endTime = new Date()
      const duration = endTime - startTime
      const seconds = parseFloat(duration / 1000).toFixed(2)
      console.log()
      log('❌ ', `\x1b[31m${subject} \x1b[90mfailed after ${seconds}sec\x1b[0m`)
      if (message) {
        console.log()
        console.error(message)
      }
      exit()
    },
    list: message => {
      console.log(' ❯', message)
    },
  }
}

import ts from 'typescript'

export const createSourceFile = content => ts.createSourceFile('x.ts', content, ts.ScriptTarget.Latest)

const filterByKind = kind => list => list.filter(item => item.kind === kind)
const firstByKind = kind => list => filterByKind(kind)(list)[0]

export const filterModuleDeclaration = firstByKind(ts.SyntaxKind.ModuleDeclaration)
export const filterInterfaceDeclaration = firstByKind(ts.SyntaxKind.InterfaceDeclaration)
export const filterVariableStatement = filterByKind(ts.SyntaxKind.VariableStatement)

export const parseFunctionComment = (node, sourceFile) =>
  node
    .getFullText(sourceFile)
    .replace(node.getText(sourceFile), '')
    .split('\n')
    .map(l => l.trim())
    .filter(l => l)
    .filter(l => l !== '/**' && l !== '*/')
    .map(l => (l.startsWith('*') ? l.substring(2) : l))

export const parseSelectorComment = (node, sourceFile) => {
  const pattern = /[a-zA-Z]/
  return node
    .getFullText(sourceFile)
    .split('\n')
    .map(l => l.trim())
    .filter(l => l)
    .filter(l => pattern.test(l))
    .map(l => (l.startsWith('*') ? l.substring(2) : l))
    .map(l => l.split(':')[0])
}
