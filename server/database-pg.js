import pg from 'pg';
import dns from 'node:dns';

// Render doesn't support IPv6 outbound. Force Node to prefer IPv4.
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first');
}

const { Pool } = pg;

// Kết nối đến Supabase PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
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
