import type { Ruleset } from '../rulesets'

// The rulesets now live in lancer/rulesets.ts, shared with Frame Survivability. Passing them on from
// here keeps this tool's imports working unchanged
export { RULESETS, type Ruleset } from '../rulesets'
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
