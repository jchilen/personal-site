import type { ReactNode } from 'react'
import { ToolLayout } from '@/components/tool-layout'
import { useApi } from '@/hooks/use-api'
import type { LancerNpc, LancerNpcSets } from './npc-types'
import { attackOdds, attackTotals, averageOdds, targetDefense } from './odds'
import { AverageResult, FeaturedResult } from './results'
import { SetupBar } from './setup-bar'
import { usePageState } from './use-page-state'
import { TargetEffects, YourEffects } from './effects-cards'
import { TotalsCard } from './totals-card'

const RULESET_NAMES = { original: 'Original', rebake: 'Rebake' } as const

export function ChanceToHitPage() {
    const npcs = useApi<LancerNpcSets>('/api/lancer/npcs')
    const { state: settings, update } = usePageState()
    const totals = attackTotals(settings)

    let results: ReactNode = null
    if (npcs.state.status === 'error') {
        results = (
            <p
                role="alert"
                className="border bg-card p-4 text-muted-foreground"
            >
                {npcs.state.error}
            </p>
        )
    } else if (npcs.state.status === 'success') {
        const list = npcs.state.data[settings.ruleset]
        const oddsAgainst = (npc: LancerNpc) =>
            attackOdds({
                target: targetDefense(npc, settings.attackType, settings.tier),
                bonus: totals.bonus.total,
                netAccuracy: totals.netAccuracy,
                invisible: settings.invisible,
            })

        // The last NPC picked, or the first in the list if it isn't in this ruleset
        const featured =
            list.find((npc) => npc.name === settings.featured) ?? list.at(0)

        results = featured && (
            <>
                <FeaturedResult
                    npc={featured}
                    settings={settings}
                    odds={oddsAgainst(featured)}
                />
                <AverageResult
                    label={`All ${list.length} ${RULESET_NAMES[settings.ruleset]} NPCs · Average`}
                    odds={averageOdds(list.map(oddsAgainst))}
                />
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
                <SetupBar settings={settings} update={update} />
                <div className="grid items-start gap-4 @2xl:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
                    <div className="flex flex-col gap-4">
                        <YourEffects settings={settings} update={update} />
                        <TargetEffects settings={settings} update={update} />
                        <TotalsCard totals={totals} />
                    </div>
                    <div className="flex flex-col gap-4">{results}</div>
                </div>
            </div>
        </ToolLayout>
    )
}
