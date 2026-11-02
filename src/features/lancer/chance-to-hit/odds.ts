import type { LancerNpc } from './npc-types'

export type AttackType = 'weapon' | 'smart' | 'tech'
export type Cover = 'none' | 'soft' | 'hard'
export type Tier = 1 | 2 | 3

/** Everything the player sets on the page that affects the roll */
export type AttackSettings = {
    attackType: AttackType
    licenseLevel: number
    frameTechAttack: number
    systems: number
    flatBonus: number
    otherAccuracy: number
    otherDifficulty: number
    impaired: boolean
    engaged: boolean
    cover: Cover
    lockOn: boolean
    prone: boolean
    invisible: boolean
}

export type Source = { label: string; value: number }
export type Total = { total: number; sources: Source[] }
export type AttackOdds = { hit: number; crit: number }

/** Grit is half the License Level, rounded up */
export function grit(licenseLevel: number): number {
    return Math.ceil(licenseLevel / 2)
}

/**
 * The average of the highest die when rolling `count` d6, as for Accuracy or Difficulty.
 * The highest die is at most k with chance (k/6)^count, and the average of a die roll
 * adds up the chance of beating each value from 0 to 5.
 */
export function averageHighestD6(count: number): number {
    if (count === 0) return 0
    let average = 6
    for (let k = 1; k <= 5; k++) average -= (k / 6) ** count
    return average
}

/**
 * Every value the Accuracy or Difficulty dice can add, with its chance. Positive `net` adds the
 * highest of that many d6; negative subtracts it; zero rolls nothing
 */
export function netDieOutcomes(
    net: number,
): { value: number; chance: number }[] {
    if (net === 0) return [{ value: 0, chance: 1 }]
    const count = Math.abs(net)
    const sign = Math.sign(net)
    return [1, 2, 3, 4, 5, 6].map((highest) => ({
        value: sign * highest,
        // The highest die is exactly `highest` when all dice are at most it, but not all below it
        chance: (highest ** count - (highest - 1) ** count) / 6 ** count,
    }))
}

type AttackInput = {
    target: number
    bonus: number
    netAccuracy: number
    invisible: boolean
}

/**
 * The exact chance to hit and to crit, by trying every d20 face with every Accuracy/Difficulty
 * result. A hit meets or beats the target; a crit is a hit with a total of 20 or more.
 * Invisible targets make half of all attacks miss before the roll
 */
export function attackOdds({
    target,
    bonus,
    netAccuracy,
    invisible,
}: AttackInput): AttackOdds {
    let hit = 0
    let crit = 0
    for (const { value, chance } of netDieOutcomes(netAccuracy)) {
        // Count the d20 faces that hit and crit as whole numbers, then weight them once
        let hitFaces = 0
        let critFaces = 0
        for (let face = 1; face <= 20; face++) {
            const total = face + bonus + value
            if (total >= target) {
                hitFaces++
                if (total >= 20) critFaces++
            }
        }
        hit += (chance * hitFaces) / 20
        crit += (chance * critFaces) / 20
    }

    // Decimals in a computer are approximate, so a sum that should be exactly 1 can land a hair
    // above it. Capping keeps every chance between 0% and 100%
    const reachesTarget = invisible ? 0.5 : 1
    return {
        hit: Math.min(1, hit) * reachesTarget,
        crit: Math.min(1, crit) * reachesTarget,
    }
}

// Keeps only the sources that actually apply, so the page lists "Lock On + Prone", not "+0" entries
function total(entries: [string, number][]): Total {
    const sources = entries
        .filter(([, value]) => value !== 0)
        .map(([label, value]) => ({ label, value }))
    return {
        total: sources.reduce((sum, source) => sum + source.value, 0),
        sources,
    }
}

/** The totals the page shows, each with the sources that add up to it */
export function attackTotals(settings: AttackSettings) {
    const tech = settings.attackType === 'tech'
    // Tech attacks ignore cover and aren't affected by Engaged, so both count as off
    const cover = tech ? 'none' : settings.cover
    const engaged = tech ? false : settings.engaged

    const accuracy = total([
        ['Lock On', settings.lockOn ? 1 : 0],
        ['Prone', settings.prone ? 1 : 0],
        ['Other', settings.otherAccuracy],
    ])
    const difficulty = total([
        ['Soft cover', cover === 'soft' ? 1 : 0],
        ['Hard cover', cover === 'hard' ? 2 : 0],
        ['Impaired', settings.impaired ? 1 : 0],
        ['Engaged', engaged ? 1 : 0],
        ['Other', settings.otherDifficulty],
    ])
    const bonus = total([
        ['Grit', grit(settings.licenseLevel)],
        ['Frame Tech Attack', tech ? settings.frameTechAttack : 0],
        ['Systems', tech ? settings.systems : 0],
        ['Flat bonus', settings.flatBonus],
    ])

    return {
        accuracy,
        difficulty,
        bonus,
        netAccuracy: accuracy.total - difficulty.total,
    }
}

/** The defense an attack rolls against: Evasion for weapons, E-Defense for Smart weapons and tech */
export function targetDefense(
    npc: LancerNpc,
    attackType: AttackType,
    tier: Tier,
): number {
    return (attackType === 'weapon' ? npc.evasion : npc.eDefense)[tier - 1]
}

/** The average chance across a list, for the "all NPCs" result */
export function averageOdds(list: AttackOdds[]): AttackOdds {
    if (list.length === 0) return { hit: 0, crit: 0 }
    return {
        hit: list.reduce((sum, odds) => sum + odds.hit, 0) / list.length,
        crit: list.reduce((sum, odds) => sum + odds.crit, 0) / list.length,
    }
}

/** NPCs grouped by the defense an attack rolls against, lowest first. Everyone in a group has the same odds */
export function groupByDefense(
    npcs: LancerNpc[],
    attackType: AttackType,
    tier: Tier,
): { defense: number; npcs: LancerNpc[] }[] {
    const groups = new Map<number, LancerNpc[]>()
    for (const npc of npcs) {
        const defense = targetDefense(npc, attackType, tier)
        groups.set(defense, [...(groups.get(defense) ?? []), npc])
    }
    return [...groups]
        .sort(([a], [b]) => a - b)
        .map(([defense, members]) => ({ defense, npcs: members }))
}
