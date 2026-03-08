CREATE TABLE admin_data (
    key VARCHAR(100) PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO admin_data (key, value) VALUES 
    ('works', '[]'::jsonb),
    ('work_links', '[]'::jsonb),
    ('work_filters', '[]'::jsonb),
    ('branches', '[]'::jsonb),
    ('settings', '{}'::jsonb);
