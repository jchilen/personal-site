import { COVER_DIFFICULTY, netDieOutcomes, type Cover } from '../rules'
import type {
    DamageTrait,
    DamageType,
    NpcAttacks,
    Weapon,
} from './survivability-types'

/** The frame being attacked, with the pilot's bonuses already added */
export type Defender = {
    evasion: number
    eDefense: number
    armor: number
    damageTraits: Partial<Record<DamageType, DamageTrait>>
}

/** One attack's result: what it deals on a hit and on a miss, and what it deals on average */
export type AttackResult = {
    hitChance: number
    hitDamage: number
    missDamage: number
    /** multiattack × (hit chance × hit damage + miss chance × miss damage) */
    expectedDamage: number
}

/** A piece of one instance of damage, after Heat and the Reliable floor */
export type DamagePart = {
    amount: number
    type: DamageType
    /** False for Burn, Heat, and every type when the attack has AP */
    armorEligible: boolean
}

/**
 * The exact chance an attack hits: d20 + attack bonus ± the highest Accuracy or Difficulty die
 * must meet or beat the defense. Lancer has no automatic hits or misses
 */
export function hitChance(
    defense: number,
    attackBonus: number,
    netAccuracy: number,
): number {
    let chance = 0
    for (const { value, chance: weight } of netDieOutcomes(netAccuracy)) {
        // A face hits when face + bonus + value >= defense. Of the 20 faces, that's this many
        const hittingFaces = 21 - (defense - attackBonus - value)
        chance += (weight * Math.min(20, Math.max(0, hittingFaces))) / 20
    }
    return chance
}

// Armor goes where it saves the most: a point on unresisted damage always saves 1, a point on
// resisted damage saves at most 1, and a point on damage the frame is immune to saves nothing
const ARMOR_ORDER = { unresisted: 0, resist: 1, immune: 2 }

/**
 * The damage one instance deals. Armor is subtracted once from the instance's Armor-eligible
 * damage, never below 0 per part; then resisted types are halved, rounded up, and immune types
 * count 0. Parts of the same type are added together before halving
 */
export function damageInstance(
    parts: DamagePart[],
    armor: number,
    traits: Defender['damageTraits'],
): number {
    const order = (part: DamagePart) =>
        ARMOR_ORDER[traits[part.type] ?? 'unresisted']
    let armorLeft = armor
    const byType = new Map<DamageType, number>()
    for (const part of [...parts].sort((a, b) => order(a) - order(b))) {
        const blocked = part.armorEligible
            ? Math.min(armorLeft, part.amount)
            : 0
        armorLeft -= blocked
        byType.set(
            part.type,
            (byType.get(part.type) ?? 0) + part.amount - blocked,
        )
    }

    let total = 0
    for (const [type, amount] of byType) {
        const trait = traits[type]
        if (trait === 'resist') total += Math.ceil(amount / 2)
        else if (trait !== 'immune') total += amount
    }
    return total
}

/** What one weapon's attack does to the defender, on average */
export function attackDamage(
    weapon: Weapon,
    defender: Defender,
    cover: Cover,
): AttackResult {
    const { tags } = weapon
    const defense = 'Smart' in tags ? defender.eDefense : defender.evasion
    // Cover only protects against ranged attacks, and Seeking attacks go around it
    const ignoresCover = weapon.weaponType === 'Melee' || 'Seeking' in tags
    const netAccuracy =
        weapon.accuracy - (ignoresCover ? 0 : COVER_DIFFICULTY[cover])
    const chance = hitChance(defense, weapon.attackBonus, netAccuracy)

    const reliable = tags.Reliable ?? 0
    const armorEligible = (type: DamageType) =>
        !('AP' in tags) && type !== 'Burn' && type !== 'Heat'
    // Heat isn't damage, so it counts 0 everywhere, including after the Reliable floor
    const amountOf = (type: DamageType, amount: number) =>
        type === 'Heat' ? 0 : amount

    const parts: DamagePart[] = weapon.damage.map((damage) => ({
        amount: amountOf(damage.type, damage.amount),
        type: damage.type,
        armorEligible: armorEligible(damage.type),
    }))
    const [first, second] = parts
    // Reliable: the weapon always deals at least that much, made up on damage 1
    const otherDamage = second?.amount ?? 0
    if (first && first.amount + otherDamage < reliable) {
        first.amount = amountOf(first.type, reliable - otherDamage)
    }

    const hitDamage = damageInstance(
        parts,
        defender.armor,
        defender.damageTraits,
    )
    // A miss still deals the Reliable amount, as one instance of damage 1's type
    const missDamage = first
        ? damageInstance(
              [
                  {
                      amount: amountOf(first.type, reliable),
                      type: first.type,
                      armorEligible: first.armorEligible,
                  },
              ],
              defender.armor,
              defender.damageTraits,
          )
        : 0

    return {
        hitChance: chance,
        hitDamage,
        missDamage,
        expectedDamage:
            weapon.multiattack *
            (chance * hitDamage + (1 - chance) * missDamage),
    }
}

/** The weapons an NPC attacks with: both, unless its primary is Superheavy */
export function attackingWeapons(attacks: NpcAttacks): Weapon[] {
    if (!attacks.secondary || attacks.primary.size === 'Superheavy') {
        return [attacks.primary]
    }
    return [attacks.primary, attacks.secondary]
}

/** One blast: every NPC attacks the defender once. Returns the average damage it deals */
export function blastDamage(
    blast: NpcAttacks[],
    defender: Defender,
    cover: Cover,
): number {
    let total = 0
    for (const attacks of blast) {
        for (const weapon of attackingWeapons(attacks)) {
            total += attackDamage(weapon, defender, cover).expectedDamage
        }
    }
    return total
}

/**
 * Every point of damage the frame can take: its HP for each of its 4 structure, plus each
 * structure its Repairs can restore. Repairs are used whole, so leftovers are wasted
 */
export function totalHp(
    hp: number,
    repairCap: number,
    structureRepairCost: number,
): number {
    return hp * (4 + Math.floor(repairCap / structureRepairCost))
}
