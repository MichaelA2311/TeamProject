CREATE TABLE projects (
    project_id   SERIAL PRIMARY KEY,
    name         VARCHAR(255) NOT NULL,
    description  TEXT,
    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
    last_edited  TIMESTAMP,
    project_size VARCHAR(10) DEFAULT '0B'
);
