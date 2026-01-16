const pool = require('../config/database');

class Models {
  static async getAll() {
    const [rows] = await pool.execute('SELECT * FROM models ORDER BY model_name');
    return rows;
  }

  static async getById(id) {
    const [rows] = await pool.execute('SELECT * FROM models WHERE model_id = ?', [id]);
    return rows[0];
  }
}

module.exports = Models;

