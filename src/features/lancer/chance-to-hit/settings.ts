import type { Ruleset } from './npc-types'
import type { AttackSettings, Tier } from './odds'

/** Everything the page remembers between visits */
export type PageState = AttackSettings & {
    ruleset: Ruleset
    tier: Tier
    featured: string | null // the featured NPC's name; null until someone picks one
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

export const DEFAULT_STATE: PageState = {
    attackType: 'weapon',
    ruleset: 'original',
    tier: 1,
    licenseLevel: 0,
    frameTechAttack: 0,
    systems: 0,
    flatBonus: 0,
    otherAccuracy: 0,
    otherDifficulty: 0,
    impaired: false,
    engaged: false,
    cover: 'none',
    lockOn: false,
    prone: false,
    invisible: false,
    featured: null,
}

// The value if it's one of the allowed options, otherwise the fallback
function oneOf<T extends string | number>(value: unknown, options: readonly T[], fallback: T): T {
    return options.includes(value as T) ? (value as T) : fallback
}

/**
 * Rebuilds the page's state from whatever was saved, checking each setting on its own.
 * A missing or broken setting falls back to its default, without throwing away the others
 */
export function restoreState(saved: unknown): PageState {
    if (typeof saved !== 'object' || saved === null) return DEFAULT_STATE
    const s = saved as Record<string, unknown>

    const whole = (key: keyof typeof LIMITS): number => {
        const value = s[key]
        const { min, max } = LIMITS[key]
        return typeof value === 'number' && Number.isInteger(value) && value >= min && value <= max
            ? value
            : DEFAULT_STATE[key]
    }
    const flag = (key: 'impaired' | 'engaged' | 'lockOn' | 'prone' | 'invisible'): boolean => {
        const value = s[key]
        return typeof value === 'boolean' ? value : DEFAULT_STATE[key]
    }

    return {
        attackType: oneOf(s.attackType, ['weapon', 'smart', 'tech'] as const, DEFAULT_STATE.attackType),
        ruleset: oneOf(s.ruleset, ['original', 'rebake'] as const, DEFAULT_STATE.ruleset),
        tier: oneOf(s.tier, [1, 2, 3] as const, DEFAULT_STATE.tier),
        cover: oneOf(s.cover, ['none', 'soft', 'hard'] as const, DEFAULT_STATE.cover),
        licenseLevel: whole('licenseLevel'),
        frameTechAttack: whole('frameTechAttack'),
        systems: whole('systems'),
        flatBonus: whole('flatBonus'),
        otherAccuracy: whole('otherAccuracy'),
        otherDifficulty: whole('otherDifficulty'),
        impaired: flag('impaired'),
        engaged: flag('engaged'),
        lockOn: flag('lockOn'),
        prone: flag('prone'),
        invisible: flag('invisible'),
        featured: typeof s.featured === 'string' ? s.featured : null,
    }
}