CREATE TABLE log (
  id uuid PRIMARY KEY,
  user_id uuid NOT NULL,
  changes jsonb NOT NULL,
  created_at timestamptz NOT NULL
);
