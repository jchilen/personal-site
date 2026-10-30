-- Which browser created each poll (hashed, like the admin token). NULL for polls made before this
ALTER TABLE polls ADD COLUMN creator_id_hash TEXT;

-- Finding "my polls" searches by this column, so index it
CREATE INDEX polls_by_creator ON polls (creator_id_hash);