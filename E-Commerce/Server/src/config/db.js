import mysql from 'mysql2/promise'

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '1234',
  database: process.env.DB_NAME || 'Ecom',
  waitForConnections: true,
  connectionLimit: 10,
})

const checkConnection = async () => {
  const connection = await pool.getConnection()

  try {
    await connection.query('SELECT 1')
  } finally {
    connection.release()
  }
}

export { checkConnection }
export default pool