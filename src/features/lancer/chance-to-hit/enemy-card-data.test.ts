import { expect, test } from 'vitest'
import { buildEnemyCards } from './enemy-card-data'
import type { LancerNpc } from './npc-types'
import { DEFAULT_STATE, newTarget } from './settings'

const ACE: LancerNpc = {
    name: 'Ace',
    role: 'Striker',
    evasion: [12, 15, 18],
    eDefense: [8, 8, 10],
}

test('builds each card from your effects plus its own: copies numbered, missing enemies skipped', () => {
    const cards = buildEnemyCards([ACE], {
        ...DEFAULT_STATE,
        targets: [
            // Not in this ruleset, so it's skipped, and doesn't count toward the copy numbers
            newTarget('Sniper'),
            { ...newTarget('Ace'), cover: 'hard' },
            { ...newTarget('Ace'), lockOn: true },
        ],
    })

    // Against Evasion 12 with no bonus. Hard cover is 2 Difficulty: 163 of the 720 rolls of a d20
    // and 2d6 hit. Lock On is 1 Accuracy: 75 of the 120 rolls of a d20 and a d6 hit
    expect(
        cards.map((card) => [card.title, card.netAccuracy, card.odds.hit]),
    ).toEqual([
        ['Ace', -2, expect.closeTo(163 / 720, 10)],
        ['Ace (2)', 1, expect.closeTo(75 / 120, 10)],
    ])
})
