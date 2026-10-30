import { hashString, seededRandom } from '@/lib/random'
import {
    buildHeadToHead,
    decideWinner,
    ORDERING_BUDGET,
    type Ballot,
    type Decision,
    type TieBreak,
} from './ranked-pairs'

// A tiebreak's details with option labels instead of positions, so stored results can be shown as-is
type LabeledTieBreak = {
    tied: string[]
    tiedBy: TieBreak['tiedBy']
    bordaScores: Record<string, number>
}

/** One place in the final ranking, and how it was decided */
export type Place =
    | { option: string; decidedBy: 'ranked-pairs' }
    | ({ option: string; decidedBy: 'borda' } & LabeledTieBreak)
    | ({
          option: string
          decidedBy: 'random-ballot'
          bordaTied: string[]
          ballotIndex: number
      } & LabeledTieBreak)

/** Everything stored when a poll closes */
export type PollResults = {
    ballotCount: number
    headToHead: number[][] // rows and columns follow the poll's option order
    places: Place[] // 1st place first; empty when nobody voted
    seed: string // revealed so anyone can check the random tiebreak followed from it
}

// Converts a decision's positions (within this round's options) into labels
function toPlace(
    decision: Exclude<Decision, { result: 'no-votes' }>,
    options: string[],
): Place {
    const label = (position: number) => options[position]
    const option = label(decision.winner)
    if (decision.result === 'ranked-pairs')
        return { option, decidedBy: 'ranked-pairs' }

    const tieBreak: LabeledTieBreak = {
        tied: decision.tied.map(label),
        tiedBy: decision.tiedBy,
        bordaScores: Object.fromEntries(
            options.map(
                (name, position) =>
                    [name, decision.bordaScores[position]] as const,
            ),
        ),
    }
    if (decision.result === 'borda')
        return { option, decidedBy: 'borda', ...tieBreak }

    return {
        option,
        decidedBy: 'random-ballot',
        ...tieBreak,
        bordaTied: decision.bordaTied.map(label),
        ballotIndex: decision.ballotIndex,
    }
}

/**
 * The full ranking, one place at a time: each place is the winner of the whole tie-break chain
 * among the options not yet placed, as if the options above it weren't running
 */
export function rankByPlace(
    options: string[],
    ballots: Ballot[],
    random: () => number,
    budget = ORDERING_BUDGET,
): Place[] {
    const places: Place[] = []
    let remaining = options

    while (remaining.length > 0) {
        // Remove already-placed options from every ballot, keeping the rest in the voter's order
        const running = new Set(remaining)
        const roundBallots = ballots.map((ballot) =>
            ballot.filter((option) => running.has(option)),
        )

        const decision = decideWinner(remaining, roundBallots, random, budget)
        if (decision.result === 'no-votes') break

        const place = toPlace(decision, remaining)
        places.push(place)
        remaining = remaining.filter((option) => option !== place.option)
    }

    return places
}

/** The results stored when a poll closes. The seed makes the random tiebreak repeatable */
export function computeResults(
    options: string[],
    ballots: Ballot[],
    seed: string,
): PollResults {
    return {
        ballotCount: ballots.length,
        headToHead: buildHeadToHead(options, ballots),
        places: rankByPlace(options, ballots, seededRandom(hashString(seed))),
        seed,
    }
}
