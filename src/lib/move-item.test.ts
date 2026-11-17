import { expect, test } from 'vitest'
import { moveItem } from './move-item'

const list = ['a', 'b', 'c']

test('up swaps an item with the one above it', () => {
    expect(moveItem(list, 1, 'up')).toEqual(['b', 'a', 'c'])
})

test('down swaps an item with the one below it', () => {
    expect(moveItem(list, 1, 'down')).toEqual(['a', 'c', 'b'])
})

test("the list isn't changed in place", () => {
    moveItem(list, 0, 'down')
    expect(list).toEqual(['a', 'b', 'c'])
})

test('nowhere to move gives back the same list', () => {
    expect(moveItem(list, 0, 'up')).toBe(list)
    expect(moveItem(list, 2, 'down')).toBe(list)
    expect(moveItem(list, 5, 'up')).toBe(list)
})
