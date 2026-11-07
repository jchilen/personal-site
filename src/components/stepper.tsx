import type { ReactNode } from 'react'
import { IconMinus, IconPlus } from '@tabler/icons-react'
import { cn } from 'cn'
import { Button } from '@/components/ui/button'
import { eyebrowClass } from '@/components/text-styles'
import { ariaDisabledClass } from '@/components/field-styles'

type StepperProps = {
    label: ReactNode
    // The id of an input passed as children, so clicking the label focuses it
    labelFor?: string
    decreaseLabel: string
    increaseLabel: string
    canDecrease: boolean
    canIncrease: boolean
    onDecrease: () => void
    onIncrease: () => void
    // The value between the buttons: a typed input, or plain read-only text
    children: ReactNode
    // Shown after the + button, such as a value this number produces
    after?: ReactNode
    // Puts the label above the buttons instead of beside them
    stacked?: boolean
}

/** A labeled row with − and + buttons around a value */
export function Stepper({
    label,
    labelFor,
    decreaseLabel,
    increaseLabel,
    canDecrease,
    canIncrease,
    onDecrease,
    onIncrease,
    children,
    after,
    stacked = false,
}: StepperProps) {
    return (
        <div
            className={cn(
                stacked
                    ? 'flex flex-col gap-1.5'
                    : 'grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3',
            )}
        >
            {labelFor ? (
                <label htmlFor={labelFor} className={eyebrowClass}>
                    {label}
                </label>
            ) : (
                <span className={eyebrowClass}>{label}</span>
            )}
            <div
                className={cn(
                    'flex items-center gap-2.5',
                    // The same height as a row of choice buttons, so the two line up side by side
                    stacked && 'min-h-10',
                )}
            >
                <div className="flex items-center gap-1">
                    <Button
                        type="button"
                        variant="outline"
                        size="icon-sm"
                        aria-label={decreaseLabel}
                        aria-disabled={!canDecrease}
                        onClick={() => {
                            if (canDecrease) onDecrease()
                        }}
                        className={ariaDisabledClass}
                    >
                        <IconMinus />
                    </Button>
                    {children}
                    <Button
                        type="button"
                        variant="outline"
                        size="icon-sm"
                        aria-label={increaseLabel}
                        aria-disabled={!canIncrease}
                        onClick={() => {
                            if (canIncrease) onIncrease()
                        }}
                        className={ariaDisabledClass}
                    >
                        <IconPlus />
                    </Button>
                </div>
                {after}
            </div>
        </div>
    )
}
