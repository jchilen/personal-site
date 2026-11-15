import type { PageAction } from './page-reducer'

/**
 * Whether an action moves things around on the page: it adds, removes or reorders cards, or shows
 * or hides the versus card. These glide into place; everything else, like changing a stat, applies
 * instantly
 */
export function changesLayout(action: PageAction): boolean {
    switch (action.type) {
        case 'addCard':
        case 'duplicateCard':
        case 'removeCard':
        case 'moveCard':
        case 'featureCard':
        case 'toggleCompare':
            return true
        // Runs as the page loads, where there's nothing on screen yet to glide from
        case 'removeMissingFrames':
        case 'renameCard':
        case 'changeCard':
            return false
    }
}
