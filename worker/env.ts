// Bindings from wrangler.jsonc. Add one here whenever you add one there.
export interface Env {
    DB: D1Database
    CREATE_LIMITER: RateLimit
    BALLOT_LIMITER: RateLimit
}
