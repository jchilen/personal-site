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
        case 'loadBuild':
        case 'removeCard':
        case 'moveCard':
        case 'featureCard':
        case 'toggleCompare':
            return true
        // removeMissingFrames runs as the page loads, where there's nothing on screen yet to glide
        // from. toggleCollapse animates on its own: the card slides open or shut, and the cards
        // below follow it
        case 'removeMissingFrames':
        case 'toggleCollapse':
        case 'renameCard':
        case 'changeCard':
            return false
    }
}
