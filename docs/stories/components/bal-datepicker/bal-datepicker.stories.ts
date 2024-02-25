import type { JSX } from '@baloise/ds-core'
import type { Meta } from '@storybook/html'
import { props, withRender, withContent, withDefaultContent, withComponentControls, StoryFactory } from '../../utils'

type Args = JSX.BalDatepicker & { content: string }

const meta: Meta<Args> = {
  title: 'Components/Deprecated/Datepicker',
  args: {
    ...withDefaultContent(),
  },
  argTypes: {
    ...withContent(),
    ...withComponentControls({ tag: 'bal-datepicker' }),
  },
  ...withRender(({ content, ...args }) => `<bal-datepicker ${props(args)}>${content}</bal-datepicker>`),
}

export default meta

/**
 * STORIES
 * ------------------------------------------------------
 */

const Story = StoryFactory<Args>(meta)

export const Basic = Story()
