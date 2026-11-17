# Tasks App (developer handover)

Stack: HTML/JS frontend, Node.js 20 + Express backend, PostgreSQL 16.

## Backend
- Port: 3000
- Start: `npm start`
- Test: `npm test`
- Health check: GET /health
- API: GET/POST /api/tasks, PATCH/DELETE /api/tasks/:id

## Environment variables (backend)
- DB_HOST (default: db)
- DB_USER (default: app)
- DB_PASSWORD (required)
- DB_NAME (default: tasks)

## Frontend
- Single static file: frontend/index.html
- Calls the backend on relative paths /api/... and /health, so a reverse proxy
  must forward those to the backend (port 3000).

## Database
- PostgreSQL. The backend creates the `tasks` table itself on startup.
