// Checks a value from outside our types (saved settings, localStorage, Radix's plain strings)
// against the options we allow, instead of trusting it with `as`

/** True if the value is one of the options, and TypeScript narrows it to that option type */
export function isOneOf<T extends string | number>(
    value: unknown,
    options: readonly T[],
): value is T {
    // Widening the list to unknown[] is always safe, and lets includes accept any value
    return (options as readonly unknown[]).includes(value)
}

/** The value if it's one of the options, otherwise the fallback */
export function oneOf<T extends string | number>(
    value: unknown,
    options: readonly T[],
    fallback: T,
): T {
    return isOneOf(value, options) ? value : fallback
}
