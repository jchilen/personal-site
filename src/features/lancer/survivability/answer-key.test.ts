import { describe, expect, test } from 'vitest'
import { attackDamage, blastDamage, totalHp, type Defender } from './damage'
import { answerKey, type AnswerKey } from './survivability-answer-key'
import type { Frame, Weapon } from './survivability-types'

const frames = new Map(
    answerKey.data.frames.map((frame) => [frame.name, frame]),
)

function frameNamed(name: string): Frame {
    const frame = frames.get(name)
    if (!frame) throw new Error(`No frame named ${name}`)
    return frame
}

function tabNamed(name: string) {
    const tab = answerKey.tabs.find((tab) => tab.tab === name)
    if (!tab) throw new Error(`No tab named ${name}`)
    return tab
}

// A frame on one of the sheet's tabs, with that tab's bonuses added the way the sheet adds them
function sheetDefender(
    frame: Frame,
    bonuses: AnswerKey['tabs'][number]['bonuses'],
): Defender {
    return {
        evasion:
            frame.evasion +
            bonuses.agilityEvasion +
            bonuses.fullSubjectivitySyncEvasion,
        eDefense:
            frame.eDefense +
            bonuses.systemsEDefense +
            bonuses.lessonOfDisbeliefEDefense,
        armor: frame.armor + bonuses.slopedPlatingArmor,
        damageTraits: frame.damageTraits,
    }
}

test('the answer key has all six tabs and all 63 frames on each', () => {
    expect(answerKey.tabs).toHaveLength(6)
    for (const tab of answerKey.tabs) expect(tab.results).toHaveLength(63)
    expect(answerKey.data.frames).toHaveLength(63)
})

describe.each(answerKey.tabs)('$tab', (tab) => {
    test('every frame’s Total HP, blast damage and blasts to kill match the sheet', () => {
        const blast = answerKey.data.attacks[tab.ruleset][tab.tier - 1]
        const { bonuses } = tab
        for (const row of tab.results) {
            const frame = frameNamed(row.frame)
            // The sheet records HULL as the Repairs it gives. Each of those is 2 HULL, worth 4 HP
            const hp = totalHp(
                frame.hp + 4 * bonuses.hullRepairs + bonuses.reinforcedFrameHp,
                frame.repairCap + bonuses.hullRepairs,
                frame.structureRepairCost,
            )
            const damage = blastDamage(
                blast,
                sheetDefender(frame, bonuses),
                tab.cover,
            )

            expect(hp, row.frame).toBe(row.totalHp)
            expect(damage, row.frame).toBeCloseTo(row.blastDamage, 9)
            expect(hp / damage, row.frame).toBeCloseTo(row.blastsToKill, 9)
        }
    })
})

// Single attacks the reviewer worked out by hand, to 7 decimal places
describe('the reviewer’s per-attack values', () => {
    function weaponOf(
        tabName: string,
        npc: string,
        slot: 'primary' | 'secondary',
    ): Weapon {
        const tab = tabNamed(tabName)
        const attacks = answerKey.data.attacks[tab.ruleset][tab.tier - 1].find(
            (attacks) => attacks.npc === npc,
        )
        const weapon = attacks?.[slot]
        if (!weapon)
            throw new Error(`${npc} has no ${slot} weapon on ${tabName}`)
        return weapon
    }

    test.each([
        ['Frames vs T1', 'Arminius', 'Archer', 'primary', 0.65, 3.3],
        ['Frames vs T1', 'Black Witch', 'Archer', 'primary', 0.55, 1.55],
        ['Frames vs T1', 'Arminius', 'Barricade', 'primary', 0.775, 0.775],
        ['Frames vs T1', 'Arminius', 'Strider', 'primary', 0.725, 3.625],
        ['Frames vs T3', 'Arminius', 'Strider', 'primary', 0.25, 1.75],
        [
            'Frames vs T3',
            'Arminius',
            'Assassin',
            'primary',
            0.6236111,
            3.1180556,
        ],
        ['Frames vs T3', 'Arminius', 'Assault', 'primary', 0.225, 4.35],
        ['Frames vs T3', 'Arminius', 'Assault', 'secondary', 0.4, 2.4],
        ['Frames vs T3', 'Arminius', 'Engineer', 'primary', 0.625, 2.5],
        ['Frames vs T1', 'Arminius', 'Cataphract', 'primary', 0.725, 2.9],
        [
            'Frames vs T3',
            'Arminius',
            'Cataphract',
            'primary',
            0.4736111,
            3.7888889,
        ],
        [
            'Frames vs Rebake T3',
            'Arminius',
            'Cataphract',
            'primary',
            0.7979167,
            4.7875,
        ],
    ] as const)(
        '%s: %s vs %s %s hits %d of the time, for %d expected damage',
        (tabName, frameName, npc, slot, hit, expected) => {
            const tab = tabNamed(tabName)
            const result = attackDamage(
                weaponOf(tabName, npc, slot),
                sheetDefender(frameNamed(frameName), tab.bonuses),
                tab.cover,
            )
            expect(result.hitChance).toBeCloseTo(hit, 6)
            expect(result.expectedDamage).toBeCloseTo(expected, 6)
        },
    )

    test('the original Strider has no secondary attack', () => {
        expect(
            answerKey.data.attacks.original[0].find(
                (attacks) => attacks.npc === 'Strider',
            )?.secondary,
        ).toBeNull()
    })
})
