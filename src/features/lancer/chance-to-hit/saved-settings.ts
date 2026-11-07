import { isOneOf, oneOf } from '@/lib/one-of'
import { RULESETS, type Ruleset } from './npc-types'
import { ATTACK_TYPES, COVERS, TIERS } from './odds'
import {
    DEFAULT_RULESET,
    DEFAULT_STATE,
    LIMITS,
    MAX_TARGETS,
    withTier,
    type PageState,
    type RulesetState,
    type Target,
} from './settings'

/**
 * The saved format's version, stored with every save. Each older version has a migration below
 * that turns it into the next one, so an old save is brought up to date one step at a time:
 * - 1: one featured NPC, with its effects saved beside the rest of the settings
 * - 2: a list of enemy cards, all at Setup's one tier
 * - 3: each ruleset keeps its own Setup tier and cards, and a card can have its own tier
 */
export const SAVE_VERSION = 3

/** What gets saved: the page's state, marked with the format's version */
export function toSaved(state: PageState): PageState & { version: number } {
    return { version: SAVE_VERSION, ...state }
}

type Fields = Record<string, unknown>

// A saved object's fields, to check one at a time, or null if it isn't an object
function fields(value: unknown): Fields | null {
    return typeof value === 'object' && value !== null
        ? (value as Fields)
        : null
}

// Saves before version 3 had no version number. Version 1 saves are the ones with a featured NPC
function versionOf(save: Fields): number {
    if (typeof save.version === 'number') return save.version
    return 'featured' in save ? 1 : 2
}

// Version 1 to 2: the featured NPC becomes the one card, taking the effects saved beside it
function fromVersion1(save: Fields): Fields {
    const { featured, cover, lockOn, prone, invisible, ...rest } = save
    return {
        ...rest,
        targets:
            typeof featured === 'string'
                ? [{ name: featured, cover, lockOn, prone, invisible }]
                : [],
    }
}

// Version 2 to 3: the one tier and card list belong to the ruleset that was showing. The other
// ruleset starts at the same tier, with no cards
function fromVersion2(save: Fields): Fields {
    const { tier, targets, ...rest } = save
    const showing = oneOf(rest.ruleset, RULESETS, DEFAULT_STATE.ruleset)
    const other = { tier, targets: [] }
    return {
        ...rest,
        version: 3,
        rulesets: {
            original: other,
            rebake: other,
            [showing]: { tier, targets },
        },
    }
}

const MIGRATIONS: Record<number, (save: Fields) => Fields> = {
    1: fromVersion1,
    2: fromVersion2,
}

// Runs each migration from the save's version up to the current one
function migrate(save: Fields): Fields {
    let current = save
    for (let version = versionOf(save); version < SAVE_VERSION; version++) {
        current = MIGRATIONS[version](current)
    }
    return current
}

// One saved card, or null if it has no usable name. Missing or broken effects fall back to
// none/off, a missing id gets a new one, and a missing or broken tier means it follows Setup
function restoreTarget(value: unknown): Target | null {
    const t = fields(value)
    if (!t || typeof t.name !== 'string' || t.name === '') return null

    const card: Target = {
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
    return withTier(card, isOneOf(t.tier, TIERS) ? t.tier : undefined)
}

// One ruleset's saved cards: valid ones only, no two sharing an id, and at most MAX_TARGETS
function restoreTargets(list: unknown): Target[] {
    if (!Array.isArray(list)) return []

    const targets: Target[] = []
    for (const item of list) {
        const target = restoreTarget(item)
        if (!target) continue
        // Two cards sharing an id would confuse the page about which one you clicked, so the
        // later one gets a fresh id. Copies of the same enemy are fine: they just need different ids
        if (targets.some((existing) => existing.id === target.id))
            target.id = crypto.randomUUID()
        targets.push(target)
    }
    return targets.slice(0, MAX_TARGETS)
}

// One ruleset's saved tier and cards
function restoreRuleset(value: unknown): RulesetState {
    const r = fields(value)
    return {
        tier: oneOf(r?.tier, TIERS, DEFAULT_RULESET.tier),
        targets: restoreTargets(r?.targets),
    }
}

/**
 * Rebuilds the page's state from whatever was saved: first brings an older save up to the current
 * version, then checks each setting on its own. A missing or broken setting falls back to its
 * default, without throwing away the others
 */
export function restoreState(saved: unknown): PageState {
    const found = fields(saved)
    if (!found) return DEFAULT_STATE
    const s = migrate(found)

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
    const rulesets = fields(s.rulesets)
    const ruleset = (name: Ruleset) => restoreRuleset(rulesets?.[name])

    return {
        attackType: oneOf(s.attackType, ATTACK_TYPES, DEFAULT_STATE.attackType),
        ruleset: oneOf(s.ruleset, RULESETS, DEFAULT_STATE.ruleset),
        licenseLevel: whole('licenseLevel'),
        frameTechAttack: whole('frameTechAttack'),
        systems: whole('systems'),
        flatBonus: whole('flatBonus'),
        otherAccuracy: whole('otherAccuracy'),
        otherDifficulty: whole('otherDifficulty'),
        impaired: flag('impaired'),
        engaged: flag('engaged'),
        rulesets: { original: ruleset('original'), rebake: ruleset('rebake') },
    }
}
