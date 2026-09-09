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

export default pool;
