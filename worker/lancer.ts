import type {
    LancerNpc,
    LancerNpcSets,
    Ruleset,
} from '../src/features/lancer/chance-to-hit/npc-types'
import type { Env } from './env'

type NpcRow = {
    ruleset: Ruleset
    name: string
    role: string
    tier: number
    evasion: number
    e_defense: number
}

// Browsers may reuse the response for 5 minutes, so hand edits to the table show up within that time
const CACHE_SECONDS = 5 * 60

export async function listLancerNpcs(
    _request: Request,
    env: Env,
): Promise<Response> {
    const { results: rows } = await env.DB.prepare(
        'SELECT ruleset, name, role, tier, evasion, e_defense FROM lancer_npcs ORDER BY ruleset, name, tier',
    ).all<NpcRow>()

    // The table has one row per tier; the page wants one entry per NPC holding all three tiers
    const sets: LancerNpcSets = { original: [], rebake: [] }
    const byKey = new Map<string, LancerNpc>()

    for (const row of rows) {
        const key = `${row.ruleset}:${row.name}`
        let npc = byKey.get(key)
        if (!npc) {
            npc = {
                name: row.name,
                role: row.role,
                evasion: [0, 0, 0],
                eDefense: [0, 0, 0],
            }
            byKey.set(key, npc)
            sets[row.ruleset].push(npc)
        }
        npc.evasion[row.tier - 1] = row.evasion
        npc.eDefense[row.tier - 1] = row.e_defense
    }

    return Response.json(sets, {
        headers: { 'Cache-Control': `public, max-age=${CACHE_SECONDS}` },
    })
}
