CREATE TABLE IF NOT EXISTS modification_works (
    modification_id TEXT NOT NULL,
    work_name TEXT NOT NULL,
    hours NUMERIC NOT NULL DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (modification_id, work_name)
);

CREATE INDEX IF NOT EXISTS idx_mod_works_mod ON modification_works(modification_id);