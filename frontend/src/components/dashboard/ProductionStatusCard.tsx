import { Play, Square, Settings, TrendingUp, AlertCircle } from 'lucide-react';
import type { ProductionData } from '../../types';

interface ProductionStatusCardProps {
  productionData: ProductionData;
}

export function ProductionStatusCard({ productionData }: ProductionStatusCardProps) {
  const { machineState, productionRate } = productionData;

  const getStateConfig = () => {
    switch (machineState) {
      case 'running':
        return {
          icon: Play,
          text: 'Çalışıyor',
          color: 'text-teal-600 dark:text-teal-400',
          bgColor: 'bg-teal-500/10',
          borderColor: 'border-teal-500/30',
        };
      case 'stopped':
        return {
          icon: Square,
          text: 'Durduruldu',
          color: 'text-gray-600 dark:text-gray-400',
          bgColor: 'bg-gray-500/10',
          borderColor: 'border-gray-500/30',
        };
      case 'setup':
        return {
          icon: Settings,
          text: 'Kurulum Modu',
          color: 'text-blue-600 dark:text-blue-400',
          bgColor: 'bg-blue-500/10',
          borderColor: 'border-blue-500/30',
        };
    }
  };

  const stateConfig = getStateConfig();
  const StateIcon = stateConfig.icon;

  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-6">
      <h2 className="mb-6 text-gray-900 dark:text-white">Üretim Durumu</h2>

      <div className="space-y-4">
        {/* Machine State */}
        <div className={`flex items-center gap-3 rounded-lg border ${stateConfig.borderColor} ${stateConfig.bgColor} p-4`}>
          <StateIcon className={`h-6 w-6 ${stateConfig.color}`} />
          <div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Makine Durumu</div>
            <div className={`${stateConfig.color}`}>{stateConfig.text}</div>
          </div>
        </div>

        {/* Production Rate */}
        <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-4">
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-2">
            <TrendingUp className="h-4 w-4" />
            <span className="text-sm">Üretim Hızı</span>
          </div>
          <div className="text-3xl text-gray-900 dark:text-white tabular-nums">{productionRate}</div>
          <div className="text-sm text-gray-500">adet / saat</div>
        </div>

        {/* Product Info */}
        <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-4">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Mevcut Ürün</div>
          <div className="text-gray-900 dark:text-white">Plastik Kablo Kaplaması</div>
          <div className="text-sm text-gray-500 mt-1">Standart Seri - Tip A</div>
        </div>

        {/* Critical Warning */}
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 flex-shrink-0 text-amber-600 dark:text-amber-400" />
            <div>
              <div className="text-sm text-amber-600 dark:text-amber-400 mb-1">Kritik Bilgi</div>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Üretim sırasında silo boşalırsa, makine çalışmaya devam eder ve hatalı kablo kaplamaları üretir. 
                Silo seviyesini yakından izleyin ve alarmlara anında yanıt verin.
              </p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-3">
            <div className="text-xs text-gray-500">Vardiya Süresi</div>
            <div className="text-xl text-gray-900 dark:text-white tabular-nums">4s 23dk</div>
          </div>
          <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-3">
            <div className="text-xs text-gray-500">Bugün Üretilen</div>
            <div className="text-xl text-gray-900 dark:text-white tabular-nums">1.847</div>
          </div>
        </div>
      </div>
    </div>
  );
}
