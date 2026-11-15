import { MAX_CARDS } from './settings'

/**
 * Why a control can't be used right now. Each is written once, and shared by the note on the page
 * and the tooltip on the locked control, so the two always say the same thing
 */
export const LOCK_REASONS = {
    cardsFull: `${MAX_CARDS} cards: remove one to add another`,
} as const