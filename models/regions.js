const pool = require('../config/database');

class Regions {
  static async getAll() {
    const [rows] = await pool.execute('SELECT * FROM regions ORDER BY region_name');
    return rows;
  }

  static async getById(id) {
    const [rows] = await pool.execute('SELECT * FROM regions WHERE region_id = ?', [id]);
    return rows[0];
  }
}

module.exports = Regions;

