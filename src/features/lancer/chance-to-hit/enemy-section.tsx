import { EnemyCards } from './enemy-cards'
import { buildEnemyCards, oddsFor } from './enemy-card-data'
import { percent } from './format'
import { NpcPicker } from './npc-picker'
import type { LancerNpc } from './npc-types'
import { attackTotals, averageOdds, type TargetEffects } from './odds'
import { MAX_TARGETS, newTarget, type PageState } from './settings'

const RULESET_NAMES = { original: 'Original', rebake: 'Rebake' } as const

type EnemySectionProps = {
    // Every NPC in the chosen ruleset
    npcs: LancerNpc[]
    settings: PageState
    update: (changes: Partial<PageState>) => void
}

/** Sections 03 and 04: the enemy picker, and a card for each chosen enemy */
export function EnemySection({ npcs, settings, update }: EnemySectionProps) {
    const cards = buildEnemyCards(npcs, settings)
    const targets = cards.map((card) => card.target)
    const full = targets.length >= MAX_TARGETS

    // Your effects alone: for the picker and the average, since each enemy's own effects
    // apply only to its card
    const yourOdds = oddsFor(settings, attackTotals(settings), false)
    const average = averageOdds(npcs.map(yourOdds))

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

    return (
        <>
            <NpcPicker
                npcs={npcs}
                selected={new Set(targets.map((target) => target.name))}
                full={full}
                oddsAgainst={yourOdds}
                onToggle={toggle}
                aside={
                    <p className="text-xs text-muted-foreground">
                        Average across all {npcs.length}{' '}
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
