import { describe, expect, test } from 'vitest'
import { blastsText, statParts, sumText, totalHpText } from './breakdowns'
import { pilotedStats, type PilotBuild } from './pilot-build'
import { answerKey } from './survivability-answer-key'
import type { Frame } from './survivability-types'

const frames = answerKey.data.frames

const noBuild: PilotBuild = {
    hull: 0,
    agility: 0,
    systems: 0,
    reinforcedFrame: false,
    fullSubjectivitySync: false,
    slopedPlating: false,
    lessonOfDisbelief: false,
    cover: 'none',
}

const everything: PilotBuild = {
    hull: 5,
    agility: 6,
    systems: 3,
    reinforcedFrame: true,
    fullSubjectivitySync: true,
    slopedPlating: true,
    lessonOfDisbelief: true,
    cover: 'none',
}

// Only the stats the build changes matter here
function frame(overrides: Partial<Frame> = {}): Frame {
    return {
        ...frames[0],
        evasion: 8,
        eDefense: 8,
        armor: 1,
        hp: 10,
        repairCap: 4,
        ...overrides,
    }
}

const total = (parts: { amount: number }[]) =>
    parts.reduce((sum, part) => sum + part.amount, 0)

describe('statParts', () => {
    test('always adds up to the same stats as pilotedStats, for every frame', () => {
        for (const build of [noBuild, everything]) {
            for (const each of frames) {
                const parts = statParts(each, build)
                const stats = pilotedStats(each, build)
                expect(total(parts.evasion)).toBe(stats.evasion)
                expect(total(parts.eDefense)).toBe(stats.eDefense)
                expect(total(parts.armor)).toBe(stats.armor)
                expect(total(parts.hp)).toBe(stats.hp)
                expect(total(parts.repairCap)).toBe(stats.repairCap)
            }
        }
    })

    test('names where each part comes from, starting with the base', () => {
        expect(statParts(frame(), everything).hp).toEqual([
            { amount: 10, source: 'base' },
            { amount: 10, source: 'HULL' },
            { amount: 5, source: 'Reinforced Frame' },
        ])
    })

    test('parts that add nothing are left out, but the base always stays', () => {
        const parts = statParts(frame({ armor: 0 }), noBuild)
        expect(parts.armor).toEqual([{ amount: 0, source: 'base' }])
        expect(parts.repairCap).toEqual([{ amount: 4, source: 'base' }])
    })

    test('Full Subjectivity Sync only adds what fits under 20 Evasion', () => {
        const build = { ...noBuild, agility: 6, fullSubjectivitySync: true }
        expect(statParts(frame({ evasion: 13 }), build).evasion).toEqual([
            { amount: 13, source: 'base' },
            { amount: 6, source: 'AGI' },
            { amount: 1, source: 'Full Subjectivity Sync' },
        ])
        // Already at 20, so it adds nothing and isn't listed
        expect(statParts(frame({ evasion: 14 }), build).evasion).toHaveLength(2)
    })
})

describe('the tooltip text', () => {
    test('a stat is written as a sum, or as just its base when nothing is added', () => {
        expect(
            sumText([
                { amount: 8, source: 'base' },
                { amount: 6, source: 'AGI' },
            ]),
        ).toBe('8 base + 6 AGI = 14')
        expect(sumText([{ amount: 8, source: 'base' }])).toBe('8 base')
    })

    test('Total HP shows the Repairs halved and rounded down, with ⌊ ⌋', () => {
        expect(totalHpText(22, 7, 2, 154)).toBe('22 HP × (4 + ⌊7 ÷ 2⌋) = 154')
    })

    test('a frame that restores a structure for 1 Repair needs no division', () => {
        // The Everest and its variants
        expect(totalHpText(10, 5, 1, 90)).toBe('10 HP × (4 + 5) = 90')
    })

    test('blasts to kill divides Total HP by the damage of one blast', () => {
        expect(blastsText(154, 70.84, 2.174)).toBe(
            '154 Total HP ÷ 70.8 damage per blast = 2.17',
        )
    })
})
