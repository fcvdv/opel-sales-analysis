const express = require('express');
const router = express.Router();
const SalesController = require('../controllers/SalesController');

router.get('/', SalesController.getAllSales);
router.get('/top-models', SalesController.getTopModels);
router.get('/by-city', SalesController.getSalesByCity);
router.get('/by-dealer', SalesController.getSalesByDealer);
router.get('/by-fuel-type', SalesController.getSalesByFuelType);
router.get('/by-body-type', SalesController.getSalesByBodyType);

module.exports = router;

