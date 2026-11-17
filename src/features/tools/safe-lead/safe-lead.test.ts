import { describe, expect, test } from 'vitest'
import { calculateSafeLead, gameClock, safeAtText } from './safe-lead'

describe('calculateSafeLead', () => {
    test('up 10 with the ball: safe with 56 seconds left, not with 57', () => {
        // (10 − 3 + 0.5)² = 56.25 seconds the lead holds for
        expect(calculateSafeLead(10, 'leading', 56)).toEqual({
            rawValue: 7.5,
            clampedValue: 7.5,
            threshold: 56.25,
            isSafe: true,
            safePercent: 100.44,
        })
        expect(calculateSafeLead(10, 'leading', 57)).toMatchObject({
            isSafe: false,
            safePercent: 98.68,
        })
    })

    test("the trailing team's ball takes half a point off, and a negative value counts as 0", () => {
        // (10 − 3 − 0.5)² = 42.25
        expect(calculateSafeLead(10, 'trailing', 42).threshold).toBe(42.25)
        // 2 − 3 − 0.5 is below 0, so it becomes 0, and 0 seconds of safety is never enough
        expect(calculateSafeLead(2, 'trailing', 1)).toEqual({
            rawValue: -1.5,
            clampedValue: 0,
            threshold: 0,
            isSafe: false,
            safePercent: 0,
        })
    })
})

describe('gameClock', () => {
    test('writes seconds the way the scoreboard does', () => {
        expect(gameClock(83)).toBe('1:23')
        expect(gameClock(60)).toBe('1:00')
        expect(gameClock(5)).toBe('0:05')
        expect(gameClock(2400)).toBe('40:00')
    })
})

describe('safeAtText', () => {
    // Up 10 with the ball: the lead holds for 56.25 seconds, so it's safe from 56 seconds left
    test('says when the lead becomes safe, or when it became safe', () => {
        expect(safeAtText(56.25, 120, 2400)).toBe('Becomes safe with 0:56 left')
        expect(safeAtText(56.25, 40, 2400)).toBe('Became safe with 0:56 left')
    })

    test('a threshold of exactly 56 seconds is only safe from 55, since safe means fewer than', () => {
        expect(safeAtText(56, 120, 2400)).toBe('Becomes safe with 0:55 left')
    })

    test('a lead bigger than a whole game is safe from the start', () => {
        expect(safeAtText(2500, 2400, 2400)).toBe('Safe for a whole game!')
    })

    test('a lead too small to ever be safe is only safe at the final buzzer', () => {
        expect(safeAtText(0, 120, 2400)).toBe('Only safe at the final buzzer')
        expect(safeAtText(0.25, 120, 2400)).toBe(
            'Only safe at the final buzzer',
        )
    })
})
