import type { Dispatch } from 'react'
import type { Ruleset } from './npc-types'
import type { TargetEffects, Tier, YourSettings } from './odds'
import type { PageAction } from './page-reducer'

export const MAX_TARGETS = 3

/**
 * One enemy card: which enemy, and its own effects. The same enemy can appear more than once, so
 * each card has its own id, to tell copies apart. A card with no tier of its own follows Setup's
 */
export type Target = TargetEffects & { id: string; name: string; tier?: Tier }

/** What each ruleset remembers on its own, so changing one never touches the other */
export type RulesetState = {
    // Setup's tier while this ruleset is showing
    tier: Tier
    targets: Target[]
}

/** Everything the page remembers between visits */
export type PageState = YourSettings & {
    ruleset: Ruleset
    rulesets: Record<Ruleset, RulesetState>
}

/** Props for any part of the page that shows the settings and can change them */
export type SettingsProps = {
    settings: PageState
    dispatch: Dispatch<PageAction>
}

/** The range of each stepper, shared by the page's controls and by restoreState */
export const LIMITS = {
    licenseLevel: { min: 0, max: 12 },
    frameTechAttack: { min: -2, max: 3 },
    systems: { min: 0, max: 6 },
    flatBonus: { min: -5, max: 5 },
    otherAccuracy: { min: 0, max: 5 },
    otherDifficulty: { min: 0, max: 5 },
} as const

export const DEFAULT_RULESET: RulesetState = { tier: 1, targets: [] }

export const DEFAULT_STATE: PageState = {
    attackType: 'weapon',
    ruleset: 'original',
    licenseLevel: 0,
    frameTechAttack: 0,
    systems: 0,
    flatBonus: 0,
    otherAccuracy: 0,
    otherDifficulty: 0,
    impaired: false,
    engaged: false,
    rulesets: { original: DEFAULT_RULESET, rebake: DEFAULT_RULESET },
}

/** The showing ruleset's own settings: its Setup tier and its cards */
export function currentRuleset(settings: PageState): RulesetState {
    return settings.rulesets[settings.ruleset]
}

/** A card with the given tier of its own, or with none (`undefined`), so it follows Setup's */
export function withTier(target: Target, tier: Tier | undefined): Target {
    const { id, name, cover, lockOn, prone, invisible } = target
    return {
        id,
        name,
        cover,
        lockOn,
        prone,
        invisible,
        // Left out entirely, rather than saved as undefined, when the card follows Setup
        ...(tier === undefined ? {} : { tier }),
    }
}

/** A new card with none of its own effects, or a copy of another card's effects and tier */
export function newTarget(
    name: string,
    from?: Omit<Target, 'id' | 'name'>,
): Target {
    const card: Target = {
        id: crypto.randomUUID(),
        name,
        cover: from?.cover ?? 'none',
        lockOn: from?.lockOn ?? false,
        prone: from?.prone ?? false,
        invisible: from?.invisible ?? false,
    }
    return withTier(card, from?.tier)
}
