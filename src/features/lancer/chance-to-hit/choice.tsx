import { cn } from 'cn'
import {
    choiceItemClass,
    fieldLabelClass,
    lockedClass,
} from '@/components/field-styles'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

type ChoiceProps<T extends string> = {
    label: string
    value: T
    options: [T, string][]
    onChange: (value: T) => void
    // Shown but unchangeable, faded and striped, for settings that don't apply right now. Marked with
    // aria-disabled instead of disabled, so the "not allowed" cursor (and tooltips) still work
    locked?: boolean
}

/** A labeled row of buttons where exactly one is selected */
export function Choice<T extends string>({
    label,
    value,
    options,
    onChange,
    locked = false,
}: ChoiceProps<T>) {
    return (
        <div className="flex flex-col gap-1.5">
            <span className={fieldLabelClass}>{label}</span>
            <ToggleGroup
                type="single"
                aria-label={label}
                value={value}
                onValueChange={(next) => {
                    // Clicking the selected button again sends '', which would leave nothing selected,
                    // and a locked choice can't change at all
                    if (next && !locked) onChange(next as T)
                }}
                className="flex flex-wrap gap-2"
            >
                {options.map(([option, text]) => (
                    <ToggleGroupItem
                        key={option}
                        value={option}
                        aria-disabled={locked}
                        className={cn(
                            choiceItemClass,
                            'px-3',
                            // Unlocked choices are a little brighter, so the faded locked ones stand apart
                            locked ? lockedClass : 'text-foreground/80',
                        )}
                    >
                        {text}
                    </ToggleGroupItem>
                ))}
            </ToggleGroup>
        </div>
    )
}
