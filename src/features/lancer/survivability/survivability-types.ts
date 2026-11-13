import type { Ruleset } from '../rulesets'

export const DAMAGE_TYPES = [
    'Burn',
    'Energy',
    'Explosive',
    'Heat',
    'Kinetic',
    'Variable',
] as const
export type DamageType = (typeof DAMAGE_TYPES)[number]

/** Resisted damage is halved, rounded up. Immune damage is ignored */
export type DamageTrait = 'resist' | 'immune'

export const WEAPON_TAGS = [
    'AP',
    'Arcing',
    'Heat Self',
    'Knockback',
    'Loading',
    'Ordnance',
    'Reliable',
    'Seeking',
    'Smart',
    'Thrown',
] as const
export type WeaponTag = (typeof WEAPON_TAGS)[number]

export type WeaponSize = 'Auxiliary' | 'Main' | 'Heavy' | 'Superheavy'
export type WeaponType =
    'Melee' | 'CQB' | 'Rifle' | 'Cannon' | 'Launcher' | 'Nexus'
export type Mount = 'Aux/Aux' | 'Main' | 'Main/Aux' | 'Flex' | 'Heavy'

/** One player frame. Its stats are the same under both rulesets */
export type Frame = {
    name: string
    source: string
    /** One or two roles */
    roles: string[]
    mounts: { worst: Mount | null; mid: Mount | null; best: Mount | null }
    efficientCore: boolean
    size: number
    armor: number
    hp: number
    evasion: number
    eDefense: number
    heatCap: number
    repairCap: number
    sensors: number
    techAttack: number
    saveTarget: number
    speed: number
    systemPoints: number
    /** Repairs it takes to restore 1 structure: 2 normally, 1 for Everest's Replaceable Parts */
    structureRepairCost: number
    /** Only the damage types this frame resists or is immune to, like { Burn: 'immune' } */
    damageTraits: Partial<Record<DamageType, DamageTrait>>
}

export type Damage = { amount: number; type: DamageType }

export type Weapon = {
    name: string
    /** null: the weapon has no size (Monstrosity's Claws) */
    size: WeaponSize | null
    /** null: no type, which counts as ranged */
    weaponType: WeaponType | null
    attackBonus: number
    /** Net Accuracy dice: positive is Accuracy, negative is Difficulty */
    accuracy: number
    multiattack: number
    /** In order, so damage[0] is damage 1. A miss with Reliable deals damage 1's type */
    damage: Damage[]
    /** Only the tags the weapon has. Reliable 3 is { Reliable: 3 }; a tag with no number, like Smart, is null */
    tags: Partial<Record<WeaponTag, number | null>>
    range1: string | null
    range2: string | null
    effect: string | null
    onHit: string | null
}

/** One NPC's attacks at one tier. NPCs with no weapons, like the Witch, aren't listed */
export type NpcAttacks = {
    npc: string
    role: string
    primary: Weapon
    secondary: Weapon | null
}

/** One value for each tier: index 0 is Tier 1, index 2 is Tier 3 */
export type ByTier<T> = [T, T, T]

/** Everything the Frame Survivability page needs, from GET /api/lancer/survivability */
export type SurvivabilityData = {
    frames: Frame[]
    attacks: Record<Ruleset, ByTier<NpcAttacks[]>>
}
