import { describe, expect, test } from 'vitest'
import { POLL_LIMITS, validateNewPoll } from './poll-rules'

const VALID = {
    title: 'Lunch',
    options: ['Tacos', 'Pizza', 'Sushi'],
    expectedVoters: 4,
}

// Copies VALID with some fields replaced, so each test shows only what it changes
function withChanges(changes: Record<string, unknown>) {
    return { ...VALID, ...changes }
}

function optionList(count: number) {
    return Array.from({ length: count }, (_, index) => `Option ${index + 1}`)
}

describe('validateNewPoll', () => {
    test('accepts a valid poll and trims extra spaces', () => {
        const messy = withChanges({
            title: '  Lunch ',
            options: [' Tacos', 'Pizza ', 'Sushi'],
        })
        expect(validateNewPoll(messy)).toEqual({ ok: true, value: VALID })
    })

    test('accepts values right at the limits', () => {
        const result = validateNewPoll({
            title: 'x'.repeat(POLL_LIMITS.titleLength),
            options: optionList(POLL_LIMITS.maxOptions),
            expectedVoters: POLL_LIMITS.maxVoters,
        })
        expect(result.ok).toBe(true)
    })

    test('rejects anything that is not an object', () => {
        expect(validateNewPoll(null).ok).toBe(false)
        expect(validateNewPoll('Lunch').ok).toBe(false)
    })

    test.each([
        ['a blank title', { title: '   ' }],
        [
            'a title over the limit',
            { title: 'x'.repeat(POLL_LIMITS.titleLength + 1) },
        ],
        ['too few options', { options: ['Tacos'] }],
        [
            'too many options',
            { options: optionList(POLL_LIMITS.maxOptions + 1) },
        ],
        ['a blank option', { options: ['Tacos', ' '] }],
        [
            'an option over the limit',
            { options: ['Tacos', 'x'.repeat(POLL_LIMITS.optionLength + 1)] },
        ],
        ['duplicate options', { options: ['Tacos', 'tacos'] }],
        ['an option that is not text', { options: ['Tacos', 3] }],
        ['a fractional voter count', { expectedVoters: 2.5 }],
        ['too few voters', { expectedVoters: POLL_LIMITS.minVoters - 1 }],
        ['too many voters', { expectedVoters: POLL_LIMITS.maxVoters + 1 }],
        ['a voter count sent as text', { expectedVoters: '4' }],
    ])('rejects %s', (_name, changes) => {
        expect(validateNewPoll(withChanges(changes)).ok).toBe(false)
    })
})
