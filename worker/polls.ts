import {
    validateBallot,
    validateNewPoll,
} from '../src/features/tools/polls/poll-rules'
import type { Env } from './env'
import {
    cookie,
    errorResponse,
    getCookie,
    withinRateLimit,
    type Params,
} from './http'
import { randomToken, sha256 } from './tokens'

// A poll lasts at most 7 days open plus 30 days of results, so this outlasts every poll it lists.
// Creating another poll resets the clock.
const DAY_MS = 24 * 60 * 60 * 1000
const OPEN_DAYS = 7
const CREATOR_COOKIE_DAYS = 37

export async function createPoll(
    request: Request,
    env: Env,
): Promise<Response> {
    if (!(await withinRateLimit(env.CREATE_LIMITER, request))) {
        return errorResponse(
            429,
            'Too many polls created. Try again in a minute.',
        )
    }
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
    // Reuse this browser's creator ID, so all its polls share one list
    const creatorId = getCookie(request, 'poll_creator') || randomToken(32)
    const creatorIdHash = await sha256(creatorId)
    const seed = randomToken(16)
    const createdAt = Date.now()
    const expiresAt = createdAt + OPEN_DAYS * DAY_MS

    await env.DB.prepare(
        `INSERT INTO polls (id, title, options, expected_voters, admin_token_hash, creator_id_hash, seed, created_at, expires_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
        .bind(
            id,
            title,
            JSON.stringify(options),
            expectedVoters,
            adminTokenHash,
            creatorIdHash,
            seed,
            createdAt,
            expiresAt,
        )
        .run()

    // Two cookies: admin access to this poll, and the creator ID for "Your polls".
    // Set-Cookie is the one header that can't be merged into one line, so each gets its own append
    const headers = new Headers()
    headers.append('Set-Cookie', pollCookie('poll_admin', adminToken, id))
    headers.append(
        'Set-Cookie',
        cookie('poll_creator', creatorId, '/api/polls', CREATOR_COOKIE_DAYS),
    )

    return Response.json({ id, adminToken }, { status: 201, headers })
}

// Cookies only this poll's API receives, lasting as long as the poll can be open
export function pollCookie(
    name: string,
    value: string,
    pollId: string,
): string {
    return cookie(name, value, `/api/polls/${pollId}`, OPEN_DAYS)
}

// Every column of the polls table. Queries that select fewer columns use Pick<PollRow, ...>
export interface PollRow {
    id: string
    title: string
    options: string
    expected_voters: number
    admin_token_hash: string
    seed: string
    created_at: number
    expires_at: number
    closed_at: number | null
    results: string | null
    creator_id_hash: string | null
}

// Closed by hand, or past its 7 days even if nothing has marked it closed yet
export function isClosed(
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
        .first<
            Pick<
                PollRow,
                | 'title'
                | 'options'
                | 'expected_voters'
                | 'expires_at'
                | 'closed_at'
            >
        >()
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

export async function castBallot(
    request: Request,
    env: Env,
    params: Params,
): Promise<Response> {
    const { id } = params
    if (!id) return errorResponse(404, 'Poll not found')
    if (!(await withinRateLimit(env.BALLOT_LIMITER, request))) {
        return errorResponse(
            429,
            "You're requesting too fast!. Try again in a minute.",
        )
    }

    const row = await env.DB.prepare(
        'SELECT options, expires_at, closed_at FROM polls WHERE id = ?',
    )
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
        return errorResponse(
            409,
            'Your vote was not counted: you already voted, or the poll just closed',
        )
    }

    return Response.json(
        { ok: true },
        {
            status: 201,
            headers: { 'Set-Cookie': pollCookie('poll_voter', voterId, id) },
        },
    )
}

type MyPollRow = Pick<
    PollRow,
    | 'id'
    | 'title'
    | 'expected_voters'
    | 'created_at'
    | 'expires_at'
    | 'closed_at'
> & { ballot_count: number }

export async function listMyPolls(
    request: Request,
    env: Env,
): Promise<Response> {
    // No cookie means this browser hasn't created any polls: an empty list, not an error
    const creatorId = getCookie(request, 'poll_creator')
    if (!creatorId) return Response.json({ polls: [] })

    const { results: rows } = await env.DB.prepare(
        `SELECT id, title, expected_voters, created_at, expires_at, closed_at,
                (SELECT COUNT(*) FROM ballots WHERE ballots.poll_id = polls.id) AS ballot_count
         FROM polls
         WHERE creator_id_hash = ?
         ORDER BY created_at DESC`,
    )
        .bind(await sha256(creatorId))
        .all<MyPollRow>()

    const now = Date.now()
    return Response.json({
        polls: rows.map((row) => ({
            id: row.id,
            title: row.title,
            expectedVoters: row.expected_voters,
            ballotCount: row.ballot_count,
            createdAt: row.created_at,
            closed: isClosed(row, now),
        })),
    })
}
