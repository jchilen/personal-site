export function percent(chance: number): string {
    return `${(chance * 100).toFixed(1)}%`
}

/** +3, 0, or −2: a real minus sign, and a plus for positives */
export function signed(value: number): string {
    if (value > 0) return `+${value}`
    if (value < 0) return `−${-value}`
    return '0'
}
