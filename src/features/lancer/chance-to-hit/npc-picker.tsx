import { useState } from 'react'
import { cn } from 'cn'
import { IconChevronDown } from '@tabler/icons-react'
import { underlineInputClass } from '@/components/field-styles'
import { SectionTitle } from '@/components/section-title'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { percent } from './format'
import type { LancerNpc } from './npc-types'
import type { AttackOdds, Tier } from './odds'

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
    featured: string
    tier: Tier
    rulesetName: string
    oddsAgainst: (npc: LancerNpc) => AttackOdds
    onPick: (name: string) => void
}

type PickerBodyProps = Omit<NpcPickerProps, 'tier' | 'rulesetName'>

// The dialog's contents, as their own component so the search box starts empty each time it opens
function PickerBody({ npcs, featured, oddsAgainst, onPick }: PickerBodyProps) {
    const [query, setQuery] = useState('')
    const search = query.trim().toLowerCase()
    const searching = search !== ''

    // Like Dota's hero grid: nothing moves while you type; matches stand out and the rest fade
    const isMatch = (npc: LancerNpc) =>
        searching && npc.name.toLowerCase().includes(search)
    const matches = npcs.filter(isMatch)
    const groups = groupByRole(npcs)

    return (
        <>
            <div className="flex flex-col gap-1.5">
                <Input
                    type="search"
                    placeholder="Search NPCs"
                    aria-label="Search NPCs"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    onKeyDown={(event) => {
                        // Enter features the first match, so you can pick without the mouse
                        if (event.key === 'Enter' && matches.length > 0) {
                            event.preventDefault()
                            onPick(matches[0].name)
                            setQuery('')
                        }
                    }}
                    className={underlineInputClass}
                />
                <p
                    aria-live="polite"
                    className="min-h-4 text-xs text-muted-foreground"
                >
                    {searching &&
                        (matches.length === 0
                            ? 'No NPC matches that name.'
                            : `${matches.length} ${matches.length === 1 ? 'match' : 'matches'}. Press Enter to feature ${matches[0].name}.`)}
                </p>
            </div>
            {/* Balanced columns: each role group flows into the next column instead of leaving gaps */}
            <div className="columns-1 gap-6 sm:columns-2 md:columns-3">
                {groups.map(([role, members]) => (
                    <section key={role} className="mb-5 break-inside-avoid">
                        <div className="mb-2 flex items-baseline justify-between gap-2 border-b pb-1.5">
                            <SectionTitle as="h3">{role}</SectionTitle>
                            <span className="text-xs text-muted-foreground">
                                {members.length}
                            </span>
                        </div>
                        <ul className="flex flex-col gap-1.5">
                            {members.map((npc) => (
                                <li key={npc.name}>
                                    <button
                                        type="button"
                                        aria-pressed={npc.name === featured}
                                        onClick={() => onPick(npc.name)}
                                        className={cn(
                                            'flex w-full items-center justify-between gap-3 border bg-background px-3 py-2 text-left text-sm transition hover:border-primary aria-pressed:border-primary aria-pressed:bg-primary/10 aria-pressed:text-primary aria-pressed:shadow-[inset_3px_0_0_var(--primary)]',
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
        </>
    )
}

export function NpcPicker({
    tier,
    rulesetName,
    onPick,
    ...bodyProps
}: NpcPickerProps) {
    // Controlled here, instead of left to Radix, so picking an NPC (by click or Enter) can close it
    const [open, setOpen] = useState(false)

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button type="button" variant="outline" size="sm">
                    Change NPC
                    <IconChevronDown data-icon="inline-end" />
                </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[85svh] overflow-y-auto sm:max-w-3xl">
                <DialogHeader>
                    <DialogTitle>Choose an NPC · T{tier}</DialogTitle>
                    <DialogDescription>
                        {rulesetName} NPCs, with your chance to hit using the
                        current settings. Pick one to feature it.
                    </DialogDescription>
                </DialogHeader>
                <PickerBody
                    {...bodyProps}
                    onPick={(name) => {
                        onPick(name)
                        setOpen(false)
                    }}
                />
            </DialogContent>
        </Dialog>
    )
}
