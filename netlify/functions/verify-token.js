// netlify/functions/verify-token.js
const { Pool } = require('pg');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };

  const { token } = JSON.parse(event.body);
  const pool = new Pool({ connectionString: process.env.NEON_DB_URL });
  const client = await pool.connect();

  try {
    const res = await client.query('SELECT used FROM tokens WHERE token = $1', [token]);
    if (res.rowCount === 0) {
      return { statusCode: 404, body: JSON.stringify({ valid: false }) };
    }

    const row = res.rows[0];
    if (row.used) {
      return { statusCode: 410, body: JSON.stringify({ valid: false, message: 'Already used' }) };
    }

    // mark as used
    await client.query('UPDATE tokens SET used = TRUE WHERE token = $1', [token]);

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ valid: true })
    };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: JSON.stringify({ error: 'DB error' }) };
  } finally {
    client.release();
  }
};
