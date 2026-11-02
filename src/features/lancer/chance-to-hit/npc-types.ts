export type Ruleset = 'original' | 'rebake'

/** One NPC's defenses; index 0 is Tier 1, index 2 is Tier 3 */
export type LancerNpc = {
    name: string
    role: string
    evasion: number[]
    eDefense: number[]
}

export type LancerNpcSets = Record<Ruleset, LancerNpc[]>
