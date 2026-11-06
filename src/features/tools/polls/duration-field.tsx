import { useState } from 'react'
import { cn } from 'cn'
import { numberInputClass } from '@/components/field-styles'
import { Input } from '@/components/ui/input'
import { useNumberField, type NumberField } from '@/hooks/use-number-field'
import { formatCloseTime } from './format-time'
import { DURATION_RANGE_TEXT, POLL_LIMITS } from './poll-rules'
import { Stepper } from '@/components/stepper'

const MINUTES_PER_HOUR = 60
const MINUTES_PER_DAY = 24 * 60
const MAX_MINUTES = 55
const MAX_HOURS = 23
const MAX_DAYS = POLL_LIMITS.maxDurationMinutes / MINUTES_PER_DAY

/** Three number fields that add up to one poll length, in minutes */
export function useDuration(initialMinutes: number) {
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

type Duration = ReturnType<typeof useDuration>

// The next value up or down. Snaps to the step first, so a typed 7 goes to 10 or 5, not 12 or 2
function stepFrom(value: number, step: number, direction: 1 | -1) {
    return direction === 1
        ? Math.floor(value / step) * step + step
        : Math.ceil(value / step) * step - step
}

type StepperRowProps = {
    id: string
    label: string
    field: NumberField
    step: number
    max: number
    minutesEach: number
    total: number
}

function StepperRow({
    id,
    label,
    field,
    step,
    max,
    minutesEach,
    total,
}: StepperRowProps) {
    const up = stepFrom(field.number, step, 1)
    const down = stepFrom(field.number, step, -1)
    // A button works only if this field stays in range and the whole length stays within the limits
    const canAdd =
        up <= max &&
        total + (up - field.number) * minutesEach <=
            POLL_LIMITS.maxDurationMinutes
    const canSubtract =
        down >= 0 &&
        total + (down - field.number) * minutesEach >=
            POLL_LIMITS.minDurationMinutes
    const unit = label.toLowerCase()

    return (
        <Stepper
            label={label}
            labelFor={id}
            decreaseLabel={`Fewer ${unit}`}
            increaseLabel={`More ${unit}`}
            canDecrease={canSubtract}
            canIncrease={canAdd}
            onDecrease={() => field.setNumber(down)}
            onIncrease={() => field.setNumber(up)}
        >
            <Input
                id={id}
                inputMode="numeric"
                {...field.inputProps}
                className={cn(numberInputClass, 'w-12 text-center')}
            />
        </Stepper>
    )
}

export function DurationField({
    id,
    duration,
}: {
    id: string
    duration: Duration
}) {
    // When the form opened. Close enough for a preview, and it keeps the clock out of rendering
    const [openedAt] = useState(() => Date.now())
    const { total } = duration
    const inRange =
        total >= POLL_LIMITS.minDurationMinutes &&
        total <= POLL_LIMITS.maxDurationMinutes

    return (
        <div className="flex flex-col gap-3">
            <StepperRow
                id={`${id}-minutes`}
                label="Minutes"
                field={duration.minutes}
                step={POLL_LIMITS.durationStepMinutes}
                max={MAX_MINUTES}
                minutesEach={1}
                total={total}
            />
            <StepperRow
                id={`${id}-hours`}
                label="Hours"
                field={duration.hours}
                step={1}
                max={MAX_HOURS}
                minutesEach={MINUTES_PER_HOUR}
                total={total}
            />
            <StepperRow
                id={`${id}-days`}
                label="Days"
                field={duration.days}
                step={1}
                max={MAX_DAYS}
                minutesEach={MINUTES_PER_DAY}
                total={total}
            />
            <p className="text-sm text-muted-foreground">
                {inRange ? (
                    <>
                        Closes{' '}
                        <span className="text-foreground">
                            {formatCloseTime(openedAt + total * 60_000)}
                        </span>{' '}
                        if you create it now.
                    </>
                ) : (
                    `Choose a length ${DURATION_RANGE_TEXT}.`
                )}
            </p>
        </div>
    )
}
