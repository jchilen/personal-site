import { describe, expect, test } from 'vitest'
import { cachedCardResults, cardResults, fieldResults } from './card-results'
import type { PilotBuild } from './pilot-build'
import { DEFAULT_SETTINGS, newCard, type CardSettings } from './settings'
import { standardFrame } from './standard-frame'
import { answerKey } from './survivability-answer-key'

const { data } = answerKey
const sheet = (tab: string) => {
    const found = answerKey.tabs.find((t) => t.tab === tab)
    if (!found) throw new Error(`No tab named ${tab}`)
    return found
}

// The sheet's builds as a pilot would enter them. Rebake T3 is left out: its Sloped Plating 2 was a
// mistake, and a pilot can only add 1
const BUILDS: [string, Partial<PilotBuild>][] = [
    ['Frames vs T1', { hull: 4, agility: 2 }],
    ['Frames vs T2', { hull: 4, agility: 4 }],
    [
        'Frames vs T3',
        { hull: 4, agility: 6, fullSubjectivitySync: true, cover: 'soft' },
    ],
    ['Frames vs Rebake T1', { hull: 4, agility: 2 }],
    ['Frames vs Rebake T2', { hull: 4, agility: 2 }],
]

describe.each(BUILDS)('%s, entered as a pilot build', (tab, choices) => {
    test('every frame’s Total HP and blasts to kill match the sheet', () => {
        const { ruleset, tier, results } = sheet(tab)
        const build = { ...DEFAULT_SETTINGS, ...choices }
        const field = fieldResults(
            data.frames,
            build,
            data.attacks[ruleset][tier - 1],
        )
        for (const row of results) {
            const result = field.find((r) => r.frame.name === row.frame)
            expect(result?.totalHp, row.frame).toBe(row.totalHp)
            expect(result?.blastsToKill, row.frame).toBeCloseTo(
                row.blastsToKill,
                9,
            )
        }
    })
})

describe('cardResults', () => {
    const settings: CardSettings = { ...DEFAULT_SETTINGS, hull: 4, agility: 2 }
    const standard = standardFrame(data.frames)

    test('ranks the card’s frame against the sheet’s own field', () => {
        const results = sheet('Frames vs T1').results
        for (const frame of ['Arminius', 'Zheng', 'Emperor', 'Pegasus']) {
            const own =
                results.find((r) => r.frame === frame)?.blastsToKill ?? 0
            const expected =
                1 + results.filter((r) => r.blastsToKill > own).length
            const card = newCard(frame, [], settings)
            expect(cardResults(card, data, standard)?.rank, frame).toBe(
                expected,
            )
        }
    })

    test('the toughest frame is 1st of 63 and the weakest is last', () => {
        expect(
            cardResults(newCard('Zheng', [], settings), data, standard),
        ).toMatchObject({ rank: 1, fieldSize: 63 })
        expect(
            cardResults(newCard('Emperor', [], settings), data, standard)?.rank,
        ).toBe(63)
    })

    test('frames tied on blasts to kill share a rank', () => {
        const genghis = cardResults(
            newCard('Genghis', [], settings),
            data,
            standard,
        )
        const worldkiller = cardResults(
            newCard('“Worldkiller” Genghis Mk I', [], settings),
            data,
            standard,
        )
        expect(genghis?.rank).toBe(worldkiller?.rank)
    })

    test('the standard frame gets the same build, so with Arminius’s stats it scores the same', () => {
        const results = cardResults(
            newCard('Arminius', [], settings),
            data,
            standard,
        )
        expect(results?.standard.blastsToKill).toBeCloseTo(
            results?.blastsToKill ?? 0,
            12,
        )
    })

    test('a card for a frame the data doesn’t have gets no results', () => {
        expect(
            cardResults(newCard('Missing Frame', [], settings), data, standard),
        ).toBeNull()
    })
})

describe('cachedCardResults', () => {
    const standard = standardFrame(data.frames)
    const card = newCard('Arminius', [], { ...DEFAULT_SETTINGS, hull: 4 })

    test('the same card gets back the very same results, without working them out again', () => {
        const first = cachedCardResults(card, data, standard)
        expect(cachedCardResults(card, data, standard)).toBe(first)
        expect(first).toEqual(cardResults(card, data, standard))
    })

    test('a changed card is a new object, so its results are worked out afresh', () => {
        const before = cachedCardResults(card, data, standard)
        const changed = { ...card, agility: 3 }
        const after = cachedCardResults(changed, data, standard)
        expect(after).not.toBe(before)
        expect(after?.stats.evasion).toBe((before?.stats.evasion ?? 0) + 3)
    })

    test('new data or a new standard frame starts afresh too', () => {
        const before = cachedCardResults(card, data, standard)
        expect(cachedCardResults(card, { ...data }, standard)).not.toBe(before)
        expect(cachedCardResults(card, data, { ...standard })).not.toBe(before)
    })
})
