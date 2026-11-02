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
    // Shown but unchangeable, with dashed borders, for settings that don't apply right now
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
                disabled={locked}
                onValueChange={(next) => {
                    // Clicking the selected button again sends '', which would leave nothing selected
                    if (next) onChange(next as T)
                }}
                className="flex flex-wrap gap-2"
            >
                {options.map(([option, text]) => (
                    <ToggleGroupItem
                        key={option}
                        value={option}
                        className={cn(
                            choiceItemClass,
                            'px-3',
                            locked && lockedClass,
                        )}
                    >
                        {text}
                    </ToggleGroupItem>
                ))}
            </ToggleGroup>
        </div>
    )
}
