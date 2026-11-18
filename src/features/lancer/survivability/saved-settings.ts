import { oneOf } from '@/lib/one-of'
import { COVERS, TIERS } from '../rules'
import { RULESETS } from '../rulesets'
import {
    DEFAULT_SETTINGS,
    STARTING_STATE,
    MAX_CARDS,
    MAX_NAME_LENGTH,
    nextCardName,
    STAT_LIMITS,
    type BuildCard,
    type CardSettings,
    type PageState,
    type PilotStat,
} from './settings'

/**
 * The saved format's version, stored with every save. When the format changes, this goes up and
 * a migration turns older saves into the new format, as chance-to-hit's saved settings do
 */
export const SAVE_VERSION = 1

/** What gets saved: the page's state, marked with the format's version */
export function toSaved(state: PageState): PageState & { version: number } {
    return { version: SAVE_VERSION, ...state }
}

/** A saved object's fields, to check one at a time */
export type Fields = Record<string, unknown>

/** A saved object's fields, or null if it isn't an object */
export function fields(value: unknown): Fields | null {
    return typeof value === 'object' && value !== null
        ? (value as Fields)
        : null
}

/**
 * A saved card's settings, each checked on its own. Anything missing or broken falls back to its
 * default. Shared by the cards on the page and the saved builds
 */
export function restoreSettings(c: Fields): CardSettings {
    const stat = (key: PilotStat): number => {
        const v = c[key]
        const { min, max } = STAT_LIMITS[key]
        return typeof v === 'number' &&
            Number.isInteger(v) &&
            v >= min &&
            v <= max
            ? v
            : DEFAULT_SETTINGS[key]
    }
    return {
        ruleset: oneOf(c.ruleset, RULESETS, DEFAULT_SETTINGS.ruleset),
        tier: oneOf(c.tier, TIERS, DEFAULT_SETTINGS.tier),
        hull: stat('hull'),
        agility: stat('agility'),
        systems: stat('systems'),
        reinforcedFrame: c.reinforcedFrame === true,
        fullSubjectivitySync: c.fullSubjectivitySync === true,
        slopedPlating: c.slopedPlating === true,
        lessonOfDisbelief: c.lessonOfDisbelief === true,
        cover: oneOf(c.cover, COVERS, DEFAULT_SETTINGS.cover),
    }
}

/** A saved name trimmed and cut to the longest allowed, or '' if there isn't one */
export function restoreName(value: unknown): string {
    return typeof value === 'string'
        ? value.trim().slice(0, MAX_NAME_LENGTH)
        : ''
}

// One saved card, or null without a frame. Anything else missing or broken falls back to its
// default; a missing name gets the next free default name
function restoreCard(value: unknown, earlier: BuildCard[]): BuildCard | null {
    const c = fields(value)
    if (!c || typeof c.frame !== 'string' || c.frame === '') return null

    const name = restoreName(c.name)
    const id = typeof c.id === 'string' && c.id !== '' ? c.id : ''

    return {
        // Two cards sharing an id would confuse the page about which one you clicked, so a
        // repeated id is replaced too
        id:
            id !== '' && !earlier.some((card) => card.id === id)
                ? id
                : crypto.randomUUID(),
        frame: c.frame,
        name: name !== '' ? name : nextCardName(c.frame, earlier),
        ...restoreSettings(c),
        collapsed: c.collapsed === true,
    }
}

/**
 * Rebuilds the page's state from whatever was saved, checking every card on its own. A broken
 * card is dropped without throwing away the others, and a comparison that no longer makes sense
 * is cleared
 */
export function restoreState(saved: unknown): PageState {
    const s = fields(saved)
    // Nothing usable saved, so this is treated like a first visit
    if (!s || !Array.isArray(s.cards)) return STARTING_STATE

    const cards: BuildCard[] = []
    for (const item of s.cards) {
        if (cards.length === MAX_CARDS) break
        const card = restoreCard(item, cards)
        if (card) cards.push(card)
    }

    // The featured card is always open, whatever was saved
    if (cards[0]?.collapsed) cards[0] = { ...cards[0], collapsed: false }

    const comparing = cards.findIndex((card) => card.id === s.comparingId)
    return {
        cards,
        // Only a card below the featured one can be compared with it
        comparingId: comparing > 0 ? cards[comparing].id : null,
    }
}
