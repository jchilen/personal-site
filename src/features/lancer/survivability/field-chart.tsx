import { useId, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import { IconPinnedOff } from '@tabler/icons-react'
import { cn } from 'cn'
import { underlineInputClass } from '@/components/field-styles'
import { hintClass } from '@/components/hint-styles'
import { glideClass } from '@/components/motion-styles'
import { SectionTitle } from '@/components/section-title'
import { eyebrowClass } from '@/components/text-styles'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useElementWidth } from '@/hooks/use-element-width'
import type { Cover } from '../rules'
import type { Ruleset } from '../rulesets'
import type { CardResults, FrameResult } from './card-results'
import {
    axisTicks,
    chartOrder,
    matchingFrames,
    placeLabels,
    type ChartLabel,
    tallestUnderTooltip,
    tooltipAlign,
} from './field-chart-layout'
import {
    defaultFilters,
    filtersOn,
    meetsFilters,
    statRanges,
    type Filters,
} from './field-filters'
import { FieldFiltersPanel } from './field-filters-panel'
import { blasts } from './format'
import type { BuildCard } from './settings'

const RULESET_NAMES: Record<Ruleset, string> = {
    original: 'Original',
    rebake: 'Rebake',
}
const COVER_PHRASES: Record<Cover, string> = {
    none: '',
    soft: ', in soft cover',
    hard: ', in hard cover',
}

// Search matches get labels too, but only this many: past that they'd bury the chart in names.
// Filters allow a few more, since they're set on purpose to narrow the field down
const MAX_MATCH_LABELS = 3
const MAX_FILTER_MATCH_LABELS = 5
// Clicked bars stay highlighted, up to this many
const MAX_PINS = 5
const PINS_FULL = `${MAX_PINS} frames pinned. Unpin one first`
// Each row of labels above the bars, in pixels
const LABEL_ROW = 20
const MIN_LABEL_ROWS = 2

// How each kind of bar is drawn. Plain bars stay quiet so the highlighted ones stand out
const BAR_LOOKS = {
    plain: 'bg-muted-foreground/35',
    active: 'bg-muted-foreground',
    featured: 'bg-primary',
    match: 'bg-foreground',
}

// The small square before a label or legend entry, drawn like the bar it stands for
function Swatch({ look }: { look: keyof typeof BAR_LOOKS }) {
    return (
        <span
            aria-hidden="true"
            className={cn('inline-block size-2.5 shrink-0', BAR_LOOKS[look])}
        />
    )
}

type FieldChartProps = {
    /** The featured card: its build, NPC type, tier and cover are given to every frame */
    card: BuildCard
    results: CardResults
}

/** Section 02: every frame's blasts to kill with the featured card's build, fewest to most */
export function FieldChart({ card, results }: FieldChartProps) {
    const [query, setQuery] = useState('')
    // Every filter starts off ("Any"), waiting at the average frame's value
    const [filters, setFilters] = useState<Filters>(() =>
        defaultFilters(results.standard.frame),
    )
    // Pinned frames, by name, so a pin follows its frame when the bars re-sort
    const [pins, setPins] = useState<string[]>([])
    // What the last pin or unpin did, for screen readers
    const [pinStatus, setPinStatus] = useState('')
    const groupRef = useRef<HTMLDivElement>(null)
    // The bar under the mouse, tapped, or stepped to with the arrow keys, by its place in the chart
    const [active, setActive] = useState<number | null>(null)
    const [focused, setFocused] = useState(false)
    const [chartRef, chartWidth] = useElementWidth()
    const [tooltipRef, tooltipWidth] = useElementWidth()
    // The chart's visible "Blasts to kill" label names both the chart and the table of its numbers
    const axisLabelId = useId()
    const keysHelpId = useId()

    const field = useMemo(() => chartOrder(results.field), [results.field])
    const ticks = axisTicks(
        Math.max(
            results.standard.blastsToKill,
            ...field.map((result) => result.blastsToKill),
        ),
    )
    const top = ticks.at(-1) ?? 1
    // A value's height as a share of the bars' area, as a CSS percentage
    const height = (value: number) => `${(value / top) * 100}%`
    // The middle of a bar, from 0 at the left edge to 1 at the right
    const center = (index: number) => (index + 0.5) / field.length

    const ranges = useMemo(
        () => statRanges(field.map((result) => result.frame)),
        [field],
    )
    const filtering = filtersOn(filters) > 0
    const searching = query.trim() !== ''
    // A frame is highlighted if it matches the search or meets every filter that's on
    const searchMatches = new Set(
        matchingFrames(field, query).map((result) => result.frame.name),
    )
    const matches = field.filter(
        (result) =>
            searchMatches.has(result.frame.name) ||
            (filtering && meetsFilters(result.frame, filters)),
    )
    const matched = new Set(matches.map((result) => result.frame.name))
    const pinned = new Set(pins)
    const featuredIndex = field.findIndex(
        (result) => result.frame.name === card.frame,
    )

    function lookOf(result: FrameResult, index: number) {
        const name = result.frame.name
        if (name === card.frame) return BAR_LOOKS.featured
        if (matched.has(name)) return BAR_LOOKS.match
        // A pinned bar stays lit like a hovered one
        return index === active || pinned.has(name)
            ? BAR_LOOKS.active
            : BAR_LOOKS.plain
    }

    // Names above the featured bar, every pinned bar (with its number, like the tooltip), and a
    // few matches
    const wanted: ChartLabel[] = []
    const values = new Map<string, number>()
    const addLabel = (index: number) => {
        const result = field[index]
        if (!result || values.has(result.frame.name)) return
        const name = result.frame.name
        // The text only sizes the label, so a pin's number counts toward its width
        const text = pinned.has(name)
            ? `${name} ${blasts(result.blastsToKill)}`
            : name
        wanted.push({ key: name, text, center: center(index) })
        values.set(name, result.blastsToKill)
    }
    addLabel(featuredIndex)
    for (const name of pins) {
        addLabel(field.findIndex((result) => result.frame.name === name))
    }
    const matchLabels = filtering ? MAX_FILTER_MATCH_LABELS : MAX_MATCH_LABELS
    if (matches.length <= matchLabels) {
        for (const result of matches) addLabel(field.indexOf(result))
    }
    const labels = placeLabels(wanted, chartWidth).map((label) => ({
        ...label,
        value: values.get(label.key) ?? 0,
    }))
    // Room for at least two rows, so a search label usually fits without pushing the chart down
    const rows = Math.max(
        MIN_LABEL_ROWS,
        ...labels.map((label) => label.row + 1),
    )
    const lookOfLabel = (key: string) => {
        if (key === card.frame) return 'featured'
        return matched.has(key) ? 'match' : 'active'
    }

    // Pins or unpins a bar. Past the limit nothing changes, and the reason is read out (and shown
    // in the bar's tooltip)
    function togglePin(index: number) {
        const name = field[index]?.frame.name
        if (!name) return
        if (pinned.has(name)) {
            setPins(pins.filter((pin) => pin !== name))
            setPinStatus(`Unpinned ${name}`)
        } else if (pins.length >= MAX_PINS) {
            setPinStatus(`${PINS_FULL}.`)
        } else {
            setPins([...pins, name])
            setPinStatus(`Pinned ${name}`)
        }
    }

    function clearPins() {
        setPins([])
        setPinStatus('Cleared the pins')
    }

    // The arrow keys step through the bars, Home and End jump to either end. Each move shows that
    // bar's tooltip, and screen readers hear the same words through the live region below
    function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
        const from = active ?? featuredIndex
        const last = field.length - 1
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            togglePin(from)
            return
        }
        if (event.key === 'Escape' && pins.length > 0) {
            event.preventDefault()
            clearPins()
            return
        }
        const to = {
            ArrowLeft: Math.max(0, from - 1),
            ArrowRight: Math.min(last, from + 1),
            Home: 0,
            End: last,
        }[event.key]
        if (to === undefined) return
        event.preventDefault()
        setActive(to)
    }

    const activeResult = active === null ? undefined : field[active]
    // The tooltip sits just above the tallest bar it covers, so it never hides the bars beside
    // the one it's for. Its own width is measured once it's showing
    const tooltipSide =
        active === null ? 'center' : tooltipAlign(center(active))
    const tooltipFloor =
        active === null
            ? 0
            : tallestUnderTooltip(
                  field.map((result) => result.blastsToKill),
                  active,
                  tooltipSide,
                  chartWidth,
                  tooltipWidth,
              )
    const activePinned =
        activeResult !== undefined && pinned.has(activeResult.frame.name)
    // The tooltip's last line says what a click does, or why it can't
    const pinHint = activePinned
        ? 'Click to unpin'
        : pins.length >= MAX_PINS
          ? PINS_FULL
          : 'Click to pin'
    const activeText =
        activeResult &&
        `${activeResult.frame.name}: ${blasts(activeResult.blastsToKill)} blasts to kill${activePinned ? ', pinned' : ''}`

    // Shown with the filters, and read out as they change
    const filterStatus = filtering
        ? `${matches.length} of ${field.length} frames match the ${searching ? 'search or filters' : 'filters'}`
        : ''

    // Read out as the search changes, and it also gives the number itself for a single match, so
    // nobody needs the tooltip to get it
    let searchStatus = ''
    if (searching) {
        const [first] = matches
        if (!first) searchStatus = 'No frame matches.'
        else if (matches.length === 1)
            searchStatus = `${first.frame.name}: ${blasts(first.blastsToKill)} blasts to kill`
        else searchStatus = `${matches.length} frames match.`
    }

    return (
        <section className={cn('flex flex-col gap-4', glideClass)}>
            <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
                <div className="flex max-w-prose flex-col gap-1">
                    <SectionTitle number={2}>Against the Field</SectionTitle>
                    <p className="text-sm text-muted-foreground">
                        How every frame stacks up with your featured build
                        against Tier {card.tier} {RULESET_NAMES[card.ruleset]}{' '}
                        NPCs
                        {COVER_PHRASES[card.cover]}.
                    </p>
                </div>
                <div className="flex w-full flex-col gap-1.5 sm:w-64">
                    <Input
                        type="search"
                        placeholder="Find a frame"
                        aria-label="Find a frame on the chart"
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        className={underlineInputClass}
                    />
                    <p
                        aria-live="polite"
                        className="min-h-4 text-xs text-muted-foreground"
                    >
                        {searchStatus}
                    </p>
                </div>
            </div>

            {/* The featured card's gold border, so the chart reads as built from that card */}
            <div className="flex flex-col gap-4 border-2 border-primary bg-background p-4">
                <ul className="flex flex-wrap gap-x-5 gap-y-1 text-xs">
                    <li className="flex items-center gap-2">
                        <Swatch look="featured" />
                        {card.frame}
                    </li>
                    {matches.length > 0 && (
                        <li className="flex items-center gap-2">
                            <Swatch look="match" />
                            {filtering ? 'Matches' : 'Search matches'}
                        </li>
                    )}
                    {pins.length > 0 && (
                        <li className="flex items-center gap-2">
                            <Swatch look="active" />
                            Pinned
                        </li>
                    )}
                    <li className="flex items-center gap-2">
                        <span
                            aria-hidden="true"
                            className="w-4 border-t-2 border-dashed border-foreground/70"
                        />
                        Average frame: {blasts(results.standard.blastsToKill)}
                    </li>
                </ul>

                <div className="grid grid-cols-[auto_1fr] gap-x-2">
                    <p
                        id={axisLabelId}
                        className={cn(
                            eyebrowClass,
                            'col-span-2 mb-1 tracking-widest',
                        )}
                    >
                        Blasts to kill
                    </p>

                    {/* Row 1: the labels' band, above the bars */}
                    <div />
                    <div
                        ref={chartRef}
                        aria-hidden="true"
                        className="relative"
                        style={{ height: rows * LABEL_ROW + 4 }}
                    >
                        {labels.map((label) => (
                            <div key={label.key}>
                                <span
                                    className={cn(
                                        'absolute flex items-center gap-1.5 font-heading text-xs font-semibold tracking-wider whitespace-nowrap uppercase',
                                        label.align === 'center' &&
                                            '-translate-x-1/2',
                                        label.align === 'end' &&
                                            '-translate-x-full',
                                    )}
                                    style={{
                                        left: `${label.center * 100}%`,
                                        bottom: label.row * LABEL_ROW + 4,
                                        height: LABEL_ROW - 4,
                                    }}
                                >
                                    <Swatch look={lookOfLabel(label.key)} />
                                    {label.key}
                                    {pinned.has(label.key) && (
                                        <span className="font-sans font-normal tracking-normal text-muted-foreground normal-case tabular-nums">
                                            {blasts(label.value)}
                                        </span>
                                    )}
                                </span>
                                {/* A leader line from the label down to the bars' area */}
                                <span
                                    className="absolute bottom-0 border-l border-foreground/40"
                                    style={{
                                        left: `${label.center * 100}%`,
                                        height: label.row * LABEL_ROW + 4,
                                    }}
                                />
                            </div>
                        ))}
                    </div>

                    {/* Row 2: the y axis and the bars */}
                    <div
                        aria-hidden="true"
                        className="relative w-8 text-right text-xs text-muted-foreground tabular-nums"
                    >
                        {ticks.map((tick) => (
                            <span
                                key={tick}
                                className="absolute right-0 translate-y-1/2"
                                style={{ bottom: height(tick) }}
                            >
                                {tick}
                            </span>
                        ))}
                    </div>
                    {/* One stop in the Tab order for the whole chart; the arrow keys move between bars */}
                    <div
                        ref={groupRef}
                        role="group"
                        tabIndex={0}
                        aria-labelledby={axisLabelId}
                        aria-describedby={keysHelpId}
                        onKeyDown={onKeyDown}
                        onFocus={() => {
                            setFocused(true)
                            setActive((current) => current ?? featuredIndex)
                        }}
                        onBlur={() => {
                            setFocused(false)
                            setActive(null)
                        }}
                        // Moving the mouse off the chart hides the tooltip, unless the arrow keys are in
                        // use. A finger also "leaves" as it lifts, so a tapped bar keeps its tooltip
                        onPointerLeave={(event) => {
                            if (
                                event.pointerType === 'mouse' &&
                                !event.currentTarget.matches(':focus-visible')
                            )
                                setActive(null)
                        }}
                        className="relative h-56 border-b outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 sm:h-72"
                    >
                        {ticks.slice(1).map((tick) => (
                            <span
                                key={tick}
                                aria-hidden="true"
                                className="absolute inset-x-0 border-t"
                                style={{ bottom: height(tick) }}
                            />
                        ))}

                        <div
                            aria-hidden="true"
                            className="absolute inset-0 flex"
                        >
                            {field.map((result, index) => (
                                // The whole column is the target, not just the bar, so short bars
                                // are as easy to point at or tap as tall ones. Keyed by place, so a
                                // change of build grows and shrinks the bars where they stand
                                <div
                                    key={index}
                                    onPointerEnter={() => setActive(index)}
                                    onPointerDown={() => setActive(index)}
                                    onClick={() => togglePin(index)}
                                    className={cn(
                                        'flex h-full flex-1 items-end px-px',
                                        index === active && 'bg-foreground/10',
                                    )}
                                >
                                    <div
                                        className={cn(
                                            'w-full transition-[height] duration-300 motion-reduce:transition-none',
                                            lookOf(result, index),
                                        )}
                                        style={{
                                            height: height(result.blastsToKill),
                                        }}
                                    />
                                </div>
                            ))}
                        </div>

                        {/* The leader lines carry on from the band down to the tops of their bars */}
                        {labels.map((label) => (
                            <span
                                key={label.key}
                                aria-hidden="true"
                                className="pointer-events-none absolute top-0 border-l border-foreground/40"
                                style={{
                                    left: `${label.center * 100}%`,
                                    height: `calc(100% - ${height(label.value)})`,
                                }}
                            />
                        ))}

                        <span
                            aria-hidden="true"
                            className="pointer-events-none absolute inset-x-0 border-t-2 border-dashed border-foreground/70"
                            style={{
                                bottom: height(results.standard.blastsToKill),
                            }}
                        />

                        {activeResult && active !== null && (
                            <div
                                ref={tooltipRef}
                                aria-hidden="true"
                                className={cn(
                                    hintClass,
                                    'pointer-events-none absolute z-10 flex flex-col px-3 py-1.5 text-xs whitespace-nowrap',
                                    tooltipSide === 'center' &&
                                        '-translate-x-1/2',
                                    tooltipSide === 'end' &&
                                        '-translate-x-full',
                                )}
                                style={{
                                    left: `${center(active) * 100}%`,
                                    bottom: `calc(${height(tooltipFloor)} + 8px)`,
                                }}
                            >
                                <span>{activeResult.frame.name}</span>
                                <span className="font-sans font-normal tracking-normal text-muted-foreground normal-case tabular-nums">
                                    {blasts(activeResult.blastsToKill)} blasts
                                    to kill
                                </span>
                                <span className="font-sans font-normal tracking-normal text-muted-foreground normal-case">
                                    {pinHint}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Row 3: what the x axis means */}
                    <div />
                    <p
                        aria-hidden="true"
                        className="mt-2 flex justify-between gap-2 text-xs text-muted-foreground"
                    >
                        <span>← Survives fewest blasts</span>
                        <span>{field.length} frames</span>
                        <span>Survives most blasts →</span>
                    </p>
                </div>

                <p id={keysHelpId} className="sr-only">
                    Use the left and right arrow keys to move between frames,
                    Enter to pin or unpin one, and Escape to clear the pins.
                </p>
                <p aria-live="polite" className="sr-only">
                    {focused ? activeText : ''}
                </p>
                <p aria-live="polite" className="sr-only">
                    {pinStatus}
                </p>
            </div>

            {/* Under the chart's right edge, only while something is pinned */}
            {pins.length > 0 && (
                <div className="-mt-2 flex justify-end">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                            clearPins()
                            // The button hides once the pins are gone, so focus goes back to the
                            // chart instead of getting lost
                            groupRef.current?.focus()
                        }}
                    >
                        <IconPinnedOff data-icon="inline-start" />
                        Clear pins
                    </Button>
                </div>
            )}

            <FieldFiltersPanel
                filters={filters}
                ranges={ranges}
                onChange={(stat, filter) =>
                    setFilters((current) => ({ ...current, [stat]: filter }))
                }
                onClear={() =>
                    setFilters(defaultFilters(results.standard.frame))
                }
                status={filterStatus}
            />

            {/* The chart's numbers for screen readers, in the chart's order. sr-only goes on a wrapper,
                not the table, so nothing inside it can show in any browser */}
            <div className="sr-only">
                <table aria-labelledby={axisLabelId}>
                    <thead>
                        <tr>
                            <th scope="col">Frame</th>
                            <th scope="col">Blasts to kill</th>
                        </tr>
                    </thead>
                    <tbody>
                        {field.map((result) => (
                            <tr key={result.frame.name}>
                                <th scope="row">
                                    {result.frame.name}
                                    {result.frame.name === card.frame &&
                                        ' (featured)'}
                                </th>
                                <td>{blasts(result.blastsToKill)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </section>
    )
}
