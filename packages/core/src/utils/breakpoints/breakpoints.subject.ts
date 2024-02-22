import { BalWindowResizeListener } from '../resize/window-resize.listener'
import { BalBreakpointObserver, BalBreakpoints } from './breakpoints.interfaces'
import { balBreakpoints } from './breakpoints'
import { initialBreakpoints } from './breakpoints.const'
import { Subject } from '../types/signal'
import { debounce } from '../helpers'

export class BalBreakpointSubject extends Subject<BalBreakpointObserver> {
  private state: BalBreakpoints = initialBreakpoints
  private listener: BalWindowResizeListener = new BalWindowResizeListener()
  private debouncedNotify = debounce(() => this.notify(), 50)

  constructor() {
    super(observer => observer.breakpointListener(this.state))
    this.listener.connect()
    this.listener.add(() => {
      balBreakpoints.detect()
      const newState = balBreakpoints.toObject()
      if (!this.isEqual(newState)) {
        this.state = newState
        this.debouncedNotify()
      }
    })
  }

  override attach(observer: BalBreakpointObserver): void {
    super.attach(observer)
    balBreakpoints.detect()
    const newState = balBreakpoints.toObject()

    if (!this.isEqual(newState)) {
      this.state = newState
      this.debouncedNotify()
    }
  }

  isEqual(newState: BalBreakpoints): boolean {
    return JSON.stringify(this.state) === JSON.stringify(newState)
  }
}

export const balBreakpointSubject = new BalBreakpointSubject()
