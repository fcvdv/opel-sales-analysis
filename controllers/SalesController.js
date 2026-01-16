const SalesService = require('../services/SalesService');
const ModelService = require('../services/ModelService');
const Dealers = require('../models/dealers');
const Cities = require('../models/cities');
const Regions = require('../models/regions');

class SalesController {
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
      
      const models = await ModelService.getAllModels();
      const dealers = await Dealers.getAll();
      const cities = await Cities.getAll();
      
      const fuelTypes = [...new Set(models.map(m => m.fuel_type).filter(Boolean))].sort();

      res.render('sales/list', {
        title: 'Tüm Satışlar',
        sales: result.data,
        pagination: result.pagination,
        filters: filters,
        filterOptions: {
          models: models,
          fuelTypes: fuelTypes,
          dealers: dealers,
          cities: cities
        }
      });
    } catch (error) {
      res.render('error', { message: error.message });
    }
  }

  static async getTopModels(req, res) {
    try {
      const topModels = await SalesService.getTopModels(20);
      res.render('sales/top-models', {
        title: 'En Çok Satan Modeller',
        topModels
      });
    } catch (error) {
      res.render('error', { message: error.message });
    }
  }

  static async getSalesByCity(req, res) {
    try {
      const byCity = await SalesService.getSalesByCity();
      res.render('sales/by-city', {
        title: 'Şehirlere Göre Satışlar',
        byCity
      });
    } catch (error) {
      res.render('error', { message: error.message });
    }
  }

  static async getSalesByDealer(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      
      const filters = {
        dealer_name: req.query.dealer_name || '',
        city_name: req.query.city_name || '',
        region_id: req.query.region_id || '',
        min_sales: req.query.min_sales || '',
        max_sales: req.query.max_sales || ''
      };

      const result = await SalesService.getSalesByDealer(filters, page, limit);
      
      const cities = await Cities.getAll();
      const regions = await Regions.getAll();

      res.render('sales/by-dealer', {
        title: 'Bayilere Göre Satışlar',
        byDealer: result.data,
        pagination: result.pagination,
        filters: filters,
        filterOptions: {
          cities: cities,
          regions: regions
        }
      });
    } catch (error) {
      res.render('error', { message: error.message });
    }
  }

  static async getSalesByFuelType(req, res) {
    try {
      const byFuelType = await SalesService.getSalesByFuelType();
      res.render('sales/by-fuel-type', {
        title: 'Yakıt Tipine Göre Satışlar',
        byFuelType
      });
    } catch (error) {
      res.render('error', { message: error.message });
    }
  }

  static async getSalesByBodyType(req, res) {
    try {
      const byBodyType = await SalesService.getSalesByBodyType();
      res.render('sales/by-body-type', {
        title: 'Kasa Tipine Göre Satışlar',
        byBodyType
      });
    } catch (error) {
      res.render('error', { message: error.message });
    }
  }
}

module.exports = SalesController;
