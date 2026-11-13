import type { Ruleset } from '../src/features/lancer/rulesets'
import type {
    ByTier,
    DamageTrait,
    DamageType,
    Frame,
    Mount,
    NpcAttacks,
    SurvivabilityData,
    Weapon,
    WeaponSize,
    WeaponTag,
    WeaponType,
} from '../src/features/lancer/survivability/survivability-types'
import type { Env } from './env'

// Rows as the tables store them, column names and all
type FrameRow = {
    id: number
    name: string
    source: string
    role_1: string
    role_2: string | null
    worst_mount: Mount | null
    mid_mount: Mount | null
    best_mount: Mount | null
    efficient_core: number
    size: number
    armor: number
    hp: number
    evasion: number
    e_defense: number
    heat_cap: number
    repair_cap: number
    sensors: number
    tech_attack: number
    save_target: number
    speed: number
    system_points: number
    structure_repair_cost: number
}

type TraitRow = {
    frame_id: number
    damage_type: DamageType
    trait: DamageTrait
}

// A weapon row joined to the lancer_npcs row it belongs to, which supplies the ruleset, NPC and tier
type WeaponRow = {
    id: number
    ruleset: Ruleset
    npc: string
    role: string
    tier: number
    slot: 'primary' | 'secondary'
    name: string
    size: WeaponSize | null
    weapon_type: WeaponType | null
    attack_bonus: number
    accuracy: number
    multiattack: number
    range_1: string | null
    range_2: string | null
    effect: string | null
    on_hit: string | null
}

type DamageRow = { weapon_id: number; amount: number; damage_type: DamageType }
type TagRow = { weapon_id: number; tag: WeaponTag; value: number | null }

export type SurvivabilityRows = {
    frames: FrameRow[]
    traits: TraitRow[]
    weapons: WeaponRow[]
    damage: DamageRow[]
    tags: TagRow[]
}

// Browsers may reuse the response for 5 minutes, so a new migration shows up within that time
const CACHE_SECONDS = 5 * 60

export async function getSurvivabilityData(
    _request: Request,
    env: Env,
): Promise<Response> {
    // The five queries don't depend on each other, so they all run at the same time
    const [frames, traits, weapons, damage, tags] = await Promise.all([
        env.DB.prepare(
            `SELECT id, name, source, role_1, role_2, worst_mount, mid_mount, best_mount, efficient_core,
                size, armor, hp, evasion, e_defense, heat_cap, repair_cap, sensors, tech_attack,
                save_target, speed, system_points, structure_repair_cost
            FROM lancer_frames ORDER BY id`,
        ).all<FrameRow>(),
        env.DB.prepare(
            'SELECT frame_id, damage_type, trait FROM lancer_frame_damage_traits',
        ).all<TraitRow>(),
        env.DB.prepare(
            `SELECT w.id, n.ruleset, n.name AS npc, n.role, n.tier, w.slot, w.name, w.size, w.weapon_type,
                w.attack_bonus, w.accuracy, w.multiattack, w.range_1, w.range_2, w.effect, w.on_hit
            FROM lancer_npc_weapons w JOIN lancer_npcs n ON n.id = w.npc_id
            ORDER BY n.ruleset, n.name, n.tier`,
        ).all<WeaponRow>(),
        env.DB.prepare(
            'SELECT weapon_id, amount, damage_type FROM lancer_weapon_damage ORDER BY weapon_id, position',
        ).all<DamageRow>(),
        env.DB.prepare(
            'SELECT weapon_id, tag, value FROM lancer_weapon_tags',
        ).all<TagRow>(),
    ])

    const data = buildSurvivabilityData({
        frames: frames.results,
        traits: traits.results,
        weapons: weapons.results,
        damage: damage.results,
        tags: tags.results,
    })
    return Response.json(data, {
        headers: { 'Cache-Control': `public, max-age=${CACHE_SECONDS}` },
    })
}

/** Turns the tables' flat rows into the nested shape the page uses. No database here, so tests can call it directly */
export function buildSurvivabilityData(
    rows: SurvivabilityRows,
): SurvivabilityData {
    const traitsByFrame = groupBy(rows.traits, (row) => row.frame_id)
    const damageByWeapon = groupBy(rows.damage, (row) => row.weapon_id)
    const tagsByWeapon = groupBy(rows.tags, (row) => row.weapon_id)

    const frames = rows.frames.map((row): Frame => ({
        name: row.name,
        source: row.source,
        roles: row.role_2 ? [row.role_1, row.role_2] : [row.role_1],
        mounts: {
            worst: row.worst_mount,
            mid: row.mid_mount,
            best: row.best_mount,
        },
        efficientCore: row.efficient_core === 1,
        size: row.size,
        armor: row.armor,
        hp: row.hp,
        evasion: row.evasion,
        eDefense: row.e_defense,
        heatCap: row.heat_cap,
        repairCap: row.repair_cap,
        sensors: row.sensors,
        techAttack: row.tech_attack,
        saveTarget: row.save_target,
        speed: row.speed,
        systemPoints: row.system_points,
        structureRepairCost: row.structure_repair_cost,
        damageTraits: Object.fromEntries(
            (traitsByFrame.get(row.id) ?? []).map((trait) => [
                trait.damage_type,
                trait.trait,
            ]),
        ),
    }))

    function toWeapon(row: WeaponRow): Weapon {
        return {
            name: row.name,
            size: row.size,
            weaponType: row.weapon_type,
            attackBonus: row.attack_bonus,
            accuracy: row.accuracy,
            multiattack: row.multiattack,
            damage: (damageByWeapon.get(row.id) ?? []).map((damage) => ({
                amount: damage.amount,
                type: damage.damage_type,
            })),
            tags: Object.fromEntries(
                (tagsByWeapon.get(row.id) ?? []).map((tag) => [
                    tag.tag,
                    tag.value,
                ]),
            ),
            range1: row.range_1,
            range2: row.range_2,
            effect: row.effect,
            onHit: row.on_hit,
        }
    }

    const attacks: Record<Ruleset, ByTier<NpcAttacks[]>> = {
        original: [[], [], []],
        rebake: [[], [], []],
    }
    // Primaries first, so every secondary finds its NPC's entry already made
    const entries = new Map<string, NpcAttacks>()
    const key = (row: WeaponRow) => `${row.ruleset}:${row.npc}:${row.tier}`

    for (const row of rows.weapons.filter((row) => row.slot === 'primary')) {
        const entry: NpcAttacks = {
            npc: row.npc,
            role: row.role,
            primary: toWeapon(row),
            secondary: null,
        }
        entries.set(key(row), entry)
        attacks[row.ruleset][row.tier - 1].push(entry)
    }
    for (const row of rows.weapons.filter((row) => row.slot === 'secondary')) {
        const entry = entries.get(key(row))
        // The tables allow it, but an attack can't be made with only a secondary weapon
        if (!entry)
            throw new Error(`${key(row)} has a secondary weapon but no primary`)
        entry.secondary = toWeapon(row)
    }

    return { frames, attacks }
}

// Sorts rows into lists by a number they share, like every damage row of one weapon. Each list keeps the rows' order
function groupBy<T>(rows: T[], keyOf: (row: T) => number): Map<number, T[]> {
    const groups = new Map<number, T[]>()
    for (const row of rows) {
        const group = groups.get(keyOf(row))
        if (group) group.push(row)
        else groups.set(keyOf(row), [row])
    }
    return groups
}
