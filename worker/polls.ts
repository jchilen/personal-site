import { validateNewPoll } from '../src/features/tools/polls/poll-rules'
import type { Env } from './env'
import { errorResponse, type Params } from './http'
import { randomToken, sha256 } from './tokens'

const DAY_MS = 24 * 60 * 60 * 1000
const OPEN_DAYS = 7

export async function createPoll(request: Request, env: Env): Promise<Response> {
    let body: unknown
    try {
        body = await request.json()
    } catch {
        return errorResponse(400, 'Request body must be JSON')
    }

    const check = validateNewPoll(body)
    if (!check.ok) return errorResponse(400, check.error)
    const { title, options, expectedVoters } = check.value

    const id = randomToken(8)
    const adminToken = randomToken(32)
    const adminTokenHash = await sha256(adminToken)
    const seed = randomToken(16)
    const createdAt = Date.now()
    const expiresAt = createdAt + OPEN_DAYS * DAY_MS

    await env.DB.prepare(
        `INSERT INTO polls (id, title, options, expected_voters, admin_token_hash, seed, created_at, expires_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    )
        .bind(id, title, JSON.stringify(options), expectedVoters, adminTokenHash, seed, createdAt, expiresAt)
        .run()

    // The token goes back twice: in a cookie for this browser, and in the body for the backup admin link
    return Response.json(
        { id, adminToken },
        { status: 201, headers: { 'Set-Cookie': adminCookie(id, adminToken) } },
    )
}

function adminCookie(pollId: string, token: string): string {
    return [
        `poll_admin=${token}`,
        `Path=/api/polls/${pollId}`,
        `Max-Age=${OPEN_DAYS * 24 * 60 * 60}`,
        'HttpOnly',
        'Secure',
        'SameSite=Strict',
    ].join('; ')
}

interface PollRow {
    title: string
    options: string
    expected_voters: number
    expires_at: number
    closed_at: number | null
}

export async function getPoll(_request: Request, env: Env, params: Params): Promise<Response> {
    const { id } = params
    if (!id) return errorResponse(404, 'Poll not found')

    // Only the columns voters may see: never the admin hash, and the seed stays hidden until results
    const row = await env.DB.prepare(
        'SELECT title, options, expected_voters, expires_at, closed_at FROM polls WHERE id = ?',
    )
        .bind(id)
        .first<PollRow>()
    if (!row) return errorResponse(404, 'Poll not found')

    return Response.json({
        id,
        title: row.title,
        options: JSON.parse(row.options) as string[],
        expectedVoters: row.expected_voters,
        expiresAt: row.expires_at,
        // A poll past its 7 days counts as closed even before anything has marked it closed
        closed: row.closed_at !== null || row.expires_at <= Date.now(),
    })
}