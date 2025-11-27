import { Settings, Bell, Sliders, Database, Shield, Save, RotateCcw } from 'lucide-react';
import { useState } from 'react';

interface SettingsPageProps {
  onSave?: (settings: any) => void;
}

export function SettingsPage({ onSave }: SettingsPageProps) {
  const [settings, setSettings] = useState({
    // Alarm Ayarları
    warningThreshold: 40,
    criticalThreshold: 20,
    enableAudioAlarms: true,
    enableEmailNotifications: false,
    
    // Veri Ayarları
    updateInterval: 1,
    historyRetention: 50,
    autoRefillLevel: 10,
    siloCapacity: 5000,
    
    // Sistem Ayarları
    language: 'tr',
    timezone: 'Europe/Istanbul',
    dateFormat: 'DD/MM/YYYY',
    
    // Güvenlik
    sessionTimeout: 30,
    requirePassword: true,
  });

  const handleSave = () => {
    onSave?.(settings);
    // Show success message
    alert('Ayarlar başarıyla kaydedildi!');
  };

  const handleReset = () => {
    if (confirm('Tüm ayarları varsayılan değerlere döndürmek istediğinizden emin misiniz?')) {
      setSettings({
        warningThreshold: 40,
        criticalThreshold: 20,
        enableAudioAlarms: true,
        enableEmailNotifications: false,
        updateInterval: 1,
        historyRetention: 50,
        autoRefillLevel: 10,
        siloCapacity: 5000,
        language: 'tr',
        timezone: 'Europe/Istanbul',
        dateFormat: 'DD/MM/YYYY',
        sessionTimeout: 30,
        requirePassword: true,
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-gray-900 dark:text-white">Sistem Ayarları</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">Silo izleme sistemi yapılandırması</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handleReset}
            className="flex items-center gap-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <RotateCcw className="h-4 w-4" />
            Sıfırla
          </button>
          <button 
            onClick={handleSave}
            className="flex items-center gap-2 rounded-lg bg-teal-500 px-4 py-2 text-sm text-white transition-colors hover:bg-teal-600"
          >
            <Save className="h-4 w-4" />
            Kaydet
          </button>
        </div>
      </div>

      {/* Alarm Settings */}
      <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-6">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/10">
            <Bell className="h-5 w-5 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <h2 className="text-gray-900 dark:text-white">Alarm Ayarları</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">Alarm eşikleri ve bildirim tercihleri</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm text-gray-700 dark:text-gray-300">
                Uyarı Eşiği (%)
              </label>
              <input
                type="number"
                value={settings.warningThreshold}
                onChange={(e) => setSettings({...settings, warningThreshold: Number(e.target.value)})}
                className="w-full rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 py-2 text-gray-900 dark:text-white"
                min="0"
                max="100"
              />
              <p className="mt-1 text-xs text-gray-500">Sarı uyarı başlatma seviyesi</p>
            </div>

            <div>
              <label className="mb-2 block text-sm text-gray-700 dark:text-gray-300">
                Kritik Eşik (%)
              </label>
              <input
                type="number"
                value={settings.criticalThreshold}
                onChange={(e) => setSettings({...settings, criticalThreshold: Number(e.target.value)})}
                className="w-full rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 py-2 text-gray-900 dark:text-white"
                min="0"
                max="100"
              />
              <p className="mt-1 text-xs text-gray-500">Kırmızı alarm başlatma seviyesi</p>
            </div>
          </div>

          <div className="space-y-4">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={settings.enableAudioAlarms}
                onChange={(e) => setSettings({...settings, enableAudioAlarms: e.target.checked})}
                className="h-4 w-4 rounded border-gray-300"
              />
              <div>
                <span className="text-sm text-gray-900 dark:text-white">Sesli Alarmları Etkinleştir</span>
                <p className="text-xs text-gray-500">Kritik alarmlar için ses çalınacak</p>
              </div>
            </label>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={settings.enableEmailNotifications}
                onChange={(e) => setSettings({...settings, enableEmailNotifications: e.target.checked})}
                className="h-4 w-4 rounded border-gray-300"
              />
              <div>
                <span className="text-sm text-gray-900 dark:text-white">E-posta Bildirimleri</span>
                <p className="text-xs text-gray-500">Alarm durumlarında e-posta gönder</p>
              </div>
            </label>
          </div>
        </div>
      </div>

      {/* Data Settings */}
      <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-6">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
            <Database className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h2 className="text-gray-900 dark:text-white">Veri Ayarları</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">Veri toplama ve saklama yapılandırması</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm text-gray-700 dark:text-gray-300">
                Güncelleme Aralığı (saniye)
              </label>
              <input
                type="number"
                value={settings.updateInterval}
                onChange={(e) => setSettings({...settings, updateInterval: Number(e.target.value)})}
                className="w-full rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 py-2 text-gray-900 dark:text-white"
                min="1"
                max="60"
              />
              <p className="mt-1 text-xs text-gray-500">PLC veri okuma sıklığı</p>
            </div>

            <div>
              <label className="mb-2 block text-sm text-gray-700 dark:text-gray-300">
                Geçmiş Veri Sayısı
              </label>
              <input
                type="number"
                value={settings.historyRetention}
                onChange={(e) => setSettings({...settings, historyRetention: Number(e.target.value)})}
                className="w-full rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 py-2 text-gray-900 dark:text-white"
                min="10"
                max="1000"
              />
              <p className="mt-1 text-xs text-gray-500">Grafikte gösterilecek nokta sayısı</p>
            </div>

            <div>
              <label className="mb-2 block text-sm text-gray-700 dark:text-gray-300">
                Otomatik Dolum Seviyesi (%)
              </label>
              <input
                type="number"
                value={settings.autoRefillLevel}
                onChange={(e) => setSettings({...settings, autoRefillLevel: Number(e.target.value)})}
                className="w-full rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 py-2 text-gray-900 dark:text-white"
                min="0"
                max="50"
              />
              <p className="mt-1 text-xs text-gray-500">Demo modunda dolum tetikleme seviyesi</p>
            </div>

            <div>
              <label className="mb-2 block text-sm text-gray-700 dark:text-gray-300">
                Silo Kapasitesi (kg)
              </label>
              <input
                type="number"
                value={settings.siloCapacity}
                onChange={(e) => setSettings({...settings, siloCapacity: Number(e.target.value)})}
                className="w-full rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 py-2 text-gray-900 dark:text-white"
                min="100"
                max="50000"
              />
              <p className="mt-1 text-xs text-gray-500">Toplam silo kapasitesi</p>
            </div>
          </div>
        </div>
      </div>

      {/* System Settings */}
      <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-6">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10">
            <Sliders className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h2 className="text-gray-900 dark:text-white">Sistem Ayarları</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">Genel sistem yapılandırması</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm text-gray-700 dark:text-gray-300">
                Dil
              </label>
              <select
                value={settings.language}
                onChange={(e) => setSettings({...settings, language: e.target.value})}
                className="w-full rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 py-2 text-gray-900 dark:text-white"
              >
                <option value="tr">Türkçe</option>
                <option value="en">English</option>
                <option value="de">Deutsch</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm text-gray-700 dark:text-gray-300">
                Saat Dilimi
              </label>
              <select
                value={settings.timezone}
                onChange={(e) => setSettings({...settings, timezone: e.target.value})}
                className="w-full rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 py-2 text-gray-900 dark:text-white"
              >
                <option value="Europe/Istanbul">İstanbul (GMT+3)</option>
                <option value="Europe/Berlin">Berlin (GMT+1)</option>
                <option value="America/New_York">New York (GMT-5)</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm text-gray-700 dark:text-gray-300">
                Tarih Formatı
              </label>
              <select
                value={settings.dateFormat}
                onChange={(e) => setSettings({...settings, dateFormat: e.target.value})}
                className="w-full rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 py-2 text-gray-900 dark:text-white"
              >
                <option value="DD/MM/YYYY">GG/AA/YYYY</option>
                <option value="MM/DD/YYYY">AA/GG/YYYY</option>
                <option value="YYYY-MM-DD">YYYY-AA-GG</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Security Settings */}
      <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-6">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
            <Shield className="h-5 w-5 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h2 className="text-gray-900 dark:text-white">Güvenlik Ayarları</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">Oturum ve erişim kontrolü</p>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <label className="mb-2 block text-sm text-gray-700 dark:text-gray-300">
              Oturum Zaman Aşımı (dakika)
            </label>
            <input
              type="number"
              value={settings.sessionTimeout}
              onChange={(e) => setSettings({...settings, sessionTimeout: Number(e.target.value)})}
              className="w-full rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 py-2 text-gray-900 dark:text-white"
              min="5"
              max="120"
            />
            <p className="mt-1 text-xs text-gray-500">İşlem yapılmadığında otomatik çıkış süresi</p>
          </div>

          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={settings.requirePassword}
              onChange={(e) => setSettings({...settings, requirePassword: e.target.checked})}
              className="h-4 w-4 rounded border-gray-300"
            />
            <div>
              <span className="text-sm text-gray-900 dark:text-white">Şifre Koruması Gerekli</span>
              <p className="text-xs text-gray-500">Sisteme erişim için şifre zorunluluğu</p>
            </div>
          </label>
        </div>
      </div>

      {/* Connection Info */}
      <div className="rounded-lg border border-teal-500/30 bg-teal-500/5 p-4">
        <div className="flex gap-3">
          <Settings className="h-5 w-5 flex-shrink-0 text-teal-600 dark:text-teal-400" />
          <div>
            <div className="text-sm text-teal-600 dark:text-teal-400 mb-1">PLC Bağlantı Bilgileri</div>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              PLC IP adresi ve port ayarları için sistem yöneticinize başvurun. 
              Bu ayarlar yalnızca arka uç yapılandırmasından değiştirilebilir.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
