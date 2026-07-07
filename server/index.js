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
