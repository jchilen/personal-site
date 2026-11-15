import { describe, expect, test } from 'vitest'
import { blasts, ordinal, rankColor, survivesComparedTo } from './format'

test('blasts to kill shows 2 decimal places', () => {
    expect(blasts(0.9547)).toBe('0.95')
    expect(blasts(1.2)).toBe('1.20')
})

describe('survivesComparedTo', () => {
    test('says how many more or fewer blasts, from the rounded numbers', () => {
        expect(survivesComparedTo(1.08, 0.96, 'the standard frame')).toBe(
            'Survives 0.12 more blasts than the standard frame',
        )
        expect(survivesComparedTo(0.712, 0.955, 'Arminius-1')).toBe(
            'Survives 0.24 fewer blasts than Arminius-1',
        )
    })

    test('numbers that look the same on screen survive as many blasts', () => {
        expect(survivesComparedTo(0.9541, 0.9549, 'the standard frame')).toBe(
            'Survives as many blasts as the standard frame',
        )
    })
})

test.each([
    [1, '1st'],
    [2, '2nd'],
    [3, '3rd'],
    [4, '4th'],
    [11, '11th'],
    [12, '12th'],
    [13, '13th'],
    [21, '21st'],
    [22, '22nd'],
    [63, '63rd'],
])('ordinal(%d) is %s', (n, expected) => {
    expect(ordinal(n)).toBe(expected)
})

describe('rankColor', () => {
    test('1st is fully green and last is fully red', () => {
        expect(rankColor(1, 63)).toBe(
            'oklch(var(--hue-lightness) calc(var(--hue-chroma) * 1) 145)',
        )
        expect(rankColor(63, 63)).toBe(
            'oklch(var(--hue-lightness) calc(var(--hue-chroma) * 1) 29)',
        )
    })

    test('the middle of the field is gray, with no color at all', () => {
        expect(rankColor(32, 63)).toContain('* 0)')
    })

    test('color grows steadily from the middle out', () => {
        expect(rankColor(16, 63)).toContain('* 0.52) 145')
        expect(rankColor(48, 63)).toContain('* 0.52) 29')
    })
})