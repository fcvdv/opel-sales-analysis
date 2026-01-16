const Models = require('../models/models');
const Regions = require('../models/regions');
const SalesService = require('./SalesService');

class FilterService {
  static async getFilterOptions() {
    const models = await Models.getAll();
    const regions = await Regions.getAll();
    const years = await SalesService.getAvailableYears();
    
    const fuelTypes = [...new Set(models.map(m => m.fuel_type).filter(Boolean))];
    const bodyTypes = [...new Set(models.map(m => m.body_type).filter(Boolean))];
    
    return {
      fuelTypes,
      bodyTypes,
      regions,
      years,
      models: models.map(m => ({ model_name: m.model_name }))
    };
  }
}

module.exports = FilterService;
