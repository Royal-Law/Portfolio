// netlify/functions/view-document.js
const { Pool } = require('pg');

const GLOBAL_TOKEN = 'employer-master-access-2025';

exports.handler = async (event) => {
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const { file_type, token } = event.queryStringParameters || {};

  if (!file_type || !token) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Missing file_type or token' }) };
  }

  const pool = new Pool({ connectionString: process.env.NEON_DB_URL });
  const client = await pool.connect();

  try {
    // ── TOKEN VALIDATION ──
    let tokenValid = false;
    const isMasterToken = (token === GLOBAL_TOKEN);

    if (isMasterToken) {
      tokenValid = true; // Employer = unlimited access
    } else {
      // Regular visitor → CV only, once
      const res = await client.query('SELECT used_for_cv FROM tokens WHERE token = $1', [token]);

      if (res.rowCount === 0) {
        return { statusCode: 403, body: JSON.stringify({ error: 'Invalid or expired token' }) };
      }

      const used_for_cv = res.rows[0].used_for_cv === true;

      if (file_type === 'cv' && !used_for_cv) {
        tokenValid = true;
        await client.query('UPDATE tokens SET used_for_cv = TRUE WHERE token = $1', [token]);
      } else if (file_type !== 'cv') {
        return { statusCode: 403, body: JSON.stringify({ error: 'Access denied: Only CV is available with this token' }) };
      } else {
        return { statusCode: 403, body: JSON.stringify({ error: 'You have already viewed the CV with this token' }) };
      }
    }

    if (!tokenValid) {
      return { statusCode: 403, body: JSON.stringify({ error: 'Forbidden' }) };
    }

    // ── LOG EVERY DOCUMENT VIEW (for employers AND visitors) ──
    try {
      await client.query(
        `INSERT INTO document_views (token, file_type) 
         VALUES ($1, $2) 
         ON CONFLICT (token, file_type) DO UPDATE SET viewed_at = NOW()`,
        [token, file_type]
      );
    } catch (logErr) {
      console.warn('Failed to log document view (non-blocking):', logErr);
      // Don't break PDF delivery if logging fails
    }

    // ── FETCH AND SERVE THE PDF ──
    const doc = await client.query(
      'SELECT file_data, file_name FROM documents WHERE file_type = $1',
      [file_type]
    );

    if (doc.rowCount === 0) {
      return { statusCode: 404, body: JSON.stringify({ error: 'Document not found' }) };
    }

    const { file_data, file_name } = doc.rows[0];

    return {
      statusCode: 200,
      isBase64Encoded: true,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${file_name || file_type + '.pdf'}"`,
        'Cache-Control': 'no-store',
      },
      body: Buffer.from(file_data).toString('base64'),
    };

  } catch (err) {
    console.error('view-document error:', err);
    return { statusCode: 500, body: JSON.stringify({ error: 'Server error' }) };
  } finally {
    client.release();
  }
};
