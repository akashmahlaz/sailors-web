-- Create videos table to store uploaded video metadata
CREATE TABLE IF NOT EXISTS videos (
  id SERIAL PRIMARY KEY,
  public_id TEXT NOT NULL UNIQUE,
  url TEXT NOT NULL,
  resource_type TEXT NOT NULL DEFAULT 'video',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL
);
