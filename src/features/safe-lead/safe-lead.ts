export type Possession = 'leading' | 'trailing'

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
