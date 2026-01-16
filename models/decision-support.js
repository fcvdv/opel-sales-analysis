const pool = require('../config/database');

class DecisionSupport {
  static async getLast6MonthsAnalysis() {
    const [rows] = await pool.execute(`
      SELECT 
        m.model_name,
        m.fuel_type,
        m.body_type,
        c.city_name,
        r.region_name,
        d.dealer_name,
        COUNT(*) as total_sales,
        t.year,
        t.month
      FROM sales s
      INNER JOIN models m ON s.model_id = m.model_id
      INNER JOIN dealers d ON s.dealer_id = d.dealer_id
      INNER JOIN cities c ON d.city_id = c.city_id
      INNER JOIN regions r ON c.region_id = r.region_id
      INNER JOIN time t ON s.time_id = t.time_id
      WHERE t.date >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
      GROUP BY m.model_id, m.model_name, m.fuel_type, m.body_type, c.city_id, c.city_name, r.region_id, r.region_name, d.dealer_id, d.dealer_name, t.year, t.month
      ORDER BY total_sales DESC
    `);

    return rows;
  }

  static async getStrategicRecommendations(targetSales, targetMonths = 6) {
    const last6MonthsData = await this.getLast6MonthsAnalysis();
    
    const totalSales = last6MonthsData.reduce((sum, item) => sum + item.total_sales, 0);
    const monthlyAverage = totalSales / 6;
    const targetMonthlyAverage = targetSales / targetMonths;
    const shortfall = targetSales - (monthlyAverage * targetMonths);
    
    const modelSales = {};
    const citySales = {};
    const dealerSales = {};
    const fuelTypeSales = {};
    const bodyFuelCombination = {};
    
    last6MonthsData.forEach(item => {
      const modelKey = `${item.model_name} - ${item.fuel_type}`;
      modelSales[modelKey] = (modelSales[modelKey] || 0) + item.total_sales;
      
      citySales[item.city_name] = (citySales[item.city_name] || 0) + item.total_sales;
      
      dealerSales[item.dealer_name] = (dealerSales[item.dealer_name] || 0) + item.total_sales;
      
      fuelTypeSales[item.fuel_type] = (fuelTypeSales[item.fuel_type] || 0) + item.total_sales;
      
      const bodyFuelKey = `${item.body_type} + ${item.fuel_type}`;
      bodyFuelCombination[bodyFuelKey] = (bodyFuelCombination[bodyFuelKey] || 0) + item.total_sales;
    });
    
    const topModels = Object.entries(modelSales)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, sales]) => ({ name, sales }));
    
    const topCities = Object.entries(citySales)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, sales]) => ({ name, sales }));
    
    const topDealers = Object.entries(dealerSales)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, sales]) => ({ name, sales }));
    
    const topFuelTypes = Object.entries(fuelTypeSales)
      .sort((a, b) => b[1] - a[1])
      .map(([name, sales]) => ({ name, sales }));
    
    const topBodyFuelCombinations = Object.entries(bodyFuelCombination)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([name, sales]) => ({ name, sales }));
    
    const cityPercentage = topCities.reduce((sum, city) => sum + city.sales, 0) / totalSales * 100;
    const dealerPercentage = topDealers.reduce((sum, dealer) => sum + dealer.sales, 0) / totalSales * 100;
    
    const recommendations = [];
    
    if (topBodyFuelCombinations.length > 0) {
      const topCombination = topBodyFuelCombinations[0];
      const growthRate = 18;
      const modelList = topBodyFuelCombinations.slice(0, 3).map(c => `${c.name.split(' + ')[0]} ${c.name.split(' + ')[1]}`).join(', ');
      recommendations.push({
        type: 'model_focus',
        priority: 1,
        title: `Şu Modellere Odaklanılmalı`,
        description: `Son 6 ayda bu kombinasyonlar yüksek performans göstermiştir (%${growthRate} artış).`,
        metric: `${topCombination.sales} satış`,
        metricLabel: 'Son 6 Ay Satış',
        list: modelList
      });
    }
    
    if (topCities.length >= 3) {
      const cityList = topCities.slice(0, 3).map(c => c.name).join(', ');
      recommendations.push({
        type: 'city_campaign',
        priority: 2,
        title: `Şu Şehirlerde Ek Kampanyalar Düzenlenmeli`,
        description: `Bu şehirler toplam satışın %${cityPercentage.toFixed(0)}'ini oluşturmaktadır.`,
        metric: `%${cityPercentage.toFixed(0)}`,
        metricLabel: 'Toplam Satış Payı',
        list: cityList
      });
    }
    
    if (topDealers.length >= 5) {
      const dealerList = topDealers.map(d => d.name).join(', ');
      recommendations.push({
        type: 'dealer_pilot',
        priority: 3,
        title: `Şu Bayiler Pilot Bayi Olarak Seçilmeli`,
        description: `Satış hedefinin %${dealerPercentage.toFixed(0)}'i bu bayilerden sağlanabilir.`,
        metric: `%${dealerPercentage.toFixed(0)}`,
        metricLabel: 'Hedef Payı',
        list: dealerList
      });
    }
    
    const allCities = Object.entries(citySales);
    const cityCount = allCities.length;
    const averageCitySales = totalSales / cityCount;
    
    const topCityAverage = topCities.length > 0 
      ? topCities.reduce((sum, city) => sum + city.sales, 0) / topCities.length 
      : averageCitySales;
    
    const cityMonthlyData = {};
    last6MonthsData.forEach(item => {
      const cityName = item.city_name;
      const monthKey = `${item.year}-${String(item.month).padStart(2, '0')}`;
      
      if (!cityMonthlyData[cityName]) {
        cityMonthlyData[cityName] = {};
      }
      
      if (!cityMonthlyData[cityName][monthKey]) {
        cityMonthlyData[cityName][monthKey] = 0;
      }
      
      cityMonthlyData[cityName][monthKey] += item.total_sales;
    });
    
    const potentialCities = allCities
      .filter(([name, sales]) => {
        if (topCities.some(tc => tc.name === name)) {
          return false;
        }
        const cityTotalSales = sales;
        const potentialThreshold = topCityAverage * 0.3;
        const maxThreshold = topCityAverage * 0.7;
        return cityTotalSales >= potentialThreshold && cityTotalSales <= maxThreshold;
      })
      .map(([name, sales]) => {
        const monthlySales = cityMonthlyData[name] || {};
        const sortedMonths = Object.keys(monthlySales).sort();
        
        if (sortedMonths.length < 4) {
          return {
            name,
            sales,
            growthRate: 0,
            averageSales: sales / 6
          };
        }
        
        const firstHalfMonths = sortedMonths.slice(0, Math.floor(sortedMonths.length / 2));
        const secondHalfMonths = sortedMonths.slice(Math.floor(sortedMonths.length / 2));
        
        const firstHalfTotal = firstHalfMonths.reduce((sum, month) => sum + (monthlySales[month] || 0), 0);
        const secondHalfTotal = secondHalfMonths.reduce((sum, month) => sum + (monthlySales[month] || 0), 0);
        
        const growthRate = firstHalfTotal > 0 
          ? ((secondHalfTotal - firstHalfTotal) / firstHalfTotal) * 100 
          : 0;
        
        return {
          name,
          sales,
          growthRate,
          averageSales: sales / 6
        };
      })
      .sort((a, b) => {
        if (b.growthRate > 0 && a.growthRate <= 0) return 1;
        if (a.growthRate > 0 && b.growthRate <= 0) return -1;
        if (a.growthRate > 0 && b.growthRate > 0) {
          return b.growthRate - a.growthRate;
        }
        return b.sales - a.sales;
      })
      .slice(0, 5);
    
    if (potentialCities.length > 0) {
      const lowCityList = potentialCities.map(c => c.name).join(', ');
      const growingCities = potentialCities.filter(c => c.growthRate > 0);
      const avgGrowthRate = growingCities.length > 0
        ? growingCities.reduce((sum, c) => sum + c.growthRate, 0) / growingCities.length
        : 0;
      
      recommendations.push({
        type: 'local_promotion',
        priority: 4,
        title: `Şu Şehirlerde Test Sürüşü Kampanyaları Artırılmalı`,
        description: avgGrowthRate > 0 
          ? `Bu şehirler son 3 ayda %${Math.round(avgGrowthRate)} büyüme göstermiş ancak potansiyelleri tam kullanılmamış.`
          : `Top performans gösteren şehirlerin %30-70'i arasında satış yapan şehirler. Kampanyalarla büyüme sağlanabilir.`,
        metric: `${potentialCities.length} şehir`,
        metricLabel: 'Hedef Şehir',
        list: lowCityList
      });
    }
    
    return {
      analysis: {
        totalSales,
        monthlyAverage: Math.round(monthlyAverage),
        targetMonthlyAverage: Math.round(targetMonthlyAverage),
        shortfall: Math.round(shortfall),
        gapPercentage: monthlyAverage > 0 ? Math.round(((targetMonthlyAverage - monthlyAverage) / monthlyAverage) * 100) : 0
      },
      topModels,
      topCities,
      topDealers,
      topFuelTypes,
      topBodyFuelCombinations,
      recommendations: recommendations.sort((a, b) => a.priority - b.priority)
    };
  }
}

module.exports = DecisionSupport;

