import type { JSX } from '@baloise/ds-core'
import type { Meta } from '@storybook/html'
import { props, withRender, withContent, withDefaultContent, withComponentControls, StoryFactory } from '../../utils'

type Args = JSX.BalInputStepper & { content: string }

const meta: Meta<Args> = {
  title: 'Components/Form/InputStepper',
  args: {
    ...withDefaultContent(''),
  },
  argTypes: {
    ...withContent(),
    ...withComponentControls({ tag: 'bal-input-stepper' }),
  },
  ...withRender(({ content, ...args }) => `<bal-input-stepper ${props(args)}>${content}</bal-input-stepper>`),
}

export default meta

/**
 * STORIES
 * ------------------------------------------------------
 */

const Story = StoryFactory<Args>(meta)

export const Basic = Story()
