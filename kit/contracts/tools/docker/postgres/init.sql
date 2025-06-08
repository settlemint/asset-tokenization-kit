-- Create databases
CREATE DATABASE txsigner;
CREATE DATABASE portal;

-- Create users
CREATE USER txsigner WITH PASSWORD 'txsigner';
CREATE USER portal WITH PASSWORD 'portal';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE txsigner TO txsigner;
GRANT ALL PRIVILEGES ON DATABASE portal TO portal;

-- Connect to txsigner database and grant schema privileges
\c txsigner;
GRANT ALL ON SCHEMA public TO txsigner;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO txsigner;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO txsigner;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO txsigner;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO txsigner;

-- Connect to portal database and grant schema privileges
\c portal;
GRANT ALL ON SCHEMA public TO portal;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO portal;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO portal;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO portal;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO portal;