import type { LancerNpc } from './npc-types'
import {
    attackOdds,
    attackTotals,
    targetDefense,
    type AttackOdds,
    type Tier,
    type YourSettings,
} from './odds'
import { currentRuleset, type PageState, type Target } from './settings'

/** Everything one enemy card shows, worked out from its saved card and your settings */
export type EnemyCardData = {
    target: Target
    npc: LancerNpc
    // "Sniper", or "Sniper (2)" for the second card of the same enemy
    title: string
    // The card's own tier if it has one, otherwise Setup's
    tier: Tier
    odds: AttackOdds
    netAccuracy: number
}

/** A function that gives the odds against any NPC at one tier, for one set of totals */
export function oddsFor(
    you: YourSettings,
    tier: Tier,
    totals: ReturnType<typeof attackTotals>,
    invisible: boolean,
): (npc: LancerNpc) => AttackOdds {
    return (npc) =>
        attackOdds({
            target: targetDefense(npc, you.attackType, tier),
            bonus: totals.bonus.total,
            netAccuracy: totals.netAccuracy,
            invisible,
        })
}

/**
 * The showing ruleset's cards, each with its NPC, title, tier, and odds, from your effects plus
 * that card's own. A card for an enemy missing from the NPC list is skipped
 */
export function buildEnemyCards(
    npcs: LancerNpc[],
    settings: PageState,
): EnemyCardData[] {
    const { tier: setupTier, targets } = currentRuleset(settings)
    const byName = new Map(npcs.map((npc) => [npc.name, npc]))
    const shown = targets.flatMap((target) => {
        const npc = byName.get(target.name)
        return npc ? [{ target, npc }] : []
    })

    return shown.map(({ target, npc }, index) => {
        const totals = attackTotals(settings, target)
        const tier = target.tier ?? setupTier
        // Copies are numbered in order: Sniper, Sniper (2), Sniper (3)
        const copy =
            shown
                .slice(0, index)
                .filter((other) => other.target.name === target.name).length + 1
        return {
            target,
            npc,
            title: copy === 1 ? npc.name : `${npc.name} (${copy})`,
            tier,
            odds: oddsFor(settings, tier, totals, target.invisible)(npc),
            netAccuracy: totals.netAccuracy,
        }
    })
}
