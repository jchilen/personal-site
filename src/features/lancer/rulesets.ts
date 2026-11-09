/** Lancer's two NPC rulesets, shared by every Lancer tool */
export const RULESETS = ['original', 'rebake'] as const
export type Ruleset = (typeof RULESETS)[number]