// Limits shared by the create form (input sizes) and the Worker (validation)
export const POLL_LIMITS = {
    titleLength: 100,
    optionLength: 60,
    minOptions: 2,
    maxOptions: 8,
    minVoters: 2,
    maxVoters: 50,
} as const

export interface NewPoll {
    title: string
    options: string[]
    expectedVoters: number
}

export type Validation<T> =
    { ok: true; value: T } | { ok: false; error: string }

function fail(error: string): { ok: false; error: string } {
    return { ok: false, error }
}

// The request body is untrusted, so it arrives as `unknown` and is checked piece by piece
export function validateNewPoll(input: unknown): Validation<NewPoll> {
    if (typeof input !== 'object' || input === null)
        return fail('Expected a JSON object')
    const { title, options, expectedVoters } = input as Record<string, unknown>

    if (typeof title !== 'string' || title.trim() === '')
        return fail('Title is required')
    if (title.trim().length > POLL_LIMITS.titleLength) {
        return fail(
            `Title must be ${POLL_LIMITS.titleLength} characters or fewer`,
        )
    }

    if (
        !Array.isArray(options) ||
        !options.every((option): option is string => typeof option === 'string')
    ) {
        return fail('Options must be a list of text')
    }

    const cleanOptions = options.map((option) => option.trim())
    if (
        cleanOptions.length < POLL_LIMITS.minOptions ||
        cleanOptions.length > POLL_LIMITS.maxOptions
    ) {
        return fail(
            `A poll needs ${POLL_LIMITS.minOptions} to ${POLL_LIMITS.maxOptions} options`,
        )
    }
    if (cleanOptions.some((option) => option === ''))
        return fail("Options can't be blank")
    if (
        cleanOptions.some((option) => option.length > POLL_LIMITS.optionLength)
    ) {
        return fail(
            `Options must be ${POLL_LIMITS.optionLength} characters or fewer`,
        )
    }

    // "Tacos" and "tacos" would look like the same option on the ballot
    const distinct = new Set(cleanOptions.map((option) => option.toLowerCase()))
    if (distinct.size !== cleanOptions.length)
        return fail('Each option must be different')

    if (
        typeof expectedVoters !== 'number' ||
        !Number.isInteger(expectedVoters) ||
        expectedVoters < POLL_LIMITS.minVoters ||
        expectedVoters > POLL_LIMITS.maxVoters
    ) {
        return fail(
            `Expected voters must be a whole number from ${POLL_LIMITS.minVoters} to ${POLL_LIMITS.maxVoters}`,
        )
    }

    return {
        ok: true,
        value: { title: title.trim(), options: cleanOptions, expectedVoters },
    }
}

// A ballot must rank every option in the poll exactly once
export function validateBallot(
    input: unknown,
    options: string[],
): Validation<string[]> {
    if (typeof input !== 'object' || input === null)
        return fail('Expected a JSON object')
    const { ranking } = input as Record<string, unknown>

    if (
        !Array.isArray(ranking) ||
        !ranking.every((option): option is string => typeof option === 'string')
    ) {
        return fail('Ranking must be a list of options')
    }

    // Same length, no repeats, and every option present means each appears exactly once
    const ranked = new Set(ranking)
    if (
        ranking.length !== options.length ||
        ranked.size !== options.length ||
        !options.every((option) => ranked.has(option))
    ) {
        return fail('Rank every option exactly once')
    }

    return { ok: true, value: ranking }
}
