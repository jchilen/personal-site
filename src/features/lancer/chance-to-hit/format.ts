import { hueColor } from '@/lib/hue-color'

export function percent(chance: number): string {
    return `${(chance * 100).toFixed(1)}%`
}

/** +3, 0, or −2: a real minus sign, and a plus for positives */
export function signed(value: number): string {
    if (value > 0) return `+${value}`
    if (value < 0) return `−${-value}`
    return '0'
}

const RED = 29
const YELLOW = 100
const GREEN = 145

/**
 * A color for a chance to hit: red at 0%, yellow at 50%, green at 100%, blending in between.
 * Uses hueColor, like the portfolio cards, so it adjusts for dark mode
 */
export function chanceColor(chance: number): string {
    const hue =
        chance < 0.5
            ? RED + (YELLOW - RED) * (chance / 0.5)
            : YELLOW + (GREEN - YELLOW) * ((chance - 0.5) / 0.5)
    // One decimal place is finer than anyone can see, and keeps the style value short
    return hueColor(Math.round(hue * 10) / 10)
}
