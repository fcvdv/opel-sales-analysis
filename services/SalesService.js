const Sales = require('../models/sales');
const Time = require('../models/time');
const Models = require('../models/models');

class SalesService {
  static async getAllSales(filters = {}, page = 1, limit = 20) {
    return await Sales.getAllFilteredAndPaginated(filters, page, limit);
  }

  static async getSaleById(id) {
    return await Sales.getById(id);
  }

  static async createSale(saleData) {
    const model = await Models.getById(saleData.model_id);
    if (!model) {
      throw new Error('Satış yapılamaz: Model bulunamadı');
    }

    return await Sales.create(saleData);
  }

  static async updateSale(id, saleData) {
    if (saleData.model_id) {
      const model = await Models.getById(saleData.model_id);
      if (!model) {
        throw new Error('Güncelleme yapılamaz: Model bulunamadı');
      }
    }

    const updated = await Sales.update(id, saleData);
    if (!updated) {
      throw new Error('Satış bulunamadı');
    }
    return updated;
  }

  static async deleteSale(id) {
    const sale = await Sales.getById(id);
    if (!sale) {
      throw new Error('Satış bulunamadı');
    }
    const saleDate = new Date(sale.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (saleDate < today) {
      throw new Error('Geçmiş tarihli satışlar silinemez');
    }

    return await Sales.delete(id);
  }

  static async getDashboardData(filters = {}) {
    const { fuel_type, body_type, region_id, year } = filters;
    
    let topModels = await Sales.getTopModelsFiltered(fuel_type, body_type, region_id, year);
    let byRegion = await Sales.getByRegionFiltered(fuel_type, body_type, null, year);
    let byYear = await Sales.getByYearFiltered(fuel_type, body_type, region_id);
    let byMonth = await Sales.getByMonthFiltered(fuel_type, body_type, region_id, year);
    let byFuelType = await Sales.getByFuelTypeFiltered(body_type, region_id, year);
    let byBodyType = await Sales.getByBodyTypeFiltered(fuel_type, region_id, year);
    let byCityAndBodyType = await Sales.getByCityAndBodyTypeFiltered(fuel_type, year);
    let byBodyTypeAndFuelType = await Sales.getByBodyTypeAndFuelTypeFiltered(region_id, year);
    let byQuarter = await Sales.getByQuarterFiltered(fuel_type, body_type, region_id, year);
    let byMonthAndFuelType = await Sales.getByMonthAndFuelTypeFiltered(body_type, region_id, year);
    let byQuarterAndModel = await Sales.getByQuarterAndModelFiltered(fuel_type, body_type, region_id, year);
    let modelSalesContinuity = await Sales.getModelSalesContinuityFiltered(fuel_type, body_type, region_id, year);
    let topDealer = await Sales.getTopDealerFiltered(fuel_type, body_type, region_id, year);
    let topCity = await Sales.getTopCityFiltered(fuel_type, body_type, region_id, year);
    
    let modelCount = 0;
    try {
      modelCount = await Sales.getModelCountFiltered(fuel_type, body_type, region_id, year);
    } catch (modelCountError) {
      console.error('Model count error:', modelCountError);
    }

    return {
      topModels,
      byRegion,
      byYear,
      byMonth,
      byFuelType,
      byBodyType,
      byBodyTypeAndFuelType,
      byCityAndBodyType,
      byQuarter,
      byMonthAndFuelType,
      byQuarterAndModel,
      modelSalesContinuity,
      topDealer,
      topCity,
      modelCount: modelCount || 0
    };
  }

  static async getCityBodyTypeData(fuel_type, year) {
    return await Sales.getByCityAndBodyTypeFiltered(fuel_type || null, year || null);
  }

  static async getCityFuelTypeData(body_type, year) {
    return await Sales.getByCityAndFuelTypeFiltered(body_type || null, year || null);
  }

  static async getTopModels(limit = 20) {
    return await Sales.getTopModels(limit);
  }

  static async getSalesByCity() {
    return await Sales.getByCity();
  }

  static async getSalesByDealer(filters = {}, page = 1, limit = 20) {
    return await Sales.getByDealerFilteredAndPaginated(filters, page, limit);
  }

  static async getSalesByFuelType() {
    return await Sales.getByFuelType();
  }

  static async getSalesByBodyType() {
    return await Sales.getByBodyType();
  }

  static async getAvailableYears() {
    return await Sales.getAvailableYears();
  }
}

module.exports = SalesService;
