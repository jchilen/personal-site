import { describe, expect, test } from 'vitest'
import type { FrameResult } from './card-results'
import {
    axisTicks,
    chartOrder,
    matchingFrames,
    placeLabels,
    tallestUnderTooltip,
    tooltipAlign,
    type ChartLabel,
} from './field-chart-layout'

// Only the name and blasts to kill matter here, so the rest of a result is left out
function result(name: string, blastsToKill: number): FrameResult {
    return { frame: { name }, blastsToKill } as FrameResult
}

const names = (results: FrameResult[]) => results.map((each) => each.frame.name)

describe('chartOrder', () => {
    test('goes from fewest blasts to kill to most, with ties in name order', () => {
        const field = [
            result('Lancaster', 2.1),
            result('Everest', 1.2),
            result('Atlas', 1.2),
            result('Pegasus', 0.7),
        ]
        expect(names(chartOrder(field))).toEqual([
            'Pegasus',
            'Atlas',
            'Everest',
            'Lancaster',
        ])
    })

    test('leaves the field it was given as it was', () => {
        const field = [result('B', 2), result('A', 1)]
        chartOrder(field)
        expect(names(field)).toEqual(['B', 'A'])
    })
})

describe('axisTicks', () => {
    test('counts up in a round step to a round top at or above the highest value', () => {
        expect(axisTicks(1.83)).toEqual([0, 0.5, 1, 1.5, 2])
        expect(axisTicks(3.4)).toEqual([0, 1, 2, 3, 4])
        expect(axisTicks(0.9)).toEqual([0, 0.25, 0.5, 0.75, 1])
        expect(axisTicks(14)).toEqual([0, 5, 10, 15])
    })

    test('a highest value that is already round is the top', () => {
        expect(axisTicks(2)).toEqual([0, 0.5, 1, 1.5, 2])
    })

    test('steps come out as clean numbers, not 0.30000000000000004', () => {
        expect(axisTicks(0.35)).toEqual([0, 0.1, 0.2, 0.3, 0.4])
    })

    test('with nothing above 0 it still draws an axis from 0 to 1', () => {
        expect(axisTicks(0)).toEqual([0, 1])
        expect(axisTicks(Number.NaN)).toEqual([0, 1])
    })
})

describe('matchingFrames', () => {
    const field = [
        result('Genghis', 1),
        result('Genghis Worden', 1),
        result('Pegasus', 1),
    ]

    test('finds every name containing the search, whatever its case', () => {
        expect(names(matchingFrames(field, 'GHIS'))).toEqual([
            'Genghis',
            'Genghis Worden',
        ])
    })

    test('ignores spaces at either end, and a blank search matches nothing', () => {
        expect(names(matchingFrames(field, '  pegasus '))).toEqual(['Pegasus'])
        expect(matchingFrames(field, '   ')).toEqual([])
    })
})

describe('placeLabels', () => {
    const label = (key: string, center: number): ChartLabel => ({
        key,
        text: key,
        center,
    })

    test('a label with room is centered over its bar, in the bottom row', () => {
        expect(placeLabels([label('Atlas', 0.5)], 600)).toEqual([
            {
                key: 'Atlas',
                text: 'Atlas',
                center: 0.5,
                row: 0,
                align: 'center',
            },
        ])
    })

    test('near an edge, a label starts or ends at its bar instead of running off the chart', () => {
        const [left, right] = placeLabels(
            [label('Pegasus', 0.01), label('Lancaster', 0.99)],
            600,
        )
        expect(left.align).toBe('start')
        expect(right.align).toBe('end')
        expect(left.row).toBe(0)
        expect(right.row).toBe(0)
    })

    test('labels that would overlap go up a row; one with room drops back to the bottom', () => {
        const placed = placeLabels(
            [
                label('Everest', 0.5),
                label('Sherman', 0.52),
                label('Tokugawa', 0.9),
            ],
            600,
        )
        expect(placed.map((each) => each.row)).toEqual([0, 1, 0])
    })

    test('labels come back in the order they were given, whatever their rows', () => {
        const placed = placeLabels(
            [label('Sherman', 0.52), label('Everest', 0.5)],
            600,
        )
        expect(placed.map((each) => each.key)).toEqual(['Sherman', 'Everest'])
        expect(placed.map((each) => each.row)).toEqual([1, 0])
    })
})

describe('tooltipAlign', () => {
    test('centered over most bars, and lined up with the bar near either edge', () => {
        expect(tooltipAlign(0.5)).toBe('center')
        expect(tooltipAlign(0.05)).toBe('start')
        expect(tooltipAlign(0.95)).toBe('end')
    })
})

describe('tallestUnderTooltip', () => {
    // 10 bars, 10px each, growing taller to the right like the sorted chart
    const values = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

    test('a centered tooltip covers the bars on both sides of its own', () => {
        // Bar 4's middle is at 45px, so a 30px tooltip covers 30–60px: bars 3 to 6
        expect(tallestUnderTooltip(values, 4, 'center', 100, 30)).toBe(7)
    })

    test('a tooltip lined up with its bar only covers the bars on its open side', () => {
        // Starting at bar 0's middle (5px), 30px reaches bar 3
        expect(tallestUnderTooltip(values, 0, 'start', 100, 30)).toBe(4)
        // Ending at bar 9's middle (95px), it reaches back to bar 6, which is shorter than bar 9
        expect(tallestUnderTooltip(values, 9, 'end', 100, 30)).toBe(10)
    })

    test("it never reaches past the chart's ends", () => {
        expect(tallestUnderTooltip(values, 1, 'center', 100, 200)).toBe(10)
    })

    test('before the chart has a width, it goes by its own bar alone', () => {
        expect(tallestUnderTooltip(values, 4, 'center', 0, 30)).toBe(5)
    })
})
