import type { Place } from './results'

const listFormat = new Intl.ListFormat('en', { type: 'conjunction' })

/** ['A', 'B', 'C'] → "A, B, and C" */
export function formatList(items: string[]): string {
    return listFormat.format(items)
}

const ORDINALS = ['1st', '2nd', '3rd']

/** 1 → "1st", 4 → "4th". Polls have at most 8 options, so the teens never come up */
export function ordinal(position: number): string {
    return ORDINALS[position - 1] ?? `${position}th`
}

/** The line under the winner's name */
export function winnerSummary(first: Place): string {
    switch (first.decidedBy) {
        case 'ranked-pairs':
            return 'A clear winner, with no tiebreak needed.'
        case 'borda':
            return `${formatList(first.tied)} were tied, so a tiebreaker decided it.`
        case 'random-ballot':
            return `${formatList(first.bordaTied)} were tied all the way, so a drawn ballot decided it.`
    }
}

/** One se/** How a tiebreak decided a place, or null when Ranked Pairs alone decided it */
export function describeTiebreak(
    place: Place,
    position: number,
): string | null {
    if (place.decidedBy === 'ranked-pairs') return null

    const tied = formatList(place.tied)
    const tie =
        place.tiedBy === 'smith-set'
            ? `Too many wins were equally strong to put ${tied} in order, so they tied for ${ordinal(position)} place.`
            : `${tied} tied for ${ordinal(position)} place.`
    const scores = place.tied
        .map((option) => `${option} ${place.bordaScores[option]}`)
        .join(', ')

    if (place.decidedBy === 'borda') {
        return `${tie} ${place.option} won it on Borda score (${scores}).`
    }
    // Everyone in the tie, or only some of them, can share the top Borda score
    const topScorers =
        place.bordaTied.length === place.tied.length
            ? 'They'
            : formatList(place.bordaTied)
    return `${tie} ${topScorers} also tied for the top Borda score (${scores}), so ballot ${place.ballotIndex + 1} was drawn at random. It ranked ${place.option} highest.`
}
