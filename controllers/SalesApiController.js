const SalesService = require('../services/SalesService');

class SalesApiController {
  static async getAllSales(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      
      const filters = {
        model_name: req.query.model_name || '',
        fuel_type: req.query.fuel_type || '',
        dealer_name: req.query.dealer_name || '',
        city_name: req.query.city_name || '',
        date_from: req.query.date_from || '',
        date_to: req.query.date_to || ''
      };

      const result = await SalesService.getAllSales(filters, page, limit);
      
      res.json({
        success: true,
        data: result.data,
        pagination: result.pagination
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  static async getSaleById(req, res) {
    try {
      const { id } = req.params;
      const sale = await SalesService.getSaleById(id);
      
      if (!sale) {
        return res.status(404).json({
          success: false,
          message: 'Satış bulunamadı'
        });
      }

      res.json({
        success: true,
        data: sale
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  static async createSale(req, res) {
    try {
      const { model_id, dealer_id, time_id } = req.body;

      if (!model_id || !dealer_id || !time_id) {
        return res.status(400).json({
          success: false,
          message: 'model_id, dealer_id ve time_id zorunludur'
        });
      }

      const saleId = await SalesService.createSale({
        model_id,
        dealer_id,
        time_id
      });

      res.status(201).json({
        success: true,
        message: 'Satış başarıyla oluşturuldu',
        data: { sale_id: saleId }
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Satış günceller (PUT /api/sales/:id)
   */
  static async updateSale(req, res) {
    try {
      const { id } = req.params;
      const { model_id, dealer_id, time_id } = req.body;

      if (!model_id || !dealer_id || !time_id) {
        return res.status(400).json({
          success: false,
          message: 'model_id, dealer_id ve time_id zorunludur'
        });
      }

      await SalesService.updateSale(id, {
        model_id,
        dealer_id,
        time_id
      });

      res.json({
        success: true,
        message: 'Satış başarıyla güncellendi'
      });
    } catch (error) {
      const statusCode = error.message.includes('bulunamadı') ? 404 : 400;
      res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }

  static async deleteSale(req, res) {
    try {
      const { id } = req.params;
      await SalesService.deleteSale(id);

      res.json({
        success: true,
        message: 'Satış başarıyla silindi'
      });
    } catch (error) {
      const statusCode = error.message.includes('bulunamadı') || 
                        error.message.includes('silinemez') ? 400 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = SalesApiController;
