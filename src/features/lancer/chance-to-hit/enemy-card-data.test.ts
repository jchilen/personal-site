import { expect, test } from 'vitest'
import { buildEnemyCards } from './enemy-card-data'
import type { LancerNpc } from './npc-types'
import type { Tier } from './odds'
import {
    DEFAULT_STATE,
    newTarget,
    type PageState,
    type Target,
} from './settings'

const ACE: LancerNpc = {
    name: 'Ace',
    role: 'Striker',
    evasion: [12, 15, 18],
    eDefense: [8, 8, 10],
}

// The page with Original showing, at this Setup tier, holding these cards
function withCards(tier: Tier, targets: Target[]): PageState {
    return {
        ...DEFAULT_STATE,
        rulesets: { ...DEFAULT_STATE.rulesets, original: { tier, targets } },
    }
}

test('builds each card from your effects plus its own: copies numbered, missing enemies skipped', () => {
    const cards = buildEnemyCards(
        [ACE],
        withCards(1, [
            // Not in this ruleset, so it's skipped, and doesn't count toward the copy numbers
            newTarget('Sniper'),
            { ...newTarget('Ace'), cover: 'hard' },
            { ...newTarget('Ace'), lockOn: true },
        ]),
    )

    // Against Evasion 12 with no bonus. Hard cover is 2 Difficulty: 163 of the 720 rolls of a d20
    // and 2d6 hit. Lock On is 1 Accuracy: 75 of the 120 rolls of a d20 and a d6 hit
    expect(
        cards.map((card) => [card.title, card.netAccuracy, card.odds.hit]),
    ).toEqual([
        ['Ace', -2, expect.closeTo(163 / 720, 10)],
        ['Ace (2)', 1, expect.closeTo(75 / 120, 10)],
    ])
})

test("a card with its own tier uses it; the rest follow Setup's", () => {
    const cards = buildEnemyCards(
        [ACE],
        withCards(1, [newTarget('Ace'), { ...newTarget('Ace'), tier: 3 }]),
    )

    // Evasion 12 at T1 and 18 at T3, with no bonus: 9 and 3 of the 20 faces hit
    expect(cards.map((card) => [card.tier, card.odds.hit])).toEqual([
        [1, expect.closeTo(9 / 20, 10)],
        [3, expect.closeTo(3 / 20, 10)],
    ])
})
