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
            return `${formatList(first.tied)} could have both won, so a tiebreaker decided it.`
        case 'random-ballot':
            return `${formatList(first.bordaTied)} were tied all the way, so a drawn ballot decided it.`
    }
}

/** One sentence on how a tiebreak decided a place, or null when Ranked Pairs alone decided it */
export function describeTiebreak(
    place: Place,
    position: number,
): string | null {
    if (place.decidedBy === 'ranked-pairs') return null

    const contenders =
        place.tiedBy === 'smith-set'
            ? `there were too many equally strong results to check every order, so the contenders were ${formatList(place.tied)}`
            : `${formatList(place.tied)} could each have taken it`
    const scores = formatList(
        place.tied.map((option) => `${option} ${place.bordaScores[option]}`),
    )

    if (place.decidedBy === 'borda') {
        return `${ordinal(position)} place: ${contenders}, so Borda scores decided (${scores}).`
    }
    return `${ordinal(position)} place: ${contenders}, and the top Borda scores tied (${scores}), so ballot ${place.ballotIndex + 1} was drawn using the seed. It ranked ${place.option} highest of ${formatList(place.bordaTied)}.`
}
