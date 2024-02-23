
import type { JSX } from '@baloise/ds-core'
import type { Meta } from '@storybook/html'
import { props, withRender, withContent, withDefaultContent, withComponentControls, StoryFactory } from '../../utils'

type Args = JSX.BalPopover & { content: string }

const meta: Meta<Args> = {
  title: 'Components/Deprecated/Popover',
  args: {
    ...withDefaultContent(),
  },
  argTypes: {
    ...withContent(),
    ...withComponentControls({ tag: 'bal-popover' }),
  },
  ...withRender(({ content, ...args }) => `<bal-popover ${props(args)}>${content}</bal-popover>`),
}

export default meta

/**
 * STORIES
 * ------------------------------------------------------
 */

const Story = StoryFactory<Args>(meta)

export const Basic = Story()

export const Secondary = Story({
  args: {
    // place props here
  },
})
