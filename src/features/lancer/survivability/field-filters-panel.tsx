import { useId, useRef } from 'react'
import {
    IconChevronDown,
    IconFilterOff,
    IconMinus,
    IconPlus,
} from '@tabler/icons-react'
import { cn } from 'cn'
import { collapseClass } from '@/components/motion-styles'
import { StepButton } from '@/components/stepper'
import { eyebrowClass } from '@/components/text-styles'
import { Button } from '@/components/ui/button'
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    COMPARISONS,
    FILTER_STATS,
    filtersOn,
    type Comparison,
    type Filters,
    type FilterStat,
    type StatFilter,
    type StatRange,
} from './field-filters'

type FieldFiltersPanelProps = {
    filters: Filters
    ranges: Record<FilterStat, StatRange>
    onChange: (stat: FilterStat, filter: StatFilter) => void
    onClear: () => void
    // Like "4 of 63 frames match the filters", or '' while every filter is off
    status: string
}

/**
 * The filters below the chart: one row per base stat, each "Any" (off) until a comparison is picked.
 * Frames that meet every filter that's on are highlighted in the chart. The rows fold away behind
 * their heading, and start folded, since they're an extra the page works fine without
 */
export function FieldFiltersPanel({
    filters,
    ranges,
    onChange,
    onClear,
    status,
}: FieldFiltersPanelProps) {
    const triggerRef = useRef<HTMLButtonElement>(null)
    const on = filtersOn(filters)

    return (
        <Collapsible defaultOpen={false} className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
                {/* A plain button rather than a ghost one, which would stay shaded while open */}
                <CollapsibleTrigger
                    ref={triggerRef}
                    className="group flex items-center gap-2 py-1 outline-none hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50"
                >
                    <span className={cn(eyebrowClass, 'text-foreground')}>
                        Highlight frames by base stats
                    </span>
                    {/* Folded away, the rows can still be filtering, so the heading says so */}
                    {on > 0 && (
                        <span className="font-heading text-xs font-semibold text-primary tabular-nums">
                            {on} on
                        </span>
                    )}
                    <IconChevronDown className="size-4 transition-transform group-data-[state=open]:rotate-180 motion-reduce:transition-none" />
                </CollapsibleTrigger>
                <div className="flex flex-wrap items-center gap-3">
                    <p
                        aria-live="polite"
                        className="text-sm text-muted-foreground"
                    >
                        {status}
                    </p>
                    {on > 0 && (
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                onClear()
                                // The button hides once every filter is off, so focus moves to the
                                // heading rather than getting lost
                                triggerRef.current?.focus()
                            }}
                        >
                            <IconFilterOff data-icon="inline-start" />
                            Clear filters
                        </Button>
                    )}
                </div>
            </div>

            <CollapsibleContent className={collapseClass}>
                {/* Two columns of rows on wider screens, so all eleven fit without a long list */}
                <ul className="grid gap-x-12 gap-y-3 pt-1 pb-1 lg:grid-cols-[auto_auto] lg:justify-start">
                    {FILTER_STATS.map(({ key, name }) => (
                        <FilterRow
                            key={key}
                            name={name}
                            filter={filters[key]}
                            range={ranges[key]}
                            onChange={(filter) => onChange(key, filter)}
                        />
                    ))}
                </ul>
            </CollapsibleContent>
        </Collapsible>
    )
}

type FilterRowProps = {
    name: string
    filter: StatFilter
    range: StatRange
    onChange: (filter: StatFilter) => void
}

// "Evasion [At least] [− 10 +]". The value waits, locked, while the comparison is Any
function FilterRow({ name, filter, range, onChange }: FilterRowProps) {
    const labelId = useId()
    const off = filter.comparison === 'any'
    const lowerReason = off
        ? 'Choose a comparison first'
        : filter.value <= range.min
          ? `No frame has less than ${range.min} ${name}`
          : undefined
    const raiseReason = off
        ? 'Choose a comparison first'
        : filter.value >= range.max
          ? `No frame has more than ${range.max} ${name}`
          : undefined
    const step = (by: number) =>
        onChange({ ...filter, value: filter.value + by })

    return (
        <li className="grid grid-cols-[minmax(0,1fr)_7rem_auto] items-center gap-3 lg:grid-cols-[7.5rem_8rem_auto]">
            <span id={labelId} className="text-sm">
                {name}
            </span>
            <Select
                value={filter.comparison}
                onValueChange={(comparison) =>
                    onChange({
                        ...filter,
                        comparison: comparison as Comparison,
                    })
                }
            >
                <SelectTrigger
                    size="sm"
                    aria-labelledby={labelId}
                    className="w-full"
                >
                    {/* Just the name: the symbols only show in the open menu */}
                    <SelectValue>
                        {COMPARISONS[filter.comparison].name}
                    </SelectValue>
                </SelectTrigger>
                {/* Opens below the menu rather than over it, so the rows around it stay readable */}
                <SelectContent position="popper" className="bg-popover">
                    {Object.entries(COMPARISONS).map(
                        ([value, { name, symbol }]) => (
                            // The symbol sits on the right where the check mark would be, so the
                            // check (the item's first span) is hidden and its space given back
                            <SelectItem
                                key={value}
                                value={value}
                                textValue={name}
                                className="pr-3 *:[span]:first:hidden *:[span]:last:flex-1"
                            >
                                <span className="flex-1">{name}</span>
                                {/* Screen readers already hear the name */}
                                <span
                                    aria-hidden="true"
                                    className="font-heading text-muted-foreground"
                                >
                                    {symbol}
                                </span>
                            </SelectItem>
                        ),
                    )}
                </SelectContent>
            </Select>
            <div className="flex items-center gap-1">
                <StepButton
                    label={`Lower the ${name} filter`}
                    lockedReason={lowerReason}
                    onClick={() => step(-1)}
                >
                    <IconMinus />
                </StepButton>
                <span
                    aria-live="polite"
                    className={cn(
                        'w-8 text-center font-heading font-semibold tabular-nums',
                        off && 'text-muted-foreground',
                    )}
                >
                    {filter.value}
                </span>
                <StepButton
                    label={`Raise the ${name} filter`}
                    lockedReason={raiseReason}
                    onClick={() => step(1)}
                >
                    <IconPlus />
                </StepButton>
            </div>
        </li>
    )
}
