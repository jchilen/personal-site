import type { LancerNpcSets, Ruleset } from './npc-types'
import type { TargetEffects, Tier, YourSettings } from './odds'
import {
    currentRuleset,
    MAX_TARGETS,
    newTarget,
    withTier,
    type PageState,
    type RulesetState,
} from './settings'

/** Everything you can do to the enemy cards. Each applies to the showing ruleset's cards only */
export type CardAction =
    // Adds a card for this enemy, or, if it has any, removes all of its cards
    | { type: 'toggleEnemy'; name: string }
    // Adds a copy right after the card, with the same effects and tier
    | { type: 'duplicateCard'; id: string }
    | { type: 'removeCard'; id: string }
    | { type: 'changeCardEffects'; id: string; changes: Partial<TargetEffects> }
    // Picking Setup's tier clears the card's own, so it follows Setup again
    | { type: 'setCardTier'; id: string; tier: Tier }

/** Everything you can do on the page */
export type PageAction =
    | CardAction
    | { type: 'changeYourSettings'; changes: Partial<YourSettings> }
    // Switches NPC type. Each ruleset keeps its own Setup tier and cards, so nothing is lost
    | { type: 'switchRuleset'; ruleset: Ruleset }
    // Changes the showing ruleset's Setup tier. Cards with a tier of their own keep it
    | { type: 'setSetupTier'; tier: Tier }
    // Removes cards for enemies the NPC list no longer has, from both rulesets
    | { type: 'removeMissingEnemies'; npcs: LancerNpcSets }

/** One ruleset's cards after a card action. At the card limit, adding does nothing */
export function cardsReducer(
    ruleset: RulesetState,
    action: CardAction,
): RulesetState {
    const { targets } = ruleset
    const full = targets.length >= MAX_TARGETS
    const withTargets = (next: typeof targets) => ({
        ...ruleset,
        targets: next,
    })

    switch (action.type) {
        case 'toggleEnemy': {
            if (targets.some((target) => target.name === action.name)) {
                return withTargets(
                    targets.filter((target) => target.name !== action.name),
                )
            }
            return full
                ? ruleset
                : withTargets([...targets, newTarget(action.name)])
        }
        case 'duplicateCard': {
            const index = targets.findIndex((target) => target.id === action.id)
            if (index === -1 || full) return ruleset
            const original = targets[index]
            return withTargets(
                targets.toSpliced(
                    index + 1,
                    0,
                    newTarget(original.name, original),
                ),
            )
        }
        case 'removeCard':
            return withTargets(
                targets.filter((target) => target.id !== action.id),
            )
        case 'changeCardEffects':
            return withTargets(
                targets.map((target) =>
                    target.id === action.id
                        ? { ...target, ...action.changes }
                        : target,
                ),
            )
        case 'setCardTier': {
            const tier = action.tier === ruleset.tier ? undefined : action.tier
            return withTargets(
                targets.map((target) =>
                    target.id === action.id ? withTier(target, tier) : target,
                ),
            )
        }
    }
}

// The state with the showing ruleset's own settings replaced
function withCurrentRuleset(
    state: PageState,
    ruleset: RulesetState,
): PageState {
    if (ruleset === currentRuleset(state)) return state
    return {
        ...state,
        rulesets: { ...state.rulesets, [state.ruleset]: ruleset },
    }
}

/**
 * The page's state after an action. It never changes the state it's given: every change returns
 * a new object, and an action that changes nothing returns the same state
 */
export function pageReducer(state: PageState, action: PageAction): PageState {
    switch (action.type) {
        case 'changeYourSettings':
            return { ...state, ...action.changes }
        case 'switchRuleset':
            return { ...state, ruleset: action.ruleset }
        case 'setSetupTier':
            return withCurrentRuleset(state, {
                ...currentRuleset(state),
                tier: action.tier,
            })
        case 'removeMissingEnemies': {
            let changed = false
            const keepAvailable = (ruleset: Ruleset): RulesetState => {
                const names = new Set(
                    action.npcs[ruleset].map((npc) => npc.name),
                )
                const saved = state.rulesets[ruleset]
                const targets = saved.targets.filter((target) =>
                    names.has(target.name),
                )
                if (targets.length === saved.targets.length) return saved
                changed = true
                return { ...saved, targets }
            }
            const rulesets = {
                original: keepAvailable('original'),
                rebake: keepAvailable('rebake'),
            }
            return changed ? { ...state, rulesets } : state
        }
        default:
            // Everything else is a card action, for the showing ruleset's cards
            return withCurrentRuleset(
                state,
                cardsReducer(currentRuleset(state), action),
            )
    }
}
