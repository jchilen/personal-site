// The odds of getting at least one drop over repeated kills, when every kill has
// the same independent chance. In statistics this is the geometric distribution.
// All chances here are fractions from 0 to 1 (5% is 0.05).

// Confidence levels shown in "Kills needed" mode
export const CONFIDENCE_MILESTONES = [0.5, 0.9, 0.95, 0.99]

// Multiples of the entered kills shown in "Chance after N" mode
const KILL_MULTIPLES = [0.5, 1, 2, 3]

/** Chance of at least one drop in `kills` tries */
export function chanceAfter(dropChance: number, kills: number) {
    // Missing every time is (1 - p) multiplied together once per kill
    return 1 - (1 - dropChance) ** kills
}

/** Fewest whole kills that give at least a `confidence` chance of a drop */
export function killsNeeded(dropChance: number, confidence: number) {
    const exact = Math.log(1 - confidence) / Math.log(1 - dropChance)
    // Subtract a hair before rounding up, so a floating-point result like
    // 2.0000000000000004 counts as 2 instead of becoming 3
    return Math.ceil(exact - 1e-9)
}

/** Kill counts at half, one, two, and three times `kills` (never below 1) */
export function killMilestones(kills: number) {
    return KILL_MULTIPLES.map((multiple) =>
        Math.max(1, Math.round(kills * multiple)),
    )
}

/** Turns a percent like 6.5 into 0.065, or null if it isn't strictly between 0 and 100 */
export function percentToFraction(percent: number) {
    if (!(percent > 0 && percent < 100)) return null
    return percent / 100
}

/** 0.9514 becomes "95.1%", with the extremes capped so they don't round to 0% or 100% */
export function formatPercent(fraction: number) {
    if (fraction >= 0.9995) return '>99.9%'
    if (fraction > 0 && fraction < 0.0005) return '<0.1%'
    return `${(fraction * 100).toFixed(1)}%`
}
