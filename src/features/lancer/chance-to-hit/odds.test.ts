import { describe, expect, test } from 'vitest'
import type { LancerNpc } from './npc-types'
import {
    attackOdds,
    attackTotals,
    averageOdds,
    grit,
    netDieOutcomes,
    targetDefense,
    NO_TARGET_EFFECTS,
    type YourSettings,
} from './odds'

// A plain weapon attack with nothing on
const BASE: YourSettings = {
    attackType: 'weapon',
    licenseLevel: 0,
    frameTechAttack: 0,
    systems: 0,
    flatBonus: 0,
    otherAccuracy: 0,
    otherDifficulty: 0,
    impaired: false,
    engaged: false,
}

// Odds with no dice and no invisibility, for tests that only change the target and bonus
function plain(target: number, bonus: number) {
    return attackOdds({ target, bonus, netAccuracy: 0, invisible: false })
}

describe('grit', () => {
    test('is half the License Level, rounded up', () => {
        expect([0, 1, 2, 3, 4, 12].map(grit)).toEqual([0, 1, 1, 2, 2, 6])
    })
})

describe('netDieOutcomes', () => {
    test('no dice: a single outcome of 0', () => {
        expect(netDieOutcomes(0)).toEqual([{ value: 0, chance: 1 }])
    })

    test('the chances always add up to 1', () => {
        for (const net of [-3, -1, 1, 2, 5]) {
            const sum = netDieOutcomes(net).reduce(
                (total, outcome) => total + outcome.chance,
                0,
            )
            expect(sum).toBeCloseTo(1, 10)
        }
    })

    test('2 Accuracy: the highest die is a 6 in 11 of 36 rolls', () => {
        expect(netDieOutcomes(2).at(-1)).toEqual({ value: 6, chance: 11 / 36 })
    })

    test('Difficulty subtracts', () => {
        expect(netDieOutcomes(-1).map((outcome) => outcome.value)).toEqual([
            -1, -2, -3, -4, -5, -6,
        ])
    })
})

describe('attackOdds', () => {
    test('matches the spreadsheet away from the edges: (21 + bonus − target) ÷ 20', () => {
        expect(plain(12, 0).hit).toBeCloseTo(0.45, 10)
        expect(plain(10, 2).hit).toBeCloseTo(0.65, 10)
    })

    test('crits on totals of 20 or more', () => {
        expect(plain(12, 0).crit).toBeCloseTo(0.05, 10) // only a natural 20
        expect(plain(10, 2).crit).toBeCloseTo(0.15, 10) // faces 18, 19, 20
    })

    test('a crit still has to hit', () => {
        expect(plain(22, 0)).toEqual({ hit: 0, crit: 0 })
        expect(plain(22, 3).hit).toBeCloseTo(0.1, 10)
        expect(plain(22, 3).crit).toBeCloseTo(0.1, 10)
    })

    test('stays between 0% and 100%', () => {
        expect(plain(6, 30)).toEqual({ hit: 1, crit: 1 })
        expect(plain(20, -30)).toEqual({ hit: 0, crit: 0 })
    })

    test('1 Accuracy near the edge is exact, not the +3.5 shortcut', () => {
        // Against 6, only 10 of the 120 face-and-die pairs total 5 or less, so 110/120 hit.
        // The shortcut would say (21 + 3.5 − 6) ÷ 20 = 92.5%
        const odds = attackOdds({
            target: 6,
            bonus: 0,
            netAccuracy: 1,
            invisible: false,
        })
        expect(odds.hit).toBeCloseTo(110 / 120, 10)
    })

    test('1 Difficulty against 10: 45 of the 120 pairs hit', () => {
        const odds = attackOdds({
            target: 10,
            bonus: 0,
            netAccuracy: -1,
            invisible: false,
        })
        expect(odds.hit).toBeCloseTo(45 / 120, 10)
    })

    test('Invisible halves both chances', () => {
        const odds = attackOdds({
            target: 12,
            bonus: 0,
            netAccuracy: 0,
            invisible: true,
        })
        expect(odds.hit).toBeCloseTo(0.225, 10)
        expect(odds.crit).toBeCloseTo(0.025, 10)
    })
})

describe('attackTotals', () => {
    test('nothing on: all zero, with no sources listed', () => {
        const totals = attackTotals(BASE)
        expect(totals.accuracy).toEqual({ total: 0, sources: [] })
        expect(totals.difficulty).toEqual({ total: 0, sources: [] })
        expect(totals.bonus).toEqual({ total: 0, sources: [] })
    })

    test('lists each source that adds up to a total', () => {
        const totals = attackTotals(
            { ...BASE, otherAccuracy: 1 },
            { ...NO_TARGET_EFFECTS, lockOn: true, prone: true, cover: 'hard' },
        )
        expect(totals.accuracy).toEqual({
            total: 3,
            sources: [
                { label: 'Lock On', value: 1 },
                { label: 'Prone', value: 1 },
                { label: 'Other', value: 1 },
            ],
        })
        expect(totals.difficulty).toEqual({
            total: 2,
            sources: [{ label: 'Hard cover', value: 2 }],
        })
        expect(totals.netAccuracy).toBe(1)
    })

    test('weapon attacks use Grit and ignore the tech-only bonuses', () => {
        const totals = attackTotals({
            ...BASE,
            licenseLevel: 5,
            frameTechAttack: 2,
            systems: 3,
        })
        expect(totals.bonus).toEqual({
            total: 3,
            sources: [{ label: 'Grit', value: 3 }],
        })
    })

    test('tech attacks add Frame Tech Attack and Systems, and ignore cover and Engaged', () => {
        const totals = attackTotals(
            {
                ...BASE,
                attackType: 'tech',
                licenseLevel: 5,
                frameTechAttack: -2,
                systems: 3,
                engaged: true,
            },
            { ...NO_TARGET_EFFECTS, cover: 'hard' },
        )
        expect(totals.bonus.total).toBe(3 - 2 + 3)
        expect(totals.difficulty).toEqual({ total: 0, sources: [] })
    })
})

describe('targetDefense', () => {
    const npc: LancerNpc = {
        name: 'Test',
        role: 'Striker',
        evasion: [8, 10, 12],
        eDefense: [6, 7, 8],
    }

    test('weapons roll against Evasion; Smart weapons and tech against E-Defense', () => {
        expect(targetDefense(npc, 'weapon', 2)).toBe(10)
        expect(targetDefense(npc, 'smart', 2)).toBe(7)
        expect(targetDefense(npc, 'tech', 3)).toBe(8)
    })
})

describe('averageOdds', () => {
    test('averages hit and crit separately', () => {
        expect(
            averageOdds([
                { hit: 0.5, crit: 0.1 },
                { hit: 0.7, crit: 0.3 },
            ]),
        ).toEqual({ hit: 0.6, crit: 0.2 })
    })

    test('an empty list averages to 0, instead of dividing by zero', () => {
        expect(averageOdds([])).toEqual({ hit: 0, crit: 0 })
    })
})
