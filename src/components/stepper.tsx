import type { ReactNode } from 'react'
import { IconMinus, IconPlus } from '@tabler/icons-react'
import { fieldLabelClass } from '@/components/field-styles'
import { Button } from '@/components/ui/button'

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
}: StepperProps) {
    return (
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
            {labelFor ? (
                <label htmlFor={labelFor} className={fieldLabelClass}>
                    {label}
                </label>
            ) : (
                <span className={fieldLabelClass}>{label}</span>
            )}
            <div className="flex items-center gap-1">
                <Button
                    type="button"
                    variant="outline"
                    size="icon-sm"
                    aria-label={decreaseLabel}
                    disabled={!canDecrease}
                    onClick={onDecrease}
                >
                    <IconMinus />
                </Button>
                {children}
                <Button
                    type="button"
                    variant="outline"
                    size="icon-sm"
                    aria-label={increaseLabel}
                    disabled={!canIncrease}
                    onClick={onIncrease}
                >
                    <IconPlus />
                </Button>
            </div>
        </div>
    )
}
