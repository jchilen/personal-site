import type { Env } from './env'

const DAY_MS = 24 * 60 * 60 * 1000
const KEEP_DAYS = 30

// Deletes polls that closed (or expired, if nobody ever opened their results) over 30 days ago.
// Their ballots are deleted with them by ON DELETE CASCADE.
export async function deleteOldPolls(env: Env, now: number): Promise<void> {
    const result = await env.DB.prepare(
        'DELETE FROM polls WHERE COALESCE(closed_at, expires_at) < ?',
    )
        .bind(now - KEEP_DAYS * DAY_MS)
        .run()

    console.log(`Deleted ${result.meta.changes} old polls`)
}
