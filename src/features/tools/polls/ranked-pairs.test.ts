import { describe, expect, test } from 'vitest'
import {
    bordaScores,
    buildHeadToHead,
    countOrderings,
    decideWinner,
    findPossibleWinners,
    findWins,
    lockWins,
    pickByRandomBallot,
    rankTiers,
    smithSet,
    sortWins,
    type Ballot,
} from './ranked-pairs'

const OPTIONS = ['A', 'B', 'C']

// Builds ballots from [count, ranking] pairs, so test cases read like the plan: [3, 'A>B>C']
function ballots(...groups: [number, string][]): Ballot[] {
    return groups.flatMap(([count, ranking]) =>
        Array.from({ length: count }, () => ranking.split('>')),
    )
}

// Test 1 from the plan: a clear winner with no cycle
const CLEAR_WINNER = ballots([3, 'A>B>C'], [3, 'B>A>C'], [2, 'C>A>B'])

// Test 2 from the plan: a cycle where the tie rule decides the winner
const CYCLE = ballots([3, 'A>B>C'], [3, 'B>C>A'], [2, 'C>A>B'])

// A 5–5–5 cycle: A beats B, B beats C, C beats A, all 5–3, so any option can win
const EVEN_CYCLE = ballots(
    [3, 'A>B>C'],
    [2, 'B>C>A'],
    [2, 'C>A>B'],
    [1, 'C>B>A'],
)

describe('buildHeadToHead', () => {
    test('counts how many voters ranked each option above each other option', () => {
        // Row = option, column = opponent: A beat B on 5 ballots, A beat C on 6, ...
        expect(buildHeadToHead(OPTIONS, CLEAR_WINNER)).toEqual([
            [0, 5, 6],
            [3, 0, 6],
            [2, 2, 0],
        ])
    })

    test('counts a cycle correctly', () => {
        expect(buildHeadToHead(OPTIONS, CYCLE)).toEqual([
            [0, 5, 3],
            [3, 0, 6],
            [5, 2, 0],
        ])
    })

    test('rejects a ballot with an option that is not in the poll', () => {
        expect(() => buildHeadToHead(OPTIONS, [['A', 'B', 'Z']])).toThrow(
            'Unknown option: Z',
        )
    })
})

describe('findWins', () => {
    test('lists every head-to-head win with its vote count', () => {
        const headToHead = buildHeadToHead(OPTIONS, CLEAR_WINNER)
        expect(findWins(headToHead)).toEqual([
            { winner: 0, loser: 1, votes: 5 }, // A beat B 5–3
            { winner: 0, loser: 2, votes: 6 }, // A beat C 6–2
            { winner: 1, loser: 2, votes: 6 }, // B beat C 6–2
        ])
    })

    test('finds all three wins in a cycle', () => {
        const headToHead = buildHeadToHead(OPTIONS, CYCLE)
        expect(findWins(headToHead)).toEqual([
            { winner: 0, loser: 1, votes: 5 }, // A beat B 5–3
            { winner: 1, loser: 2, votes: 6 }, // B beat C 6–2
            { winner: 2, loser: 0, votes: 5 }, // C beat A 5–3
        ])
    })

    test('records no win for an exact tie', () => {
        const tied = ballots([4, 'A>B'], [4, 'B>A'])
        expect(findWins(buildHeadToHead(['A', 'B'], tied))).toEqual([])
    })
})

// Runs Steps 1–5 in order, for tests that only care about the outcome
function rank(options: string[], cast: Ballot[]) {
    const wins = sortWins(findWins(buildHeadToHead(options, cast)))
    const { locked, trace } = lockWins(wins, options.length)
    return { trace, tiers: rankTiers(locked) }
}

describe('sortWins', () => {
    test('puts the strongest wins first', () => {
        const wins = sortWins(findWins(buildHeadToHead(OPTIONS, CLEAR_WINNER)))
        expect(wins.map((win) => win.votes)).toEqual([6, 6, 5])
    })

    test('does not change the original list', () => {
        const wins = findWins(buildHeadToHead(OPTIONS, CLEAR_WINNER))
        const before = [...wins]
        sortWins(wins)
        expect(wins).toEqual(before)
    })
})

describe('lockWins and rankTiers', () => {
    test('Test 1: locks every win and ranks A, B, C', () => {
        const { trace, tiers } = rank(OPTIONS, CLEAR_WINNER)
        expect(trace.every((entry) => entry.status === 'locked')).toBe(true)
        expect(tiers).toEqual([[0], [1], [2]])
    })

    test('Test 2, A>B first: C>A is skipped and A wins', () => {
        // The default order puts the two 5–3 wins as A>B, then C>A
        const { trace, tiers } = rank(OPTIONS, CYCLE)
        expect(trace).toEqual([
            { winner: 1, loser: 2, votes: 6, status: 'locked' }, // B>C
            { winner: 0, loser: 1, votes: 5, status: 'locked' }, // A>B
            { winner: 2, loser: 0, votes: 5, status: 'skipped' }, // C>A would close the loop
        ])
        expect(tiers).toEqual([[0], [1], [2]])
    })

    test('Test 2, C>A first: A>B is skipped and B wins', () => {
        // Same wins in the other order, to show that the order of equal wins changes the winner
        const wins = [
            { winner: 1, loser: 2, votes: 6 }, // B>C
            { winner: 2, loser: 0, votes: 5 }, // C>A
            { winner: 0, loser: 1, votes: 5 }, // A>B
        ]
        const { locked, trace } = lockWins(wins, 3)
        expect(trace.map((entry) => entry.status)).toEqual([
            'locked',
            'locked',
            'skipped',
        ])
        expect(rankTiers(locked)).toEqual([[1], [2], [0]])
    })

    test('an exact head-to-head tie puts both options in the same tier', () => {
        // A and B tie 2–2; both beat C 4–0
        const { tiers } = rank(OPTIONS, ballots([2, 'A>B>C'], [2, 'B>A>C']))
        expect(tiers).toEqual([[0, 1], [2]])
    })
})

// Steps 1–3, for tests that start from the sorted wins
function sortedWinsFor(options: string[], cast: Ballot[]) {
    return sortWins(findWins(buildHeadToHead(options, cast)))
}

describe('countOrderings', () => {
    test('multiplies the number of ways to order each equal-strength group', () => {
        // Test 1: two 6–2 wins (2 orders) and one 5–3 win (1 order)
        expect(countOrderings(sortedWinsFor(OPTIONS, CLEAR_WINNER))).toBe(2)
        // The even cycle: three 5–3 wins can go in 3 × 2 × 1 = 6 orders
        expect(countOrderings(sortedWinsFor(OPTIONS, EVEN_CYCLE))).toBe(6)
    })
})

describe('findPossibleWinners', () => {
    test('Test 1: only A can win, found by the quick check', () => {
        expect(
            findPossibleWinners(sortedWinsFor(OPTIONS, CLEAR_WINNER), 3),
        ).toEqual([0])
    })

    test('Test 2: A or B can win, depending on the order of the 5–3 wins', () => {
        expect(findPossibleWinners(sortedWinsFor(OPTIONS, CYCLE), 3)).toEqual([
            0, 1,
        ])
    })

    test('a 5–5–5 cycle: every option can win', () => {
        expect(
            findPossibleWinners(sortedWinsFor(OPTIONS, EVEN_CYCLE), 3),
        ).toEqual([0, 1, 2])
    })

    test('an exact tie at the top: both tied options can win', () => {
        const tied = ballots([2, 'A>B>C'], [2, 'B>A>C'])
        expect(findPossibleWinners(sortedWinsFor(OPTIONS, tied), 3)).toEqual([
            0, 1,
        ])
    })

    test('gives up (null) when checking every order would exceed the budget', () => {
        // Test 2 has 2 possible orders; with a budget of 1, it shouldn't try
        expect(
            findPossibleWinners(sortedWinsFor(OPTIONS, CYCLE), 3, 1),
        ).toBeNull()
    })

    test('still uses the quick check when the order cannot matter, even over budget', () => {
        // Test 1 has 2 possible orders, but nothing conflicts, so the budget never comes up
        expect(
            findPossibleWinners(sortedWinsFor(OPTIONS, CLEAR_WINNER), 3, 1),
        ).toEqual([0])
    })
})

// Predictable stand-ins for randomness: always pick the first ballot, or the one halfway through
const FIRST_BALLOT = () => 0
const MIDDLE_BALLOT = () => 0.5

describe('bordaScores', () => {
    test('Test 2 scores match the plan: A 8, B 9, C 7', () => {
        expect(bordaScores(OPTIONS, CYCLE)).toEqual([8, 9, 7])
    })

    test('Test 1 scores: A 11, B 9, C 4', () => {
        expect(bordaScores(OPTIONS, CLEAR_WINNER)).toEqual([11, 9, 4])
    })
})

describe('smithSet', () => {
    test('is just the winner when one option beats every other', () => {
        expect(smithSet(buildHeadToHead(OPTIONS, CLEAR_WINNER))).toEqual([0])
    })

    test('includes every option in a cycle', () => {
        expect(smithSet(buildHeadToHead(OPTIONS, CYCLE))).toEqual([0, 1, 2])
    })

    test('includes both options in an exact tie at the top', () => {
        const tied = ballots([2, 'A>B>C'], [2, 'B>A>C'])
        expect(smithSet(buildHeadToHead(OPTIONS, tied))).toEqual([0, 1])
    })
})

describe('pickByRandomBallot', () => {
    test('uses the first ballot when random gives 0', () => {
        // Ballot 0 is A>B>C, so A is the highest of A and B
        expect(
            pickByRandomBallot([0, 1], OPTIONS, CYCLE, FIRST_BALLOT),
        ).toEqual({
            winner: 0,
            ballotIndex: 0,
        })
    })

    test('uses the middle ballot when random gives 0.5', () => {
        // Ballot 4 of 8 is B>C>A, so B is the highest of A and B
        expect(
            pickByRandomBallot([0, 1], OPTIONS, CYCLE, MIDDLE_BALLOT),
        ).toEqual({
            winner: 1,
            ballotIndex: 4,
        })
    })
})

describe('decideWinner', () => {
    test('reports no votes when there are no ballots', () => {
        expect(decideWinner(OPTIONS, [], FIRST_BALLOT)).toEqual({
            result: 'no-votes',
        })
    })

    test('Test 1: A wins outright under Ranked Pairs', () => {
        expect(decideWinner(OPTIONS, CLEAR_WINNER, FIRST_BALLOT)).toEqual({
            result: 'ranked-pairs',
            winner: 0,
        })
    })

    test('Test 2: A and B tie under Ranked Pairs, B wins on Borda 9 vs 8', () => {
        expect(decideWinner(OPTIONS, CYCLE, FIRST_BALLOT)).toEqual({
            result: 'borda',
            winner: 1,
            tied: [0, 1],
            tiedBy: 'ranked-pairs',
            bordaScores: [8, 9, 7],
        })
    })

    test('a 5–5–5 cycle that also ties on Borda goes to the random ballot', () => {
        // Every option scores 8, so ballot 0 (A>B>C) decides: A
        expect(decideWinner(OPTIONS, EVEN_CYCLE, FIRST_BALLOT)).toEqual({
            result: 'random-ballot',
            winner: 0,
            bordaTied: [0, 1, 2],
            ballotIndex: 0,
            tied: [0, 1, 2],
            tiedBy: 'ranked-pairs',
            bordaScores: [8, 8, 8],
        })
    })

    test('over budget, Borda decides among the Smith set instead', () => {
        // With a budget of 1, Test 2 skips the search. The Smith set is all three options
        // (even C, which Ranked Pairs couldn't pick), and B still has the best Borda score.
        expect(decideWinner(OPTIONS, CYCLE, FIRST_BALLOT, 1)).toEqual({
            result: 'borda',
            winner: 1,
            tied: [0, 1, 2],
            tiedBy: 'smith-set',
            bordaScores: [8, 9, 7],
        })
    })
})
