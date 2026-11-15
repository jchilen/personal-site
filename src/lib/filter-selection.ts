// Stands for "no filter" in the toggle group. It can't clash with an option, since options are
// real values like manufacturer names
export const ALL = '__all__'

/**
 * The options that are on after a click, given what the toggle group now holds. All just clicked on
 * turns every option off. Otherwise it's the options still on, in the order they're listed, and none
 * left on means All
 */
export function nextSelection(
    selected: string[],
    next: string[],
    options: string[],
): string[] {
    if (next.includes(ALL) && selected.length > 0) return []
    return options.filter((option) => next.includes(option))
}