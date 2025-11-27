import { AlertTriangle, CheckCircle2, AlertCircle, X } from 'lucide-react';
import type { SiloStatus } from '../../types';

interface AlarmBannerProps {
  status: SiloStatus;
  level: number;
  onAcknowledge?: () => void;
}

export function AlarmBanner({ status, level, onAcknowledge }: AlarmBannerProps) {
  const getConfig = () => {
    switch (status) {
      case 'critical':
        return {
          icon: AlertCircle,
          title: 'KRİTİK ALARM',
          message: `Silo neredeyse boş (${level.toFixed(1)}%) – Hatalı kablo kaplaması üretimini önlemek için hemen doldurun!`,
          bgColor: 'bg-red-500/10',
          borderColor: 'border-red-500/50',
          textColor: 'text-red-600 dark:text-red-400',
          iconColor: 'text-red-600 dark:text-red-500',
        };
      case 'low':
        return {
          icon: AlertTriangle,
          title: 'Uyarı',
          message: `Silo malzeme seviyesi düşük (${level.toFixed(1)}%) – Yakında doldurmaya hazırlanın.`,
          bgColor: 'bg-yellow-500/10',
          borderColor: 'border-yellow-500/50',
          textColor: 'text-yellow-600 dark:text-yellow-400',
          iconColor: 'text-yellow-600 dark:text-yellow-500',
        };
      case 'normal':
        return {
          icon: CheckCircle2,
          title: 'Tüm Sistemler Normal',
          message: `Silo seviyesi sağlıklı ${level.toFixed(1)}%. Üretim sorunsuz devam ediyor.`,
          bgColor: 'bg-teal-500/10',
          borderColor: 'border-teal-500/50',
          textColor: 'text-teal-600 dark:text-teal-400',
          iconColor: 'text-teal-600 dark:text-teal-500',
        };
    }
  };

  const config = getConfig();
  const Icon = config.icon;

  return (
    <div
      className={`flex items-center justify-between rounded-lg border ${config.borderColor} ${config.bgColor} p-4 ${
        status === 'critical' ? 'animate-pulse' : ''
      }`}
    >
      <div className="flex items-start gap-4">
        <Icon className={`h-6 w-6 flex-shrink-0 ${config.iconColor}`} />
        <div>
          <h3 className={`${config.textColor}`}>{config.title}</h3>
          <p className="text-sm text-gray-700 dark:text-gray-300">{config.message}</p>
        </div>
      </div>
      {status !== 'normal' && onAcknowledge && (
        <button
          onClick={onAcknowledge}
          className={`flex items-center gap-2 rounded-lg border ${config.borderColor} px-4 py-2 text-sm transition-colors hover:bg-gray-100 dark:hover:bg-gray-900 ${config.textColor}`}
        >
          Onayla
        </button>
      )}
    </div>
  );
}