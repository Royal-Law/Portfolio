// netlify/functions/create-token.js
const { Pool } = require('pg');
const crypto = require('crypto');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };

  const { adminKey } = JSON.parse(event.body);
  if (adminKey !== process.env.TOKEN_ADMIN_KEY) {
    return { statusCode: 403, body: JSON.stringify({ error: 'Invalid admin key' }) };
  }

  const pool = new Pool({ connectionString: process.env.NEON_DB_URL });
  const client = await pool.connect();

  try {
    const token = crypto.randomBytes(12).toString('hex'); // 24-char token
    await client.query('INSERT INTO tokens (token) VALUES ($1)', [token]);
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token })
    };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: JSON.stringify({ error: 'DB error' }) };
  } finally {
    client.release();
  }
};
