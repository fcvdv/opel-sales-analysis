const pool = require('../config/database');

class Cities {
  static async getAll() {
    const [rows] = await pool.execute(`
      SELECT 
        c.city_id,
        c.city_name,
        r.region_name
      FROM cities c
      INNER JOIN regions r ON c.region_id = r.region_id
      ORDER BY c.city_name
    `);
    return rows;
  }

  static async getById(id) {
    const [rows] = await pool.execute(`
      SELECT 
        c.city_id,
        c.city_name,
        r.region_name
      FROM cities c
      INNER JOIN regions r ON c.region_id = r.region_id
      WHERE c.city_id = ?
    `, [id]);
    return rows[0];
  }

  static async getByRegion(regionId) {
    const [rows] = await pool.execute(`
      SELECT 
        c.city_id,
        c.city_name,
        r.region_name
      FROM cities c
      INNER JOIN regions r ON c.region_id = r.region_id
      WHERE c.region_id = ?
      ORDER BY c.city_name
    `, [regionId]);
    return rows;
  }
}

module.exports = Cities;

