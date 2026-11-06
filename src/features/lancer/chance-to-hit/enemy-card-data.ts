import type { EnemyCardData } from './enemy-cards'
import type { LancerNpc } from './npc-types'
import { attackOdds, attackTotals, targetDefense } from './odds'
import type { PageState } from './settings'

/** A function that gives the odds against any NPC, for one set of totals */
export function oddsFor(
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

/**
 * Each saved card with its NPC, title, and odds, from your effects plus that card's own.
 * Cards for enemies missing from this ruleset are skipped
 */
export function buildEnemyCards(
    npcs: LancerNpc[],
    settings: PageState,
): EnemyCardData[] {
    const byName = new Map(npcs.map((npc) => [npc.name, npc]))
    const shown = settings.targets.flatMap((target) => {
        const npc = byName.get(target.name)
        return npc ? [{ target, npc }] : []
    })

    return shown.map(({ target, npc }, index) => {
        const totals = attackTotals(settings, target)
        // Copies are numbered in order: Sniper, Sniper (2), Sniper (3)
        const copy =
            shown
                .slice(0, index)
                .filter((other) => other.target.name === target.name).length + 1
        return {
            target,
            npc,
            title: copy === 1 ? npc.name : `${npc.name} (${copy})`,
            odds: oddsFor(settings, totals, target.invisible)(npc),
            netAccuracy: totals.netAccuracy,
        }
    })
}
