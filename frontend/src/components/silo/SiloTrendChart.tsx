import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import type { SiloLevelSample } from '../../types';

interface SiloTrendChartProps {
  history: SiloLevelSample[];
}

export function SiloTrendChart({ history }: SiloTrendChartProps) {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('tr-TR', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  const chartData = history.map(sample => ({
    time: formatTime(sample.timestamp),
    level: Number(sample.level.toFixed(1)),
    timestamp: sample.timestamp,
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-3 shadow-xl">
          <p className="text-sm text-gray-600 dark:text-gray-400">{formatTime(data.timestamp)}</p>
          <p className="text-gray-900 dark:text-white">
            Seviye: <span className="text-teal-600 dark:text-teal-400">{data.level}%</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-gray-900 dark:text-white">Gerçek Zamanlı Trend</h2>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-teal-500" />
            <span className="text-gray-600 dark:text-gray-400">Silo Seviyesi</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-0.5 w-4 bg-yellow-500" />
            <span className="text-gray-600 dark:text-gray-400">Uyarı (40%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-0.5 w-4 bg-red-500" />
            <span className="text-gray-600 dark:text-gray-400">Kritik (20%)</span>
          </div>
        </div>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#d1d5db" className="dark:stroke-gray-700" />
            <XAxis 
              dataKey="time" 
              stroke="#6B7280"
              style={{ fontSize: '12px' }}
              interval="preserveStartEnd"
              minTickGap={50}
            />
            <YAxis 
              stroke="#6B7280"
              style={{ fontSize: '12px' }}
              domain={[0, 100]}
              ticks={[0, 20, 40, 60, 80, 100]}
              label={{ value: 'Seviye (%)', angle: -90, position: 'insideLeft', style: { fill: '#6B7280' } }}
            />
            <Tooltip content={<CustomTooltip />} />
            
            {/* Threshold lines */}
            <ReferenceLine y={40} stroke="#EAB308" strokeDasharray="3 3" strokeWidth={2} />
            <ReferenceLine y={20} stroke="#EF4444" strokeDasharray="3 3" strokeWidth={2} />
            
            {/* Main data line */}
            <Line 
              type="monotone" 
              dataKey="level" 
              stroke="#14B8A6" 
              strokeWidth={3}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 flex items-center justify-between rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-3">
        <span className="text-sm text-gray-600 dark:text-gray-400">Veri Noktası: {history.length}</span>
        <span className="text-sm text-gray-600 dark:text-gray-400">Güncelleme Hızı: 1s</span>
        <span className="text-sm text-gray-600 dark:text-gray-400">Geçmiş: Son {Math.ceil(history.length / 60)} dk</span>
      </div>
    </div>
  );
}
