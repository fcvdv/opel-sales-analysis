const pool = require('../config/database');

class Time {
  static async getAll() {
    const [rows] = await pool.execute('SELECT * FROM time ORDER BY date DESC');
    return rows;
  }

  static async getById(id) {
    const [rows] = await pool.execute('SELECT * FROM time WHERE time_id = ?', [id]);
    return rows[0];
  }
}

module.exports = Time;

