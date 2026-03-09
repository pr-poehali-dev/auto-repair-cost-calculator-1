CREATE TABLE IF NOT EXISTS works (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(500) NOT NULL,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_works_name ON works (name);
CREATE INDEX IF NOT EXISTS idx_works_sort ON works (sort_order);