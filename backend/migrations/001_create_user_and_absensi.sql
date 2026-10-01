CREATE TYPE absensi_status AS ENUM ('masuk', 'pulang');

CREATE TABLE "user" (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL UNIQUE,
  photo_url text NULL,
  position text NOT NULL,
  phone_number text NULL,
  password text NOT NULL
);

CREATE TABLE absensi (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES "user"(id),
  created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  status absensi_status NOT NULL
);
