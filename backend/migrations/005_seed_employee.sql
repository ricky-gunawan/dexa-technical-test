INSERT INTO "user" (name, email, position, phone_number, password)
VALUES (
  'Karyawan Demo',
  'karyawan@hadir.local',
  'Software Engineer',
  '081234567890',
  '$2b$10$NykKJjn35TBXizhc1Ss5/O/esJJr7mS/V7Np/RbhCX1LceAXMu6NS'
)
ON CONFLICT (email) DO NOTHING;
