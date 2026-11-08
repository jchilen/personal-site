import { MAX_TARGETS } from './settings'

/**
 * Why a control can't be used right now. Each is written once, and shared by the note or warning
 * on the page and the tooltip on the locked control, so the two always say the same thing
 */
export const LOCK_REASONS = {
    techCover: 'Tech attacks ignore cover',
    techEngaged: "Engaged doesn't affect tech attacks",
    pickerFull: `${MAX_TARGETS} chosen: unselect one to choose another`,
    cardsFull: `${MAX_TARGETS} chosen: remove one to add a copy`,
} as const
