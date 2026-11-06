import { useState } from 'react'
import { cn } from 'cn'
import { numberInputClass } from '@/components/field-styles'
import { Input } from '@/components/ui/input'
import type { NumberField } from '@/hooks/use-number-field'
import { formatCloseTime } from './format-time'
import { DURATION_RANGE_TEXT, POLL_LIMITS } from './poll-rules'
import {
    MAX_DAYS,
    MAX_HOURS,
    MAX_MINUTES,
    MINUTES_PER_DAY,
    MINUTES_PER_HOUR,
    type Duration,
} from './use-duration'
import { Stepper } from '@/components/stepper'

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
