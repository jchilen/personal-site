import { useNumberField, type NumberField } from '@/hooks/use-number-field'
import { POLL_LIMITS } from './poll-rules'

export const MINUTES_PER_HOUR = 60
export const MINUTES_PER_DAY = 24 * 60
export const MAX_MINUTES = 55
export const MAX_HOURS = 23
export const MAX_DAYS = POLL_LIMITS.maxDurationMinutes / MINUTES_PER_DAY

export type Duration = {
    minutes: NumberField
    hours: NumberField
    days: NumberField
    total: number
}

/** Three number fields that add up to one poll length, in minutes */
export function useDuration(initialMinutes: number): Duration {
    const minutes = useNumberField({
        max: MAX_MINUTES,
        initial: initialMinutes % MINUTES_PER_HOUR,
    })
    const hours = useNumberField({
        max: MAX_HOURS,
        initial: Math.floor(initialMinutes / MINUTES_PER_HOUR) % 24,
    })
    const days = useNumberField({
        max: MAX_DAYS,
        initial: Math.floor(initialMinutes / MINUTES_PER_DAY),
    })

    const total =
        minutes.number +
        hours.number * MINUTES_PER_HOUR +
        days.number * MINUTES_PER_DAY
    return { minutes, hours, days, total }
}
