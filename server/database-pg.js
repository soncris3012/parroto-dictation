import pg from 'pg';
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
  if (typeof text === 'string' && params && Array.isArray(params)) {
    let i = 1;
    text = text.replace(/\?/g, () => `$${i++}`);
  }
  return originalQuery(text, params);
};

export default pool;
