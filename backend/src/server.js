const express = require('express');
const { Pool } = require('pg');
const { validateTitle } = require('./validate');

const app = express();
app.use(express.json());

const pool = new Pool({
  host: process.env.DB_HOST || 'db',
  user: process.env.DB_USER || 'app',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'tasks',
  port: 5432,
});

async function initDb(retries = 15) {
  for (let i = 0; i < retries; i++) {
    try {
      await pool.query(`CREATE TABLE IF NOT EXISTS tasks (
        id SERIAL PRIMARY KEY,
        title VARCHAR(100) NOT NULL,
        done BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT NOW())`);
      console.log('Database ready');
      return;
    } catch (e) {
      console.log(`DB not ready (${i + 1}/${retries}), retrying...`);
      await new Promise(r => setTimeout(r, 2000));
    }
  }
  throw new Error('Database never became ready');
}

app.get('/health', async (_req, res) => {
  try { await pool.query('SELECT 1'); res.json({ status: 'ok', version: process.env.APP_VERSION || 'dev' }); }
  catch { res.status(500).json({ status: 'db-down' }); }
});

app.get('/api/tasks', async (_req, res) => {
  const { rows } = await pool.query('SELECT * FROM tasks ORDER BY id DESC');
  res.json(rows);
});

app.post('/api/tasks', async (req, res) => {
  if (!validateTitle(req.body.title)) return res.status(400).json({ error: 'Title must be 1-100 characters' });
  const { rows } = await pool.query('INSERT INTO tasks (title) VALUES ($1) RETURNING *', [req.body.title.trim()]);
  res.status(201).json(rows[0]);
});

app.patch('/api/tasks/:id', async (req, res) => {
  const { rows } = await pool.query('UPDATE tasks SET done = NOT done WHERE id = $1 RETURNING *', [req.params.id]);
  rows[0] ? res.json(rows[0]) : res.status(404).json({ error: 'Not found' });
});

app.delete('/api/tasks/:id', async (req, res) => {
  await pool.query('DELETE FROM tasks WHERE id = $1', [req.params.id]);
  res.status(204).end();
});

initDb().then(() => app.listen(3000, () => console.log('API on :3000')))
        .catch(e => { console.error(e); process.exit(1); });
