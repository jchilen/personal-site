import { describe, expect, test } from 'vitest'
import type { LancerNpc } from './npc-types'
import { pageReducer, type PageAction } from './page-reducer'
import {
    DEFAULT_STATE,
    currentRuleset,
    newTarget,
    withTier,
    type PageState,
    type Target,
} from './settings'

// The page with Original showing at Setup's T1, holding these cards
function withCards(...targets: Target[]): PageState {
    return {
        ...DEFAULT_STATE,
        rulesets: {
            ...DEFAULT_STATE.rulesets,
            original: { tier: 1, targets },
        },
    }
}

// The showing ruleset's cards after a series of actions
function cardsAfter(state: PageState, ...actions: PageAction[]): Target[] {
    return currentRuleset(actions.reduce(pageReducer, state)).targets
}

const names = (targets: Target[]) => targets.map((target) => target.name)

describe('toggleEnemy', () => {
    test('adds a new card for an enemy without one', () => {
        expect(
            names(
                cardsAfter(DEFAULT_STATE, { type: 'toggleEnemy', name: 'Ace' }),
            ),
        ).toEqual(['Ace'])
    })

    test('removes every card for an enemy that has some, copies included', () => {
        const ace = newTarget('Ace')
        const state = withCards(ace, newTarget('Hive'), newTarget('Ace', ace))
        expect(
            names(cardsAfter(state, { type: 'toggleEnemy', name: 'Ace' })),
        ).toEqual(['Hive'])
    })

    test('does nothing at the card limit', () => {
        const state = withCards(
            newTarget('Ace'),
            newTarget('Hive'),
            newTarget('Witch'),
        )
        expect(
            pageReducer(state, { type: 'toggleEnemy', name: 'Sniper' }),
        ).toBe(state)
    })
})

describe('duplicateCard', () => {
    test('adds a copy right after the original, with its effects and tier, and its own id', () => {
        const ace = withTier({ ...newTarget('Ace'), lockOn: true }, 3)
        const state = withCards(ace, newTarget('Hive'))
        const [original, copy, hive] = cardsAfter(state, {
            type: 'duplicateCard',
            id: ace.id,
        })
        expect(original).toBe(ace)
        expect(copy).toEqual({ ...ace, id: expect.any(String) })
        expect(copy.id).not.toBe(ace.id)
        expect(hive.name).toBe('Hive')
    })

    test('does nothing at the card limit', () => {
        const ace = newTarget('Ace')
        const state = withCards(ace, newTarget('Hive'), newTarget('Witch'))
        expect(pageReducer(state, { type: 'duplicateCard', id: ace.id })).toBe(
            state,
        )
    })
})

test('removeCard removes only that card, leaving its copies', () => {
    const ace = newTarget('Ace')
    const copy = newTarget('Ace', ace)
    expect(
        cardsAfter(withCards(ace, copy), { type: 'removeCard', id: ace.id }),
    ).toEqual([copy])
})

test("changeCardEffects changes only that card's effects", () => {
    const ace = newTarget('Ace')
    const hive = newTarget('Hive')
    expect(
        cardsAfter(withCards(ace, hive), {
            type: 'changeCardEffects',
            id: ace.id,
            changes: { cover: 'soft', prone: true },
        }),
    ).toEqual([{ ...ace, cover: 'soft', prone: true }, hive])
})

describe('setCardTier', () => {
    test("gives the card a tier of its own, different from Setup's", () => {
        const ace = newTarget('Ace')
        const [card] = cardsAfter(withCards(ace), {
            type: 'setCardTier',
            id: ace.id,
            tier: 3,
        })
        expect(card.tier).toBe(3)
    })

    test("picking Setup's tier clears the card's own, so it follows Setup again", () => {
        const ace = withTier(newTarget('Ace'), 3)
        const [card] = cardsAfter(
            withCards(ace),
            { type: 'setCardTier', id: ace.id, tier: 1 },
            { type: 'setSetupTier', tier: 2 },
        )
        expect(card).not.toHaveProperty('tier')
    })
})

test("setSetupTier changes only the showing ruleset's tier, and cards keep their own", () => {
    const ace = withTier(newTarget('Ace'), 3)
    const state = pageReducer(withCards(ace), { type: 'setSetupTier', tier: 2 })
    expect(state.rulesets.original).toEqual({ tier: 2, targets: [ace] })
    expect(state.rulesets.rebake).toBe(DEFAULT_STATE.rulesets.rebake)
})

test('switchRuleset swaps to that ruleset’s own tier and cards, and back again', () => {
    const ace = newTarget('Ace')
    const original = withCards(ace)
    const rebake = pageReducer(original, {
        type: 'switchRuleset',
        ruleset: 'rebake',
    })
    expect(currentRuleset(rebake)).toBe(DEFAULT_STATE.rulesets.rebake)
    expect(
        currentRuleset(
            pageReducer(rebake, { type: 'switchRuleset', ruleset: 'original' }),
        ),
    ).toEqual({ tier: 1, targets: [ace] })
})

test('changeYourSettings changes only the given settings', () => {
    const state = pageReducer(DEFAULT_STATE, {
        type: 'changeYourSettings',
        changes: { licenseLevel: 6, impaired: true },
    })
    expect(state).toEqual({ ...DEFAULT_STATE, licenseLevel: 6, impaired: true })
})

describe('removeMissingEnemies', () => {
    const npc = (name: string): LancerNpc => ({
        name,
        role: 'Striker',
        evasion: [8, 8, 8],
        eDefense: [8, 8, 8],
    })

    test('removes cards for enemies the list no longer has, in both rulesets', () => {
        const ace = newTarget('Ace')
        const gone = newTarget('Retired')
        const state: PageState = {
            ...DEFAULT_STATE,
            rulesets: {
                original: { tier: 1, targets: [ace, gone] },
                rebake: { tier: 2, targets: [gone] },
            },
        }
        const after = pageReducer(state, {
            type: 'removeMissingEnemies',
            npcs: { original: [npc('Ace')], rebake: [npc('Ace')] },
        })
        expect(after.rulesets).toEqual({
            original: { tier: 1, targets: [ace] },
            rebake: { tier: 2, targets: [] },
        })
    })

    test('returns the same state when nothing is missing', () => {
        const state = withCards(newTarget('Ace'))
        expect(
            pageReducer(state, {
                type: 'removeMissingEnemies',
                npcs: { original: [npc('Ace')], rebake: [] },
            }),
        ).toBe(state)
    })
})

test('never changes the state it was given', () => {
    const ace = newTarget('Ace')
    const state = withCards(ace)
    const before = structuredClone(state)
    const actions: PageAction[] = [
        { type: 'toggleEnemy', name: 'Hive' },
        { type: 'duplicateCard', id: ace.id },
        { type: 'changeCardEffects', id: ace.id, changes: { lockOn: true } },
        { type: 'setCardTier', id: ace.id, tier: 3 },
        { type: 'removeCard', id: ace.id },
        { type: 'setSetupTier', tier: 2 },
        { type: 'switchRuleset', ruleset: 'rebake' },
        { type: 'changeYourSettings', changes: { licenseLevel: 4 } },
    ]
    for (const action of actions) pageReducer(state, action)
    expect(state).toEqual(before)
})
