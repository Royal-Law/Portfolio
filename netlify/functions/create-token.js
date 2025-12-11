const { Pool } = require('pg');
const crypto = require('crypto');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405 };

  const { adminKey } = JSON.parse(event.body);
  if (adminKey !== process.env.TOKEN_ADMIN_KEY) {
    return { statusCode: 403, body: JSON.stringify({ error: 'Forbidden' }) };
  }

  const pool = new Pool({ connectionString: process.env.NEON_DB_URL });
  const client = await pool.connect();

  try {
    const token = crypto.randomBytes(16).toString('hex');
    await client.query('INSERT INTO tokens (token) VALUES ($1)', [token]);
    return { statusCode: 200, body: JSON.stringify({ token }) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: 'DB error' }) };
  } finally {
    client.release();
  }
};
