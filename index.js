const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.set('view engine', 'ejs');
app.set('views', './views');

const indexRoutes = require('./routes/index');
const salesRoutes = require('./routes/sales');
const apiRoutes = require('./routes/api');

app.use('/', indexRoutes);
app.use('/sales', salesRoutes);
app.use('/api', apiRoutes);

app.use((req, res) => {
  res.status(404).render('error', { message: 'Sayfa bulunamadı' });
});

app.use((err, req, res, next) => {
  console.error('Hata:', err);
  res.status(500).render('error', { 
    message: process.env.NODE_ENV === 'development' ? err.message : 'İç sunucu hatası' 
  });
});

app.listen(PORT, () => {
  console.log(`Sunucu http://localhost:${PORT} adresinde çalışıyor`);
});

