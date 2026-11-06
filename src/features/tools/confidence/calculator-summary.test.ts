import { describe, expect, test } from 'vitest'
import {
    chanceSummary,
    killsNeededSummary,
    type Summary,
} from './calculator-summary'
import { percentToFraction } from './confidence'

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

    test('chances too close to 0% or 100% to show honestly at one decimal are capped', () => {
        expect(chanceSummary(0.5, 20).readout?.value).toBe('>99.9%')
        expect(chanceSummary(0.0001, 1).readout?.value).toBe('<0.1%')
    })
})

test('typed percents of 0 or 100 give a hint instead of an answer, but kills-needed milestones only need a drop chance', () => {
    // 100% sure would take endless kills, so the calculator asks for something below it
    const certain = killsNeededSummary(
        percentToFraction(5),
        percentToFraction(100),
        100,
    )
    expect(certain.readout).toBeNull()
    expect(certain.milestones).toHaveLength(4)

    expect(
        killsNeededSummary(percentToFraction(0), percentToFraction(90), 90)
            .milestones,
    ).toEqual([])
    expect(chanceSummary(percentToFraction(5), 0)).toMatchObject({
        readout: null,
        milestones: [],
    })
    expect(chanceSummary(percentToFraction(100), 28)).toMatchObject({
        readout: null,
        milestones: [],
    })
})
