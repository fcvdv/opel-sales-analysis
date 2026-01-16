const pool = require('../config/database');

class Sales {
  static async getAll() {
    const [rows] = await pool.execute(`
      SELECT 
        s.sale_id,
        m.model_name,
        m.fuel_type,
        m.body_type,
        d.dealer_name,
        c.city_name,
        r.region_name,
        t.date,
        t.year,
        t.quarter,
        t.month,
        t.month_name
      FROM sales s
      INNER JOIN models m ON s.model_id = m.model_id
      INNER JOIN dealers d ON s.dealer_id = d.dealer_id
      INNER JOIN cities c ON d.city_id = c.city_id
      INNER JOIN regions r ON c.region_id = r.region_id
      INNER JOIN time t ON s.time_id = t.time_id
      ORDER BY t.date DESC
    `);
    return rows;
  }

  static async getById(id) {
    const [rows] = await pool.execute(`
      SELECT 
        s.sale_id,
        m.model_name,
        m.fuel_type,
        m.body_type,
        d.dealer_name,
        c.city_name,
        r.region_name,
        t.date,
        t.year,
        t.quarter,
        t.month,
        t.month_name
      FROM sales s
      INNER JOIN models m ON s.model_id = m.model_id
      INNER JOIN dealers d ON s.dealer_id = d.dealer_id
      INNER JOIN cities c ON d.city_id = c.city_id
      INNER JOIN regions r ON c.region_id = r.region_id
      INNER JOIN time t ON s.time_id = t.time_id
      WHERE s.sale_id = ?
    `, [id]);
    return rows[0];
  }

  static async create(saleData) {
    const { model_id, dealer_id, time_id } = saleData;
    const [result] = await pool.execute(
      'INSERT INTO sales (model_id, dealer_id, time_id) VALUES (?, ?, ?)',
      [model_id, dealer_id, time_id]
    );
    return result.insertId;
  }

  static async update(id, saleData) {
    const { model_id, dealer_id, time_id } = saleData;
    const [result] = await pool.execute(
      'UPDATE sales SET model_id = ?, dealer_id = ?, time_id = ? WHERE sale_id = ?',
      [model_id, dealer_id, time_id, id]
    );
    return result.affectedRows > 0;
  }

  static async delete(id) {
    const [result] = await pool.execute('DELETE FROM sales WHERE sale_id = ?', [id]);
    return result.affectedRows > 0;
  }

  static async getTopModels(limit = 10) {
    const limitValue = Math.max(1, Math.min(parseInt(limit, 10) || 10, 1000));
    const [rows] = await pool.execute(`
      SELECT 
        m.model_name,
        m.fuel_type,
        m.body_type,
        COUNT(*) as total_sales
      FROM sales s
      INNER JOIN models m ON s.model_id = m.model_id
      GROUP BY m.model_id, m.model_name, m.fuel_type, m.body_type
      ORDER BY total_sales DESC
      LIMIT ${limitValue}
    `);
    return rows;
  }

  static async getByRegion() {
    const [rows] = await pool.execute(`
      SELECT 
        r.region_name,
        COUNT(*) as total_sales
      FROM sales s
      INNER JOIN dealers d ON s.dealer_id = d.dealer_id
      INNER JOIN cities c ON d.city_id = c.city_id
      INNER JOIN regions r ON c.region_id = r.region_id
      GROUP BY r.region_id, r.region_name
      ORDER BY total_sales DESC
    `);
    return rows;
  }

  static async getByMonth() {
    const [rows] = await pool.execute(`
      SELECT 
        t.year,
        t.month,
        t.month_name,
        COUNT(*) as total_sales
      FROM sales s
      INNER JOIN time t ON s.time_id = t.time_id
      GROUP BY t.year, t.month, t.month_name
      ORDER BY t.year DESC, t.month DESC
    `);
    return rows;
  }

  static async getByYear() {
    const [rows] = await pool.execute(`
      SELECT 
        t.year,
        COUNT(*) as total_sales
      FROM sales s
      INNER JOIN time t ON s.time_id = t.time_id
      GROUP BY t.year
      ORDER BY t.year DESC
    `);
    return rows;
  }

  static async getByQuarter() {
    const [rows] = await pool.execute(`
      SELECT 
        t.year,
        t.quarter,
        COUNT(*) as total_sales
      FROM sales s
      INNER JOIN time t ON s.time_id = t.time_id
      GROUP BY t.year, t.quarter
      ORDER BY t.year DESC, t.quarter DESC
    `);
    return rows;
  }

  static async getByCity() {
    const [rows] = await pool.execute(`
      SELECT 
        c.city_name,
        r.region_name,
        COUNT(*) as total_sales
      FROM sales s
      INNER JOIN dealers d ON s.dealer_id = d.dealer_id
      INNER JOIN cities c ON d.city_id = c.city_id
      INNER JOIN regions r ON c.region_id = r.region_id
      GROUP BY c.city_id, c.city_name, r.region_name
      ORDER BY total_sales DESC
    `);
    return rows;
  }

  static async getByDealer() {
    const [rows] = await pool.execute(`
      SELECT 
        d.dealer_name,
        c.city_name,
        COUNT(*) as total_sales
      FROM sales s
      INNER JOIN dealers d ON s.dealer_id = d.dealer_id
      INNER JOIN cities c ON d.city_id = c.city_id
      GROUP BY d.dealer_id, d.dealer_name, c.city_name
      ORDER BY total_sales DESC
    `);
    return rows;
  }

  static async getByDealerFilteredAndPaginated(filters = {}, page = 1, limit = 20) {
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.max(1, Math.min(parseInt(limit) || 20, 100));
    const offset = (pageNum - 1) * limitNum;

    const conditions = [];
    const params = [];
    const havingConditions = [];
    const havingParams = [];

    if (filters.dealer_name && filters.dealer_name.trim() !== '') {
      conditions.push('d.dealer_name LIKE ?');
      params.push(`%${filters.dealer_name.trim()}%`);
    }

    if (filters.city_name && filters.city_name.trim() !== '') {
      conditions.push('c.city_name LIKE ?');
      params.push(`%${filters.city_name.trim()}%`);
    }

    if (filters.region_id && filters.region_id.toString().trim() !== '') {
      const regionIdNum = parseInt(filters.region_id, 10);
      if (!isNaN(regionIdNum)) {
        conditions.push('r.region_id = ?');
        params.push(regionIdNum);
      }
    }

    if (filters.min_sales && filters.min_sales.toString().trim() !== '') {
      const minSales = parseInt(filters.min_sales, 10);
      if (!isNaN(minSales)) {
        havingConditions.push('COUNT(*) >= ?');
        havingParams.push(minSales);
      }
    }

    if (filters.max_sales && filters.max_sales.toString().trim() !== '') {
      const maxSales = parseInt(filters.max_sales, 10);
      if (!isNaN(maxSales)) {
        havingConditions.push('COUNT(*) <= ?');
        havingParams.push(maxSales);
      }
    }

    const whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';
    const havingClause = havingConditions.length > 0 ? 'HAVING ' + havingConditions.join(' AND ') : '';

    const [rows] = await pool.execute(`
      SELECT 
        d.dealer_id,
        d.dealer_name,
        c.city_name,
        r.region_name,
        COUNT(*) as total_sales
      FROM sales s
      INNER JOIN dealers d ON s.dealer_id = d.dealer_id
      INNER JOIN cities c ON d.city_id = c.city_id
      INNER JOIN regions r ON c.region_id = r.region_id
      ${whereClause}
      GROUP BY d.dealer_id, d.dealer_name, c.city_name, r.region_name
      ${havingClause}
      ORDER BY total_sales DESC
      LIMIT ${limitNum} OFFSET ${offset}
    `, [...params, ...havingParams]);

    const [countRows] = await pool.execute(`
      SELECT COUNT(*) as total
      FROM (
        SELECT d.dealer_id
        FROM sales s
        INNER JOIN dealers d ON s.dealer_id = d.dealer_id
        INNER JOIN cities c ON d.city_id = c.city_id
        INNER JOIN regions r ON c.region_id = r.region_id
        ${whereClause}
        GROUP BY d.dealer_id, d.dealer_name, c.city_name, r.region_name
        ${havingClause}
      ) as dealer_counts
    `, [...params, ...havingParams]);

    const total = countRows[0]?.total || 0;
    const totalPages = Math.ceil(total / limitNum);

    return {
      data: rows,
      pagination: {
        currentPage: pageNum,
        totalPages: totalPages,
        totalItems: total,
        itemsPerPage: limitNum,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1
      }
    };
  }

  static async getByFuelType() {
    const [rows] = await pool.execute(`
      SELECT 
        m.fuel_type,
        COUNT(*) as total_sales
      FROM sales s
      INNER JOIN models m ON s.model_id = m.model_id
      GROUP BY m.fuel_type
      ORDER BY total_sales DESC
    `);
    return rows;
  }

  static async getByBodyType() {
    const [rows] = await pool.execute(`
      SELECT 
        m.body_type,
        COUNT(*) as total_sales
      FROM sales s
      INNER JOIN models m ON s.model_id = m.model_id
      GROUP BY m.body_type
      ORDER BY total_sales DESC
    `);
    return rows;
  }

  static buildWhereClause(fuel_type, body_type, region_id, year) {
    const conditions = [];
    const params = [];
    if (fuel_type && fuel_type.trim() !== '') {
      conditions.push('m.fuel_type = ?');
      params.push(fuel_type);
    }
    if (body_type && body_type.trim() !== '') {
      conditions.push('m.body_type = ?');
      params.push(body_type);
    }
    if (region_id && region_id.toString().trim() !== '') {
      const regionIdNum = parseInt(region_id, 10);
      if (!isNaN(regionIdNum)) {
        conditions.push('r.region_id = ?');
        params.push(regionIdNum);
      }
    }
    if (year && year.toString().trim() !== '') {
      const yearNum = parseInt(year, 10);
      if (!isNaN(yearNum)) {
        conditions.push('t.year = ?');
        params.push(yearNum);
      }
    }
    return {
      clause: conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '',
      params
    };
  }

  static async getTopModelsFiltered(fuel_type, body_type, region_id, year, limit = 10) {
    const limitValue = Math.max(1, Math.min(parseInt(limit, 10) || 10, 1000));
    const where = this.buildWhereClause(fuel_type, body_type, region_id, year);
    const [rows] = await pool.execute(`
      SELECT 
        m.model_name,
        m.fuel_type,
        m.body_type,
        COUNT(*) as total_sales
      FROM sales s
      INNER JOIN models m ON s.model_id = m.model_id
      INNER JOIN dealers d ON s.dealer_id = d.dealer_id
      INNER JOIN cities c ON d.city_id = c.city_id
      INNER JOIN regions r ON c.region_id = r.region_id
      INNER JOIN time t ON s.time_id = t.time_id
      ${where.clause}
      GROUP BY m.model_id, m.model_name, m.fuel_type, m.body_type
      ORDER BY total_sales DESC
      LIMIT ${limitValue}
    `, where.params);
    return rows;
  }

  static async getModelCountFiltered(fuel_type, body_type, region_id, year) {
    const [rows] = await pool.execute('SELECT COUNT(*) as model_count FROM models');
    const count = rows[0]?.model_count;
    return count ? Number(count) : 0;
  }

  static async getByRegionFiltered(fuel_type, body_type, region_id, year) {
    const where = this.buildWhereClause(fuel_type, body_type, region_id, year);
    const [rows] = await pool.execute(`
      SELECT 
        r.region_id,
        r.region_name,
        COUNT(*) as total_sales
      FROM sales s
      INNER JOIN models m ON s.model_id = m.model_id
      INNER JOIN dealers d ON s.dealer_id = d.dealer_id
      INNER JOIN cities c ON d.city_id = c.city_id
      INNER JOIN regions r ON c.region_id = r.region_id
      INNER JOIN time t ON s.time_id = t.time_id
      ${where.clause}
      GROUP BY r.region_id, r.region_name
      ORDER BY total_sales DESC
    `, where.params);
    return rows;
  }

  static async getByYearFiltered(fuel_type, body_type, region_id) {
    const where = this.buildWhereClause(fuel_type, body_type, region_id, null);
    const [rows] = await pool.execute(`
      SELECT 
        t.year,
        COUNT(*) as total_sales
      FROM sales s
      INNER JOIN models m ON s.model_id = m.model_id
      INNER JOIN dealers d ON s.dealer_id = d.dealer_id
      INNER JOIN cities c ON d.city_id = c.city_id
      INNER JOIN regions r ON c.region_id = r.region_id
      INNER JOIN time t ON s.time_id = t.time_id
      ${where.clause}
      GROUP BY t.year
      ORDER BY t.year DESC
    `, where.params);
    return rows;
  }

  static async getByMonthFiltered(fuel_type, body_type, region_id, year) {
    const where = this.buildWhereClause(fuel_type, body_type, region_id, year);
    const [rows] = await pool.execute(`
      SELECT 
        t.year,
        t.month,
        t.month_name,
        COUNT(*) as total_sales
      FROM sales s
      INNER JOIN models m ON s.model_id = m.model_id
      INNER JOIN dealers d ON s.dealer_id = d.dealer_id
      INNER JOIN cities c ON d.city_id = c.city_id
      INNER JOIN regions r ON c.region_id = r.region_id
      INNER JOIN time t ON s.time_id = t.time_id
      ${where.clause}
      GROUP BY t.year, t.month, t.month_name
      ORDER BY t.year DESC, t.month DESC
    `, where.params);
    return rows;
  }

  static async getByMonthAndFuelTypeFiltered(body_type, region_id, year) {
    const where = this.buildWhereClause(null, body_type, region_id, year);
    const [rows] = await pool.execute(`
      SELECT 
        t.year,
        t.month,
        t.month_name,
        m.fuel_type,
        COUNT(*) as total_sales
      FROM sales s
      INNER JOIN models m ON s.model_id = m.model_id
      INNER JOIN dealers d ON s.dealer_id = d.dealer_id
      INNER JOIN cities c ON d.city_id = c.city_id
      INNER JOIN regions r ON c.region_id = r.region_id
      INNER JOIN time t ON s.time_id = t.time_id
      ${where.clause}
      GROUP BY t.year, t.month, t.month_name, m.fuel_type
      ORDER BY t.year DESC, t.month DESC, m.fuel_type
    `, where.params);
    return rows;
  }

  static async getByQuarterFiltered(fuel_type, body_type, region_id, year) {
    const where = this.buildWhereClause(fuel_type, body_type, region_id, year);
    const [rows] = await pool.execute(`
      SELECT 
        t.year,
        t.quarter,
        COUNT(*) as total_sales
      FROM sales s
      INNER JOIN models m ON s.model_id = m.model_id
      INNER JOIN dealers d ON s.dealer_id = d.dealer_id
      INNER JOIN cities c ON d.city_id = c.city_id
      INNER JOIN regions r ON c.region_id = r.region_id
      INNER JOIN time t ON s.time_id = t.time_id
      ${where.clause}
      GROUP BY t.year, t.quarter
      ORDER BY t.year DESC, t.quarter DESC
    `, where.params);
    return rows;
  }

  static async getByQuarterAndModelFiltered(fuel_type, body_type, region_id, year) {
    const where = this.buildWhereClause(fuel_type, body_type, region_id, year);
    let finalClause = where.clause;
    
    if (!year || year.toString().trim() === '') {
      const dateCondition = where.clause ? ' AND t.date >= DATE_SUB(CURDATE(), INTERVAL 1 YEAR)' : 'WHERE t.date >= DATE_SUB(CURDATE(), INTERVAL 1 YEAR)';
      finalClause = where.clause + dateCondition;
    }
    
    const [rows] = await pool.execute(`
      SELECT 
        t.year,
        t.quarter,
        m.model_name,
        m.fuel_type,
        COUNT(*) as total_sales
      FROM sales s
      INNER JOIN models m ON s.model_id = m.model_id
      INNER JOIN dealers d ON s.dealer_id = d.dealer_id
      INNER JOIN cities c ON d.city_id = c.city_id
      INNER JOIN regions r ON c.region_id = r.region_id
      INNER JOIN time t ON s.time_id = t.time_id
      ${finalClause}
      GROUP BY t.year, t.quarter, m.model_id, m.model_name, m.fuel_type
      ORDER BY t.year DESC, t.quarter DESC, total_sales DESC
    `, where.params);
    return rows;
  }

  static async getByFuelTypeFiltered(body_type, region_id, year) {
    const conditions = [];
    const params = [];
    if (body_type) {
      conditions.push('m.body_type = ?');
      params.push(body_type);
    }
    if (region_id) {
      conditions.push('r.region_id = ?');
      params.push(parseInt(region_id, 10));
    }
    if (year) {
      conditions.push('t.year = ?');
      params.push(parseInt(year, 10));
    }
    const whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';
    const [rows] = await pool.execute(`
      SELECT 
        m.fuel_type,
        COUNT(*) as total_sales
      FROM sales s
      INNER JOIN models m ON s.model_id = m.model_id
      INNER JOIN dealers d ON s.dealer_id = d.dealer_id
      INNER JOIN cities c ON d.city_id = c.city_id
      INNER JOIN regions r ON c.region_id = r.region_id
      INNER JOIN time t ON s.time_id = t.time_id
      ${whereClause}
      GROUP BY m.fuel_type
      ORDER BY total_sales DESC
    `, params);
    return rows;
  }

  static async getByBodyTypeFiltered(fuel_type, region_id, year) {
    const conditions = [];
    const params = [];
    if (fuel_type) {
      conditions.push('m.fuel_type = ?');
      params.push(fuel_type);
    }
    if (region_id) {
      conditions.push('r.region_id = ?');
      params.push(parseInt(region_id, 10));
    }
    if (year) {
      conditions.push('t.year = ?');
      params.push(parseInt(year, 10));
    }
    const whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';
    const [rows] = await pool.execute(`
      SELECT 
        m.body_type,
        COUNT(*) as total_sales
      FROM sales s
      INNER JOIN models m ON s.model_id = m.model_id
      INNER JOIN dealers d ON s.dealer_id = d.dealer_id
      INNER JOIN cities c ON d.city_id = c.city_id
      INNER JOIN regions r ON c.region_id = r.region_id
      INNER JOIN time t ON s.time_id = t.time_id
      ${whereClause}
      GROUP BY m.body_type
      ORDER BY total_sales DESC
    `, params);
    return rows;
  }

  static async getByCityAndBodyTypeFiltered(fuel_type, year) {
    const where = this.buildWhereClause(fuel_type, null, null, year);
    const [rows] = await pool.execute(`
      SELECT 
        c.city_id,
        c.city_name,
        m.body_type,
        COUNT(*) as total_sales
      FROM sales s
      INNER JOIN models m ON s.model_id = m.model_id
      INNER JOIN dealers d ON s.dealer_id = d.dealer_id
      INNER JOIN cities c ON d.city_id = c.city_id
      INNER JOIN regions r ON c.region_id = r.region_id
      INNER JOIN time t ON s.time_id = t.time_id
      ${where.clause}
      GROUP BY c.city_id, c.city_name, m.body_type
      ORDER BY c.city_name, m.body_type
    `, where.params);
    return rows;
  }

  static async getByCityAndFuelTypeFiltered(body_type, year) {
    const where = this.buildWhereClause(null, body_type, null, year);
    const [rows] = await pool.execute(`
      SELECT 
        c.city_id,
        c.city_name,
        m.fuel_type,
        COUNT(*) as total_sales
      FROM sales s
      INNER JOIN models m ON s.model_id = m.model_id
      INNER JOIN dealers d ON s.dealer_id = d.dealer_id
      INNER JOIN cities c ON d.city_id = c.city_id
      INNER JOIN regions r ON c.region_id = r.region_id
      INNER JOIN time t ON s.time_id = t.time_id
      ${where.clause}
      GROUP BY c.city_id, c.city_name, m.fuel_type
      ORDER BY c.city_name, m.fuel_type
    `, where.params);
    return rows;
  }

  static async getTopDealerFiltered(fuel_type, body_type, region_id, year) {
    const where = this.buildWhereClause(fuel_type, body_type, region_id, year);
    const [rows] = await pool.execute(`
      SELECT 
        d.dealer_name,
        c.city_name,
        COUNT(*) as total_sales
      FROM sales s
      INNER JOIN models m ON s.model_id = m.model_id
      INNER JOIN dealers d ON s.dealer_id = d.dealer_id
      INNER JOIN cities c ON d.city_id = c.city_id
      INNER JOIN regions r ON c.region_id = r.region_id
      INNER JOIN time t ON s.time_id = t.time_id
      ${where.clause}
      GROUP BY d.dealer_id, d.dealer_name, c.city_name
      ORDER BY total_sales DESC
      LIMIT 1
    `, where.params);
    return rows[0] || null;
  }

  static async getByBodyTypeAndFuelTypeFiltered(region_id, year) {
    const where = this.buildWhereClause(null, null, region_id, year);
    const [rows] = await pool.execute(`
      SELECT 
        m.body_type,
        m.fuel_type,
        COUNT(*) as total_sales
      FROM sales s
      INNER JOIN models m ON s.model_id = m.model_id
      INNER JOIN dealers d ON s.dealer_id = d.dealer_id
      INNER JOIN cities c ON d.city_id = c.city_id
      INNER JOIN regions r ON c.region_id = r.region_id
      INNER JOIN time t ON s.time_id = t.time_id
      ${where.clause}
      GROUP BY m.body_type, m.fuel_type
      ORDER BY m.body_type, m.fuel_type
    `, where.params);
    return rows;
  }

  static async getTopCityFiltered(fuel_type, body_type, region_id, year) {
    const where = this.buildWhereClause(fuel_type, body_type, region_id, year);
    const [rows] = await pool.execute(`
      SELECT 
        c.city_name,
        COUNT(*) as total_sales
      FROM sales s
      INNER JOIN models m ON s.model_id = m.model_id
      INNER JOIN dealers d ON s.dealer_id = d.dealer_id
      INNER JOIN cities c ON d.city_id = c.city_id
      INNER JOIN regions r ON c.region_id = r.region_id
      INNER JOIN time t ON s.time_id = t.time_id
      ${where.clause}
      GROUP BY c.city_id, c.city_name
      ORDER BY total_sales DESC
      LIMIT 1
    `, where.params);
    return rows[0] || null;
  }

  static async getModelSalesContinuityFiltered(fuel_type, body_type, region_id, year) {
    const where = this.buildWhereClause(fuel_type, body_type, region_id, year);
    const [rows] = await pool.execute(`
      SELECT 
        m.model_id,
        m.model_name,
        m.fuel_type,
        m.body_type,
        COUNT(*) as total_sales,
        COUNT(DISTINCT CONCAT(t.year, '-', LPAD(t.month, 2, '0'))) as active_months
      FROM sales s
      INNER JOIN models m ON s.model_id = m.model_id
      INNER JOIN dealers d ON s.dealer_id = d.dealer_id
      INNER JOIN cities c ON d.city_id = c.city_id
      INNER JOIN regions r ON c.region_id = r.region_id
      INNER JOIN time t ON s.time_id = t.time_id
      ${where.clause}
      GROUP BY m.model_id, m.model_name, m.fuel_type, m.body_type
      ORDER BY total_sales DESC
    `, where.params);
    return rows;
  }

  static async getAvailableYears() {
    const [rows] = await pool.execute(`
      SELECT DISTINCT t.year
      FROM sales s
      INNER JOIN time t ON s.time_id = t.time_id
      ORDER BY t.year DESC
    `);
    return rows.map(r => r.year);
  }

  static async getAllFilteredAndPaginated(filters = {}, page = 1, limit = 20) {
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(parseInt(limit, 10) || 20, 1000));
    const offset = (pageNum - 1) * limitNum;
    const conditions = [];
    const params = [];

    if (filters.model_name && filters.model_name.trim() !== '') {
      conditions.push('m.model_name LIKE ?');
      params.push(`%${filters.model_name.trim()}%`);
    }

    if (filters.fuel_type && filters.fuel_type.trim() !== '') {
      conditions.push('m.fuel_type = ?');
      params.push(filters.fuel_type.trim());
    }

    if (filters.dealer_name && filters.dealer_name.trim() !== '') {
      conditions.push('d.dealer_name LIKE ?');
      params.push(`%${filters.dealer_name.trim()}%`);
    }

    if (filters.city_name && filters.city_name.trim() !== '') {
      conditions.push('c.city_name LIKE ?');
      params.push(`%${filters.city_name.trim()}%`);
    }

    if (filters.date_from && filters.date_from.trim() !== '') {
      conditions.push('t.date >= ?');
      params.push(filters.date_from.trim());
    }

    if (filters.date_to && filters.date_to.trim() !== '') {
      conditions.push('t.date <= ?');
      params.push(filters.date_to.trim());
    }

    const whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';

    const [rows] = await pool.execute(`
      SELECT 
        s.sale_id,
        m.model_name,
        m.fuel_type,
        d.dealer_name,
        c.city_name,
        r.region_name,
        t.date,
        t.year,
        t.quarter,
        t.month,
        t.month_name
      FROM sales s
      INNER JOIN models m ON s.model_id = m.model_id
      INNER JOIN dealers d ON s.dealer_id = d.dealer_id
      INNER JOIN cities c ON d.city_id = c.city_id
      INNER JOIN regions r ON c.region_id = r.region_id
      INNER JOIN time t ON s.time_id = t.time_id
      ${whereClause}
      ORDER BY t.date DESC
      LIMIT ${limitNum} OFFSET ${offset}
    `, params);

    const [countRows] = await pool.execute(`
      SELECT COUNT(*) as total
      FROM sales s
      INNER JOIN models m ON s.model_id = m.model_id
      INNER JOIN dealers d ON s.dealer_id = d.dealer_id
      INNER JOIN cities c ON d.city_id = c.city_id
      INNER JOIN regions r ON c.region_id = r.region_id
      INNER JOIN time t ON s.time_id = t.time_id
      ${whereClause}
    `, params);

    const total = countRows[0]?.total || 0;
    const totalPages = Math.ceil(total / limitNum);

    return {
      data: rows,
      pagination: {
        currentPage: pageNum,
        totalPages: totalPages,
        totalItems: total,
        itemsPerPage: limitNum,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1
      }
    };
  }
}

module.exports = Sales;
