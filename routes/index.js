const express = require('express');
const router = express.Router();
const DashboardController = require('../controllers/DashboardController');

router.get('/', (req, res) => {
  res.redirect('/dashboard');
});

router.get('/dashboard', DashboardController.getDashboard);

module.exports = router;

