-- 1) Create database
CREATE DATABASE podcastmanager;

-- 2) Create application role/user
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'podcastmanager_user') THEN
    CREATE ROLE podcastmanager_user WITH LOGIN PASSWORD 'podcastmanager_password' CREATEDB;
  END IF;
END$$;

-- 3) Grant privileges on the database
GRANT ALL PRIVILEGES ON DATABASE podcastmanager TO podcastmanager_user;

-- 5) Ensure public schema privileges for the new DB
-- Run these in the context of the target DB
\connect podcastmanager

-- Make sure the user can use/create in public schema (avoid "permission denied for schema public")
GRANT USAGE ON SCHEMA public TO podcastmanager_user;
GRANT CREATE ON SCHEMA public TO podcastmanager_user;

-- Optional: grant all on existing objects (if any) and set defaults for future objects
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO podcastmanager_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO podcastmanager_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON TABLES TO podcastmanager_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON SEQUENCES TO podcastmanager_user;

-- 6) If superuser is needed (e.g., migrations), uncomment:
ALTER ROLE podcastmanager_user WITH SUPERUSER
