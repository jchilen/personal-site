import { expect, test } from 'vitest'
import { changesLayout } from './layout-actions'

test('adding, removing, reordering, and comparing cards glide into place', () => {
    expect(changesLayout({ type: 'addCard', frame: 'Arminius' })).toBe(true)
    expect(changesLayout({ type: 'duplicateCard', id: 'a' })).toBe(true)
    expect(changesLayout({ type: 'removeCard', id: 'a' })).toBe(true)
    expect(changesLayout({ type: 'moveCard', id: 'a', direction: 'up' })).toBe(
        true,
    )
    expect(changesLayout({ type: 'featureCard', id: 'a' })).toBe(true)
    expect(changesLayout({ type: 'toggleCompare', id: 'a' })).toBe(true)
})

test('renaming, changing a build, and clearing missing frames on load apply instantly', () => {
    expect(changesLayout({ type: 'removeMissingFrames', frames: [] })).toBe(
        false,
    )
    expect(changesLayout({ type: 'renameCard', id: 'a', name: 'New' })).toBe(
        false,
    )
    expect(
        changesLayout({ type: 'changeCard', id: 'a', changes: { hull: 4 } }),
    ).toBe(false)
})