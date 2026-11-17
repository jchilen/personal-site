export const POSSESSIONS = ['leading', 'trailing'] as const
export type Possession = (typeof POSSESSIONS)[number]

export type SafeLeadResult = {
    rawValue: number
    clampedValue: number
    threshold: number
    isSafe: boolean
    safePercent: number
}

export function calculateSafeLead(
    pointsAhead: number,
    possession: Possession,
    secondsLeft: number,
): SafeLeadResult {
    // Step 1: Start with points ahead, subtract 3,
    //         adjust +/- 0.5 for possession
    const rawValue = pointsAhead - 3 + (possession === 'leading' ? 0.5 : -0.5)

    // Step 2: If the result is negative, treat it as 0
    const clampedValue = Math.max(0, rawValue)

    // Step 3: Square it
    const threshold = clampedValue * clampedValue

    // Step 4: If threshold > seconds remaining, the lead is safe
    const isSafe = threshold > secondsLeft

    // How close to safe, as a percentage (rounded down to 2 decimals)
    const safePercent = Math.floor((threshold / secondsLeft) * 10000) / 100

    return { rawValue, clampedValue, threshold, isSafe, safePercent }
}

/** Seconds as a game clock, the way the scoreboard shows it: 83 → "1:23", 2400 → "40:00" */
export function gameClock(seconds: number): string {
    const minutes = Math.floor(seconds / 60)
    return `${minutes}:${String(seconds % 60).padStart(2, '0')}`
}

/**
 * When in the game a lead becomes safe, for the line under the result. A lead is safe while the
 * seconds left are fewer than its threshold, so the last whole second it's safe at is one under
 * the threshold, rounded up. A lead too small to ever be safe is only safe at the buzzer, and one
 * bigger than a whole game is safe from the start
 */
export function safeAtText(
    threshold: number,
    secondsLeft: number,
    gameSeconds: number,
): string {
    const safeFrom = Math.ceil(threshold) - 1
    if (safeFrom >= gameSeconds) return 'Safe for a whole game!'
    if (safeFrom <= 0) return 'Only safe at the final buzzer'
    const clock = gameClock(safeFrom)
    return secondsLeft <= safeFrom
        ? `Became safe with ${clock} left`
        : `Becomes safe with ${clock} left`
}
