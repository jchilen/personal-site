CREATE TABLE polls (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    options TEXT NOT NULL,            -- JSON array of option labels
    expected_voters INTEGER NOT NULL,
    admin_token_hash TEXT NOT NULL,   -- SHA-256 of the admin token, never the token itself
    seed TEXT NOT NULL,               -- tiebreak seed, revealed with the results
    created_at INTEGER NOT NULL,      -- milliseconds since 1970 (Date.now())
    expires_at INTEGER NOT NULL,
    closed_at INTEGER,                -- NULL while the poll is open
    results TEXT                      -- JSON, computed once when the poll closes
) STRICT;

CREATE TABLE ballots (
    id INTEGER PRIMARY KEY,
    poll_id TEXT NOT NULL REFERENCES polls (id) ON DELETE CASCADE,
    voter_id TEXT NOT NULL,
    ranking TEXT NOT NULL,            -- JSON array, the voter's order
    created_at INTEGER NOT NULL,
    UNIQUE (poll_id, voter_id)
) STRICT;