class DashboardController {
  static async getDashboard(req, res) {
    try {
      res.render('dashboard', {
        title: 'Opel Türkiye Satış Analizi - Dashboard'
      });
    } catch (error) {
      res.render('error', { message: error.message });
    }
  }
}

module.exports = DashboardController;
