import { describe, expect, test } from 'vitest'
import { restoreState, SAVE_VERSION, toSaved } from './saved-settings'
import { DEFAULT_STATE, type PageState, type Target } from './settings'

const ACE_CARD: Target = {
    id: 'a',
    name: 'Ace',
    cover: 'none',
    lockOn: false,
    prone: false,
    invisible: false,
}

// A version 3 save holding these rulesets, and nothing else
function savedWith(rulesets: unknown) {
    return { version: 3, rulesets }
}

describe('restoreState', () => {
    test('nothing saved, or a save that isn’t an object: the defaults', () => {
        expect(restoreState(null)).toEqual(DEFAULT_STATE)
        expect(restoreState('hello')).toEqual(DEFAULT_STATE)
        expect(restoreState(42)).toEqual(DEFAULT_STATE)
    })

    test('a complete, current save comes back exactly, without its version number', () => {
        const state: PageState = {
            ...DEFAULT_STATE,
            attackType: 'tech',
            ruleset: 'rebake',
            licenseLevel: 7,
            frameTechAttack: -2,
            systems: 4,
            impaired: true,
            rulesets: {
                original: {
                    tier: 2,
                    targets: [{ ...ACE_CARD, cover: 'soft', lockOn: true }],
                },
                rebake: {
                    tier: 3,
                    targets: [
                        { ...ACE_CARD, id: 'b', name: 'Sniper', prone: true },
                        {
                            ...ACE_CARD,
                            id: 'c',
                            name: 'Sniper',
                            cover: 'hard',
                            tier: 1,
                        },
                    ],
                },
            },
        }
        expect(restoreState(toSaved(state))).toEqual(state)
        expect(toSaved(state).version).toBe(SAVE_VERSION)
    })

    test('one bad value resets only itself', () => {
        const restored = restoreState({
            ...toSaved(DEFAULT_STATE),
            licenseLevel: 40,
            impaired: true,
            rulesets: {
                original: { tier: 2, targets: [] },
                rebake: { tier: 'T9', targets: [] },
            },
        })
        expect(restored.licenseLevel).toBe(DEFAULT_STATE.licenseLevel)
        expect(restored.impaired).toBe(true)
        expect(restored.rulesets.original.tier).toBe(2)
        expect(restored.rulesets.rebake.tier).toBe(1)
    })

    test('wrong types and unknown options fall back to the defaults', () => {
        const restored = restoreState({
            version: 3,
            attackType: 'laser',
            ruleset: 'both',
            systems: 2.5,
            impaired: 'yes',
            rulesets: { original: 'none', rebake: 7 },
        })
        expect(restored).toEqual(DEFAULT_STATE)
    })

    test('cards: broken entries are dropped, and each ruleset keeps at most 3, copies included', () => {
        const restored = restoreState(
            savedWith({
                original: {
                    tier: 1,
                    targets: [
                        { id: 'a', name: 'Ace' },
                        'not an enemy',
                        { id: 'x', name: '' },
                        { id: 'b', name: 'Ace' },
                        { id: 'c', name: 'Hive' },
                        { id: 'd', name: 'Witch' },
                    ],
                },
                rebake: {
                    tier: 1,
                    targets: [
                        { id: 'e', name: 'Ace' },
                        { id: 'f', name: 'Hive' },
                        { id: 'g', name: 'Witch' },
                    ],
                },
            }),
        )
        expect(
            restored.rulesets.original.targets.map((target) => target.name),
        ).toEqual(['Ace', 'Ace', 'Hive'])
        expect(restored.rulesets.rebake.targets).toHaveLength(3)
    })

    test('two cards sharing an id: the later one gets a new id', () => {
        const restored = restoreState(
            savedWith({
                original: {
                    tier: 1,
                    targets: [
                        { id: 'same', name: 'Ace' },
                        { id: 'same', name: 'Hive' },
                    ],
                },
            }),
        )
        const [first, second] = restored.rulesets.original.targets
        expect(first.id).toBe('same')
        expect(second.id).not.toBe('same')
    })

    test("a card's broken effects fall back to none and off, a broken tier means it follows Setup, and a missing id is made up", () => {
        const restored = restoreState(
            savedWith({
                original: {
                    tier: 1,
                    targets: [
                        {
                            name: 'Ace',
                            cover: 'diagonal',
                            lockOn: 'yes',
                            tier: 9,
                        },
                    ],
                },
            }),
        )
        const [card] = restored.rulesets.original.targets
        expect(card).toEqual({ ...ACE_CARD, id: expect.any(String) })
        expect(card).not.toHaveProperty('tier')
    })
})

describe('older saves', () => {
    test('version 2: its tier and cards go to the ruleset that was showing', () => {
        const restored = restoreState({
            ruleset: 'rebake',
            tier: 2,
            targets: [{ id: 'a', name: 'Ace' }],
        })
        expect(restored.rulesets).toEqual({
            original: { tier: 2, targets: [] },
            rebake: { tier: 2, targets: [ACE_CARD] },
        })
    })

    test('version 2 with no cards: keeps the settings it has', () => {
        expect(restoreState({ licenseLevel: 4 })).toEqual({
            ...DEFAULT_STATE,
            licenseLevel: 4,
        })
    })

    test("version 1: the featured NPC becomes one card with its effects, following Setup's tier", () => {
        const restored = restoreState({
            featured: 'Ace',
            tier: 2,
            cover: 'hard',
            lockOn: true,
        })
        // The save's tier was Setup's, so it becomes the ruleset's tier, not the card's own
        expect(restored.rulesets.original).toEqual({
            tier: 2,
            targets: [
                {
                    ...ACE_CARD,
                    id: expect.any(String),
                    cover: 'hard',
                    lockOn: true,
                },
            ],
        })
        expect(restored.rulesets.original.targets[0]).not.toHaveProperty('tier')
        expect(restored).not.toHaveProperty('featured')
    })
})
