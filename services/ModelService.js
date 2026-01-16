const Models = require('../models/models');

class ModelService {
  static async getAllModels() {
    return await Models.getAll();
  }

  static async getModelById(id) {
    return await Models.getById(id);
  }
}

module.exports = ModelService;
