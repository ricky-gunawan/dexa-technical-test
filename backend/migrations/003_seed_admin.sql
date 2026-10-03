INSERT INTO "user" (name, email, position, phone_number, password)
VALUES (
  'Administrator',
  'admin@hadir.local',
  'HR Administrator',
  NULL,
  '$2b$10$.6qcX..U71.2qkgrLrz7nO57ycYmMFIbB1PsGeR6LoBK3xgHtWcHa'
)
ON CONFLICT (email) DO NOTHING;
