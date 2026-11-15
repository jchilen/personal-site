import { cn } from 'cn'
import { choiceItemClass } from '@/components/field-styles'
import { eyebrowClass } from '@/components/text-styles'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { ALL, nextSelection } from '@/lib/filter-selection'

type FilterChoiceProps = {
    label: string
    options: string[]
    // The options turned on. Empty means no filter: everything shows, and All is selected
    selected: string[]
    onChange: (selected: string[]) => void
}

/**
 * A labeled row of filter buttons where any number can be on, led by All. Clicking a selected option
 * turns it off; turning off the last one goes back to All, and clicking All turns them all off
 */
export function FilterChoice({
    label,
    options,
    selected,
    onChange,
}: FilterChoiceProps) {
    return (
        <div className="flex flex-col gap-1.5">
            <span className={eyebrowClass}>{label}</span>
            <ToggleGroup
                type="multiple"
                aria-label={label}
                value={selected.length === 0 ? [ALL] : selected}
                onValueChange={(next) =>
                    onChange(nextSelection(selected, next, options))
                }
                className="flex flex-wrap gap-2"
            >
                {[ALL, ...options].map((option) => (
                    <ToggleGroupItem
                        key={option}
                        value={option}
                        className={cn(
                            choiceItemClass,
                            'px-3 text-foreground/80',
                        )}
                    >
                        {option === ALL ? 'All' : option}
                    </ToggleGroupItem>
                ))}
            </ToggleGroup>
        </div>
    )
}