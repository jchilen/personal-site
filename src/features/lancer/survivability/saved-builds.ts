import { fields, restoreName, restoreSettings } from './saved-settings'
import {
    cardSettings,
    MAX_NAME_LENGTH,
    type BuildCard,
    type CardSettings,
} from './settings'

/** The most builds that can be saved at once */
export const MAX_SAVED_BUILDS = 10

/**
 * The saved format's version, stored with the saves. When the format changes, this goes up and
 * restoreSaves learns to read the older format, like the page's own saved settings
 */
export const SAVED_BUILDS_VERSION = 1

/** A card kept for later: its frame, name, and settings, without its place on the page */
export type SavedBuild = CardSettings & {
    /** Stays the same through renames and updates, so the save's tile keeps its place */
    id: string
    name: string
    frame: string
    /** When it was last saved, in milliseconds since 1970, for oldest-first order */
    savedAt: number
}

/**
 * Whether two names are the same, ignoring capitals and spaces at either end. Cards show their
 * names in all capitals, so "Tank" and "TANK" look identical
 */
export function sameName(a: string, b: string): boolean {
    return a.trim().toLowerCase() === b.trim().toLowerCase()
}

/** The save with this name, if there is one */
export function findSave(
    saves: SavedBuild[],
    name: string,
): SavedBuild | undefined {
    return saves.find((save) => sameName(save.name, name))
}

/** A card can always update its own save, but a new save needs room under the limit */
export function canSave(saves: SavedBuild[], name: string): boolean {
    return (
        saves.length < MAX_SAVED_BUILDS || findSave(saves, name) !== undefined
    )
}

/**
 * The saves with this card saved, oldest first, so the card goes at the end. A save with the same
 * name is replaced, so saving a card again updates it (and moves it to the end, as the most recently
 * saved), and only a new name makes a new save. Unchanged when there's no room
 */
export function saveCard(
    saves: SavedBuild[],
    card: BuildCard,
    savedAt: number,
): SavedBuild[] {
    if (!canSave(saves, card.name)) return saves
    const existing = findSave(saves, card.name)
    const build: SavedBuild = {
        ...cardSettings(card),
        id: existing?.id ?? crypto.randomUUID(),
        name: card.name,
        frame: card.frame,
        savedAt,
    }
    return [...saves.filter((save) => !sameName(save.name, card.name)), build]
}

/** Whether a save other than this one already has the name, so this one can't take it */
export function nameTaken(
    saves: SavedBuild[],
    id: string,
    name: string,
): boolean {
    return saves.some((save) => save.id !== id && sameName(save.name, name))
}

/**
 * The saves with one renamed, trimming spaces and capping the length. Unchanged for a blank name,
 * or one another save already has, since saving a card finds its save by name
 */
export function renameSave(
    saves: SavedBuild[],
    id: string,
    newName: string,
): SavedBuild[] {
    const name = newName.trim().slice(0, MAX_NAME_LENGTH)
    const index = saves.findIndex((save) => save.id === id)
    if (
        index === -1 ||
        name === '' ||
        name === saves[index].name ||
        nameTaken(saves, id, name)
    )
        return saves
    return saves.with(index, { ...saves[index], name })
}

/** The saves without this one */
export function deleteSave(saves: SavedBuild[], id: string): SavedBuild[] {
    return saves.filter((save) => save.id !== id)
}

/** What gets stored: the saves, marked with the format's version */
export function toStoredSaves(saves: SavedBuild[]): {
    version: number
    saves: SavedBuild[]
} {
    return { version: SAVED_BUILDS_VERSION, saves }
}

/**
 * Rebuilds the saves from whatever was stored, checking each on its own. One without a frame or a
 * name is dropped, as is a second save with a name already used. They come back oldest first, and
 * past the limit only the newest are kept
 */
export function restoreSaves(stored: unknown): SavedBuild[] {
    const s = fields(stored)
    if (!s || !Array.isArray(s.saves)) return []

    const saves: SavedBuild[] = []
    for (const item of s.saves) {
        const b = fields(item)
        if (!b || typeof b.frame !== 'string' || b.frame === '') continue
        const name = restoreName(b.name)
        if (name === '' || findSave(saves, name)) continue
        const id = typeof b.id === 'string' && b.id !== '' ? b.id : ''
        saves.push({
            ...restoreSettings(b),
            // A missing or repeated id gets a new one, since each tile needs its own
            id:
                id !== '' && !saves.some((save) => save.id === id)
                    ? id
                    : crypto.randomUUID(),
            name,
            frame: b.frame,
            savedAt:
                typeof b.savedAt === 'number' && Number.isFinite(b.savedAt)
                    ? b.savedAt
                    : 0,
        })
    }
    return saves
        .toSorted((a, b) => a.savedAt - b.savedAt)
        .slice(-MAX_SAVED_BUILDS)
}
