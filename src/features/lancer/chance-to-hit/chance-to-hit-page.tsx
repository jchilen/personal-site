import type { ReactNode } from 'react'
import { ToolLayout } from '@/components/tool-layout'
import { useApi } from '@/hooks/use-api'
import { YourEffects } from './effects-cards'
import { EnemyCards, type EnemyCardData } from './enemy-cards'
import { percent } from './format'
import { NpcPicker } from './npc-picker'
import type { LancerNpc, LancerNpcSets } from './npc-types'
import {
    attackOdds,
    attackTotals,
    averageOdds,
    targetDefense,
    type TargetEffects,
} from './odds'
import { MAX_TARGETS, newTarget, type PageState } from './settings'
import { SetupBar } from './setup-bar'
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
        const shown = settings.targets.flatMap((target) => {
            const npc = byName.get(target.name)
            return npc ? [{ target, npc }] : []
        })
        const targets = shown.map(({ target }) => target)
        const full = targets.length >= MAX_TARGETS

        // Your effects alone: for the picker and the average, since each enemy's own effects
        // apply only to its card
        const yourOdds = oddsFor(settings, attackTotals(settings), false)
        const average = averageOdds(list.map(yourOdds))

        const cards: EnemyCardData[] = shown.map(({ target, npc }, index) => {
            const totals = attackTotals(settings, target)
            // Copies are numbered in order: Sniper, Sniper (2), Sniper (3)
            const copy =
                shown
                    .slice(0, index)
                    .filter((other) => other.target.name === target.name)
                    .length + 1
            return {
                target,
                npc,
                title: copy === 1 ? npc.name : `${npc.name} (${copy})`,
                odds: oddsFor(settings, totals, target.invisible)(npc),
                netAccuracy: totals.netAccuracy,
            }
        })

        // Every change saves the shown cards, which also drops any skipped ones
        const setTargets = (next: typeof targets) => update({ targets: next })

        // Adds an enemy, or removes it, copies and all
        const toggle = (name: string) => {
            if (targets.some((target) => target.name === name)) {
                setTargets(targets.filter((target) => target.name !== name))
            } else if (!full) {
                setTargets([...targets, newTarget(name)])
            }
        }

        const changeTarget = (id: string, changes: Partial<TargetEffects>) =>
            setTargets(
                targets.map((target) =>
                    target.id === id ? { ...target, ...changes } : target,
                ),
            )

        // The copy goes right after the card it was copied from
        const duplicate = (id: string) => {
            const index = targets.findIndex((target) => target.id === id)
            if (index === -1 || full) return
            const copy = newTarget(targets[index].name, targets[index])
            setTargets([
                ...targets.slice(0, index + 1),
                copy,
                ...targets.slice(index + 1),
            ])
        }

        const remove = (id: string) =>
            setTargets(targets.filter((target) => target.id !== id))

        enemies = (
            <>
                <NpcPicker
                    npcs={list}
                    selected={new Set(targets.map((target) => target.name))}
                    full={full}
                    oddsAgainst={yourOdds}
                    onToggle={toggle}
                    aside={
                        <p className="text-xs text-muted-foreground">
                            Average across all {list.length}{' '}
                            {RULESET_NAMES[settings.ruleset]} NPCs at T
                            {settings.tier}: {percent(average.hit)} to hit,{' '}
                            {percent(average.crit)} to crit.
                        </p>
                    }
                />
                <EnemyCards
                    cards={cards}
                    attackType={settings.attackType}
                    tier={settings.tier}
                    onChange={changeTarget}
                    onDuplicate={duplicate}
                    onRemove={remove}
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
