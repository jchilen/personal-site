import type { PageAction } from './page-reducer'

/**
 * Whether an action moves things around on the page: it adds, removes or swaps cards, or shows or
 * hides rows and notes. These glide into place; everything else, like changing a number, applies
 * instantly
 */
export function changesLayout(action: PageAction): boolean {
    switch (action.type) {
        case 'toggleEnemy':
        case 'duplicateCard':
        case 'removeCard':
        case 'switchRuleset':
            return true
        // Tech attacks show the Frame Tech Attack and Systems rows, Setup's notes, and different
        // toggles on each card
        case 'changeYourSettings':
            return action.changes.attackType !== undefined
        // Invisible shows a note on the card
        case 'changeCardEffects':
            return action.changes.invisible !== undefined
        case 'setCardTier':
        case 'setSetupTier':
        case 'removeMissingEnemies':
            return false
    }
}
