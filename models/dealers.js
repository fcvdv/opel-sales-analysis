const pool = require('../config/database');

class Dealers {
  static async getAll() {
    const [rows] = await pool.execute(`
      SELECT 
        d.dealer_id,
        d.dealer_name,
        c.city_name,
        r.region_name
      FROM dealers d
      INNER JOIN cities c ON d.city_id = c.city_id
      INNER JOIN regions r ON c.region_id = r.region_id
      ORDER BY d.dealer_name
    `);
    return rows;
  }

  static async getById(id) {
    const [rows] = await pool.execute(`
      SELECT 
        d.dealer_id,
        d.dealer_name,
        c.city_name,
        r.region_name
      FROM dealers d
      INNER JOIN cities c ON d.city_id = c.city_id
      INNER JOIN regions r ON c.region_id = r.region_id
      WHERE d.dealer_id = ?
    `, [id]);
    return rows[0];
  }

  static async getByCity(cityId) {
    const [rows] = await pool.execute(`
      SELECT 
        d.dealer_id,
        d.dealer_name,
        c.city_name,
        r.region_name
      FROM dealers d
      INNER JOIN cities c ON d.city_id = c.city_id
      INNER JOIN regions r ON c.region_id = r.region_id
      WHERE d.city_id = ?
      ORDER BY d.dealer_name
    `, [cityId]);
    return rows;
  }
}

module.exports = Dealers;

