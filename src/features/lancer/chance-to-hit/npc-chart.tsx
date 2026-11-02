import { cn } from 'cn'
import { IconArrowUpRight } from '@tabler/icons-react'
import { fieldLabelClass } from '@/components/field-styles'
import { SectionTitle } from '@/components/section-title'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { chanceColor, percent, signed } from './format'
import type { LancerNpc } from './npc-types'
import { groupByDefense, type AttackOdds, type attackTotals } from './odds'
import type { PageState } from './settings'

const ATTACK_NAMES = {
    weapon: 'Weapon',
    smart: 'Smart weapon',
    tech: 'Tech attack',
} as const

type DefenseGroup = { defense: number; npcs: LancerNpc[]; hit: number }

function hasFeatured(group: DefenseGroup, featured: string): boolean {
    return group.npcs.some((npc) => npc.name === featured)
}

type BarProps = {
    group: DefenseGroup
    featured: string
    sideways?: boolean
    title?: string
}

// One group's bar. The featured NPC's group takes the hit chance's red-to-green color; the rest stay gray
function Bar({ group, featured, sideways = false, title }: BarProps) {
    const size = `${group.hit * 100}%`
    const backgroundColor = hasFeatured(group, featured)
        ? chanceColor(group.hit)
        : undefined

    return (
        <span
            aria-hidden="true"
            title={title}
            className={cn(
                'block',
                sideways ? 'h-full' : 'w-3/5 rounded-t-sm',
                !backgroundColor && 'bg-muted-foreground/30',
            )}
            style={
                sideways
                    ? { width: size, backgroundColor }
                    : { height: size, backgroundColor }
            }
        />
    )
}

type NpcNameProps = {
    npc: LancerNpc
    group: DefenseGroup
    featured: string
    onPick: (name: string) => void
}

function NpcName({ npc, group, featured, onPick }: NpcNameProps) {
    const isFeatured = npc.name === featured
    return (
        <button
            type="button"
            aria-pressed={isFeatured}
            onClick={() => onPick(npc.name)}
            className="text-xs wrap-break-word transition-colors hover:text-primary aria-pressed:font-semibold"
            style={{ color: isFeatured ? chanceColor(group.hit) : undefined }}
        >
            {npc.name}
        </button>
    )
}

type GroupViewProps = {
    groups: DefenseGroup[]
    defenseLabel: string
    featured: string
    onPick: (name: string) => void
}

// One equal-width column per group: the chart always fits its space, never scrolling sideways
function columnsFor(groups: DefenseGroup[]) {
    return { gridTemplateColumns: `repeat(${groups.length}, minmax(0, 1fr))` }
}

// Wide screens: one column per defense value, its height the chance to hit, names underneath
function ChartColumns({
    groups,
    defenseLabel,
    featured,
    onPick,
}: GroupViewProps) {
    return (
        <ol className="hidden gap-1.5 lg:grid" style={columnsFor(groups)}>
            {groups.map((group) => (
                <li
                    key={group.defense}
                    className="flex min-w-0 flex-col items-center text-center"
                >
                    <div className="flex h-40 w-full flex-col items-center justify-end border-b">
                        <span className="mb-1 text-xs tabular-nums">
                            {percent(group.hit)}
                        </span>
                        <Bar group={group} featured={featured} />
                    </div>
                    <span className="mt-1.5 text-[10px] tracking-wide text-muted-foreground uppercase">
                        {defenseLabel}
                    </span>
                    <span className="font-heading text-base font-semibold">
                        {group.defense}
                    </span>
                    <ul className="mt-1 flex w-full flex-col gap-0.5">
                        {group.npcs.map((npc) => (
                            <li key={npc.name}>
                                <NpcName
                                    npc={npc}
                                    group={group}
                                    featured={featured}
                                    onPick={onPick}
                                />
                            </li>
                        ))}
                    </ul>
                </li>
            ))}
        </ol>
    )
}

// Narrower screens: one row per defense value, a short sideways bar and the names wrapping beside it
function ChartRows({ groups, defenseLabel, featured, onPick }: GroupViewProps) {
    return (
        <ol className="flex flex-col lg:hidden">
            {groups.map((group) => (
                <li
                    key={group.defense}
                    className="grid grid-cols-[5.5rem_minmax(0,1fr)] gap-3 border-b py-2"
                >
                    <div>
                        <p
                            className={cn(
                                fieldLabelClass,
                                'font-semibold text-foreground',
                            )}
                        >
                            {defenseLabel} {group.defense}
                        </p>
                        <p className="text-xs text-muted-foreground tabular-nums">
                            {percent(group.hit)}
                        </p>
                        <div className="mt-1 h-1.5 bg-muted">
                            <Bar group={group} featured={featured} sideways />
                        </div>
                    </div>
                    <ul className="flex flex-wrap gap-x-3 gap-y-1">
                        {group.npcs.map((npc) => (
                            <li key={npc.name}>
                                <NpcName
                                    npc={npc}
                                    group={group}
                                    featured={featured}
                                    onPick={onPick}
                                />
                            </li>
                        ))}
                    </ul>
                </li>
            ))}
        </ol>
    )
}

type MiniChartProps = {
    groups: DefenseGroup[]
    featured: string
    defenseLabel: string
    defenseName: string
}

// The small always-visible version on the page: bars only. The button around it opens the full chart
function MiniChart({
    groups,
    featured,
    defenseLabel,
    defenseName,
}: MiniChartProps) {
    return (
        <span aria-hidden="true" className="flex flex-col gap-1">
            <span
                className="grid h-24 gap-0.5 border-b"
                style={columnsFor(groups)}
            >
                {groups.map((group) => (
                    <span
                        key={group.defense}
                        className="flex h-full items-end justify-center"
                    >
                        <Bar
                            group={group}
                            featured={featured}
                            title={`${defenseLabel} ${group.defense}: ${percent(group.hit)} to hit · ${group.npcs.map((npc) => npc.name).join(', ')}`}
                        />
                    </span>
                ))}
            </span>
            <span
                className="grid gap-0.5 text-center text-[10px] text-muted-foreground tabular-nums"
                style={columnsFor(groups)}
            >
                {groups.map((group) => (
                    <span
                        key={group.defense}
                        className={cn(
                            hasFeatured(group, featured) &&
                                'font-semibold text-foreground',
                        )}
                    >
                        {group.defense}
                    </span>
                ))}
            </span>
            <span className={cn(fieldLabelClass, 'text-center')}>
                {defenseName}
            </span>
        </span>
    )
}

type NpcChartProps = {
    npcs: LancerNpc[]
    featured: string
    settings: PageState
    totals: ReturnType<typeof attackTotals>
    rulesetName: string
    oddsAgainst: (npc: LancerNpc) => AttackOdds
    onPick: (name: string) => void
}

export function NpcChart({
    npcs,
    featured,
    settings,
    totals,
    rulesetName,
    oddsAgainst,
    onPick,
}: NpcChartProps) {
    // Everyone in a group shares a defense, so the first NPC's odds are the group's odds
    const groups = groupByDefense(npcs, settings.attackType, settings.tier).map(
        (group) => ({
            ...group,
            hit: oddsAgainst(group.npcs[0]).hit,
        }),
    )
    const weapon = settings.attackType === 'weapon'
    const defenseLabel = weapon ? 'EV' : 'E-Def'
    const defenseName = weapon ? 'Evasion' : 'E-Defense'
    const viewProps = { groups, defenseLabel, featured, onPick }

    // The chart's situation, so it's always clear which settings it reflects
    const summary = [
        ATTACK_NAMES[settings.attackType],
        `Attack bonus ${signed(totals.bonus.total)}`,
        `Accuracy ${totals.accuracy.total}`,
        `Difficulty ${totals.difficulty.total}`,
        settings.invisible && 'Invisible',
    ]
        .filter(Boolean)
        .join(' · ')

    return (
        <Dialog>
            <DialogTrigger asChild>
                <button
                    type="button"
                    aria-label={`Open the chart of all ${rulesetName} NPCs`}
                    className="group flex w-full flex-col gap-3 border bg-card p-4 text-left transition-colors hover:border-primary"
                >
                    <span className="flex items-center justify-between gap-2">
                        <SectionTitle as="span">All NPCs</SectionTitle>
                        <span
                            className={cn(
                                fieldLabelClass,
                                'flex items-center gap-1 transition-colors group-hover:text-primary',
                            )}
                        >
                            Open chart
                            <IconArrowUpRight
                                aria-hidden="true"
                                className="size-3.5"
                            />
                        </span>
                    </span>
                    <MiniChart
                        groups={groups}
                        featured={featured}
                        defenseLabel={defenseLabel}
                        defenseName={defenseName}
                    />
                </button>
            </DialogTrigger>
            <DialogContent className="max-h-[85svh] overflow-y-auto sm:max-w-5xl">
                <DialogHeader>
                    <DialogTitle>
                        All {rulesetName} NPCs · T{settings.tier}
                    </DialogTitle>
                    <DialogDescription>{summary}</DialogDescription>
                </DialogHeader>
                <ChartColumns {...viewProps} />
                <ChartRows {...viewProps} />
                <p className="text-sm text-muted-foreground">
                    NPCs in the same group share the same {defenseName}, so they
                    share the same chance to hit. Pick a name to feature it.
                </p>
            </DialogContent>
        </Dialog>
    )
}
