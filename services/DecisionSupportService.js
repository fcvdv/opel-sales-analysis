const DecisionSupport = require('../models/decision-support');

class DecisionSupportService {
  static async getStrategicRecommendations(targetSales, targetMonths = 6) {
    if (!targetSales) {
      throw new Error('Hedef satış adedi zorunludur');
    }

    return await DecisionSupport.getStrategicRecommendations(
      parseInt(targetSales),
      parseInt(targetMonths)
    );
  }
}

module.exports = DecisionSupportService;
