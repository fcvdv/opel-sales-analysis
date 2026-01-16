const express = require('express');
const router = express.Router();
const ApiController = require('../controllers/ApiController');
const SalesApiController = require('../controllers/SalesApiController');

router.get('/dashboard-data', ApiController.getDashboardData);
router.get('/city-body-type-data', ApiController.getCityBodyTypeData);
router.get('/city-fuel-type-data', ApiController.getCityFuelTypeData);
router.get('/filters', ApiController.getFilters);
router.post('/strategic-recommendations', ApiController.getStrategicRecommendations);
router.get('/sales', SalesApiController.getAllSales);
router.get('/sales/:id', SalesApiController.getSaleById);
router.post('/sales', SalesApiController.createSale);
router.put('/sales/:id', SalesApiController.updateSale);
router.delete('/sales/:id', SalesApiController.deleteSale);

module.exports = router;

