import { describe, expect, test } from 'vitest'
import { newTarget, withTier } from './settings'

describe('newTarget', () => {
    test("a new card starts with none of its own effects, following Setup's tier", () => {
        const card = newTarget('Ace')
        expect(card).toEqual({
            id: expect.any(String),
            name: 'Ace',
            cover: 'none',
            lockOn: false,
            prone: false,
            invisible: false,
        })
        expect(card).not.toHaveProperty('tier')
    })

    test('a copy takes the effects and tier, but gets its own id', () => {
        const original = withTier({ ...newTarget('Ace'), cover: 'hard' }, 2)
        const copy = newTarget(original.name, original)
        expect(copy).toEqual({ ...original, id: expect.any(String) })
        expect(copy.id).not.toBe(original.id)
    })
})

describe('withTier', () => {
    test('sets a tier of its own, or leaves the tier out entirely to follow Setup', () => {
        const card = newTarget('Ace')
        expect(withTier(card, 3)).toEqual({ ...card, tier: 3 })
        expect(withTier(withTier(card, 3), undefined)).not.toHaveProperty(
            'tier',
        )
    })
})
