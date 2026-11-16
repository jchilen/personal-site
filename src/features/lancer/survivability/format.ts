/** Blasts to kill, to 2 decimal places */
export function blasts(value: number): string {
    return value.toFixed(2)
}

/**
 * How many more or fewer blasts a frame survives than another, worked out from the rounded numbers
 * on screen so the sentence never disagrees with them: "Survives 0.12 more blasts than Pegasus-1".
 * With a subject it names who survives: "Tank build survives 0.12 more blasts than Pegasus-1"
 */
export function survivesComparedTo(
    value: number,
    other: number,
    otherName: string,
    subject?: string,
): string {
    const survives = subject === undefined ? 'Survives' : `${subject} survives`
    const difference = Number(blasts(value)) - Number(blasts(other))
    if (Math.abs(difference) < 0.005) {
        return `${survives} as many blasts as ${otherName}`
    }
    const amount = blasts(Math.abs(difference))
    const direction = difference > 0 ? 'more' : 'fewer'
    return `${survives} ${amount} ${direction} blasts than ${otherName}`
}

/** 1st, 2nd, 3rd, 4th… 11th, 12th, 13th… 21st */
export function ordinal(n: number): string {
    const lastTwo = n % 100
    if (lastTwo >= 11 && lastTwo <= 13) return `${n}th`
    const suffix = { 1: 'st', 2: 'nd', 3: 'rd' }[n % 10] ?? 'th'
    return `${n}${suffix}`
}

const RED = 29
const GREEN = 145

/**
 * A color for a rank among `count` frames: gray in the middle of the field, turning greener toward
 * 1st and redder toward last. It uses the theme's hue lightness and chroma like hueColor, scaling the
 * chroma from 0 (gray) at the middle to full at either end, so it adjusts for dark mode too
 */
export function rankColor(rank: number, count: number): string {
    // 1 for the top rank, 0 for the bottom
    const position = count > 1 ? (count - rank) / (count - 1) : 0.5
    const strength = Math.round(Math.abs(position - 0.5) * 2 * 100) / 100
    const hue = position >= 0.5 ? GREEN : RED
    return `oklch(var(--hue-lightness) calc(var(--hue-chroma) * ${strength}) ${hue})`
}
