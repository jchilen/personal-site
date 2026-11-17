import { expect, test } from 'vitest'
import { lowerLimitReason, upperLimitReason } from './limit-reasons'

test('a lowest value of 0 is spelled out as zero', () => {
    expect(lowerLimitReason(0)).toBe("Can't go lower than zero")
})

test('other limits are written as numbers, minus sign and all', () => {
    expect(lowerLimitReason(-5)).toBe("Can't go lower than -5")
    expect(upperLimitReason(5)).toBe("Can't go higher than 5")
    expect(upperLimitReason(0)).toBe("Can't go higher than 0")
})
