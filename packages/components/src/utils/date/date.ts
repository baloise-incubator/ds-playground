import { DateTime, Info } from 'luxon'
import { useBalConfig } from '../config'
import { dateSeparator } from '@baloise/web-app-utils'

export interface BalDateInfoOptions {
  format?: 'narrow' | 'short' | 'long'
  locale?: string
}
export class BalDate {
  public static fromAnyFormat(value: string) {
    const separator = value.replace(/[0-9]/g, '').charAt(0)
    const config = useBalConfig()
    const locale = config?.locale || 'de-CH'
    const pairs = value.split(separator)

    const length = pairs.length
    if (length === 2) {
      const year = new Date().getFullYear()
      return new BalDate(
        DateTime.fromFormat(`${pairs[0]}${separator}${pairs[1]}${separator}${year}`, `d${separator}M${separator}yy`, {
          locale,
        }),
      )
    }
    if (length === 3) {
      if (pairs[2].length === 1) {
        return new BalDate(
          DateTime.fromFormat(
            `${pairs[0]}${separator}${pairs[1]}${separator}${2000 + parseInt(pairs[2], 10)}`,
            `d${separator}M${separator}yy`,
            {
              locale,
            },
          ),
        )
      } else if (pairs[2] === '') {
        const year = new Date().getFullYear()
        return new BalDate(
          DateTime.fromFormat(`${pairs[0]}${separator}${pairs[1]}${separator}${year}`, `d${separator}M${separator}yy`, {
            locale,
          }),
        )
      }
    }

    return new BalDate(DateTime.fromFormat(value, `d${separator}M${separator}yy`, { locale }))
  }

  public static fromISO(value: string | undefined) {
    return new BalDate(DateTime.fromISO(value || ''))
  }

  public static infoMonths({ format, locale }: BalDateInfoOptions = {}) {
    const config = useBalConfig()
    return Info.months(format || 'long', { locale: locale || config?.locale || 'de-CH' })
  }

  public static infoWeekdays({ format, locale }: BalDateInfoOptions = {}) {
    const config = useBalConfig()
    const weekdays = Info.weekdays(format, { locale: locale || config?.locale || 'de-CH' })
    return weekdays
  }

  constructor(private dt: DateTime) {}

  public get isValid() {
    return this.dt.isValid
  }

  public toISO() {
    if (this.isValid) {
      return this.dt.toISO()
    }
    return ''
  }

  public toISODate() {
    if (this.isValid) {
      return this.dt.toISODate() as string
    }
    return ''
  }

  public toFormat() {
    if (this.isValid) {
      const config = useBalConfig()
      const locale = config?.locale || 'de-CH'
      const separator = dateSeparator(locale)
      return this.dt.toFormat(`dd${separator}MM${separator}yyyy`)
    }
    return ''
  }

  public isBefore(isoDate: string): boolean {
    const date = DateTime.fromISO(isoDate || '')
    if (date.isValid) {
      return this.dt < date
    }
    return false
  }

  public isBeforeOrEqual(isoDate: string): boolean {
    const date = DateTime.fromISO(isoDate || '')
    if (date.isValid) {
      return this.dt <= date
    }
    return false
  }

  public isAfter(isoDate: string): boolean {
    const date = DateTime.fromISO(isoDate || '')
    if (date.isValid) {
      return this.dt > date
    }
    return false
  }

  public isAfterOrEqual(isoDate: string): boolean {
    const date = DateTime.fromISO(isoDate || '')
    if (date.isValid) {
      return this.dt >= date
    }
    return false
  }

  public get month() {
    if (this.isValid) {
      return this.dt.month
    }
    return undefined
  }

  public get year() {
    if (this.isValid) {
      return this.dt.year
    }
    return undefined
  }
}
