import { describe, expect, test } from 'vitest'
import {
    attackDamage,
    attackingWeapons,
    damageInstance,
    hitChance,
    totalHp,
    type DamagePart,
    type Defender,
} from './damage'
import type {
    DamageTrait,
    DamageType,
    NpcAttacks,
    Weapon,
} from './survivability-types'

// A plain 4 Kinetic rifle attack, so each test only spells out what it's about
function weapon(overrides: Partial<Weapon> = {}): Weapon {
    return {
        name: 'Test Rifle',
        size: 'Main',
        weaponType: 'Rifle',
        attackBonus: 0,
        accuracy: 0,
        multiattack: 1,
        damage: [{ amount: 4, type: 'Kinetic' }],
        tags: {},
        range1: null,
        range2: null,
        effect: null,
        onHit: null,
        ...overrides,
    }
}

// Evasion 10 with no bonus or dice is an even 55% to hit: faces 10 to 20
function defender(overrides: Partial<Defender> = {}): Defender {
    return {
        evasion: 10,
        eDefense: 10,
        armor: 0,
        damageTraits: {},
        ...overrides,
    }
}

describe('hitChance', () => {
    test('with no dice, it counts the d20 faces that meet the defense', () => {
        expect(hitChance(10, 0, 0)).toBeCloseTo(0.55, 12)
        expect(hitChance(10, 3, 0)).toBeCloseTo(0.7, 12)
        expect(hitChance(25, 0, 0)).toBe(0)
        expect(hitChance(0, 0, 0)).toBe(1)
    })

    test('1 Difficulty die subtracts the die, so a 5 to 20 hit becomes 45/120', () => {
        // (10 + 9 + 8 + 7 + 6 + 5) faces out of 20, one sixth each
        expect(hitChance(10, 0, -1)).toBeCloseTo(45 / 120, 12)
    })

    test('each die result is capped at 20 faces on its own, not the total afterwards', () => {
        // With +4, +5 or +6 every face hits; with +1 to +3, 17 to 19 faces do
        expect(hitChance(5, 0, 1)).toBeCloseTo(
            (17 + 18 + 19 + 20 + 20 + 20) / 120,
            12,
        )
    })

    test('matches rolling every d20 face with every combination of dice', () => {
        for (let net = -3; net <= 3; net++) {
            for (let gap = -10; gap <= 30; gap++) {
                // gap is defense minus attack bonus
                let hits = 0
                let rolls = 0
                const count = Math.abs(net)
                for (let combo = 0; combo < 6 ** count; combo++) {
                    let highest = 0
                    for (
                        let die = 0, rest = combo;
                        die < count;
                        die++, rest = Math.floor(rest / 6)
                    ) {
                        highest = Math.max(highest, (rest % 6) + 1)
                    }
                    for (let face = 1; face <= 20; face++) {
                        rolls++
                        if (face + Math.sign(net) * highest >= gap) hits++
                    }
                }
                expect(
                    hitChance(gap, 0, net),
                    `net ${net}, gap ${gap}`,
                ).toBeCloseTo(hits / rolls, 12)
            }
        }
    })
})

describe('damageInstance', () => {
    const part = (
        amount: number,
        type: DamageType,
        armorEligible = true,
    ): DamagePart => ({
        amount,
        type,
        armorEligible,
    })

    test('Armor is subtracted once from the whole instance, never below 0 per part', () => {
        expect(
            damageInstance([part(4, 'Kinetic'), part(2, 'Energy')], 3, {}),
        ).toBe(3)
        expect(damageInstance([part(1, 'Kinetic')], 3, {})).toBe(0)
    })

    test('Burn and AP damage skip Armor', () => {
        expect(
            damageInstance([part(4, 'Kinetic'), part(2, 'Burn', false)], 3, {}),
        ).toBe(3)
        expect(damageInstance([part(4, 'Kinetic', false)], 3, {})).toBe(4)
    })

    test('resisted damage is halved, rounded up', () => {
        expect(
            damageInstance([part(5, 'Kinetic')], 0, { Kinetic: 'resist' }),
        ).toBe(3)
    })

    test('two parts of the same resisted type are added before halving, so they round up once', () => {
        expect(
            damageInstance([part(3, 'Kinetic'), part(3, 'Kinetic')], 0, {
                Kinetic: 'resist',
            }),
        ).toBe(3)
    })

    test('immune damage counts 0', () => {
        expect(
            damageInstance([part(4, 'Kinetic'), part(3, 'Burn', false)], 1, {
                Burn: 'immune',
            }),
        ).toBe(3)
    })

    test('Armor goes to unresisted damage first, where each point saves a full point', () => {
        // Energy 4 - 2 = 2, plus Kinetic 5 halved = 3. Armor on Kinetic instead would give 4 + 2 = 6
        expect(
            damageInstance([part(5, 'Kinetic'), part(4, 'Energy')], 2, {
                Kinetic: 'resist',
            }),
        ).toBe(5)
    })

    test('the v6 rounding bug: resisted damage still rounds up when Armor covers the rest', () => {
        // Energy 5 - 3 = 2, plus Kinetic 1 halved, rounded up = 1
        expect(
            damageInstance([part(1, 'Kinetic'), part(5, 'Energy')], 3, {
                Kinetic: 'resist',
            }),
        ).toBe(3)
    })

    test('matches trying every way to split Armor between the parts and keeping the best', () => {
        const types: DamageType[] = ['Kinetic', 'Energy', 'Burn']
        const traitSets: Partial<Record<DamageType, DamageTrait>>[] = [
            {},
            { Kinetic: 'resist' },
            { Energy: 'resist' },
            { Burn: 'immune' },
        ]
        const finalDamage = (
            amounts: Map<DamageType, number>,
            traits: Partial<Record<DamageType, DamageTrait>>,
        ) => {
            let total = 0
            for (const [type, amount] of amounts) {
                if (traits[type] === 'resist') total += Math.ceil(amount / 2)
                else if (traits[type] !== 'immune') total += amount
            }
            return total
        }
        for (const traits of traitSets) {
            for (const typeA of types) {
                for (const typeB of types) {
                    for (let a = 0; a <= 4; a++) {
                        for (let b = 0; b <= 4; b++) {
                            for (const [eligibleA, eligibleB] of [
                                [true, true],
                                [true, false],
                                [false, true],
                                [false, false],
                            ]) {
                                for (let armor = 0; armor <= 6; armor++) {
                                    // Armor must be used as far as the eligible damage allows
                                    const usable = Math.min(
                                        armor,
                                        (eligibleA ? a : 0) +
                                            (eligibleB ? b : 0),
                                    )
                                    let best = Infinity
                                    for (
                                        let onA = 0;
                                        onA <= (eligibleA ? a : 0);
                                        onA++
                                    ) {
                                        const onB = usable - onA
                                        if (
                                            onB < 0 ||
                                            onB > (eligibleB ? b : 0)
                                        )
                                            continue
                                        const amounts = new Map<
                                            DamageType,
                                            number
                                        >()
                                        amounts.set(typeA, a - onA)
                                        amounts.set(
                                            typeB,
                                            (amounts.get(typeB) ?? 0) + b - onB,
                                        )
                                        best = Math.min(
                                            best,
                                            finalDamage(amounts, traits),
                                        )
                                    }
                                    const parts = [
                                        part(a, typeA, eligibleA),
                                        part(b, typeB, eligibleB),
                                    ]
                                    expect(
                                        damageInstance(parts, armor, traits),
                                        JSON.stringify({
                                            parts,
                                            armor,
                                            traits,
                                        }),
                                    ).toBe(best)
                                }
                            }
                        }
                    }
                }
            }
        }
    })
})

describe('attackDamage', () => {
    test('Smart attacks roll against E-Defense instead of Evasion', () => {
        const target = defender({ evasion: 10, eDefense: 15 })
        expect(attackDamage(weapon(), target, 'none').hitChance).toBeCloseTo(
            0.55,
            12,
        )
        expect(
            attackDamage(weapon({ tags: { Smart: null } }), target, 'none')
                .hitChance,
        ).toBeCloseTo(0.3, 12)
    })

    test('cover adds Difficulty to ranged attacks, Smart ones included', () => {
        expect(
            attackDamage(weapon(), defender(), 'soft').hitChance,
        ).toBeCloseTo(45 / 120, 12)
        expect(
            attackDamage(weapon({ tags: { Smart: null } }), defender(), 'soft')
                .hitChance,
        ).toBeCloseTo(45 / 120, 12)
        expect(
            attackDamage(weapon({ weaponType: null }), defender(), 'soft')
                .hitChance,
        ).toBeCloseTo(45 / 120, 12)
    })

    test('Melee and Seeking attacks ignore cover, and Accuracy cancels Difficulty', () => {
        expect(
            attackDamage(weapon({ weaponType: 'Melee' }), defender(), 'hard')
                .hitChance,
        ).toBeCloseTo(0.55, 12)
        expect(
            attackDamage(
                weapon({ tags: { Seeking: null } }),
                defender(),
                'hard',
            ).hitChance,
        ).toBeCloseTo(0.55, 12)
        expect(
            attackDamage(weapon({ accuracy: 1 }), defender(), 'soft').hitChance,
        ).toBeCloseTo(0.55, 12)
    })

    test('expected damage is multiattack × (hit chance × hit damage + miss chance × miss damage)', () => {
        // Evasion 11 is an even 50%. Hits deal 4; misses deal Reliable 2
        const result = attackDamage(
            weapon({ multiattack: 2, tags: { Reliable: 2 } }),
            defender({ evasion: 11 }),
            'none',
        )
        expect(result).toEqual({
            hitChance: 0.5,
            hitDamage: 4,
            missDamage: 2,
            expectedDamage: 6,
        })
    })

    test('Reliable raises damage 1 so the hit deals at least that much, and Armor still reduces it', () => {
        expect(
            attackDamage(
                weapon({
                    damage: [{ amount: 2, type: 'Kinetic' }],
                    tags: { Reliable: 5 },
                }),
                defender(),
                'none',
            ).hitDamage,
        ).toBe(5)
        const twoTypes = weapon({
            damage: [
                { amount: 1, type: 'Kinetic' },
                { amount: 2, type: 'Energy' },
            ],
            tags: { Reliable: 6 },
        })
        expect(attackDamage(twoTypes, defender(), 'none').hitDamage).toBe(6)
        expect(
            attackDamage(twoTypes, defender({ armor: 1 }), 'none').hitDamage,
        ).toBe(5)
    })

    test('a miss deals Reliable as damage 1’s type, after Armor and resistance', () => {
        const result = attackDamage(
            weapon({ tags: { Reliable: 3 } }),
            defender({ armor: 1, damageTraits: { Kinetic: 'resist' } }),
            'none',
        )
        expect(result.missDamage).toBe(1)
        expect(attackDamage(weapon(), defender(), 'none').missDamage).toBe(0)
    })

    test('Heat counts 0, even when Reliable raises it, and is zeroed before the Reliable floor', () => {
        const heatOnly = weapon({
            damage: [{ amount: 3, type: 'Heat' }],
            tags: { Reliable: 2 },
        })
        expect(attackDamage(heatOnly, defender(), 'none')).toMatchObject({
            hitDamage: 0,
            missDamage: 0,
        })
        // Heat damage 2 counts 0, so damage 1 is raised all the way to Reliable 3
        const heatSecond = weapon({
            damage: [
                { amount: 1, type: 'Kinetic' },
                { amount: 2, type: 'Heat' },
            ],
            tags: { Reliable: 3 },
        })
        expect(attackDamage(heatSecond, defender(), 'none').hitDamage).toBe(3)
    })

    test('AP skips Armor for every type', () => {
        expect(
            attackDamage(
                weapon({ tags: { AP: null } }),
                defender({ armor: 3 }),
                'none',
            ).hitDamage,
        ).toBe(4)
        expect(
            attackDamage(weapon(), defender({ armor: 3 }), 'none').hitDamage,
        ).toBe(1)
    })

    test('Variable damage is never resisted: the NPC picks a type the frame doesn’t resist', () => {
        const variable = weapon({ damage: [{ amount: 4, type: 'Variable' }] })
        expect(
            attackDamage(
                variable,
                defender({ damageTraits: { Kinetic: 'resist' } }),
                'none',
            ).hitDamage,
        ).toBe(4)
    })

    test('a weapon with no damage deals none, hit or miss', () => {
        expect(
            attackDamage(
                weapon({ damage: [], tags: { Reliable: 2 } }),
                defender(),
                'none',
            ).expectedDamage,
        ).toBe(0)
    })
})

test('an NPC attacks with both weapons, unless its primary is Superheavy', () => {
    const attacks: NpcAttacks = {
        npc: 'Test',
        role: 'Striker',
        primary: weapon(),
        secondary: weapon({ name: 'Knife' }),
    }
    expect(attackingWeapons(attacks)).toHaveLength(2)
    expect(
        attackingWeapons({
            ...attacks,
            primary: weapon({ size: 'Superheavy' }),
        }),
    ).toHaveLength(1)
    expect(attackingWeapons({ ...attacks, secondary: null })).toHaveLength(1)
})

test('Total HP is HP for each of 4 structure plus each structure Repairs can restore', () => {
    expect(totalHp(10, 5, 2)).toBe(60)
    // Everest's Replaceable Parts: 1 Repair per structure
    expect(totalHp(10, 5, 1)).toBe(90)
})