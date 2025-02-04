# podcast-manager
CMS for RSS Feeds + Markdown Blog Content + Client Implementation

## Local Setup

1. `CREATE DATABASE podcastmanager;`
2. `CREATE ROLE podcastmanager_user WITH LOGIN PASSWORD 'changeme' CREATEDB;`
3. `\du` -> display info
4. `GRANT ALL PRIVILEGES ON DATABASE podcastmanager TO podcastmanager_user;`
5. `ALTER USER podcastmanager_user WITH SUPERUSER;`
