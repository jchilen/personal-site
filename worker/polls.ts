import {
    validateBallot,
    validateNewPoll,
} from '../src/features/tools/polls/poll-rules'
import type { Env } from './env'
import { errorResponse, getCookie, type Params } from './http'
import { randomToken, sha256 } from './tokens'

const DAY_MS = 24 * 60 * 60 * 1000
const OPEN_DAYS = 7

export async function createPoll(
    request: Request,
    env: Env,
): Promise<Response> {
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
        .bind(
            id,
            title,
            JSON.stringify(options),
            expectedVoters,
            adminTokenHash,
            seed,
            createdAt,
            expiresAt,
        )
        .run()

    // The token goes back twice: in a cookie for this browser, and in the body for the backup admin link
    return Response.json(
        { id, adminToken },
        {
            status: 201,
            headers: { 'Set-Cookie': pollCookie('poll_admin', adminToken, id) },
        },
    )
}

// Cookies only this poll's API receives, lasting as long as the poll can be open
function pollCookie(name: string, value: string, pollId: string): string {
    return [
        `${name}=${value}`,
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

// Closed by hand, or past its 7 days even if nothing has marked it closed yet
function isClosed(
    row: Pick<PollRow, 'expires_at' | 'closed_at'>,
    now: number,
): boolean {
    return row.closed_at !== null || row.expires_at <= now
}

export async function getPoll(
    request: Request,
    env: Env,
    params: Params,
): Promise<Response> {
    const { id } = params
    if (!id) return errorResponse(404, 'Poll not found')

    // Only the columns voters may see: never the admin hash, and the seed stays hidden until results
    const row = await env.DB.prepare(
        'SELECT title, options, expected_voters, expires_at, closed_at FROM polls WHERE id = ?',
    )
        .bind(id)
        .first<PollRow>()
    if (!row) return errorResponse(404, 'Poll not found')

    // Whether this browser has a ballot in this poll (no cookie means it never voted)
    const voterId = getCookie(request, 'poll_voter')
    const ballot = voterId
        ? await env.DB.prepare(
              'SELECT 1 FROM ballots WHERE poll_id = ? AND voter_id = ?',
          )
              .bind(id, voterId)
              .first()
        : null

    return Response.json({
        id,
        title: row.title,
        options: JSON.parse(row.options) as string[],
        expectedVoters: row.expected_voters,
        expiresAt: row.expires_at,
        // A poll past its 7 days counts as closed even before anything has marked it closed
        closed: isClosed(row, Date.now()),
        hasVoted: ballot !== null,
    })
}

export async function castBallot(request: Request, env: Env, params: Params): Promise<Response> {
    const { id } = params
    if (!id) return errorResponse(404, 'Poll not found')

    const row = await env.DB.prepare('SELECT options, expires_at, closed_at FROM polls WHERE id = ?')
        .bind(id)
        .first<Pick<PollRow, 'options' | 'expires_at' | 'closed_at'>>()
    if (!row) return errorResponse(404, 'Poll not found')

    const now = Date.now()
    if (isClosed(row, now)) return errorResponse(409, 'This poll has closed')

    let body: unknown
    try {
        body = await request.json()
    } catch {
        return errorResponse(400, 'Request body must be JSON')
    }

    const check = validateBallot(body, JSON.parse(row.options) as string[])
    if (!check.ok) return errorResponse(400, check.error)

    // This browser's voter ID, or a new one on its first vote in this poll
    const voterId = getCookie(request, 'poll_voter') || randomToken(16)

    // One statement that only inserts while the poll is open, and skips a second ballot from the same browser
    const result = await env.DB.prepare(
        `INSERT INTO ballots (poll_id, voter_id, ranking, created_at)
         SELECT id, ?, ?, ? FROM polls
         WHERE id = ? AND closed_at IS NULL AND expires_at > ?
         ON CONFLICT (poll_id, voter_id) DO NOTHING`,
    )
        .bind(voterId, JSON.stringify(check.value), now, id, now)
        .run()

    if (result.meta.changes === 0) {
        return errorResponse(409, 'Your vote was not counted: you already voted, or the poll just closed')
    }

    return Response.json(
        { ok: true },
        { status: 201, headers: { 'Set-Cookie': pollCookie('poll_voter', voterId, id) } },
    )
}