import { describe, expect, test } from 'vitest'
import { calculateSafeLead } from './safe-lead'

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
