import type { Ruleset } from './npc-types'
import type { TargetEffects, Tier, YourSettings } from './odds'

export const MAX_TARGETS = 3

/**
 * One enemy card and its own effects. The same enemy can appear more than once, so each card has
 * its own id, to tell copies apart
 */
export type Target = TargetEffects & { id: string; name: string }

/** Everything the page remembers between visits */
export type PageState = YourSettings & {
    ruleset: Ruleset
    tier: Tier
    targets: Target[]
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
    targets: [],
}

const COVERS = ['none', 'soft', 'hard'] as const

/** A new enemy card with none of its own effects, or a copy of an existing card's effects */
export function newTarget(name: string, effects?: TargetEffects): Target {
    return {
        id: crypto.randomUUID(),
        name,
        cover: effects?.cover ?? 'none',
        lockOn: effects?.lockOn ?? false,
        prone: effects?.prone ?? false,
        invisible: effects?.invisible ?? false,
    }
}

// The value if it's one of the allowed options, otherwise the fallback
function oneOf<T extends string | number>(
    value: unknown,
    options: readonly T[],
    fallback: T,
): T {
    return options.includes(value as T) ? (value as T) : fallback
}

// One saved enemy card, or null if it has no usable name. Missing or broken effects fall back to
// none/off, and a missing id gets a new one
function restoreTarget(value: unknown): Target | null {
    if (typeof value !== 'object' || value === null) return null
    const t = value as Record<string, unknown>
    if (typeof t.name !== 'string' || t.name === '') return null

    return {
        id:
            typeof t.id === 'string' && t.id !== ''
                ? t.id
                : crypto.randomUUID(),
        name: t.name,
        cover: oneOf(t.cover, COVERS, 'none'),
        lockOn: t.lockOn === true,
        prone: t.prone === true,
        invisible: t.invisible === true,
    }
}

// The saved enemy cards: valid entries only, no two sharing an id, and at most MAX_TARGETS
function restoreTargets(s: Record<string, unknown>): Target[] {
    // Saves from before multiple enemies had one featured NPC, with the target effects stored
    // beside it, so that NPC becomes the first card and keeps those effects
    const saved: unknown[] = Array.isArray(s.targets)
        ? s.targets
        : typeof s.featured === 'string'
          ? [{ ...s, name: s.featured }]
          : []

    const targets: Target[] = []
    for (const item of saved) {
        const target = restoreTarget(item)
        if (!target) continue
        // Two cards sharing an id would confuse the page about which one you clicked; give the
        // later one a fresh id. Copies of the same enemy are fine: they just need different ids
        if (targets.some((existing) => existing.id === target.id))
            target.id = crypto.randomUUID()
        targets.push(target)
    }
    return targets.slice(0, MAX_TARGETS)
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
        return typeof value === 'number' &&
            Number.isInteger(value) &&
            value >= min &&
            value <= max
            ? value
            : DEFAULT_STATE[key]
    }
    const flag = (key: 'impaired' | 'engaged'): boolean => {
        const value = s[key]
        return typeof value === 'boolean' ? value : DEFAULT_STATE[key]
    }

    return {
        attackType: oneOf(
            s.attackType,
            ['weapon', 'smart', 'tech'] as const,
            DEFAULT_STATE.attackType,
        ),
        ruleset: oneOf(
            s.ruleset,
            ['original', 'rebake'] as const,
            DEFAULT_STATE.ruleset,
        ),
        tier: oneOf(s.tier, [1, 2, 3] as const, DEFAULT_STATE.tier),
        licenseLevel: whole('licenseLevel'),
        frameTechAttack: whole('frameTechAttack'),
        systems: whole('systems'),
        flatBonus: whole('flatBonus'),
        otherAccuracy: whole('otherAccuracy'),
        otherDifficulty: whole('otherDifficulty'),
        impaired: flag('impaired'),
        engaged: flag('engaged'),
        targets: restoreTargets(s),
    }
}
