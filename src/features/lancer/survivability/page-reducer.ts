import {
    cardSettings,
    clampStat,
    DEFAULT_SETTINGS,
    MAX_CARDS,
    MAX_NAME_LENGTH,
    newCard,
    type BuildCard,
    type CardSettings,
    type PageState,
} from './settings'

/** Everything you can do on the page */
export type PageAction =
    // Adds a card for this frame at the bottom, facing the featured card's ruleset and tier
    | { type: 'addCard'; frame: string }
    // Adds a copy right after the card, with the same build, ruleset and tier
    | { type: 'duplicateCard'; id: string }
    | { type: 'removeCard'; id: string }
    // Swaps the card with the one above or below it. Moving to the top makes it the featured card
    | { type: 'moveCard'; id: string; direction: 'up' | 'down' }
    // Moves the card straight to the top
    | { type: 'featureCard'; id: string }
    | { type: 'renameCard'; id: string; name: string }
    | { type: 'changeCard'; id: string; changes: Partial<CardSettings> }
    // Starts or stops comparing this card with the featured card
    | { type: 'toggleCompare'; id: string }
    // Folds a lower card down to its top rows, or opens it again. The featured card always stays open
    | { type: 'toggleCollapse'; id: string }
    // Removes cards for frames the data no longer has
    | { type: 'removeMissingFrames'; frames: string[] }

const indexOf = (cards: BuildCard[], id: string) =>
    cards.findIndex((card) => card.id === id)

/*
 * The new card order, with the comparison kept valid. It ends if its card is gone. If its card
 * became the featured one, the two swap roles: the old featured card becomes the compared one.
 * Whichever card ends up first is featured, and the featured card is always open
 */
function withCards(state: PageState, newCards: BuildCard[]): PageState {
    const [first] = newCards
    const cards = first?.collapsed
        ? newCards.with(0, { ...first, collapsed: false })
        : newCards
    let { comparingId } = state
    if (comparingId !== null && indexOf(cards, comparingId) === -1) {
        comparingId = null
    }
    if (comparingId !== null && cards[0].id === comparingId) {
        const oldFeatured = state.cards[0]
        comparingId = indexOf(cards, oldFeatured.id) > 0 ? oldFeatured.id : null
    }
    return { cards, comparingId }
}

// The changes with each pilot stat kept to its stepper's range
function clampedChanges(changes: Partial<CardSettings>): Partial<CardSettings> {
    const clamped = { ...changes }
    for (const stat of ['hull', 'agility', 'systems'] as const) {
        const value = clamped[stat]
        if (value !== undefined) clamped[stat] = clampStat(stat, value)
    }
    return clamped
}

/**
 * The page's state after an action. It never changes the state it's given: every change returns
 * a new object, and an action that changes nothing returns the same state
 */
export function pageReducer(state: PageState, action: PageAction): PageState {
    const { cards } = state
    const full = cards.length >= MAX_CARDS

    switch (action.type) {
        case 'addCard': {
            if (full) return state
            // A new card faces the same enemies as the featured one, with an empty build
            const featured = cards.at(0)
            const settings = featured
                ? {
                      ...DEFAULT_SETTINGS,
                      ruleset: featured.ruleset,
                      tier: featured.tier,
                  }
                : DEFAULT_SETTINGS
            return withCards(state, [
                ...cards,
                newCard(action.frame, cards, settings),
            ])
        }
        case 'duplicateCard': {
            const index = indexOf(cards, action.id)
            if (index === -1 || full) return state
            const original = cards[index]
            const copy = newCard(original.frame, cards, cardSettings(original))
            return withCards(state, cards.toSpliced(index + 1, 0, copy))
        }
        case 'removeCard': {
            if (indexOf(cards, action.id) === -1) return state
            return withCards(
                state,
                cards.filter((card) => card.id !== action.id),
            )
        }
        case 'moveCard': {
            const index = indexOf(cards, action.id)
            const other = action.direction === 'up' ? index - 1 : index + 1
            if (index === -1 || other < 0 || other >= cards.length) return state
            const moved = [...cards]
            moved[index] = cards[other]
            moved[other] = cards[index]
            return withCards(state, moved)
        }
        case 'featureCard': {
            const index = indexOf(cards, action.id)
            if (index <= 0) return state
            return withCards(state, [
                cards[index],
                ...cards.toSpliced(index, 1),
            ])
        }
        case 'renameCard': {
            // A blank name keeps the old one, so a card is never left without a name
            const name = action.name.trim().slice(0, MAX_NAME_LENGTH)
            const index = indexOf(cards, action.id)
            if (index === -1 || name === '' || name === cards[index].name) {
                return state
            }
            return {
                ...state,
                cards: cards.with(index, { ...cards[index], name }),
            }
        }
        case 'changeCard': {
            const index = indexOf(cards, action.id)
            if (index === -1) return state
            const changed = {
                ...cards[index],
                ...clampedChanges(action.changes),
            }
            return { ...state, cards: cards.with(index, changed) }
        }
        case 'toggleCompare': {
            // The featured card can't be compared with itself
            if (indexOf(cards, action.id) <= 0) return state
            return {
                ...state,
                comparingId: state.comparingId === action.id ? null : action.id,
            }
        }
        case 'toggleCollapse': {
            const index = indexOf(cards, action.id)
            if (index <= 0) return state
            const card = cards[index]
            return {
                ...state,
                cards: cards.with(index, {
                    ...card,
                    collapsed: !card.collapsed,
                }),
            }
        }
        case 'removeMissingFrames': {
            const frames = new Set(action.frames)
            const kept = cards.filter((card) => frames.has(card.frame))
            return kept.length === cards.length ? state : withCards(state, kept)
        }
    }
}
