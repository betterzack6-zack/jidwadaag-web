require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { Pool } = require('pg');

const app = express();
app.use(cors());
app.use(express.json());

// --- PostgreSQL connection ---
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.warn('⚠️  DATABASE_URL is not set. Create server/.env with your PostgreSQL connection string.');
}
// Hosted Postgres (Neon, Render, etc.) requires SSL; a local Postgres does not.
const isLocal = !connectionString || /localhost|127\.0\.0\.1/.test(connectionString);
const pool = new Pool({
  connectionString,
  ssl: isLocal ? false : { rejectUnauthorized: false }
});

// --- Admin authentication ---
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
if (!ADMIN_PASSWORD) {
  console.warn('⚠️  ADMIN_PASSWORD is not set. The admin panel will be disabled until you set it.');
}
function requireAdmin(req, res, next) {
  if (!ADMIN_PASSWORD) {
    return res.status(503).json({ error: 'Admin panel not configured (ADMIN_PASSWORD missing).' });
  }
  if (req.headers['x-admin-password'] !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Mot de passe incorrect.' });
  }
  next();
}

// --- Schema (created on startup, fresh database) ---
async function init() {
  await pool.query(`CREATE TABLE IF NOT EXISTS trips (
    id SERIAL PRIMARY KEY,
    "driverName" TEXT,
    "driverNumber" TEXT,
    "depart" TEXT,
    "arrive" TEXT,
    "date" TEXT,
    "time" TEXT,
    "carMark" TEXT,
    "carModel" TEXT,
    "seats" INTEGER,
    "price" REAL,
    "ac" BOOLEAN,
    "baggage" BOOLEAN,
    "khat" BOOLEAN,
    "description" TEXT,
    "createdAt" TEXT
  )`);
  await pool.query(`CREATE TABLE IF NOT EXISTS visits (
    id SERIAL PRIMARY KEY,
    "visitedAt" TEXT
  )`);
  await pool.query(`CREATE TABLE IF NOT EXISTS installs (
    id SERIAL PRIMARY KEY,
    "installedAt" TEXT
  )`);
  console.log('✅ Database ready');
}

// --- Routes ---
app.get('/api/trips', async (req, res) => {
  const { depart, arrive } = req.query;
  const conditions = [];
  const params = [];
  if (depart) {
    params.push(`%${String(depart).toLowerCase()}%`);
    conditions.push(`LOWER("depart") LIKE $${params.length}`);
  }
  if (arrive) {
    params.push(`%${String(arrive).toLowerCase()}%`);
    conditions.push(`LOWER("arrive") LIKE $${params.length}`);
  }
  let sql = 'SELECT * FROM trips';
  if (conditions.length) sql += ' WHERE ' + conditions.join(' AND ');
  sql += ' ORDER BY id DESC';
  try {
    const { rows } = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/trips', async (req, res) => {
  const t = req.body || {};
  const required = ['driverName', 'driverNumber', 'depart', 'arrive', 'date', 'time'];
  for (const f of required) {
    if (!t[f] || String(t[f]).trim() === '') {
      return res.status(400).json({ error: `${f} is required` });
    }
  }
  const seats = t.seats != null && String(t.seats).trim() !== '' ? parseInt(t.seats, 10) : null;
  const price = t.price != null && String(t.price).trim() !== '' ? parseFloat(t.price) : null;
  const createdAt = new Date().toISOString();
  const sql = `INSERT INTO trips
    ("driverName","driverNumber","depart","arrive","date","time","carMark","carModel","seats","price","ac","baggage","khat","description","createdAt")
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
    RETURNING *`;
  const values = [
    t.driverName, t.driverNumber, t.depart, t.arrive, t.date, t.time,
    t.carMark || null, t.carModel || null, seats, price,
    !!t.ac, !!t.baggage, !!t.khat, t.description || null, createdAt
  ];
  try {
    const { rows } = await pool.query(sql, values);
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Admin routes (protected by ADMIN_PASSWORD) ---
app.post('/api/admin/login', requireAdmin, (req, res) => {
  res.json({ ok: true });
});

app.delete('/api/trips/:id', requireAdmin, async (req, res) => {
  try {
    const { rowCount } = await pool.query('DELETE FROM trips WHERE id = $1', [req.params.id]);
    if (rowCount === 0) return res.status(404).json({ error: 'Trajet introuvable.' });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Visits tracking ---
app.post('/api/visit', async (req, res) => {
  try {
    await pool.query('INSERT INTO visits ("visitedAt") VALUES ($1)', [new Date().toISOString()]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/install', async (req, res) => {
  try {
    await pool.query('INSERT INTO installs ("installedAt") VALUES ($1)', [new Date().toISOString()]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/admin/stats', requireAdmin, async (req, res) => {
  try {
    const now = new Date();
    const startToday = now.toISOString().split('T')[0] + 'T00:00:00.000Z';
    const start7 = new Date(now.getTime() - 7 * 24 * 3600 * 1000).toISOString();
    const total = await pool.query('SELECT COUNT(*)::int AS c FROM visits');
    const today = await pool.query('SELECT COUNT(*)::int AS c FROM visits WHERE "visitedAt" >= $1', [startToday]);
    const week = await pool.query('SELECT COUNT(*)::int AS c FROM visits WHERE "visitedAt" >= $1', [start7]);
    const installs = await pool.query('SELECT COUNT(*)::int AS c FROM installs');
    res.json({
      total: total.rows[0].c,
      today: today.rows[0].c,
      last7days: week.rows[0].c,
      installs: installs.rows[0].c
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Serve the built client (production) ---
const clientDist = path.join(__dirname, '..', 'client', 'dist');
app.use(express.static(clientDist));
app.get('*', (req, res) => {
  res.sendFile(path.join(clientDist, 'index.html'), err => {
    if (err) res.status(404).end();
  });
});

const PORT = process.env.PORT || 4000;
init()
  .then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => {
    console.error('❌ Database init failed:', err.message);
    process.exit(1);
  });
