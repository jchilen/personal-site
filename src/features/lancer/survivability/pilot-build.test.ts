import { describe, expect, test } from 'vitest'
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

// Only the stats the build changes matter here
function frame(overrides: Partial<Frame> = {}): Frame {
    return {
        ...frames[0],
        evasion: 8,
        eDefense: 8,
        armor: 1,
        hp: 10,
        repairCap: 5,
        ...overrides,
    }
}

test('with nothing chosen, the frame keeps its own stats', () => {
    expect(pilotedStats(frame(), noBuild)).toEqual({
        evasion: 8,
        eDefense: 8,
        armor: 1,
        hp: 10,
        repairCap: 5,
    })
})

test('HULL gives +2 HP per point and +1 Repair per 2 points, rounded down', () => {
    expect(pilotedStats(frame(), { ...noBuild, hull: 5 })).toMatchObject({
        hp: 20,
        repairCap: 7,
    })
    expect(pilotedStats(frame(), { ...noBuild, hull: 6 })).toMatchObject({
        hp: 22,
        repairCap: 8,
    })
})

test('AGI adds Evasion and SYS adds E-Defense, 1 per point', () => {
    expect(
        pilotedStats(frame(), { ...noBuild, agility: 3, systems: 4 }),
    ).toMatchObject({ evasion: 11, eDefense: 12 })
})

test('Reinforced Frame +5 HP, Sloped Plating +1 Armor, Lesson of Disbelief +2 E-Defense', () => {
    const build = {
        ...noBuild,
        reinforcedFrame: true,
        slopedPlating: true,
        lessonOfDisbelief: true,
    }
    expect(pilotedStats(frame(), build)).toMatchObject({
        hp: 15,
        armor: 2,
        eDefense: 10,
    })
})

describe('Full Subjectivity Sync', () => {
    const sync = { ...noBuild, fullSubjectivitySync: true }

    test.each([
        [17, 19],
        [18, 20],
        [19, 20],
        [20, 20],
        [22, 22],
    ])('takes Evasion %d to %d: +2, but never past 20', (evasion, expected) => {
        expect(pilotedStats(frame({ evasion }), sync).evasion).toBe(expected)
    })

    test('the cap counts AGI too', () => {
        expect(
            pilotedStats(frame({ evasion: 12 }), { ...sync, agility: 7 })
                .evasion,
        ).toBe(20)
    })
})

// The sheet's six tab builds, as a pilot would enter them, must give each frame the same stats
describe('the sheet’s builds', () => {
    test.each([
        [
            'T1 and both Rebake T1 and T2: HULL 4, AGI 2',
            { hull: 4, agility: 2 },
            { evasion: 2, hp: 8, repairs: 2, armor: 0 },
        ],
        [
            'T2: HULL 4, AGI 4',
            { hull: 4, agility: 4 },
            { evasion: 4, hp: 8, repairs: 2, armor: 0 },
        ],
        [
            'T3: HULL 4, AGI 6, Full Subjectivity Sync',
            { hull: 4, agility: 6, fullSubjectivitySync: true },
            { evasion: 8, hp: 8, repairs: 2, armor: 0 },
        ],
        [
            'Rebake T3: HULL 6, AGI 2, Sloped Plating',
            { hull: 6, agility: 2, slopedPlating: true },
            { evasion: 2, hp: 12, repairs: 3, armor: 1 },
        ],
    ])('%s', (_name, choices, added) => {
        for (const frame of frames) {
            expect(
                pilotedStats(frame, { ...noBuild, ...choices }),
                frame.name,
            ).toEqual({
                evasion: frame.evasion + added.evasion,
                eDefense: frame.eDefense,
                armor: frame.armor + added.armor,
                hp: frame.hp + added.hp,
                repairCap: frame.repairCap + added.repairs,
            })
        }
    })
})