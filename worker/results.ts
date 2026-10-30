import {
    computeResults,
    type PollResults,
} from '../src/features/tools/polls/results'
import { isAdmin } from './admin'
import type { Env } from './env'
import { errorResponse, type Params } from './http'
import { isClosed, type PollRow } from './polls'

// Server-side only: includes the admin hash and seed, which must never be put in a response as-is
type PollDetails = Omit<PollRow, 'id' | 'created_at'>

function loadPoll(env: Env, id: string): Promise<PollDetails | null> {
    return env.DB.prepare(
        `SELECT title, options, expected_voters, admin_token_hash, seed, expires_at, closed_at, results
         FROM polls WHERE id = ?`,
    )
        .bind(id)
        .first<PollDetails>()
}

// The stored results, computed and saved the first time a closed or expired poll needs them
async function ensureResults(
    env: Env,
    id: string,
    poll: PollDetails,
): Promise<PollResults> {
    if (poll.results !== null) return JSON.parse(poll.results) as PollResults

    // Mark the poll closed first. After this, the ballot insert's guard rejects every new vote,
    // so the ballots read below are final. An expired poll counts as closed when it expired.
    const closedAt = Math.min(Date.now(), poll.expires_at)
    await env.DB.prepare(
        'UPDATE polls SET closed_at = ? WHERE id = ? AND closed_at IS NULL',
    )
        .bind(closedAt, id)
        .run()

    const { results: rows } = await env.DB.prepare(
        'SELECT ranking FROM ballots WHERE poll_id = ? ORDER BY id',
    )
        .bind(id)
        .all<{ ranking: string }>()
    const ballots = rows.map((row) => JSON.parse(row.ranking) as string[])
    const results = computeResults(
        JSON.parse(poll.options) as string[],
        ballots,
        poll.seed,
    )

    // If two requests get here at once, both compute identical results; only the first save is kept
    await env.DB.prepare(
        'UPDATE polls SET results = ? WHERE id = ? AND results IS NULL',
    )
        .bind(JSON.stringify(results), id)
        .run()

    return results
}

export async function getStatus(
    request: Request,
    env: Env,
    params: Params,
): Promise<Response> {
    const { id } = params
    const poll = id ? await loadPoll(env, id) : null
    if (!id || !poll) return errorResponse(404, 'Poll not found')
    if (!(await isAdmin(request, poll.admin_token_hash))) {
        return errorResponse(403, 'Only the poll creator can see this')
    }

    const row = await env.DB.prepare(
        'SELECT COUNT(*) AS count FROM ballots WHERE poll_id = ?',
    )
        .bind(id)
        .first<{ count: number }>()

    return Response.json({
        ballotCount: row?.count ?? 0,
        expectedVoters: poll.expected_voters,
        closed: isClosed(poll, Date.now()),
    })
}

export async function closePoll(
    request: Request,
    env: Env,
    params: Params,
): Promise<Response> {
    const { id } = params
    const poll = id ? await loadPoll(env, id) : null
    if (!id || !poll) return errorResponse(404, 'Poll not found')
    if (!(await isAdmin(request, poll.admin_token_hash))) {
        return errorResponse(403, 'Only the poll creator can close this poll')
    }

    // Closing an already-closed poll just returns its results
    return Response.json(await ensureResults(env, id, poll))
}

export async function getResults(
    _request: Request,
    env: Env,
    params: Params,
): Promise<Response> {
    const { id } = params
    const poll = id ? await loadPoll(env, id) : null
    if (!id || !poll) return errorResponse(404, 'Poll not found')
    if (!isClosed(poll, Date.now())) {
        return errorResponse(403, 'Results are hidden until the poll closes')
    }

    return Response.json({
        title: poll.title,
        options: JSON.parse(poll.options) as string[],
        expectedVoters: poll.expected_voters,
        results: await ensureResults(env, id, poll),
    })
}
