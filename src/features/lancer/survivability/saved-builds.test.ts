import { describe, expect, test } from 'vitest'
import { pageReducer } from './page-reducer'
import {
    canSave,
    deleteSave,
    MAX_SAVED_BUILDS,
    nameTaken,
    renameSave,
    restoreSaves,
    saveCard,
    toStoredSaves,
    type SavedBuild,
} from './saved-builds'
import {
    DEFAULT_SETTINGS,
    MAX_CARDS,
    MAX_NAME_LENGTH,
    newCard,
    type BuildCard,
    type PageState,
} from './settings'

const card = (name: string, changes: Partial<BuildCard> = {}): BuildCard => ({
    ...newCard('Everest', []),
    name,
    ...changes,
})

const save = (name: string, savedAt = 0): SavedBuild => ({
    ...DEFAULT_SETTINGS,
    id: `id-${name}`,
    name,
    frame: 'Everest',
    savedAt,
})

// Ten saves, the oldest first
const fullSaves = Array.from({ length: MAX_SAVED_BUILDS }, (_, i) =>
    save(`Build ${i}`, i + 1),
)

describe('saveCard', () => {
    test('a new name adds a save at the end, with the card’s frame and settings', () => {
        const saves = saveCard([save('Old', 1)], card('Tank', { hull: 4 }), 2)
        expect(saves.map((s) => s.name)).toEqual(['Old', 'Tank'])
        expect(saves[1]).toMatchObject({
            frame: 'Everest',
            hull: 4,
            savedAt: 2,
        })
    })

    test('saving a card with the same name updates that save, keeping its id, and moves it to the end', () => {
        const saves = [save('Tank', 1), save('Other', 2)]
        const updated = saveCard(saves, card('Tank', { agility: 6 }), 3)
        expect(updated).toHaveLength(2)
        expect(updated[1]).toMatchObject({
            id: 'id-Tank',
            name: 'Tank',
            agility: 6,
            savedAt: 3,
        })
    })

    test('names match whatever their capitals, since cards show them in all capitals', () => {
        const updated = saveCard([save('Tank')], card('TANK'), 1)
        expect(updated).toHaveLength(1)
        expect(updated[0]).toMatchObject({ id: 'id-Tank', name: 'TANK' })
    })

    test('at the limit, a new name is refused but an existing save can still be updated', () => {
        expect(canSave(fullSaves, 'New')).toBe(false)
        expect(saveCard(fullSaves, card('New'), 99)).toBe(fullSaves)
        expect(canSave(fullSaves, 'Build 3')).toBe(true)
        expect(saveCard(fullSaves, card('Build 3'), 99).at(-1)?.name).toBe(
            'Build 3',
        )
    })
})

describe('renameSave', () => {
    const saves = [save('Tank'), save('Dodge')]

    test('renames a save, trimming spaces and capping the length at the limit', () => {
        expect(renameSave(saves, 'id-Tank', '  Wall  ')[0].name).toBe('Wall')
        expect(renameSave(saves, 'id-Tank', 'x'.repeat(50))[0].name).toBe(
            'x'.repeat(MAX_NAME_LENGTH),
        )
    })

    test('a blank name, or one another save has, changes nothing', () => {
        expect(renameSave(saves, 'id-Tank', '   ')).toBe(saves)
        expect(nameTaken(saves, 'id-Tank', 'dodge')).toBe(true)
        expect(renameSave(saves, 'id-Tank', 'dodge')).toBe(saves)
    })

    test('a save can change the capitals of its own name', () => {
        expect(nameTaken(saves, 'id-Tank', 'TANK')).toBe(false)
        expect(renameSave(saves, 'id-Tank', 'TANK')[0].name).toBe('TANK')
    })
})

test('deleteSave removes only that save', () => {
    const saves = [save('Tank'), save('Dodge')]
    expect(deleteSave(saves, 'id-Tank')).toEqual([save('Dodge')])
})

describe('restoreSaves', () => {
    test('what was stored comes back the same', () => {
        const saves = [save('Dodge', 1), save('Tank', 2)]
        expect(restoreSaves(toStoredSaves(saves))).toEqual(saves)
    })

    test('nothing usable stored gives no saves', () => {
        expect(restoreSaves(null)).toEqual([])
        expect(restoreSaves({ saves: 'oops' })).toEqual([])
    })

    test('a save without a frame or a name is dropped, and so is a second save with a name already used', () => {
        const restored = restoreSaves({
            saves: [
                save('Tank', 3),
                { ...save('No frame'), frame: '' },
                { ...save(''), name: '   ' },
                { ...save('tank', 1), id: 'other' },
            ],
        })
        expect(restored.map((s) => s.name)).toEqual(['Tank'])
    })

    test('broken settings fall back to their defaults, and a missing id gets a new one', () => {
        const [restored] = restoreSaves({
            saves: [{ name: 'Tank', frame: 'Everest', hull: 99, tier: 7 }],
        })
        expect(restored).toMatchObject({
            ...DEFAULT_SETTINGS,
            name: 'Tank',
            savedAt: 0,
        })
        expect(restored.id).not.toBe('')
    })

    test('saves come back oldest first, and past the limit the oldest is dropped', () => {
        const stored = [...fullSaves, save('Newest', 100)].toReversed()
        const restored = restoreSaves({ saves: stored })
        expect(restored).toHaveLength(MAX_SAVED_BUILDS)
        expect(restored[0].name).toBe('Build 1')
        expect(restored.at(-1)?.name).toBe('Newest')
    })
})

describe('loadBuild', () => {
    test('adds a card at the bottom with the saved frame, name, and settings', () => {
        const state: PageState = {
            cards: [card('Everest-1')],
            comparingId: null,
        }
        const build = { ...save('Tank'), frame: 'Lancaster', hull: 4 }
        const next = pageReducer(state, { type: 'loadBuild', build })
        expect(next.cards).toHaveLength(2)
        expect(next.cards[1]).toMatchObject({
            frame: 'Lancaster',
            name: 'Tank',
            hull: 4,
            collapsed: false,
        })
        expect(next.cards[1].id).not.toBe('id-Tank')
    })

    test('does nothing when all the card slots are taken', () => {
        const state: PageState = {
            cards: Array.from({ length: MAX_CARDS }, (_, i) => card(`C${i}`)),
            comparingId: null,
        }
        expect(
            pageReducer(state, { type: 'loadBuild', build: save('Tank') }),
        ).toBe(state)
    })
})
