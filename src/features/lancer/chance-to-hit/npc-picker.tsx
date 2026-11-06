import { useState, type ReactNode } from 'react'
import { cn } from 'cn'
import { underlineInputClass } from '@/components/field-styles'
import { SectionTitle } from '@/components/section-title'
import { Input } from '@/components/ui/input'
import { percent } from './format'
import type { LancerNpc } from './npc-types'
import type { AttackOdds } from './odds'
import { MAX_TARGETS } from './settings'

// Where each role sits: three columns, with the bigger roles across the top
const ROLE_COLUMNS = [
    ['Striker', 'Biological'],
    ['Controller', 'Support'],
    ['Defender', 'Artillery'],
]

/**
 * Each column's roles with their NPCs, skipping roles this ruleset doesn't have (Rebake has no
 * Biological). Any role the table gains later goes at the bottom of the last column instead of
 * disappearing
 */
function roleColumns(npcs: LancerNpc[]): [string, LancerNpc[]][][] {
    const known = ROLE_COLUMNS.flat()
    const extra = [...new Set(npcs.map((npc) => npc.role))].filter(
        (role) => !known.includes(role),
    )
    const columns = ROLE_COLUMNS.map((roles, index) =>
        index === ROLE_COLUMNS.length - 1 ? [...roles, ...extra] : roles,
    )
    return columns.map((roles) =>
        roles
            .map((role): [string, LancerNpc[]] => [
                role,
                npcs.filter((npc) => npc.role === role),
            ])
            .filter(([, members]) => members.length > 0),
    )
}

type NpcPickerProps = {
    npcs: LancerNpc[]
    // Names with at least one enemy card
    selected: Set<string>
    // At the most cards allowed, so names that aren't selected can't be added
    full: boolean
    oddsAgainst: (npc: LancerNpc) => AttackOdds
    onToggle: (name: string) => void
    // Shown at the far right of the title row
    aside?: ReactNode
}

/** Section 03: every enemy in the ruleset, by role. Pick a name to add its card; pick it again to remove it */
export function NpcPicker({
    npcs,
    selected,
    full,
    oddsAgainst,
    onToggle,
    aside,
}: NpcPickerProps) {
    const [query, setQuery] = useState('')
    // How many times an unavailable name was picked. Each new number remounts the warning, replaying its flash
    const [flashes, setFlashes] = useState(0)
    // Once there's room again, forget earlier flashes, so filling up later doesn't show a stale warning
    if (!full && flashes !== 0) setFlashes(0)
    const search = query.trim().toLowerCase()
    const searching = search !== ''

    // Like Dota's hero grid: nothing moves while you type; matches stand out and the rest fade
    const isMatch = (npc: LancerNpc) =>
        searching && npc.name.toLowerCase().includes(search)
    const matches = npcs.filter(isMatch)
    const first = matches.at(0)
    const unavailable = (npc: LancerNpc) => full && !selected.has(npc.name)

    // Adds or removes an enemy, and says whether it did. At the limit, a new name flashes the warning instead
    function pick(npc: LancerNpc): boolean {
        if (unavailable(npc)) {
            setFlashes((count) => count + 1)
            return false
        }
        setFlashes(0)
        onToggle(npc.name)
        return true
    }

    let status: ReactNode = null
    if (full && flashes > 0) {
        status = (
            <span
                key={flashes}
                className="animate-flash motion-reduce:animate-none"
            >
                {MAX_TARGETS} chosen: unselect one to choose another.
            </span>
        )
    } else if (searching) {
        status = first
            ? `${matches.length} ${matches.length === 1 ? 'match' : 'matches'}. Press Enter to ${selected.has(first.name) ? 'remove' : 'select'} ${first.name}.`
            : 'No enemy matches that name.'
    }

    return (
        // Its own container, so the columns follow this card's width
        <section className="@container flex flex-col gap-3 border bg-card p-4">
            <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                <div>
                    <SectionTitle number={3}>
                        Enemies - Pick up to {MAX_TARGETS}
                    </SectionTitle>
                </div>
                {aside}
            </div>
            <div className="flex flex-col gap-1.5">
                <Input
                    type="search"
                    placeholder="Search enemies"
                    aria-label="Search enemies"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    onKeyDown={(event) => {
                        // Enter picks the first match, so you can choose without the mouse
                        if (event.key === 'Enter' && first) {
                            event.preventDefault()
                            if (pick(first)) setQuery('')
                        }
                    }}
                    className={underlineInputClass}
                />
                <p
                    aria-live="polite"
                    className="min-h-4 text-xs text-muted-foreground"
                >
                    {status}
                </p>
            </div>
            <div className="grid gap-x-4 gap-y-1 @xl:grid-cols-3">
                {roleColumns(npcs).map((column, index) => (
                    // The columns never reorder, so their position works as a key
                    <div key={index} className="flex flex-col gap-1">
                        {column.map(([role, members]) => (
                            <section key={role}>
                                {/* One row tall, with the title centered, so every header lines up with the names beside it */}
                                <div className="mb-1 flex h-7.5 items-center">
                                    <SectionTitle as="h3">{role}</SectionTitle>
                                </div>
                                <ul className="flex flex-col gap-1">
                                    {members.map((npc) => (
                                        <li key={npc.name}>
                                            <button
                                                type="button"
                                                aria-pressed={selected.has(
                                                    npc.name,
                                                )}
                                                aria-disabled={unavailable(npc)}
                                                onClick={() => pick(npc)}
                                                className={cn(
                                                    'flex w-full items-center justify-between gap-2 border bg-background px-2 py-1 text-left text-sm transition hover:border-primary aria-disabled:cursor-not-allowed aria-disabled:text-muted-foreground aria-disabled:hover:border-border aria-pressed:border-primary aria-pressed:bg-primary/10 aria-pressed:text-primary aria-pressed:shadow-[inset_3px_0_0_var(--primary)]',
                                                    searching &&
                                                        !isMatch(npc) &&
                                                        'opacity-30',
                                                    isMatch(npc) &&
                                                        'ring-2 ring-foreground',
                                                )}
                                            >
                                                <span className="truncate">
                                                    {npc.name}
                                                </span>
                                                <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
                                                    {percent(
                                                        oddsAgainst(npc).hit,
                                                    )}
                                                </span>
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </section>
                        ))}
                    </div>
                ))}
            </div>
        </section>
    )
}
