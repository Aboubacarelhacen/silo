# Hızlı Başlangıç - PLC Bağlantı Kontrolü

## 🚀 Sistemi Başlatma

### 1. Backend'i Çalıştırın

```bash
cd backend
dotnet run
```

Backend `http://localhost:5000` üzerinde çalışacak

### 2. Frontend'i Çalıştırın

```bash
cd frontend
npm run dev
```

Frontend `http://localhost:5173` üzerinde çalışacak

## 🔌 İlk Kez PLC'ye Bağlanma

1. **Tarayıcıda açın**: `http://localhost:5173`

2. **Giriş yapın**:

   - Kullanıcı adı: `admin`
   - Şifre: `admin123`

3. **Dashboard'da PLC Bağlantı Kartını görün**:

   - Sayfa üstünde "PLC Bağlantısı" kartı var
   - Durum: 🔴 **Bağlı Değil**

4. **"PLC'ye Bağlan" butonuna tıklayın**:

   - Buton "Bağlanıyor..." olacak
   - PLC'ye bağlanmaya çalışır

5. **Başarılı Bağlantı**:
   - Durum: 🟢 **Bağlı**
   - Anlık veri akmaya başlar
   - Silo seviyesi gösterilir
   - Sıcaklık termometresi güncellenir

## ⚠️ PLC Bulunamazsa Ne Olur?

### Senaryo 1: PLC Ağda Değil

```
Hata: "Could not connect to opc.tcp://192.168.1.49:26543"
```

**Çözüm**:

- PLC'nin açık olduğundan emin olun
- IP adresinin doğru olduğunu kontrol edin (`192.168.1.49`)
- Ağ bağlantısını kontrol edin
- `backend/appsettings.json` dosyasında endpoint'i kontrol edin

### Senaryo 2: Node ID Yanlış

```
Hata: "Failed to read node"
```

**Çözüm**:

- Node ID'leri kontrol edin:
  - Silo: `ns=1;b=1020ffab`
  - Sıcaklık: `ns=1;s=Temperature`
- `backend/appsettings.json` dosyasında düzeltin

### Senaryo 3: Zaman Aşımı

```
Hata: "Operation timeout"
```

**Çözüm**:

- PLC'nin aşırı yüklü olup olmadığını kontrol edin
- Timeout ayarını artırın (varsayılan: 15 saniye)

## 🔄 Test Modu (PLC Olmadan)

PLC yoksa test için backend'de `SimulatedSiloDataSource` kullanabilirsiniz:

### Backend'de Değişiklik:

**Program.cs** dosyasında:

```csharp
// Bu satırı comment'leyin:
// builder.Services.AddSingleton<ISiloDataSource, RealOpcUaSiloDataSource>();

// Bu satırı ekleyin:
builder.Services.AddSingleton<ISiloDataSource, SimulatedSiloDataSource>();
```

Böylece PLC olmadan rastgele test verileri ile çalışabilirsiniz.

## 📊 Bağlantı Durumunu Takip Etme

### Dashboard'da

- Üstte her zaman bağlantı durumu görünür
- 5 saniyede bir otomatik güncellenir
- Bağlı ise: Yeşil nokta animasyonlu
- Bağlı değilse: Kırmızı nokta

### Ayarlar Sayfasında

- Settings > PLC Bağlantısı bölümü
- Aynı kontroller var
- Endpoint bilgisi gösterilir

## 🛠️ Gelişmiş Ayarlar

### PLC Endpoint Değiştirme

`backend/appsettings.json`:

```json
{
  "OpcUa": {
    "EndpointUrl": "opc.tcp://192.168.1.49:26543",
    "SiloLevelNodeId": "ns=1;b=1020ffab",
    "TemperatureNodeId": "ns=1;s=Temperature"
  }
}
```

### Güncelleme Sıklığı

`backend/Services/SiloMonitorService.cs`:

```csharp
await Task.Delay(1000, stoppingToken); // 1000ms = 1 saniye
```

## 📝 Sık Karşılaşılan Sorunlar

### Problem: "Authorization failed"

**Çözüm**: Token'ın süresi dolmuş, yeniden giriş yapın

### Problem: Veri gelmiyor

**Çözüm**:

1. PLC bağlantı durumunu kontrol edin (yeşil mi?)
2. Backend console'da hata var mı bakın
3. Frontend console'da (F12) hata var mı bakın

### Problem: "Session timeout"

**Çözüm**:

- Backend yeniden başlatın
- Frontend'de "Bağlantıyı Kes" sonra tekrar "Bağlan"

## ✨ İpuçları

1. **Her zaman önce backend'i başlatın**, sonra frontend'i
2. **İlk bağlantı 2-3 saniye sürebilir** (normal)
3. **Bağlantı koptuğunda** sistem otomatik yeniden bağlanmaya çalışmaz, manuel bağlanmalısınız
4. **Test için** simüle edilmiş veri kaynağını kullanabilirsiniz
5. **Hata mesajlarını** not edin, debug için çok faydalı

## 🎯 Başarı Göstergeleri

✅ Backend konsol: "OPC UA session created successfully"
✅ Frontend: Yeşil "Bağlı" badge
✅ Dashboard: Silo seviyesi ve sıcaklık güncelleniyor
✅ Grafik: Gerçek zamanlı veri çiziliyor

## 📞 Destek

Sorun yaşarsanız:

1. Backend console loglarını kontrol edin
2. Frontend browser console'u kontrol edin (F12)
3. `PLC_CONNECTION_GUIDE.md` dosyasını okuyun
4. PLC network ayarlarını doğrulayın
