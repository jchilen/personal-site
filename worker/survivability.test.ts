import { describe, expect, test } from 'vitest'
import { buildSurvivabilityData, type SurvivabilityRows } from './survivability'

// A frame row with every stat filled in, so each test only spells out what it's about
const frameRow = {
    id: 1,
    name: 'Everest',
    source: 'GMS',
    role_1: 'Balanced',
    role_2: null,
    worst_mount: null,
    mid_mount: 'Flex',
    best_mount: 'Main/Aux',
    efficient_core: 0,
    size: 1,
    armor: 0,
    hp: 10,
    evasion: 8,
    e_defense: 8,
    heat_cap: 6,
    repair_cap: 5,
    sensors: 10,
    tech_attack: 0,
    save_target: 10,
    speed: 4,
    system_points: 6,
    structure_repair_cost: 1,
} satisfies SurvivabilityRows['frames'][number]

const weaponRow = {
    id: 10,
    ruleset: 'original',
    npc: 'Assault',
    role: 'Striker',
    tier: 2,
    slot: 'primary',
    name: 'Heavy Assault Rifle',
    size: 'Main',
    weapon_type: 'Rifle',
    attack_bonus: 1,
    accuracy: 0,
    multiattack: 1,
    range_1: 'Range 10',
    range_2: null,
    effect: null,
    on_hit: null,
} satisfies SurvivabilityRows['weapons'][number]

const noRows: SurvivabilityRows = {
    frames: [],
    traits: [],
    weapons: [],
    damage: [],
    tags: [],
}

describe('frames', () => {
    test('renames columns, turns 0/1 into true/false, and lists one or two roles', () => {
        const data = buildSurvivabilityData({
            ...noRows,
            frames: [
                frameRow,
                {
                    ...frameRow,
                    id: 2,
                    name: 'Atlas',
                    role_1: 'Striker',
                    role_2: 'Defender',
                    efficient_core: 1,
                },
            ],
        })
        expect(data.frames[0]).toMatchObject({
            name: 'Everest',
            roles: ['Balanced'],
            mounts: { worst: null, mid: 'Flex', best: 'Main/Aux' },
            efficientCore: false,
            eDefense: 8,
            repairCap: 5,
            structureRepairCost: 1,
            damageTraits: {},
        })
        expect(data.frames[1]).toMatchObject({
            roles: ['Striker', 'Defender'],
            efficientCore: true,
        })
    })

    test('each frame gets only its own resistances and immunities', () => {
        const data = buildSurvivabilityData({
            ...noRows,
            frames: [frameRow, { ...frameRow, id: 2, name: 'Genghis' }],
            traits: [{ frame_id: 2, damage_type: 'Burn', trait: 'immune' }],
        })
        expect(data.frames[0].damageTraits).toEqual({})
        expect(data.frames[1].damageTraits).toEqual({ Burn: 'immune' })
    })
})

describe('NPC attacks', () => {
    test("files each NPC under its ruleset and tier, with its weapon's damage in order and its tags by name", () => {
        const data = buildSurvivabilityData({
            ...noRows,
            weapons: [weaponRow],
            damage: [
                { weapon_id: 10, amount: 4, damage_type: 'Kinetic' },
                { weapon_id: 10, amount: 2, damage_type: 'Burn' },
            ],
            tags: [
                { weapon_id: 10, tag: 'Reliable', value: 3 },
                { weapon_id: 10, tag: 'Smart', value: null },
            ],
        })
        expect(data.attacks.original[0]).toEqual([])
        expect(data.attacks.rebake[1]).toEqual([])
        expect(data.attacks.original[1]).toEqual([
            {
                npc: 'Assault',
                role: 'Striker',
                primary: {
                    name: 'Heavy Assault Rifle',
                    size: 'Main',
                    weaponType: 'Rifle',
                    attackBonus: 1,
                    accuracy: 0,
                    multiattack: 1,
                    damage: [
                        { amount: 4, type: 'Kinetic' },
                        { amount: 2, type: 'Burn' },
                    ],
                    tags: { Reliable: 3, Smart: null },
                    range1: 'Range 10',
                    range2: null,
                    effect: null,
                    onHit: null,
                },
                secondary: null,
            },
        ])
    })

    test('a secondary weapon joins its own NPC at its own tier, whatever order the rows come in', () => {
        const data = buildSurvivabilityData({
            ...noRows,
            weapons: [
                {
                    ...weaponRow,
                    id: 11,
                    slot: 'secondary',
                    name: 'Combat Knife',
                },
                weaponRow,
                { ...weaponRow, id: 12, tier: 3, name: 'Tier 3 Rifle' },
            ],
        })
        expect(data.attacks.original[1]).toHaveLength(1)
        expect(data.attacks.original[1][0].primary.name).toBe(
            'Heavy Assault Rifle',
        )
        expect(data.attacks.original[1][0].secondary?.name).toBe('Combat Knife')
        expect(data.attacks.original[2][0].secondary).toBeNull()
    })

    test('a weapon with no damage rows has no damage', () => {
        const data = buildSurvivabilityData({ ...noRows, weapons: [weaponRow] })
        expect(data.attacks.original[1][0].primary.damage).toEqual([])
        expect(data.attacks.original[1][0].primary.tags).toEqual({})
    })

    test('a secondary weapon without a primary is an error, not a silently missing attack', () => {
        expect(() =>
            buildSurvivabilityData({
                ...noRows,
                weapons: [{ ...weaponRow, slot: 'secondary' }],
            }),
        ).toThrow('original:Assault:2 has a secondary weapon but no primary')
    })
})
