import { describe, expect, test } from 'vitest'
import type { Ballot } from './ranked-pairs'
import { computeResults, rankByPlace, type Place } from './results'
import { describeTiebreak, winnerSummary } from './results-text'

const OPTIONS = ['A', 'B', 'C']

// Same helper and cases as ranked-pairs.test.ts
function ballots(...groups: [number, string][]): Ballot[] {
    return groups.flatMap(([count, ranking]) =>
        Array.from({ length: count }, () => ranking.split('>')),
    )
}

const CLEAR_WINNER = ballots([3, 'A>B>C'], [3, 'B>A>C'], [2, 'C>A>B'])
const CYCLE = ballots([3, 'A>B>C'], [3, 'B>C>A'], [2, 'C>A>B'])
const EVEN_CYCLE = ballots(
    [3, 'A>B>C'],
    [2, 'B>C>A'],
    [2, 'C>A>B'],
    [1, 'C>B>A'],
)

const FIRST_BALLOT = () => 0
const MIDDLE_BALLOT = () => 0.5

function order(places: Place[]) {
    return places.map((place) => place.option)
}

describe('rankByPlace', () => {
    test('a clear winner: every place is decided by Ranked Pairs alone', () => {
        const places = rankByPlace(OPTIONS, CLEAR_WINNER, FIRST_BALLOT)
        expect(order(places)).toEqual(['A', 'B', 'C'])
        expect(
            places.every((place) => place.decidedBy === 'ranked-pairs'),
        ).toBe(true)
    })

    test('the cycle: Borda picks B, and the ranking agrees with the winner', () => {
        const places = rankByPlace(OPTIONS, CYCLE, FIRST_BALLOT)
        expect(order(places)).toEqual(['B', 'C', 'A'])
        expect(places[0]).toEqual({
            option: 'B',
            decidedBy: 'borda',
            tied: ['A', 'B'],
            tiedBy: 'ranked-pairs',
            bordaScores: { A: 8, B: 9, C: 7 },
        })
        // With B out, C beat A 5–3 head-to-head, so 2nd place needs no tiebreak
        expect(places[1].decidedBy).toBe('ranked-pairs')
    })

    test('the 5–5–5 cycle: the drawn ballot picks 1st place', () => {
        const places = rankByPlace(OPTIONS, EVEN_CYCLE, FIRST_BALLOT)
        expect(places[0]).toMatchObject({
            option: 'A',
            decidedBy: 'random-ballot',
            bordaTied: ['A', 'B', 'C'],
            ballotIndex: 0,
        })
        expect(order(places)).toEqual(['A', 'B', 'C'])
    })

    test('the 5–5–5 cycle: a different draw changes 1st place, and the rest follows head-to-head', () => {
        // Ballot 4 is B>C>A, so B wins; with B out, C beat A 5–3
        expect(order(rankByPlace(OPTIONS, EVEN_CYCLE, MIDDLE_BALLOT))).toEqual([
            'B',
            'C',
            'A',
        ])
    })

    test('no ballots: no places', () => {
        expect(rankByPlace(OPTIONS, [], FIRST_BALLOT)).toEqual([])
    })
})

describe('computeResults', () => {
    test('the same seed always gives the same results', () => {
        expect(computeResults(OPTIONS, EVEN_CYCLE, 'seed-1')).toEqual(
            computeResults(OPTIONS, EVEN_CYCLE, 'seed-1'),
        )
    })

    test('records the ballot count, head-to-head table, ranking, and seed', () => {
        const results = computeResults(OPTIONS, CLEAR_WINNER, 'seed-1')
        expect(results.ballotCount).toBe(8)
        expect(results.headToHead).toEqual([
            [0, 5, 6],
            [3, 0, 6],
            [2, 2, 0],
        ])
        expect(order(results.places)).toEqual(['A', 'B', 'C'])
        expect(results.seed).toBe('seed-1')
    })

    test('no votes: zero ballots and no places', () => {
        expect(computeResults(OPTIONS, [], 'seed-1')).toMatchObject({
            ballotCount: 0,
            places: [],
        })
    })
})

// What the results page says, from the ballots all the way to its sentences
describe('results text', () => {
    // The winner's line, then one sentence per place a tiebreak decided
    function shownText(places: Place[]) {
        return [
            winnerSummary(places[0]),
            ...places
                .map((place, index) => describeTiebreak(place, index + 1))
                .filter((text) => text !== null),
        ]
    }

    test('a clear winner: no tiebreak to explain', () => {
        expect(
            shownText(rankByPlace(OPTIONS, CLEAR_WINNER, FIRST_BALLOT)),
        ).toEqual(['A clear winner, with no tiebreak needed.'])
    })

    test('the cycle goes to Borda, and the 5–5–5 cycle to a drawn ballot', () => {
        expect(shownText(rankByPlace(OPTIONS, CYCLE, FIRST_BALLOT))).toEqual([
            'A and B could each have won, so a tiebreaker decided it.',
            '1st place: A and B could each have taken it, so Borda scores decided (A 8 and B 9).',
        ])

        // Every option scores 8, so Borda can't split them either
        expect(
            shownText(rankByPlace(OPTIONS, EVEN_CYCLE, FIRST_BALLOT)),
        ).toEqual([
            'A, B, and C were tied all the way, so a drawn ballot decided it.',
            '1st place: A, B, and C could each have taken it, and the top Borda scores tied (A 8, B 8, and C 8), so ballot 1 was drawn using the seed. It ranked A highest of A, B, and C.',
        ])
    })
})
