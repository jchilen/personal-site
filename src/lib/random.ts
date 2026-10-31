// Turns text into a number (an FNV-1a hash), so the same text always gives the same number
export function hashString(text: string) {
    let hash = 2166136261
    for (const char of text) {
        hash = Math.imul(hash ^ char.charCodeAt(0), 16777619)
    }
    return hash >>> 0
}

// A tiny seeded random number generator (mulberry32): the same seed always gives the same sequence
export function seededRandom(seed: number) {
    let state = seed
    return () => {
        state = (state + 0x6d2b79f5) | 0
        let t = Math.imul(state ^ (state >>> 15), 1 | state)
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296
    }
}

// Fisher–Yates shuffle: a new array in random order, with every order equally likely.
// `random` can be swapped for a seeded one, which makes the result repeatable in tests
export function shuffle<T>(
    items: readonly T[],
    random: () => number = Math.random,
): T[] {
    const result = [...items]
    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(random() * (i + 1))
        ;[result[i], result[j]] = [result[j], result[i]]
    }
    return result
}
