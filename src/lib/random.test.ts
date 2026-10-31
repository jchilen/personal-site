import { describe, expect, test } from 'vitest'
import { seededRandom, shuffle } from './random'

const ITEMS = ['A', 'B', 'C', 'D', 'E']

describe('shuffle', () => {
    test('keeps every item exactly once, and leaves the original list alone', () => {
        const shuffled = shuffle(ITEMS)
        expect([...shuffled].sort()).toEqual(ITEMS)
        expect(ITEMS).toEqual(['A', 'B', 'C', 'D', 'E'])
    })

    test('follows the random function it is given', () => {
        // Always picking position 0 rotates the first item to the end
        expect(shuffle(ITEMS, () => 0)).toEqual(['B', 'C', 'D', 'E', 'A'])
    })

    test('the same seed gives the same order', () => {
        expect(shuffle(ITEMS, seededRandom(42))).toEqual(
            shuffle(ITEMS, seededRandom(42)),
        )
    })
})
