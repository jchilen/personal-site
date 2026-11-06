/**
 * A color picked by its hue alone (0–360 around the color wheel). Lightness and chroma come from
 * the theme's --hue-lightness and --hue-chroma, so every hue color adjusts for dark mode together
 */
export function hueColor(hue: number): string {
    return `oklch(var(--hue-lightness) var(--hue-chroma) ${hue})`
}
