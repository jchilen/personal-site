import { expect, test } from 'vitest'
import { neighborAfterRemoval } from './focus'

test('focus moves to the next item, the previous one if the last was removed, or nowhere', () => {
    const items = ['a', 'b', 'c']
    expect(neighborAfterRemoval(items, 0)).toBe('b')
    expect(neighborAfterRemoval(items, 1)).toBe('c')
    expect(neighborAfterRemoval(items, 2)).toBe('b')
    expect(neighborAfterRemoval(['a'], 0)).toBeUndefined()
})
