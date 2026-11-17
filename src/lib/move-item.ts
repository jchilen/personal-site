/**
 * A copy of the list with the item at `index` swapped with its neighbor above (up) or below (down).
 * The same list comes back, unchanged, when there's nowhere to move
 */
export function moveItem<T>(
    items: T[],
    index: number,
    direction: 'up' | 'down',
): T[] {
    const other = direction === 'up' ? index - 1 : index + 1
    if (
        index < 0 ||
        index >= items.length ||
        other < 0 ||
        other >= items.length
    )
        return items
    const moved = [...items]
    moved[index] = items[other]
    moved[other] = items[index]
    return moved
}
