import { EnemyCards } from './enemy-cards'
import { buildEnemyCards, oddsFor } from './enemy-card-data'
import { percent } from './format'
import { NpcPicker } from './npc-picker'
import type { LancerNpc } from './npc-types'
import { attackTotals, averageOdds } from './odds'
import { currentRuleset, MAX_TARGETS, type SettingsProps } from './settings'

const RULESET_NAMES = { original: 'Original', rebake: 'Rebake' } as const

type EnemySectionProps = SettingsProps & {
    // Every NPC in the showing ruleset
    npcs: LancerNpc[]
}

/** Sections 03 and 04: the enemy picker, and a card for each chosen enemy */
export function EnemySection({ npcs, settings, dispatch }: EnemySectionProps) {
    const { tier } = currentRuleset(settings)
    const cards = buildEnemyCards(npcs, settings)
    const full = cards.length >= MAX_TARGETS

    // Your effects alone, at Setup's tier: for the picker and the average, since each enemy's own
    // effects and tier apply only to its card
    const yourOdds = oddsFor(settings, tier, attackTotals(settings), false)
    const average = averageOdds(npcs.map(yourOdds))

    return (
        <>
            <NpcPicker
                npcs={npcs}
                selected={new Set(cards.map((card) => card.target.name))}
                full={full}
                oddsAgainst={yourOdds}
                onToggle={(name) => dispatch({ type: 'toggleEnemy', name })}
                aside={
                    <p className="text-xs text-muted-foreground">
                        Average across all {npcs.length}{' '}
                        {RULESET_NAMES[settings.ruleset]} NPCs at T{tier}:{' '}
                        {percent(average.hit)} to hit, {percent(average.crit)}{' '}
                        to crit.
                    </p>
                }
            />
            <EnemyCards
                cards={cards}
                attackType={settings.attackType}
                onChange={(id, changes) =>
                    dispatch({ type: 'changeCardEffects', id, changes })
                }
                onDuplicate={(id) => dispatch({ type: 'duplicateCard', id })}
                onRemove={(id) => dispatch({ type: 'removeCard', id })}
            />
        </>
    )
}
