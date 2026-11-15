import { describe, expect, test } from 'vitest'
import { pageReducer, type PageAction } from './page-reducer'
import {
    DEFAULT_SETTINGS,
    DEFAULT_STATE,
    newCard,
    type BuildCard,
    type PageState,
} from './settings'

// The state after a series of actions, starting from an empty page
function after(...actions: PageAction[]): PageState {
    return actions.reduce(pageReducer, DEFAULT_STATE)
}

const names = (state: PageState) => state.cards.map((card) => card.name)

// A page holding cards for these frames, top to bottom, and comparing nothing
function withFrames(...frames: string[]): PageState {
    const cards: BuildCard[] = []
    for (const frame of frames) cards.push(newCard(frame, cards))
    return { cards, comparingId: null }
}

const idOf = (state: PageState, name: string) => {
    const card = state.cards.find((card) => card.name === name)
    if (!card) throw new Error(`No card named ${name}`)
    return card.id
}

describe('addCard', () => {
    test('adds a card at the bottom, named after its frame with the first free number', () => {
        const state = after(
            { type: 'addCard', frame: 'Arminius' },
            { type: 'addCard', frame: 'Everest' },
            { type: 'addCard', frame: 'Arminius' },
        )
        expect(names(state)).toEqual(['Arminius-1', 'Everest-1', 'Arminius-2'])
    })

    test('reuses a number freed up by removing a card', () => {
        const start = withFrames('Arminius', 'Arminius')
        const removed = pageReducer(start, {
            type: 'removeCard',
            id: idOf(start, 'Arminius-1'),
        })
        const state = pageReducer(removed, {
            type: 'addCard',
            frame: 'Arminius',
        })
        expect(names(state)).toEqual(['Arminius-2', 'Arminius-1'])
    })

    test('a new card faces the featured card’s ruleset and tier, with an empty build', () => {
        const start = withFrames('Arminius')
        const featured = pageReducer(start, {
            type: 'changeCard',
            id: start.cards[0].id,
            changes: { ruleset: 'rebake', tier: 3, hull: 4, cover: 'soft' },
        })
        const added = pageReducer(featured, {
            type: 'addCard',
            frame: 'Everest',
        })
        expect(added.cards[1]).toMatchObject({
            ...DEFAULT_SETTINGS,
            ruleset: 'rebake',
            tier: 3,
        })
    })

    test('does nothing at the 3-card limit', () => {
        const full = withFrames('Arminius', 'Everest', 'Atlas')
        expect(pageReducer(full, { type: 'addCard', frame: 'Zheng' })).toBe(
            full,
        )
    })
})

describe('duplicateCard', () => {
    test('adds a copy right after the card, with its settings and the next free name', () => {
        const start = withFrames('Arminius', 'Everest')
        const built = pageReducer(start, {
            type: 'changeCard',
            id: start.cards[0].id,
            changes: { hull: 6, slopedPlating: true, tier: 2 },
        })
        const state = pageReducer(built, {
            type: 'duplicateCard',
            id: built.cards[0].id,
        })
        expect(names(state)).toEqual(['Arminius-1', 'Arminius-2', 'Everest-1'])
        expect(state.cards[1]).toMatchObject({
            hull: 6,
            slopedPlating: true,
            tier: 2,
        })
        expect(state.cards[1].id).not.toBe(state.cards[0].id)
    })

    test('does nothing at the limit or for a card that isn’t there', () => {
        const full = withFrames('Arminius', 'Everest', 'Atlas')
        expect(
            pageReducer(full, { type: 'duplicateCard', id: full.cards[0].id }),
        ).toBe(full)
        const one = withFrames('Arminius')
        expect(pageReducer(one, { type: 'duplicateCard', id: 'missing' })).toBe(
            one,
        )
    })
})

describe('moving and featuring', () => {
    const start = withFrames('Arminius', 'Everest', 'Atlas')

    test('moveCard swaps a card with its neighbor', () => {
        const up = pageReducer(start, {
            type: 'moveCard',
            id: idOf(start, 'Atlas-1'),
            direction: 'up',
        })
        expect(names(up)).toEqual(['Arminius-1', 'Atlas-1', 'Everest-1'])
        const down = pageReducer(start, {
            type: 'moveCard',
            id: idOf(start, 'Arminius-1'),
            direction: 'down',
        })
        expect(names(down)).toEqual(['Everest-1', 'Arminius-1', 'Atlas-1'])
    })

    test('moveCard does nothing past the top or bottom', () => {
        expect(
            pageReducer(start, {
                type: 'moveCard',
                id: idOf(start, 'Arminius-1'),
                direction: 'up',
            }),
        ).toBe(start)
        expect(
            pageReducer(start, {
                type: 'moveCard',
                id: idOf(start, 'Atlas-1'),
                direction: 'down',
            }),
        ).toBe(start)
    })

    test('featureCard moves a card to the top, keeping the others in order', () => {
        const state = pageReducer(start, {
            type: 'featureCard',
            id: idOf(start, 'Atlas-1'),
        })
        expect(names(state)).toEqual(['Atlas-1', 'Arminius-1', 'Everest-1'])
        expect(
            pageReducer(state, {
                type: 'featureCard',
                id: idOf(state, 'Atlas-1'),
            }),
        ).toBe(state)
    })
})

describe('comparing', () => {
    const start = withFrames('Arminius', 'Everest', 'Atlas')
    const comparing = (state: PageState) =>
        state.cards.find((card) => card.id === state.comparingId)?.name ?? null

    test('toggleCompare starts and stops comparing a card, and switching cards switches it', () => {
        const on = pageReducer(start, {
            type: 'toggleCompare',
            id: idOf(start, 'Everest-1'),
        })
        expect(comparing(on)).toBe('Everest-1')
        const other = pageReducer(on, {
            type: 'toggleCompare',
            id: idOf(on, 'Atlas-1'),
        })
        expect(comparing(other)).toBe('Atlas-1')
        expect(
            pageReducer(other, {
                type: 'toggleCompare',
                id: idOf(other, 'Atlas-1'),
            }).comparingId,
        ).toBeNull()
    })

    test('the featured card can’t be compared with itself', () => {
        expect(
            pageReducer(start, {
                type: 'toggleCompare',
                id: idOf(start, 'Arminius-1'),
            }),
        ).toBe(start)
    })

    test('featuring the compared card swaps roles: the old featured card becomes the compared one', () => {
        const on = pageReducer(start, {
            type: 'toggleCompare',
            id: idOf(start, 'Atlas-1'),
        })
        const state = pageReducer(on, {
            type: 'featureCard',
            id: idOf(on, 'Atlas-1'),
        })
        expect(names(state)[0]).toBe('Atlas-1')
        expect(comparing(state)).toBe('Arminius-1')
    })

    test('moving the compared card to the top swaps roles too', () => {
        const on = pageReducer(start, {
            type: 'toggleCompare',
            id: idOf(start, 'Everest-1'),
        })
        const state = pageReducer(on, {
            type: 'moveCard',
            id: idOf(on, 'Everest-1'),
            direction: 'up',
        })
        expect(comparing(state)).toBe('Arminius-1')
    })

    test('reordering that doesn’t touch the top keeps the comparison as it was', () => {
        const on = pageReducer(start, {
            type: 'toggleCompare',
            id: idOf(start, 'Everest-1'),
        })
        const state = pageReducer(on, {
            type: 'moveCard',
            id: idOf(on, 'Atlas-1'),
            direction: 'up',
        })
        expect(comparing(state)).toBe('Everest-1')
    })

    test('removing the compared card ends the comparison', () => {
        const on = pageReducer(start, {
            type: 'toggleCompare',
            id: idOf(start, 'Everest-1'),
        })
        expect(
            pageReducer(on, { type: 'removeCard', id: idOf(on, 'Everest-1') })
                .comparingId,
        ).toBeNull()
    })

    test('removing the featured card ends the comparison when the compared card takes its place', () => {
        const on = pageReducer(start, {
            type: 'toggleCompare',
            id: idOf(start, 'Everest-1'),
        })
        const state = pageReducer(on, {
            type: 'removeCard',
            id: idOf(on, 'Arminius-1'),
        })
        expect(names(state)[0]).toBe('Everest-1')
        expect(state.comparingId).toBeNull()
    })

    test('removing the featured card keeps a comparison with a card further down', () => {
        const on = pageReducer(start, {
            type: 'toggleCompare',
            id: idOf(start, 'Atlas-1'),
        })
        const state = pageReducer(on, {
            type: 'removeCard',
            id: idOf(on, 'Arminius-1'),
        })
        expect(comparing(state)).toBe('Atlas-1')
    })
})

describe('renameCard', () => {
    const start = withFrames('Arminius')
    const id = start.cards[0].id

    test('renames the card, trimming spaces and capping the length at 40', () => {
        expect(
            names(
                pageReducer(start, {
                    type: 'renameCard',
                    id,
                    name: '  Tank build ',
                }),
            ),
        ).toEqual(['Tank build'])
        expect(
            pageReducer(start, { type: 'renameCard', id, name: 'x'.repeat(60) })
                .cards[0].name,
        ).toHaveLength(40)
    })

    test('a blank name keeps the old one', () => {
        expect(
            pageReducer(start, { type: 'renameCard', id, name: '   ' }),
        ).toBe(start)
    })

    test('a renamed card frees its default name for the next new card', () => {
        const renamed = pageReducer(start, {
            type: 'renameCard',
            id,
            name: 'Tank build',
        })
        expect(
            names(pageReducer(renamed, { type: 'addCard', frame: 'Arminius' })),
        ).toEqual(['Tank build', 'Arminius-1'])
    })
})

describe('changeCard', () => {
    const start = withFrames('Arminius', 'Everest')

    test('changes only that card', () => {
        const state = pageReducer(start, {
            type: 'changeCard',
            id: start.cards[1].id,
            changes: { agility: 3, fullSubjectivitySync: true },
        })
        expect(state.cards[1]).toMatchObject({
            agility: 3,
            fullSubjectivitySync: true,
        })
        expect(state.cards[0]).toBe(start.cards[0])
    })

    test('keeps HULL, AGI and SYS between 0 and 6, in whole numbers', () => {
        const state = pageReducer(start, {
            type: 'changeCard',
            id: start.cards[0].id,
            changes: { hull: 9, agility: -2, systems: 2.6 },
        })
        expect(state.cards[0]).toMatchObject({
            hull: 6,
            agility: 0,
            systems: 3,
        })
    })
})

test('removeMissingFrames drops cards for frames the data no longer has', () => {
    const start = withFrames('Arminius', 'Old Frame', 'Everest')
    const state = pageReducer(start, {
        type: 'removeMissingFrames',
        frames: ['Arminius', 'Everest'],
    })
    expect(names(state)).toEqual(['Arminius-1', 'Everest-1'])
    expect(
        pageReducer(state, {
            type: 'removeMissingFrames',
            frames: ['Arminius', 'Everest'],
        }),
    ).toBe(state)
})

test('the reducer never changes the state it’s given', () => {
    const start = withFrames('Arminius', 'Everest')
    const snapshot = structuredClone(start)
    pageReducer(start, {
        type: 'changeCard',
        id: start.cards[0].id,
        changes: { hull: 4 },
    })
    pageReducer(start, {
        type: 'moveCard',
        id: start.cards[1].id,
        direction: 'up',
    })
    pageReducer(start, {
        type: 'renameCard',
        id: start.cards[0].id,
        name: 'New name',
    })
    expect(start).toEqual(snapshot)
})