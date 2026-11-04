import { useState, type ReactNode } from 'react'
import { cn } from 'cn'
import { underlineInputClass } from '@/components/field-styles'
import { SectionTitle } from '@/components/section-title'
import { Input } from '@/components/ui/input'
import { percent } from './format'
import type { LancerNpc } from './npc-types'
import type { AttackOdds } from './odds'
import { MAX_TARGETS } from './settings'

const ROLE_ORDER = [
    'Striker',
    'Controller',
    'Defender',
    'Support',
    'Artillery',
    'Biological',
]

// Roles in the order above; any role the table gains later goes at the end instead of disappearing
function roleRank(role: string): number {
    const index = ROLE_ORDER.indexOf(role)
    return index === -1 ? ROLE_ORDER.length : index
}

function groupByRole(npcs: LancerNpc[]): [string, LancerNpc[]][] {
    const roles = [...new Set(npcs.map((npc) => npc.role))].sort(
        (a, b) => roleRank(a) - roleRank(b),
    )
    return roles.map((role) => [role, npcs.filter((npc) => npc.role === role)])
}

type NpcPickerProps = {
    npcs: LancerNpc[]
    // Names with at least one enemy card
    selected: Set<string>
    // At the most cards allowed, so names that aren't selected can't be added
    full: boolean
    oddsAgainst: (npc: LancerNpc) => AttackOdds
    onToggle: (name: string) => void
}

/** Section 03: every enemy in the ruleset, by role. Pick a name to add its card; pick it again to remove it */
export function NpcPicker({
    npcs,
    selected,
    full,
    oddsAgainst,
    onToggle,
}: NpcPickerProps) {
    const [query, setQuery] = useState('')
    // How many times an unavailable name was picked. Each new number remounts the warning, replaying its flash
    const [flashes, setFlashes] = useState(0)
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
        // Its own container, so the number of columns follows this card's width
        <section className="@container flex flex-col gap-3 border bg-card p-4">
            <div>
                <SectionTitle number={3}>Enemies</SectionTitle>
                <p className="mt-1 text-sm text-muted-foreground">
                    Pick up to {MAX_TARGETS}. Percentages use your effects only.
                </p>
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
            {/* Balanced columns: each role group flows into the next column instead of leaving gaps */}
            <div className="columns-2 gap-4 @xl:columns-3">
                {groupByRole(npcs).map(([role, members]) => (
                    <section key={role} className="mb-4 break-inside-avoid">
                        <div className="mb-1.5 flex items-baseline justify-between gap-2 border-b pb-1">
                            <SectionTitle as="h3" marker="hex">
                                {role}
                            </SectionTitle>
                            <span className="text-xs text-muted-foreground">
                                {members.length}
                            </span>
                        </div>
                        <ul className="flex flex-col gap-1">
                            {members.map((npc) => (
                                <li key={npc.name}>
                                    <button
                                        type="button"
                                        aria-pressed={selected.has(npc.name)}
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
                                            {percent(oddsAgainst(npc).hit)}
                                        </span>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </section>
                ))}
            </div>
        </section>
    )
}
