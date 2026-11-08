import type { LancerNpc } from './npc-types'

export const ATTACK_TYPES = ['weapon', 'smart', 'tech'] as const
export type AttackType = (typeof ATTACK_TYPES)[number]
export const COVERS = ['none', 'soft', 'hard'] as const
export type Cover = (typeof COVERS)[number]

/** The Difficulty each kind of cover adds to an attack */
export const COVER_DIFFICULTY = {
    none: 0,
    soft: 1,
    hard: 2,
} satisfies Record<Cover, number>
export const TIERS = [1, 2, 3] as const
export type Tier = (typeof TIERS)[number]

/** Your side of the roll: the same against every enemy */
export type YourSettings = {
    attackType: AttackType
    licenseLevel: number
    frameTechAttack: number
    systems: number
    flatBonus: number
    otherAccuracy: number
    otherDifficulty: number
    impaired: boolean
    engaged: boolean
}

/** One enemy's own effects, which only apply to attacks against that enemy */
export type TargetEffects = {
    cover: Cover
    lockOn: boolean
    prone: boolean
    invisible: boolean
}

export const NO_TARGET_EFFECTS: TargetEffects = {
    cover: 'none',
    lockOn: false,
    prone: false,
    invisible: false,
}

export type Source = { label: string; value: number }
export type Total = { total: number; sources: Source[] }
export type AttackOdds = { hit: number; crit: number }

/** Grit is half the License Level, rounded up */
export function grit(licenseLevel: number): number {
    return Math.ceil(licenseLevel / 2)
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

/*
 * The totals for an attack against one enemy: your effects, which apply to every enemy, plus that
 * enemy's own. Each total lists the sources that add up to it
 */
export function attackTotals(
    you: YourSettings,
    target: TargetEffects = NO_TARGET_EFFECTS,
) {
    const tech = you.attackType === 'tech'
    // Tech attacks ignore cover and aren't affected by Engaged, so both count as off
    const cover = tech ? 'none' : target.cover
    const engaged = tech ? false : you.engaged

    const accuracy = total([
        ['Lock On', target.lockOn ? 1 : 0],
        ['Prone', target.prone ? 1 : 0],
        ['Other', you.otherAccuracy],
    ])
    const difficulty = total([
        ['Soft cover', cover === 'soft' ? COVER_DIFFICULTY.soft : 0],
        ['Hard cover', cover === 'hard' ? COVER_DIFFICULTY.hard : 0],
        ['Impaired', you.impaired ? 1 : 0],
        ['Engaged', engaged ? 1 : 0],
        ['Other', you.otherDifficulty],
    ])
    const bonus = total([
        ['Grit', grit(you.licenseLevel)],
        ['Frame Tech Attack', tech ? you.frameTechAttack : 0],
        ['Systems', tech ? you.systems : 0],
        ['Flat bonus', you.flatBonus],
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

/** The average chance across a list, for the picker's average across the whole ruleset */
export function averageOdds(list: AttackOdds[]): AttackOdds {
    if (list.length === 0) return { hit: 0, crit: 0 }
    return {
        hit: list.reduce((sum, odds) => sum + odds.hit, 0) / list.length,
        crit: list.reduce((sum, odds) => sum + odds.crit, 0) / list.length,
    }
}
