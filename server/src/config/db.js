import mysql from 'mysql2/promise';

let pool;

export async function initDatabase() {
  pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'real_estate_pm',
    waitForConnections: true,
    connectionLimit: 10
  });
  
  // Verify connection
  try {
    const connection = await pool.getConnection();
    await connection.query('SELECT 1');
    connection.release();
    console.log('MySQL Database connected successfully.');
  } catch (error) {
    console.error('Database connection failed:', error.message);
    process.exit(1);
  }
}

export function db() {
  if (!pool) throw new Error('Database not initialized');
  return pool;
}
