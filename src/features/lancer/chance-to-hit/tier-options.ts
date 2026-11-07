import { oneOf } from '@/lib/one-of'
import { TIERS, type Tier } from './odds'

/**
 * The tier choices, shared by Setup and each card's tier picker. Choice works with text, so each
 * tier is a string
 */
export const TIER_OPTIONS = TIERS.map((tier): [string, string] => [
    String(tier),
    `T${tier}`,
])

/** The tier a chosen option stands for, or the fallback if it isn't one */
export function tierFromOption(option: string, fallback: Tier): Tier {
    return oneOf(Number(option), TIERS, fallback)
}
