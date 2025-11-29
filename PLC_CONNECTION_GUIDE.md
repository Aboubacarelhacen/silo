# PLC Bağlantı Kontrolü - Kullanım Kılavuzu

## Problem

Sistem ilk açıldığında PLC'ye otomatik bağlanmaya çalışıyordu. Eğer PLC erişilebilir değilse, veri alınamıyordu ve kullanıcı hiçbir şey göremiyordu.

## Çözüm

Artık **manuel PLC bağlantı kontrolü** eklendi:

- Backend otomatik olarak bağlanmaz
- Kullanıcı "PLC'ye Bağlan" butonuna basarak bağlantıyı başlatır
- Bağlantı durumu anlık olarak görüntülenir

## Yeni Özellikler

### 1. PLC Bağlantı Kontrolü Bileşeni

**Konum:** Dashboard sayfasının üstünde ve Ayarlar sayfasında

**Özellikler:**

- 🟢 **Bağlantı Durumu**: Bağlı/Bağlı Değil göstergesi
- 🔌 **Bağlan Butonu**: PLC'ye manuel bağlantı
- ✂️ **Bağlantıyı Kes Butonu**: Manuel bağlantı kesme
- ⚠️ **Hata Mesajları**: Bağlantı başarısız olursa detaylı hata gösterimi
- 🔄 **Otomatik Durum Güncellemesi**: Her 5 saniyede durum kontrolü

### 2. Backend API Endpoints

#### `POST /api/plc/connect`

PLC'ye bağlanır

- Kimlik doğrulama gerektirir
- Başarılı: `{success: true, message: "PLC'ye bağlandı"}`
- Başarısız: `{success: false, message: "Hata mesajı"}`

#### `POST /api/plc/disconnect`

PLC bağlantısını keser

- Kimlik doğrulama gerektirir
- Başarılı: `{success: true, message: "PLC bağlantısı kesildi"}`

#### `GET /api/plc/status`

Mevcut bağlantı durumunu kontrol eder

- Kimlik doğrulama gerektirir
- Döner: `{connected: boolean, message: string, lastError?: string, endpoint: string}`

### 3. Backend Değişiklikleri

**RealOpcUaSiloDataSource.cs:**

- `ConnectAsync()`: Manuel bağlantı metodu
- `Disconnect()`: Manuel bağlantı kesme metodu
- `GetConnectionStatus()`: Durum kontrolü metodu
- Bağlı değilken okuma yapılırsa 0 döner (hata vermez)

**SiloMonitorService.cs:**

- Başlangıçta otomatik bağlanmaz
- Eğer bağlı değilse veri broadcast etmez
- 0 değeri gelirse atlar (gereksiz veri göndermez)

## Kullanım

### İlk Açılışta

1. Sistemi açın (backend + frontend)
2. Giriş yapın
3. Dashboard'da üstte **"PLC Bağlantısı"** kartını görün
4. **"PLC'ye Bağlan"** butonuna tıklayın
5. Bağlantı başarılı olduğunda:
   - Durum: 🟢 **Bağlı** olarak değişir
   - Anlık veriler akmaya başlar
   - Silo seviyesi ve sıcaklık gösterilir

### Bağlantı Başarısız Olursa

- Kırmızı uyarı kutusu görünür
- Hata mesajı gösterilir (örn: "Endpoint erişilebilir değil")
- PLC IP adresini ve ağ bağlantısını kontrol edin
- Tekrar bağlanmayı deneyin

### Bağlantıyı Kesmek

1. **"Bağlantıyı Kes"** butonuna tıklayın
2. Veri akışı durur
3. Durum: ⚫ **Bağlı Değil** olarak değişir

## Teknik Detaylar

### Güvenlik

- Tüm API endpoint'leri JWT kimlik doğrulaması gerektirir
- Sadece giriş yapmış kullanıcılar bağlantı kontrolü yapabilir

### Bağlantı Bilgileri

- **Endpoint**: `opc.tcp://192.168.1.49:26543`
- **Silo Node**: `ns=1;b=1020ffab`
- **Sıcaklık Node**: `ns=1;s=Temperature`

### Frontend Bileşenler

- **PlcConnectionControl.tsx**: Bağlantı kontrolü UI bileşeni
- DashboardPage: Üstte bağlantı kontrolü gösterir
- SettingsPage: Ayarlar sayfasında da bağlantı kontrolü var

### Backend Controller

- **PlcController.cs**: Yeni API controller
  - Connect endpoint
  - Disconnect endpoint
  - Status endpoint

## Avantajlar

✅ **Kullanıcı Kontrolü**: Manuel bağlantı kontrolü
✅ **Hata Yönetimi**: Detaylı hata mesajları
✅ **Durum Takibi**: Anlık bağlantı durumu gösterimi
✅ **Esneklik**: İstediğiniz zaman bağlan/kes
✅ **Veri Tasarrufu**: Bağlı değilken gereksiz broadcast yok

## Gelecek Geliştirmeler (Opsiyonel)

- 🔄 Otomatik yeniden bağlanma seçeneği (ayarlardan açılabilir)
- 📊 Bağlantı geçmişi logu
- ⏰ Zamanlanmış bağlantı/kesme
- 📧 Bağlantı koptuğunda bildirim gönderme
