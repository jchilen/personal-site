import { MAX_SAVED_BUILDS } from './saved-builds'
import { MAX_CARDS } from './settings'

/**
 * Why a control can't be used right now. Each is written once, and shared by the note on the page
 * and the tooltip on the locked control, so the two always say the same thing
 */
export const LOCK_REASONS = {
    cardsFull: `${MAX_CARDS} cards: remove one to add another`,
    loadFull: 'Remove a card first',
    savesFull: `${MAX_SAVED_BUILDS} builds saved. Delete one first`,
    frameMissing: 'This frame is no longer in the data',
} as const
