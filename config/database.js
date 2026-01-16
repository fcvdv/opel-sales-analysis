const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_NAME || 'opel_sales',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});

async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('Veritabanı bağlantısı başarılı');
    connection.release();
    return true;
  } catch (error) {
    console.error('Veritabanı bağlantı hatası:', error.message);
    return false;
  }
}

testConnection();

module.exports = pool;

