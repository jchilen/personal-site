import { blastDamage, totalHp } from './damage'
import { pilotedStats, type PilotBuild, type PilotedStats } from './pilot-build'
import type { BuildCard } from './settings'
import type {
    Frame,
    NpcAttacks,
    SurvivabilityData,
} from './survivability-types'

/** How one frame does against one blast, once the pilot's build is added */
export type FrameResult = {
    frame: Frame
    stats: PilotedStats
    totalHp: number
    blastDamage: number
    blastsToKill: number
}

export function frameResult(
    frame: Frame,
    build: PilotBuild,
    blast: NpcAttacks[],
): FrameResult {
    const stats = pilotedStats(frame, build)
    const hp = totalHp(stats.hp, stats.repairCap, frame.structureRepairCost)
    const damage = blastDamage(
        blast,
        { ...stats, damageTraits: frame.damageTraits },
        build.cover,
    )
    return {
        frame,
        stats,
        totalHp: hp,
        blastDamage: damage,
        blastsToKill: hp / damage,
    }
}

/** Every frame with the same build against the same blast: the field a card is ranked in */
export function fieldResults(
    frames: Frame[],
    build: PilotBuild,
    blast: NpcAttacks[],
): FrameResult[] {
    return frames.map((frame) => frameResult(frame, build, blast))
}

/** A card's frame, how it ranks in its field, and how the standard frame does with the same build */
export type CardResults = FrameResult & {
    /** 1st survives the most blasts. Frames tied on blasts to kill share a rank */
    rank: number
    fieldSize: number
    standard: FrameResult
    /** Every frame with this card's build, the card's own frame included, for the chart */
    field: FrameResult[]
}

/** A card's results, or null if its frame isn't in the data */
export function cardResults(
    card: BuildCard,
    data: SurvivabilityData,
    standard: Frame,
): CardResults | null {
    const blast = data.attacks[card.ruleset][card.tier - 1]
    const field = fieldResults(data.frames, card, blast)
    const own = field.find((result) => result.frame.name === card.frame)
    if (!own) return null

    return {
        ...own,
        rank:
            1 +
            field.filter((result) => result.blastsToKill > own.blastsToKill)
                .length,
        fieldSize: field.length,
        standard: frameResult(standard, card, blast),
        field,
    }
}

// Results already worked out, by card. The reducer replaces only the card that changed, so a card
// that's the same object as last time, with the same data and standard frame, has the same results.
// A WeakMap forgets a card once nothing else holds on to it, like a removed card
const saved = new WeakMap<
    BuildCard,
    { data: SurvivabilityData; standard: Frame; results: CardResults | null }
>()

/**
 * cardResults, worked out once per card and reused until that card, the data or the standard frame
 * changes. The cards and the versus card both read from it, so nothing is worked out twice
 */
export function cachedCardResults(
    card: BuildCard,
    data: SurvivabilityData,
    standard: Frame,
): CardResults | null {
    const hit = saved.get(card)
    if (hit && hit.data === data && hit.standard === standard)
        return hit.results
    const results = cardResults(card, data, standard)
    saved.set(card, { data, standard, results })
    return results
}
