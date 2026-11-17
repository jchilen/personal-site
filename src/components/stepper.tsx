import type { ReactNode } from 'react'
import { IconMinus, IconPlus } from '@tabler/icons-react'
import { cn } from 'cn'
import { Button } from '@/components/ui/button'
import { eyebrowClass } from '@/components/text-styles'
import { lockedButtonClass } from '@/components/field-styles'
import { Hint } from '@/components/hint'

type StepperProps = {
    label: ReactNode
    // The id of an input passed as children, so clicking the label focuses it
    labelFor?: string
    decreaseLabel: string
    increaseLabel: string
    // Why − or + can't be used right now, usually because the number is at its limit. Setting one
    // locks that button: the locked look, with the reason as its tooltip. Like Choice's
    // lockedReason, it uses aria-disabled, so the button keeps focus and still shows the tooltip
    decreaseLockedReason?: string
    increaseLockedReason?: string
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
    decreaseLockedReason,
    increaseLockedReason,
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
                    <StepButton
                        label={decreaseLabel}
                        lockedReason={decreaseLockedReason}
                        onClick={onDecrease}
                    >
                        <IconMinus />
                    </StepButton>
                    {children}
                    <StepButton
                        label={increaseLabel}
                        lockedReason={increaseLockedReason}
                        onClick={onIncrease}
                    >
                        <IconPlus />
                    </StepButton>
                </div>
                {after}
            </div>
        </div>
    )
}

type StepButtonProps = {
    label: string
    lockedReason?: string
    onClick: () => void
    // Extra classes, like a page's own icon color
    className?: string
    children: ReactNode
}

/**
 * The − or + button. Locked, it keeps focus (so holding Enter at a limit doesn't lose your place)
 * and shows why on hover or focus. Also used by steppers laid out differently, like Is the Lead
 * Safe?'s
 */
export function StepButton({
    label,
    lockedReason,
    onClick,
    className,
    children,
}: StepButtonProps) {
    const locked = lockedReason !== undefined
    return (
        <Hint label={lockedReason ?? null}>
            <Button
                type="button"
                variant="outline"
                size="icon-sm"
                aria-label={label}
                aria-disabled={locked}
                onClick={() => {
                    if (!locked) onClick()
                }}
                className={cn(className, locked && lockedButtonClass)}
            >
                {children}
            </Button>
        </Hint>
    )
}
