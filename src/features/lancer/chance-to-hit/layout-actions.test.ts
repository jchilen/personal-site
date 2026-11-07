import { describe, expect, test } from 'vitest'
import { changesLayout } from './layout-actions'

describe('changesLayout', () => {
    test('adding, copying and removing cards changes the layout', () => {
        expect(changesLayout({ type: 'toggleEnemy', name: 'Assault' })).toBe(
            true,
        )
        expect(changesLayout({ type: 'duplicateCard', id: 'a' })).toBe(true)
        expect(changesLayout({ type: 'removeCard', id: 'a' })).toBe(true)
    })

    test('switching NPC type changes the layout', () => {
        expect(
            changesLayout({ type: 'switchRuleset', ruleset: 'rebake' }),
        ).toBe(true)
    })

    test('only the attack type changes the layout among your settings', () => {
        expect(
            changesLayout({
                type: 'changeYourSettings',
                changes: { attackType: 'tech' },
            }),
        ).toBe(true)
        expect(
            changesLayout({
                type: 'changeYourSettings',
                changes: { licenseLevel: 4 },
            }),
        ).toBe(false)
    })

    test("only Invisible changes the layout among a card's effects", () => {
        expect(
            changesLayout({
                type: 'changeCardEffects',
                id: 'a',
                changes: { invisible: true },
            }),
        ).toBe(true)
        expect(
            changesLayout({
                type: 'changeCardEffects',
                id: 'a',
                changes: { cover: 'hard' },
            }),
        ).toBe(false)
    })

    test('tier changes leave the layout alone', () => {
        expect(changesLayout({ type: 'setCardTier', id: 'a', tier: 2 })).toBe(
            false,
        )
        expect(changesLayout({ type: 'setSetupTier', tier: 3 })).toBe(false)
    })
})
