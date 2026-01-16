# Opel Türkiye Satış Analizi

Opel Türkiye'nin satış verilerini analiz etmek için geliştirilmiş web uygulaması. Proje, MVC (Model-View-Controller) mimarisine uygun olarak tasarlanmıştır ve REST prensiplerine uygun API endpoint'leri içermektedir.

## İçindekiler

- [Özellikler](#özellikler)
- [Teknolojiler](#teknolojiler)
- [Kurulum](#kurulum)
- [Kullanım](#kullanım)
- [API Dokümantasyonu](#api-dokümantasyonu)
- [Proje Yapısı](#proje-yapısı)
- [MVC Mimarisi](#mvc-mimarisi)
- [İş Kuralları](#iş-kuralları)
- [Geliştirme](#geliştirme)
- [Lisans](#lisans)

## Özellikler

- **Interaktif Dashboard**: Satış verilerinin görselleştirildiği dinamik dashboard
- **Detaylı Raporlama**: Şehir, bölge, model, yakıt tipi ve kasa tipine göre kapsamlı raporlar
- **Gelişmiş Filtreleme**: Çoklu filtre seçenekleri ile veri analizi
- **RESTful API**: CRUD işlemleri için REST prensiplerine uygun API endpoint'leri
- **İş Kuralları**: Geçmiş tarihli satış silme kısıtlaması ve model kontrolü
- **Responsive Tasarım**: Mobil ve masaüstü uyumlu arayüz

## Teknolojiler

- **Backend Framework**: Node.js, Express.js
- **Veritabanı**: MySQL
- **View Engine**: EJS (Embedded JavaScript)
- **Mimari**: MVC (Model-View-Controller)
- **Diğer**: Chart.js, D3.js (veri görselleştirme)

## Kurulum

### Gereksinimler

- Node.js (v14 veya üzeri)
- MySQL (v5.7 veya üzeri)
- npm veya yarn

### Adımlar

1. **Projeyi klonlayın**
   ```bash
   git clone <repository-url>
   cd opel_sales_analysis/app
   ```

2. **Bağımlılıkları yükleyin**
   ```bash
   npm install
   ```

3. **Environment değişkenlerini yapılandırın**
   
   `.env` dosyası oluşturun:
   ```env
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=root
   DB_NAME=opel_sales
   PORT=3000
   NODE_ENV=development
   ```

4. **Veritabanını hazırlayın**
   
   MySQL veritabanını oluşturun ve gerekli tabloları import edin.

5. **Uygulamayı başlatın**
   ```bash
   npm start
   ```

6. **Tarayıcıda açın**
   
   `http://localhost:3000` adresine gidin.

## Kullanım

### Dashboard

Dashboard sayfasına erişmek için:
```
http://localhost:3000/dashboard
```

Dashboard'da şu özellikler bulunur:
- Toplam satış istatistikleri
- En çok satan modeller
- Bölgesel satış dağılımı
- Yakıt tipi analizleri
- Aylık satış trendleri

### Satış Yönetimi

Satış listesine erişmek için:
```
http://localhost:3000/sales
```

Filtreleme seçenekleri:
- Model adı
- Yakıt tipi
- Bayi adı
- Şehir
- Tarih aralığı

## API Dokümantasyonu

### Base URL
```
http://localhost:3000/api
```

### Dashboard API

#### Dashboard Verilerini Getir
```http
GET /api/dashboard-data
```

**Query Parametreleri:**
- `fuel_type` (optional): Yakıt tipi filtresi
- `body_type` (optional): Kasa tipi filtresi
- `region_id` (optional): Bölge ID filtresi
- `year` (optional): Yıl filtresi

**Örnek:**
```bash
curl "http://localhost:3000/api/dashboard-data?fuel_type=Benzin&year=2023"
```

#### Filtre Seçeneklerini Getir
```http
GET /api/filters
```

**Yanıt:**
```json
{
  "success": true,
  "data": {
    "fuelTypes": ["Benzin", "Dizel", "Elektrik"],
    "bodyTypes": ["Sedan", "Hatchback", "SUV"],
    "regions": [...],
    "years": [2020, 2021, 2022, 2023],
    "models": [...]
  }
}
```

### CRUD API (Satışlar)

#### Tüm Satışları Listele
```http
GET /api/sales
```

**Query Parametreleri:**
- `page` (optional): Sayfa numarası (varsayılan: 1)
- `limit` (optional): Sayfa başına kayıt (varsayılan: 20)
- `model_name` (optional): Model adı filtresi
- `fuel_type` (optional): Yakıt tipi filtresi
- `dealer_name` (optional): Bayi adı filtresi
- `city_name` (optional): Şehir adı filtresi
- `date_from` (optional): Başlangıç tarihi
- `date_to` (optional): Bitiş tarihi

**Örnek:**
```bash
curl "http://localhost:3000/api/sales?page=1&limit=10&fuel_type=Benzin"
```

#### Satış Getir (ID ile)
```http
GET /api/sales/:id
```

**Örnek:**
```bash
curl "http://localhost:3000/api/sales/123"
```

#### Yeni Satış Oluştur
```http
POST /api/sales
```

**Request Body:**
```json
{
  "model_id": 1,
  "dealer_id": 5,
  "time_id": 10
}
```

**Örnek:**
```bash
curl -X POST "http://localhost:3000/api/sales" \
  -H "Content-Type: application/json" \
  -d '{"model_id": 1, "dealer_id": 5, "time_id": 10}'
```

#### Satış Güncelle
```http
PUT /api/sales/:id
```

**Request Body:**
```json
{
  "model_id": 2,
  "dealer_id": 5,
  "time_id": 10
}
```

#### Satış Sil
```http
DELETE /api/sales/:id
```

**Not:** Geçmiş tarihli satışlar silinemez.

### Stratejik Öneriler

#### Stratejik Önerileri Getir
```http
POST /api/strategic-recommendations
```

**Request Body:**
```json
{
  "targetSales": 1000,
  "targetMonths": 6
}
```

## Proje Yapısı

```
app/
├── config/
│   └── database.js              # Veritabanı bağlantı yapılandırması
├── controllers/
│   ├── ApiController.js         # API endpoint controller'ları
│   ├── DashboardController.js   # Dashboard controller
│   ├── SalesApiController.js    # REST API CRUD işlemleri
│   └── SalesController.js       # View route controller'ları
├── models/
│   ├── cities.js                # Şehir modeli
│   ├── dealers.js               # Bayi modeli
│   ├── decision-support.js      # Karar destek modeli
│   ├── models.js                # Model modeli
│   ├── regions.js               # Bölge modeli
│   ├── sales.js                 # Satış modeli
│   └── time.js                  # Zaman modeli
├── routes/
│   ├── api.js                   # API route tanımları
│   ├── index.js                 # Ana route'lar
│   └── sales.js                 # Satış route'ları
├── services/
│   ├── DecisionSupportService.js # Stratejik öneriler servisi
│   ├── FilterService.js         # Filtre servisi
│   ├── ModelService.js          # Model servisi
│   └── SalesService.js          # İş mantığı ve iş kuralları
├── views/
│   ├── dashboard.ejs            # Dashboard sayfası
│   ├── error.ejs                 # Hata sayfası
│   ├── index.ejs                 # Ana sayfa
│   └── sales/
│       ├── by-body-type.ejs      # Kasa tipine göre satışlar
│       ├── by-city.ejs           # Şehirlere göre satışlar
│       ├── by-dealer.ejs         # Bayilere göre satışlar
│       ├── by-fuel-type.ejs      # Yakıt tipine göre satışlar
│       ├── list.ejs              # Satış listesi
│       └── top-models.ejs        # En çok satan modeller
├── public/
│   └── opel-logo.svg            # Opel logosu
├── index.js                      # Uygulama giriş noktası
└── package.json                  # Proje bağımlılıkları
```

## MVC Mimarisi

Proje, katı MVC mimarisine uygun olarak tasarlanmıştır:

### Katman Sorumlulukları

| Katman | Sorumluluk |
|--------|------------|
| **Routes** | Sadece routing işlemleri yapar, iş mantığı içermez |
| **Controllers** | HTTP isteklerini alır, service katmanına yönlendirir ve response döner |
| **Services** | İş mantığı, validasyon ve iş kurallarını içerir |
| **Models** | Veritabanı sorgularını ve veri erişim işlemlerini yapar |
| **Views** | Kullanıcı arayüzü (EJS template'leri) |

### Mimari Akış

```
Request → Route → Controller → Service → Model → Database
                ↓
              View ← Response
```

## ⚖️ İş Kuralları

### 1. Geçmiş Tarihli Satış Silme Kısıtlaması

Geçmiş tarihli satışlar silinemez. Sadece bugün ve gelecek tarihli satışlar silinebilir.

**Uygulama:**
- `SalesService.deleteSale()` metodunda tarih kontrolü yapılır
- Geçmiş tarihli satış silme denemesi hata döndürür

### 2. Model Kontrolü

Satış oluşturulurken veya güncellenirken, belirtilen `model_id`'nin veritabanında mevcut olması gerekir.

**Uygulama:**
- `SalesService.createSale()` metodunda model kontrolü yapılır
- `SalesService.updateSale()` metodunda model kontrolü yapılır
- Model bulunamazsa işlem gerçekleştirilmez ve hata döndürülür

## Geliştirme

### Bağımlılıklar

```json
{
  "express": "^4.18.2",
  "ejs": "^3.1.9",
  "mysql2": "^3.6.5",
  "dotenv": "^16.3.1",
  "cors": "^2.8.5"
}
```

### Scripts

```bash
# Uygulamayı başlat
npm start
```

### Geliştirme Notları

- Proje MVC mimarisine uygun olarak geliştirilmiştir
- Tüm iş mantığı `services` katmanında bulunur
- Controller'lar sadece HTTP isteklerini yönetir
- Model'ler sadece veritabanı işlemlerini içerir

## Lisans

Bu proje ISC lisansı altında lisanslanmıştır.

## Katkıda Bulunanlar

- Opel Türkiye Satış Analizi Projesi Ekibi

## İletişim

Sorularınız veya önerileriniz için issue açabilirsiniz.

---

**Not:** Bu proje eğitim amaçlı geliştirilmiştir ve MVC mimarisi, REST API tasarımı ve iş kuralları uygulaması konularında örnek teşkil etmektedir.
