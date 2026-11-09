/** Lancer rules shared by every Lancer tool */

export const TIERS = [1, 2, 3] as const
export type Tier = (typeof TIERS)[number]

export const COVERS = ['none', 'soft', 'hard'] as const
export type Cover = (typeof COVERS)[number]

/** The Difficulty each kind of cover adds to an attack */
export const COVER_DIFFICULTY = {
    none: 0,
    soft: 1,
    hard: 2,
} satisfies Record<Cover, number>

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