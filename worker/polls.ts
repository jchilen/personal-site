import { validateNewPoll } from '../src/features/tools/polls/poll-rules'
import type { Env } from './env'
import { errorResponse } from './http'
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