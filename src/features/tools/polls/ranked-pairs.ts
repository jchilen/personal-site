// Ranked Pairs (the Tideman method) and its tie-break chain, as pure functions with no React
// or database code. Inside the math, options are referred to by their position in the poll's
// options list (0, 1, 2, ...), which keeps the head-to-head table a simple grid of numbers.

/** One voter's ranking: option IDs, most preferred first */
export type Ballot = string[]

/** One option beating another head-to-head */
export type Win = {
    winner: number
    loser: number
    votes: number // how many voters preferred the winner
}

/** A win and what happened to it while locking */
export type TraceEntry = Win & { status: 'locked' | 'skipped' }

// Turns a ballot of option IDs into option positions, rejecting any ID that isn't in the poll
function toPositions(ballot: Ballot, positions: Map<string, number>) {
    return ballot.map((id) => {
        const position = positions.get(id)
        if (position === undefined) throw new Error(`Unknown option: ${id}`)
        return position
    })
}

/** Step 1: headToHead[a][b] is how many voters ranked option a above option b */
export function buildHeadToHead(options: string[], ballots: Ballot[]) {
    const positions = new Map(options.map((id, index) => [id, index]))
    const headToHead = options.map(() => options.map(() => 0))

    for (const ballot of ballots) {
        const ranked = toPositions(ballot, positions)
        // Each option beats every option listed after it on this ballot
        for (let higher = 0; higher < ranked.length; higher++) {
            for (let lower = higher + 1; lower < ranked.length; lower++) {
                headToHead[ranked[higher]][ranked[lower]] += 1
            }
        }
    }

    return headToHead
}

/** Step 2: every pair where one option got more votes than the other (an exact tie is no win) */
export function findWins(headToHead: number[][]) {
    const wins: Win[] = []

    for (let a = 0; a < headToHead.length; a++) {
        for (let b = 0; b < headToHead.length; b++) {
            if (headToHead[a][b] > headToHead[b][a]) {
                wins.push({ winner: a, loser: b, votes: headToHead[a][b] })
            }
        }
    }

    return wins
}

/**
 * Step 3: strongest wins first. Equal-strength wins get a fixed but arbitrary order here
 * (by option position); the tie-break chain decides whether that order changed the winner.
 */
export function sortWins(wins: Win[]) {
    return [...wins].sort(
        (a, b) => b.votes - a.votes || a.winner - b.winner || a.loser - b.loser,
    )
}

// Whether you can get from one option to another by following locked wins
function reaches(
    locked: boolean[][],
    from: number,
    to: number,
    seen = new Set<number>(),
): boolean {
    if (from === to) return true
    seen.add(from)
    return locked[from].some(
        (isLocked, next) =>
            isLocked && !seen.has(next) && reaches(locked, next, to, seen),
    )
}

/** Step 4: lock each win in order, skipping any that would create a loop */
export function lockWins(sortedWins: Win[], optionCount: number) {
    const locked = Array.from({ length: optionCount }, () =>
        Array<boolean>(optionCount).fill(false),
    )
    const trace: TraceEntry[] = []

    for (const win of sortedWins) {
        // If the loser can already reach the winner, locking this would close a loop
        if (reaches(locked, win.loser, win.winner)) {
            trace.push({ ...win, status: 'skipped' })
        } else {
            locked[win.winner][win.loser] = true
            trace.push({ ...win, status: 'locked' })
        }
    }

    return { locked, trace }
}

/** Step 5: group options into tiers; tier 0 is the winner (more than one option means a tie) */
export function rankTiers(locked: boolean[][]) {
    const remaining = new Set(locked.map((_, index) => index))
    const tiers: number[][] = []

    while (remaining.size > 0) {
        // Every remaining option that no other remaining option has a locked win over
        const tier = [...remaining].filter(
            (option) => ![...remaining].some((other) => locked[other][option]),
        )
        // Can't happen when the locked wins have no loops, but guards against an endless loop
        if (tier.length === 0) throw new Error('Locked wins contain a loop')

        tiers.push(tier)
        for (const option of tier) remaining.delete(option)
    }

    return tiers
}

/** The most orderings of equal-strength wins we'll try before falling back to Borda */
export const ORDERING_BUDGET = 1000

// Splits sorted wins into groups of equal strength, strongest group first
export function groupByStrength(sortedWins: Win[]) {
    const groups: Win[][] = []
    for (const win of sortedWins) {
        const lastGroup = groups.at(-1)
        if (lastGroup && lastGroup[0].votes === win.votes) {
            lastGroup.push(win)
        } else {
            groups.push([win])
        }
    }
    return groups
}

function factorial(n: number): number {
    return n <= 1 ? 1 : n * factorial(n - 1)
}

/** How many different orders the equal-strength wins could be processed in */
export function countOrderings(sortedWins: Win[]) {
    return groupByStrength(sortedWins).reduce(
        (total, group) => total * factorial(group.length),
        1,
    )
}

// Every possible order of a list: [a, b] → [[a, b], [b, a]]
function permutations<T>(items: T[]): T[][] {
    if (items.length <= 1) return [items]
    return items.flatMap((item, index) =>
        permutations([...items.slice(0, index), ...items.slice(index + 1)]).map(
            (rest) => [item, ...rest],
        ),
    )
}

// Every full order of wins: each group stays in strength order, but its own wins are shuffled
// every possible way, combined with every possible order of the groups after it
function allOrders(groups: Win[][]) {
    return groups.reduce<Win[][]>(
        (orders, group) =>
            orders.flatMap((order) =>
                permutations(group).map((groupOrder) => [
                    ...order,
                    ...groupOrder,
                ]),
            ),
        [[]],
    )
}

/**
 * Every option that could win, depending on how equal-strength wins are ordered, sorted by
 * position. Returns null when checking every order would take more than `budget` orderings.
 */
export function findPossibleWinners(
    sortedWins: Win[],
    optionCount: number,
    budget = ORDERING_BUDGET,
) {
    // Quick check: if nothing was skipped, nothing conflicted, so every order gives this result
    const { locked, trace } = lockWins(sortedWins, optionCount)
    if (trace.every((entry) => entry.status === 'locked')) {
        return rankTiers(locked)[0]
    }

    if (countOrderings(sortedWins) > budget) return null

    const winners = new Set<number>()
    for (const order of allOrders(groupByStrength(sortedWins))) {
        const result = lockWins(order, optionCount)
        for (const option of rankTiers(result.locked)[0]) winners.add(option)
    }
    return [...winners].sort((a, b) => a - b)
}

/** Borda score for each option: n−1 points for a first-place ranking, n−2 for second, …, 0 for last */
export function bordaScores(options: string[], ballots: Ballot[]) {
    const positions = new Map(options.map((id, index) => [id, index]))
    const scores = options.map(() => 0)

    for (const ballot of ballots) {
        toPositions(ballot, positions).forEach((option, place) => {
            scores[option] += options.length - 1 - place
        })
    }

    return scores
}

/** The Smith set: the smallest group of options that each beat every option outside the group */
export function smithSet(headToHead: number[][]) {
    const count = headToHead.length
    const beatsOrTies = (a: number, b: number) =>
        headToHead[a][b] >= headToHead[b][a]

    // Every option you can get to from `option` by following beat-or-tie results
    const reachable = (option: number, seen = new Set<number>()) => {
        seen.add(option)
        for (let next = 0; next < count; next++) {
            if (!seen.has(next) && beatsOrTies(option, next))
                reachable(next, seen)
        }
        return seen
    }

    // An option is in the Smith set if it can reach every other option this way
    return headToHead
        .map((_, option) => option)
        .filter((option) => reachable(option).size === count)
}

/**
 * Picks one ballot using `random` (a function returning 0 ≤ n < 1), and returns whichever of
 * the tied options that ballot ranks highest, plus which ballot was used
 */
export function pickByRandomBallot(
    tied: number[],
    options: string[],
    ballots: Ballot[],
    random: () => number,
) {
    const positions = new Map(options.map((id, index) => [id, index]))
    const ballotIndex = Math.floor(random() * ballots.length)
    const ranked = toPositions(ballots[ballotIndex], positions)

    const winner = ranked.find((option) => tied.includes(option))
    if (winner === undefined)
        throw new Error('Ballot does not rank the tied options')

    return { winner, ballotIndex }
}

/** What the tiebreak chain chose between, and why */
export type TieBreak = {
    tied: number[] // the options the tiebreakers chose between
    tiedBy: 'ranked-pairs' | 'smith-set' // possible RP winners, or the Smith set if the search gave up
    bordaScores: number[] // every option's Borda score
}

/** How a poll's winner was decided */
export type Decision =
    | { result: 'no-votes' }
    | { result: 'ranked-pairs'; winner: number }
    | ({ result: 'borda'; winner: number } & TieBreak)
    | ({
          result: 'random-ballot'
          winner: number
          bordaTied: number[] // the options still tied after Borda
          ballotIndex: number
      } & TieBreak)

/** Runs the whole chain: Ranked Pairs, then Borda, then a random ballot if still tied */
export function decideWinner(
    options: string[],
    ballots: Ballot[],
    random: () => number,
    budget = ORDERING_BUDGET,
): Decision {
    if (ballots.length === 0) return { result: 'no-votes' }

    const headToHead = buildHeadToHead(options, ballots)
    const sortedWins = sortWins(findWins(headToHead))
    const possible = findPossibleWinners(sortedWins, options.length, budget)

    // If the search gave up, fall back to the Smith set, which always includes the real winner
    const tied = possible ?? smithSet(headToHead)
    const tiedBy: TieBreak['tiedBy'] = possible ? 'ranked-pairs' : 'smith-set'

    if (tied.length === 1) return { result: 'ranked-pairs', winner: tied[0] }

    const scores = bordaScores(options, ballots)
    const best = Math.max(...tied.map((option) => scores[option]))
    const bordaTied = tied.filter((option) => scores[option] === best)

    if (bordaTied.length === 1) {
        return {
            result: 'borda',
            winner: bordaTied[0],
            tied,
            tiedBy,
            bordaScores: scores,
        }
    }

    const { winner, ballotIndex } = pickByRandomBallot(
        bordaTied,
        options,
        ballots,
        random,
    )
    return {
        result: 'random-ballot',
        winner,
        bordaTied,
        ballotIndex,
        tied,
        tiedBy,
        bordaScores: scores,
    }
}
