import type { FrameResult } from './card-results'

/** The field from fewest blasts to kill to most, the order the chart draws it in. Ties go by name */
export function chartOrder(field: FrameResult[]): FrameResult[] {
    return field.toSorted(
        (a, b) =>
            a.blastsToKill - b.blastsToKill ||
            a.frame.name.localeCompare(b.frame.name),
    )
}

// Gaps between axis marks are one of these, times a power of 10: 0.1, 0.2, 0.25, 0.5, 1, 2…
const ROUND_STEPS = [1, 2, 2.5, 5, 10]

/**
 * The values marked on the y axis: from 0 up to a round number at or above the highest value, about
 * `count` evenly spaced steps apart. The last one is the top of the chart
 */
export function axisTicks(highest: number, count = 4): number[] {
    if (!(highest > 0)) return [0, 1]
    const rough = highest / count
    const power = 10 ** Math.floor(Math.log10(rough))
    const step =
        power * (ROUND_STEPS.find((round) => round * power >= rough) ?? 10)
    const steps = Math.ceil(highest / step - 1e-9)
    // Rounded, so 3 × 0.1 comes out as 0.3 rather than 0.30000000000000004
    return Array.from(
        { length: steps + 1 },
        (_, i) => Math.round(i * step * 1e6) / 1e6,
    )
}

/** Frames whose names contain the search, ignoring case and spaces at either end. None for a blank search */
export function matchingFrames(
    field: FrameResult[],
    query: string,
): FrameResult[] {
    const search = query.trim().toLowerCase()
    if (search === '') return []
    return field.filter((result) =>
        result.frame.name.toLowerCase().includes(search),
    )
}

/** A name to write above one bar */
export type ChartLabel = {
    key: string
    text: string
    /** Where the bar's middle is, from 0 (left edge) to 1 (right edge) */
    center: number
}

/** A label with a spot that keeps it on the chart and off the other labels */
export type PlacedLabel = ChartLabel & {
    /** 0 is the row nearest the bars; each row up is one more step away */
    row: number
    /** Centered over its bar, or lined up with it on one side when centering would run off the edge */
    align: 'start' | 'center' | 'end'
}

// About how wide each letter of a label is, and the room the swatch before it takes, in pixels.
// A guess on the generous side is fine: it only ever moves a label up a row it didn't need
const LETTER_WIDTH = 9
const SWATCH_WIDTH = 16
const LABEL_GAP = 8

/**
 * Gives each label a row, so none overlap however close their bars are. A label stays over its bar,
 * centered if it fits on the chart, otherwise starting or ending at the bar. Labels left to right
 * each take the lowest row that's clear where they sit
 */
export function placeLabels(
    labels: ChartLabel[],
    chartWidth: number,
): PlacedLabel[] {
    const spans = labels.map((label) => {
        const width = SWATCH_WIDTH + label.text.length * LETTER_WIDTH
        const middle = label.center * chartWidth
        let align: PlacedLabel['align'] = 'center'
        let left = middle - width / 2
        if (left < 0) {
            align = 'start'
            left = middle
        } else if (middle + width / 2 > chartWidth) {
            align = 'end'
            left = middle - width
        }
        return { label, align, left, right: left + width }
    })

    // Where each row's last label ends, so the next one knows if it fits
    const rowEnds: number[] = []
    const rows = new Map<ChartLabel, number>()
    for (const span of spans.toSorted((a, b) => a.left - b.left)) {
        let row = rowEnds.findIndex((end) => end + LABEL_GAP <= span.left)
        if (row === -1) row = rowEnds.length
        rowEnds[row] = span.right
        rows.set(span.label, row)
    }

    return spans.map(({ label, align }) => ({
        ...label,
        align,
        row: rows.get(label) ?? 0,
    }))
}
