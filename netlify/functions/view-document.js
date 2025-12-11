/*
const { Pool } = require('pg');

const GLOBAL_TOKEN = 'employer-master-access-2025'; // ← Your master token

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
    // ── TOKEN VALIDATION (FINAL BULLETPROOF VERSION) ──
    let tokenValid = false;
    const isMasterToken = (token === GLOBAL_TOKEN);

    if (isMasterToken) {
      tokenValid = true; // Employer → full unlimited access forever
    } else {
      // Regular one-time token → CV only, once
      const res = await client.query(
        'SELECT used_for_cv FROM tokens WHERE token = $1',
        [token]
      );

      if (res.rowCount === 0) {
        return { statusCode: 403, body: JSON.stringify({ error: 'Invalid or expired token' }) };
      }

      // THIS LINE PREVENTS SERVER ERROR (handles NULL values safely)
      const used_for_cv = res.rows[0].used_for_cv === true;

      if (file_type === 'cv' && !used_for_cv) {
        tokenValid = true;
        await client.query('UPDATE tokens SET used_for_cv = TRUE WHERE token = $1', [token]);
      }
      else if (file_type !== 'cv') {
        return { statusCode: 403, body: JSON.stringify({ error: 'Access denied: Only CV is available with this token' }) };
      }
      else {
        return { statusCode: 403, body: JSON.stringify({ error: 'You have already viewed the CV with this token' }) };
      }
    }

    if (!tokenValid) {
      return { statusCode: 403, body: JSON.stringify({ error: 'Forbidden' }) };
    }

    // ── FETCH PDF FROM DATABASE ──
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
};*/


// netlify/functions/view-document.js
const { Pool } = require('pg');

const MASTER_TOKEN = 'employer-master-access-2025'; // ← only this person gets documents

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
    let tokenValid = false;

    // 1. Master token → unlimited access to EVERY document forever
    if (token === MASTER_TOKEN) {
      tokenValid = true;
    } else {
      // 2. Normal one-time token → can ONLY unlock the website, NEVER documents
      const res = await client.query(
        'SELECT token FROM tokens WHERE token = $1', // we don’t even look at used_for_cv anymore
        [token]
      );

      if (res.rowCount > 0) {
        // Token exists → great for the frontend (your existing unlock system works)
        // But we deliberately DO NOT set tokenValid = true here for documents
        return {
          statusCode: 403,
          body: JSON.stringify({
            error: 'This token can only unlock site content. Documents are for employers only.'
          })
        };
      } else {
        return { statusCode: 403, body: JSON.stringify({ error: 'Invalid token' }) };
      }
    }

    // Only reaches here if MASTER_TOKEN was used
    if (!tokenValid) {
      return { statusCode: 403, body: JSON.stringify({ error: 'Forbidden' }) };
    }

    // Serve the requested document (CV or any future file)
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
