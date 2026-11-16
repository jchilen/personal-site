import { expect, test } from 'vitest'
import { restoreState, SAVE_VERSION, toSaved } from './saved-settings'
import {
    DEFAULT_SETTINGS,
    DEFAULT_STATE,
    newCard,
    type PageState,
} from './settings'

const saved = (value: unknown) =>
    restoreState(JSON.parse(JSON.stringify(value)))

test('a saved state comes back exactly as it was', () => {
    const first = newCard('Arminius', [], {
        ...DEFAULT_SETTINGS,
        hull: 4,
        cover: 'soft',
        tier: 2,
    })
    const second = {
        ...newCard('Everest', [first]),
        name: 'Tank build',
        slopedPlating: true,
    }
    const state: PageState = { cards: [first, second], comparingId: second.id }
    expect(saved(toSaved(state))).toEqual(state)
    expect(toSaved(state).version).toBe(SAVE_VERSION)
})

test('nothing saved, or something that isn’t a save, gives an empty page', () => {
    expect(restoreState(null)).toEqual(DEFAULT_STATE)
    expect(restoreState('hello')).toEqual(DEFAULT_STATE)
    expect(restoreState({ cards: 'not a list' })).toEqual(DEFAULT_STATE)
})

test('a card without a frame is dropped, without losing the others', () => {
    const state = saved({
        cards: [{ name: 'No frame' }, { frame: 'Everest', name: 'Everest-1' }],
    })
    expect(state.cards.map((card) => card.name)).toEqual(['Everest-1'])
})

test('broken settings fall back to their defaults, one at a time', () => {
    const [card] = saved({
        cards: [
            {
                frame: 'Arminius',
                name: 'Arminius-1',
                ruleset: 'homebrew',
                tier: 7,
                hull: 9,
                agility: 2.5,
                systems: 3,
                slopedPlating: 'yes',
                lessonOfDisbelief: true,
                cover: 'partial',
            },
        ],
    }).cards
    expect(card).toMatchObject({
        ruleset: 'original',
        tier: 1,
        hull: 0,
        agility: 0,
        systems: 3,
        slopedPlating: false,
        lessonOfDisbelief: true,
        cover: 'none',
    })
})

test('a missing name gets the next free default name, and a missing or repeated id gets a new one', () => {
    const state = saved({
        cards: [
            { frame: 'Arminius', id: 'a' },
            { frame: 'Arminius', id: 'a' },
        ],
    })
    expect(state.cards.map((card) => card.name)).toEqual([
        'Arminius-1',
        'Arminius-2',
    ])
    expect(state.cards[0].id).toBe('a')
    expect(state.cards[1].id).not.toBe('a')
})

test('only the first 3 cards are kept', () => {
    const state = saved({
        cards: ['A', 'B', 'C', 'D'].map((frame) => ({ frame })),
    })
    expect(state.cards.map((card) => card.frame)).toEqual(['A', 'B', 'C'])
})

test('a comparison with the featured card itself, or with a card that’s gone, is cleared', () => {
    const cards = [
        { frame: 'A', id: 'a' },
        { frame: 'B', id: 'b' },
    ]
    expect(saved({ cards, comparingId: 'b' }).comparingId).toBe('b')
    expect(saved({ cards, comparingId: 'a' }).comparingId).toBeNull()
    expect(saved({ cards, comparingId: 'gone' }).comparingId).toBeNull()
})
