import type { ReactNode } from 'react'
import { ToolLayout } from '@/components/tool-layout'
import { useApi } from '@/hooks/use-api'
import { TargetEffects, YourEffects } from './effects-cards'
import { NpcPicker } from './npc-picker'
import type { LancerNpc, LancerNpcSets } from './npc-types'
import { attackOdds, attackTotals, averageOdds, targetDefense } from './odds'
import { AverageResult, FeaturedResult } from './results'
import { MAX_TARGETS, newTarget, type PageState } from './settings'
import { SetupBar } from './setup-bar'
import { TotalsCard } from './totals-card'
import { usePageState } from './use-page-state'

const RULESET_NAMES = { original: 'Original', rebake: 'Rebake' } as const

// A function that gives the odds against any NPC, for one set of totals
function oddsFor(
    settings: PageState,
    totals: ReturnType<typeof attackTotals>,
    invisible: boolean,
) {
    return (npc: LancerNpc) =>
        attackOdds({
            target: targetDefense(npc, settings.attackType, settings.tier),
            bonus: totals.bonus.total,
            netAccuracy: totals.netAccuracy,
            invisible,
        })
}

export function ChanceToHitPage() {
    const npcs = useApi<LancerNpcSets>('/api/lancer/npcs')
    const { state: settings, update } = usePageState()
    // Temporary until Step E: the page still has one set of target effects, stored in settings itself
    const totals = attackTotals(settings, settings)

    let enemies: ReactNode = null
    if (npcs.state.status === 'error') {
        enemies = (
            <p
                role="alert"
                className="border bg-card p-4 text-muted-foreground"
            >
                {npcs.state.error}
            </p>
        )
    } else if (npcs.state.status === 'success') {
        const list = npcs.state.data[settings.ruleset]
        const byName = new Map(list.map((npc) => [npc.name, npc]))
        // Each saved card with its NPC. Cards for enemies missing from this ruleset are skipped
        const cards = settings.targets.flatMap((target) => {
            const npc = byName.get(target.name)
            return npc ? [{ target, npc }] : []
        })
        const targets = cards.map((card) => card.target)
        const full = targets.length >= MAX_TARGETS

        // The picker uses your effects alone, since each enemy's own effects apply only to its card
        const pickerOdds = oddsFor(settings, attackTotals(settings), false)
        const cardOdds = oddsFor(settings, totals, settings.invisible)

        // Adds an enemy, or removes it, copies and all. Saving the shown cards also drops any skipped ones
        const toggle = (name: string) => {
            if (targets.some((target) => target.name === name)) {
                update({
                    targets: targets.filter((target) => target.name !== name),
                })
            } else if (!full) {
                update({ targets: [...targets, newTarget(name)] })
            }
        }

        enemies = (
            <>
                <NpcPicker
                    npcs={list}
                    selected={new Set(targets.map((target) => target.name))}
                    full={full}
                    oddsAgainst={pickerOdds}
                    onToggle={toggle}
                />
                {/* Temporary until Step E replaces these with the section 04 cards */}
                <div className="grid items-start gap-4 @2xl:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
                    <div className="flex flex-col gap-4">
                        <TargetEffects settings={settings} update={update} />
                        <TotalsCard totals={totals} />
                    </div>
                    <div className="flex flex-col gap-4">
                        {cards.length === 0 ? (
                            <p className="border bg-card p-4 text-muted-foreground">
                                No enemies selected, select up to {MAX_TARGETS}{' '}
                                enemies above to see your chance of hitting
                                each.
                            </p>
                        ) : (
                            cards.map(({ target, npc }) => (
                                <FeaturedResult
                                    key={target.id}
                                    npc={npc}
                                    settings={settings}
                                    odds={cardOdds(npc)}
                                />
                            ))
                        )}
                        <AverageResult
                            label={`All ${list.length} ${RULESET_NAMES[settings.ruleset]} NPCs · Average`}
                            odds={averageOdds(list.map(cardOdds))}
                        />
                    </div>
                </div>
            </>
        )
    }

    return (
        <ToolLayout
            eyebrow="Lancer"
            title="Chance-to-Hit Calculator"
            intro="Find out your likelihood of hitting a given Lancer enemy."
        >
            <div className="@container flex flex-col gap-4">
                {/* No items-start here, so both cards stretch to the taller one's height */}
                <div className="grid gap-4 @2xl:grid-cols-[auto_minmax(0,1fr)]">
                    <SetupBar settings={settings} update={update} />
                    <YourEffects settings={settings} update={update} />
                </div>
                {enemies}
            </div>
        </ToolLayout>
    )
}
