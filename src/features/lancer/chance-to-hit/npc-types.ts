export const RULESETS = ['original', 'rebake'] as const
export type Ruleset = (typeof RULESETS)[number]

/** One value for each tier: index 0 is Tier 1, index 2 is Tier 3 */
export type PerTier = [number, number, number]

/** One NPC's defenses at each tier */
export type LancerNpc = {
    name: string
    role: string
    evasion: PerTier
    eDefense: PerTier
}

export type LancerNpcSets = Record<Ruleset, LancerNpc[]>
