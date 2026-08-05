# Portfolio — Node/Express + MySQL, deployed on Vercel

## What changed
- Database migrated from SQLite to **MySQL** (`mysql2`, connection pool in `backend/db.js`).
- API routes live in `backend/api/index.js` so they can run as a Vercel serverless function.
- `backend/server.js` is used for local development and serves files from `frontend/`.
- Frontend files now live in `frontend/`, with images and browser scripts in `frontend/assets/`.
- Connection details are read from environment variables (see `.env.example`), never hardcoded.

## Local development
1. Install a MySQL server (or use a free hosted one — see below).
2. Copy the example env file and fill in your credentials:
   ```bash
   cp .env.example .env
   ```
3. Install dependencies and start:
   ```bash
   npm install
   npm start
   ```
4. Visit `http://localhost:3000`. Tables are created and seeded automatically on first request.

## Deploying to Vercel
Vercel doesn't host a MySQL database itself, so you need a hosted MySQL instance. Good free/low-cost options that work well with Vercel:
- **PlanetScale**, **Railway**, **Aiven**, or **Amazon RDS Free Tier**

Steps:
1. Push this project to a GitHub repo.
2. In Vercel, "Add New Project" → import the repo. `vercel.json` routes API requests to `backend/api/index.js` and static requests to `frontend/`.
3. In **Project Settings → Environment Variables**, add:
   - `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
   - `DB_SSL=true` if your MySQL provider requires SSL (most hosted ones do)
4. Deploy. On the first API request, `backend/db.js` creates the tables and seeds your resume/skills/projects data.

## Project structure
```
/frontend/              → static HTML, CSS, browser JS, and assets
/frontend/assets/       → profile.png, favicon.png, theme.js
/backend/api/index.js   → Express app API routes, deployed as a Vercel function
/backend/db.js          → MySQL pool, schema creation, seed data
/backend/server.js      → local-only dev server for frontend + API
/package.json           → npm scripts and dependencies
/vercel.json            → routes API and static frontend requests
/.env.example           → required environment variables without secrets
```
