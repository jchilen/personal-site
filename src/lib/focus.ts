/**
 * A ref callback that focuses an element as soon as it appears, for content swapped in where the
 * focused control used to be. It must stay one shared function: React calls a ref callback again
 * whenever the callback itself changes, so a new function on every render would pull focus back
 * to the element on every render
 */
export function focusOnMount(node: HTMLElement | null): void {
    node?.focus()
}

/**
 * When the item at `index` is removed, the item that should take focus in its place: the one after
 * it, or the one before if it was last. Undefined if it was the only item
 */
export function neighborAfterRemoval<T>(
    items: readonly T[],
    index: number,
): T | undefined {
    return items[index + 1] ?? items[index - 1]
}
