import shell from 'shelljs'
import { exec, done, logger } from '../../../scripts/utils.mjs'

const run = async () => {
  const log = logger('token generating')
  log.start()

  try {
    shell.rm('-rf', 'dist')
    await exec('npm', ['run', 'generate'])
    log.succeed()
  } catch (error) {
    log.fail(error)
  } finally {
    done()
  }
}

run()
