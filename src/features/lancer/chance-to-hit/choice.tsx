import { cn } from 'cn'
import { choiceItemClass, lockedClass } from '@/components/field-styles'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Hint } from '@/components/hint'
import { eyebrowClass } from '@/components/text-styles'

type ChoiceProps<T extends string> = {
    label: string
    value: T
    options: [T, string][]
    onChange: (value: T) => void
    // Why the choice doesn't apply right now. Setting it locks the choice: faded and striped,
    // unchangeable, with the reason as each button's tooltip. Marked with aria-disabled instead of
    // disabled, so the buttons can still be focused and hovered to show that tooltip
    lockedReason?: string
    // A tooltip for some options, by value, shown while the choice is unlocked
    hints?: Partial<Record<T, string>>
}

/** A labeled row of buttons where exactly one is selected */
export function Choice<T extends string>({
    label,
    value,
    options,
    onChange,
    lockedReason,
    hints,
}: ChoiceProps<T>) {
    const locked = lockedReason !== undefined

    return (
        <div className="flex flex-col gap-1.5">
            <span className={eyebrowClass}>{label}</span>
            <ToggleGroup
                type="single"
                aria-label={label}
                value={value}
                onValueChange={(next) => {
                    // Radix sends a plain string, so find the option it belongs to. Clicking the
                    // selected button again sends '', which matches none and leaves the choice as
                    // it was, and a locked choice can't change at all
                    const match = options.find(([option]) => option === next)
                    if (match && !locked) onChange(match[0])
                }}
                className="flex flex-wrap gap-2"
            >
                {options.map(([option, text]) => (
                    <Hint
                        key={option}
                        label={lockedReason ?? hints?.[option] ?? null}
                    >
                        <ToggleGroupItem
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
                    </Hint>
                ))}
            </ToggleGroup>
        </div>
    )
}
