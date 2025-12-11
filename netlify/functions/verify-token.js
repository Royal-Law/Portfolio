const { Pool } = require('pg');

// CHANGE THIS TO YOUR GLOBAL TOKEN
const GLOBAL_TOKEN = 'employer-master-access-2025';

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405 };

  const { token } = JSON.parse(event.body);
  const pool = new Pool({ connectionString: process.env.NEON_DB_URL });
  const client = await pool.connect();

  try {
    // GLOBAL TOKEN: Always valid, never marked as used
    if (token === GLOBAL_TOKEN) {
      return { statusCode: 200, body: JSON.stringify({ valid: true }) };
    }

    // REGULAR TOKENS: One-time use
    const res = await client.query('SELECT used FROM tokens WHERE token = $1', [token]);
    if (res.rowCount === 0) {
      return { statusCode: 200, body: JSON.stringify({ valid: false }) };
    }
    if (res.rows[0].used) {
      return { statusCode: 200, body: JSON.stringify({ valid: false, message: 'Token already used' }) };
    }

    // Mark regular token as used
    await client.query('UPDATE tokens SET used = TRUE WHERE token = $1', [token]);
    return { statusCode: 200, body: JSON.stringify({ valid: true }) };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: JSON.stringify({ error: 'DB error' }) };
  } finally {
    client.release();
  }
};
