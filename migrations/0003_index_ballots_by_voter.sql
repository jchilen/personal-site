-- "Which polls did this browser vote in?" searches ballots by voter_id
CREATE INDEX ballots_by_voter ON ballots (voter_id);