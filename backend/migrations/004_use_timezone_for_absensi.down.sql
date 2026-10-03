ALTER TABLE absensi
  ALTER COLUMN created_at TYPE timestamp
  USING created_at AT TIME ZONE 'UTC';
