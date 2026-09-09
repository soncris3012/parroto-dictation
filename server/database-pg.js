import pg from 'pg';
import dns from 'node:dns';

// Render doesn't support IPv6 outbound. Force Node to prefer IPv4.
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first');
}

const { Pool } = pg;

let connectionString = process.env.DATABASE_URL;

// Automatic IPv4 translation for Render (Render lacks IPv6 outbound)
if (connectionString && connectionString.includes('.supabase.co')) {
  try {
    const parsed = new URL(connectionString);
    const match = parsed.hostname.match(/^db\.([a-z0-9]+)\.supabase\.co$/);
    if (match) {
      const projectRef = match[1];
      const origUser = decodeURIComponent(parsed.username || 'postgres');
      if (!origUser.includes('.')) {
        parsed.username = `${origUser}.${projectRef}`;
      }
      parsed.hostname = 'aws-0-ap-southeast-1.pooler.supabase.com';
      parsed.port = '5432';
      connectionString = parsed.toString();
      console.log('[PG INFO] Auto-converted Supabase URL to IPv4 Pooler:', parsed.hostname);
    }
  } catch (e) {
    console.error('[PG ERROR] Failed to parse DATABASE_URL:', e);
  }
}

// Kết nối đến Supabase PostgreSQL
const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});

// Kiểm tra kết nối
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Lỗi kết nối Supabase:', err);
  } else {
    console.log('Kết nối Supabase thành công tại:', res.rows[0].now);
  }
});

// Override pool.query to convert SQLite `?` to Postgres `$1, $2...`
const originalQuery = pool.query.bind(pool);
pool.query = async (text, params) => {
  let sql = text;
  if (typeof sql === 'string' && params && Array.isArray(params)) {
    let i = 1;
    sql = sql.replace(/\?/g, () => `$${i++}`);
  }
  try {
    return await originalQuery(sql, params);
  } catch (err) {
    console.error("[PG ERROR]:", err.message, "\nSQL:", sql, "\nParams:", params);
    throw err;
  }
};

export default pool;
