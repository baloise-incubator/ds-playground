import { MarkdownTable } from './docs-util'
import { SPACE } from './constants'

export interface TestingCommand {
  name: string
  description: string[]
  signature: string
  path: string
  component: string
}

export const commandsToMarkdown = (commands: TestingCommand[] = []) => {
  const content: string[] = []
  if (commands.length === 0) {
    return content
  }

  content.push(`### Commands`)
  content.push('')
  content.push(`A list of the custom commands for this specific component.`)
  content.push('')

  const table = new MarkdownTable()

  table.addHeader(['Command', 'Description', 'Signature'])

  commands.forEach(command => {
    const signature = command.signature
      .split(',\n      ')
      .join(', ')
      .split(',\n    )')
      .join(')')
      .split('(\n      ')
      .join('(')

    table.addRow([
      `\`${command.name}\``,
      command.description.join(SPACE),
      `${signature.replace('Chainable<JQuery>', 'Chainable').replace('<Loggable', `\\<Loggable`)}`,
    ])
  })

  content.push(...table.toMarkdown())
  content.push('')

  return content
}
