import { describe, expect, test } from 'vitest'
import {
    defaultFilters,
    filtersOn,
    meetsFilters,
    statRanges,
    type Filters,
} from './field-filters'
import { answerKey } from './survivability-answer-key'
import { standardFrame } from './standard-frame'
import type { Frame } from './survivability-types'

const frames = answerKey.data.frames
const average = standardFrame(frames)

function frame(overrides: Partial<Frame>): Frame {
    return { ...average, ...overrides }
}

// Every filter off, then the given ones on
function filters(on: Partial<Filters>): Filters {
    return { ...defaultFilters(average), ...on }
}

describe('defaultFilters', () => {
    test('every filter starts off, waiting at the average frame’s value', () => {
        const start = defaultFilters(average)
        expect(filtersOn(start)).toBe(0)
        expect(start.evasion).toEqual({
            comparison: 'any',
            value: average.evasion,
        })
    })

    test('with every filter off, every frame matches', () => {
        const start = defaultFilters(average)
        expect(frames.every((f) => meetsFilters(f, start))).toBe(true)
    })
})

describe('meetsFilters', () => {
    test('each comparison compares the base stat with the value', () => {
        const at = (comparison: Filters['evasion']['comparison']) =>
            filters({ evasion: { comparison, value: 10 } })
        const nine = frame({ evasion: 9 })
        const ten = frame({ evasion: 10 })
        expect(meetsFilters(ten, at('moreThan'))).toBe(false)
        expect(meetsFilters(nine, at('moreThan'))).toBe(false)
        expect(meetsFilters(frame({ evasion: 11 }), at('moreThan'))).toBe(true)
        expect(meetsFilters(ten, at('lessThan'))).toBe(false)
        expect(meetsFilters(nine, at('lessThan'))).toBe(true)
        expect(meetsFilters(ten, at('exactly'))).toBe(true)
        expect(meetsFilters(nine, at('exactly'))).toBe(false)
    })

    test('a frame has to meet every filter that’s on', () => {
        const both = filters({
            evasion: { comparison: 'moreThan', value: 9 },
            armor: { comparison: 'moreThan', value: 0 },
        })
        expect(meetsFilters(frame({ evasion: 10, armor: 1 }), both)).toBe(true)
        expect(meetsFilters(frame({ evasion: 10, armor: 0 }), both)).toBe(false)
        expect(filtersOn(both)).toBe(2)
    })
})

test('statRanges gives the lowest and highest value any frame has', () => {
    const ranges = statRanges([frame({ speed: 3 }), frame({ speed: 6 })])
    expect(ranges.speed).toEqual({ min: 3, max: 6 })
})
