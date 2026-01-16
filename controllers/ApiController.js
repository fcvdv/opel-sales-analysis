const SalesService = require('../services/SalesService');
const FilterService = require('../services/FilterService');
const DecisionSupportService = require('../services/DecisionSupportService');

class ApiController {
  static async getDashboardData(req, res) {
    try {
      const { fuel_type, body_type, region_id, year } = req.query;
      
      const filters = { fuel_type, body_type, region_id, year };
      const data = await SalesService.getDashboardData(filters);
      
      res.json({
        success: true,
        data: data
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  static async getCityBodyTypeData(req, res) {
    try {
      const { fuel_type, year } = req.query;
      const data = await SalesService.getCityBodyTypeData(fuel_type, year);
      
      res.json({
        success: true,
        data: data
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  static async getCityFuelTypeData(req, res) {
    try {
      const { body_type, year } = req.query;
      const data = await SalesService.getCityFuelTypeData(body_type, year);
      
      res.json({
        success: true,
        data: data
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Filtre seçeneklerini getirir (GET /api/filters)
   */
  static async getFilters(req, res) {
    try {
      const data = await FilterService.getFilterOptions();
      
      res.json({
        success: true,
        data: data
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  static async getStrategicRecommendations(req, res) {
    try {
      const { targetSales, targetMonths = 6 } = req.body;

      const result = await DecisionSupportService.getStrategicRecommendations(
        targetSales,
        targetMonths
      );

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      const statusCode = error.message.includes('zorunludur') ? 400 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = ApiController;
