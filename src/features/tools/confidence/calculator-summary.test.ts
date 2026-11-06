import { describe, expect, test } from 'vitest'
import {
    chanceSummary,
    killsNeededSummary,
    type Summary,
} from './calculator-summary'

// The milestones as they read on screen: [label, value]
function shownMilestones(summary: Summary) {
    return summary.milestones.map(({ label, value }) => [label, value])
}

describe('killsNeededSummary', () => {
    test('5% drops at 90% confidence: the answer and every milestone, as shown', () => {
        const summary = killsNeededSummary(0.05, 0.9, 90)
        expect(summary.readout).toEqual({ value: '45', unit: 'kills' })
        expect(summary.note).toBe('for at least a 90% chance.')
        expect(shownMilestones(summary)).toEqual([
            ['50% sure', '14 kills'],
            ['90% sure', '45 kills'],
            ['95% sure', '59 kills'],
            ['99% sure', '90 kills'],
        ])
    })

    test('an answer that lands exactly on a whole number is not rounded up past it', () => {
        // 3 kills at 25% each is exactly 57.8125%, but the division comes out as 3.0000000000000004
        expect(killsNeededSummary(0.25, 0.578125, 57.8125).readout?.value).toBe(
            '3',
        )
    })
})

describe('chanceSummary', () => {
    test('5% drops over 28 kills: the answer and the chance at half, 1×, 2×, and 3× the kills', () => {
        const summary = chanceSummary(0.05, 28)
        expect(summary.readout).toEqual({ value: '76.2%' })
        expect(summary.note).toBe('of at least one drop in 28 kills.')
        expect(shownMilestones(summary)).toEqual([
            ['14 kills', '51.2%'],
            ['28 kills', '76.2%'],
            ['56 kills', '94.3%'],
            ['84 kills', '98.7%'],
        ])
    })
})

test('unusable inputs give a hint instead of an answer, but kills-needed milestones only need a drop chance', () => {
    const noConfidence = killsNeededSummary(0.05, null, 0)
    expect(noConfidence.readout).toBeNull()
    expect(noConfidence.milestones).toHaveLength(4)

    expect(killsNeededSummary(null, 0.9, 90).milestones).toEqual([])
    expect(chanceSummary(0.05, 0)).toMatchObject({
        readout: null,
        milestones: [],
    })
    expect(chanceSummary(null, 28)).toMatchObject({
        readout: null,
        milestones: [],
    })
})
