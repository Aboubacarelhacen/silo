import { Activity, Clock, Database, AlertTriangle, TrendingDown, CheckCircle } from 'lucide-react';
import type { SiloData } from '../../types';

interface SiloDetailsCardProps {
  siloData: SiloData;
}

export function SiloDetailsCard({ siloData }: SiloDetailsCardProps) {
  const { currentLevel, status, volumeKg, lastRefillTime, lastUpdateTime } = siloData;

  const getStatusConfig = () => {
    switch (status) {
      case 'critical':
        return {
          icon: AlertTriangle,
          text: 'KRİTİK – Hemen Doldurun',
          color: 'text-red-600 dark:text-red-400',
          bgColor: 'bg-red-500/10',
        };
      case 'low':
        return {
          icon: TrendingDown,
          text: 'Düşük – Yakında Doldurun',
          color: 'text-yellow-600 dark:text-yellow-400',
          bgColor: 'bg-yellow-500/10',
        };
      case 'normal':
        return {
          icon: CheckCircle,
          text: 'Normal',
          color: 'text-teal-600 dark:text-teal-400',
          bgColor: 'bg-teal-500/10',
        };
    }
  };

  const statusConfig = getStatusConfig();
  const StatusIcon = statusConfig.icon;

  const formatTimeSince = (date: Date) => {
    const minutes = Math.floor((Date.now() - date.getTime()) / 60000);
    if (minutes < 60) return `${minutes} dk önce`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} sa ${minutes % 60} dk önce`;
    const days = Math.floor(hours / 24);
    return `${days} gün ${hours % 24} sa önce`;
  };

  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-6">
      <h2 className="mb-6 text-gray-900 dark:text-white">Silo Detayları</h2>

      <div className="space-y-4">
        {/* Status Badge */}
        <div className={`flex items-center gap-3 rounded-lg border border-gray-200 dark:border-gray-800 ${statusConfig.bgColor} p-4`}>
          <StatusIcon className={`h-6 w-6 ${statusConfig.color}`} />
          <div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Durum</div>
            <div className={`${statusConfig.color}`}>{statusConfig.text}</div>
          </div>
        </div>

        {/* Level Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-4">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <Activity className="h-4 w-4" />
              <span className="text-sm">Mevcut Seviye</span>
            </div>
            <div className="mt-2 text-2xl text-gray-900 dark:text-white tabular-nums">{currentLevel.toFixed(1)}%</div>
            <div className="text-sm text-gray-500">{volumeKg.toFixed(0)} kg</div>
          </div>

          <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-4">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <Database className="h-4 w-4" />
              <span className="text-sm">Kapasite</span>
            </div>
            <div className="mt-2 text-2xl text-gray-900 dark:text-white">5.000</div>
            <div className="text-sm text-gray-500">kg toplam</div>
          </div>
        </div>

        {/* Time Information */}
        <div className="space-y-3 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <Clock className="h-4 w-4" />
              <span className="text-sm">Son Dolum</span>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-900 dark:text-white">{formatTimeSince(lastRefillTime)}</div>
              <div className="text-xs text-gray-500">
                {lastRefillTime.toLocaleTimeString('tr-TR', { 
                  hour: '2-digit', 
                  minute: '2-digit',
                  hour12: false 
                })}
              </div>
            </div>
          </div>

          <div className="h-px bg-gray-200 dark:bg-gray-800" />

          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <Activity className="h-4 w-4" />
              <span className="text-sm">Son PLC Güncellemesi</span>
            </div>
            <div className="text-right">
              <div className="text-sm text-teal-600 dark:text-teal-400">Canlı</div>
              <div className="text-xs text-gray-500">
                {lastUpdateTime.toLocaleTimeString('tr-TR', { 
                  hour: '2-digit', 
                  minute: '2-digit',
                  second: '2-digit',
                  hour12: false 
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Warning Thresholds */}
        <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-4">
          <div className="mb-3 text-sm text-gray-600 dark:text-gray-400">Alarm Eşikleri</div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Uyarı Seviyesi</span>
              <span className="text-yellow-600 dark:text-yellow-400">40%</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Kritik Seviye</span>
              <span className="text-red-600 dark:text-red-400">20%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
