import { Calendar, Download, TrendingDown, TrendingUp, Activity, BarChart3 } from 'lucide-react';
import { useState } from 'react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import type { SiloLevelSample } from '../types';

interface HistoryPageProps {
  history: SiloLevelSample[];
}

export function HistoryPage({ history }: HistoryPageProps) {
  const [timeRange, setTimeRange] = useState<'1h' | '6h' | '12h' | '24h'>('1h');
  const [chartType, setChartType] = useState<'line' | 'area' | 'bar'>('area');

  const getFilteredHistory = () => {
    const now = Date.now();
    const ranges = {
      '1h': 60 * 60 * 1000,
      '6h': 6 * 60 * 60 * 1000,
      '12h': 12 * 60 * 60 * 1000,
      '24h': 24 * 60 * 60 * 1000,
    };
    
    return history.filter(sample => 
      now - sample.timestamp.getTime() <= ranges[timeRange]
    );
  };

  const filteredHistory = getFilteredHistory();

  const chartData = filteredHistory.map(sample => ({
    time: sample.timestamp.toLocaleTimeString('tr-TR', { 
      hour: '2-digit', 
      minute: '2-digit',
    }),
    level: Number(sample.level.toFixed(1)),
    volumeKg: sample.volumeKg,
    timestamp: sample.timestamp,
  }));

  // Calculate statistics
  const stats = {
    current: filteredHistory[filteredHistory.length - 1]?.level || 0,
    min: Math.min(...filteredHistory.map(s => s.level)),
    max: Math.max(...filteredHistory.map(s => s.level)),
    avg: filteredHistory.reduce((sum, s) => sum + s.level, 0) / filteredHistory.length || 0,
    trend: filteredHistory.length > 1 
      ? filteredHistory[filteredHistory.length - 1].level - filteredHistory[0].level 
      : 0,
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-3 shadow-xl">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {data.timestamp.toLocaleString('tr-TR')}
          </p>
          <p className="text-gray-900 dark:text-white">
            Seviye: <span className="text-teal-600 dark:text-teal-400">{data.level}%</span>
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {data.volumeKg?.toFixed(0)} kg
          </p>
        </div>
      );
    }
    return null;
  };

  const renderChart = () => {
    const commonProps = {
      data: chartData,
      margin: { top: 5, right: 20, left: 10, bottom: 5 },
    };

    switch (chartType) {
      case 'line':
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" className="dark:stroke-gray-700" />
            <XAxis dataKey="time" stroke="#6B7280" style={{ fontSize: '12px' }} />
            <YAxis stroke="#6B7280" style={{ fontSize: '12px' }} domain={[0, 100]} />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine y={40} stroke="#EAB308" strokeDasharray="3 3" strokeWidth={2} />
            <ReferenceLine y={20} stroke="#EF4444" strokeDasharray="3 3" strokeWidth={2} />
            <Line type="monotone" dataKey="level" stroke="#14B8A6" strokeWidth={3} dot={false} />
          </LineChart>
        );
      
      case 'area':
        return (
          <AreaChart {...commonProps}>
            <defs>
              <linearGradient id="colorLevel" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#14B8A6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#14B8A6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" className="dark:stroke-gray-700" />
            <XAxis dataKey="time" stroke="#6B7280" style={{ fontSize: '12px' }} />
            <YAxis stroke="#6B7280" style={{ fontSize: '12px' }} domain={[0, 100]} />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine y={40} stroke="#EAB308" strokeDasharray="3 3" strokeWidth={2} />
            <ReferenceLine y={20} stroke="#EF4444" strokeDasharray="3 3" strokeWidth={2} />
            <Area type="monotone" dataKey="level" stroke="#14B8A6" strokeWidth={2} fillOpacity={1} fill="url(#colorLevel)" />
          </AreaChart>
        );
      
      case 'bar':
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" className="dark:stroke-gray-700" />
            <XAxis dataKey="time" stroke="#6B7280" style={{ fontSize: '12px' }} />
            <YAxis stroke="#6B7280" style={{ fontSize: '12px' }} domain={[0, 100]} />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine y={40} stroke="#EAB308" strokeDasharray="3 3" strokeWidth={2} />
            <ReferenceLine y={20} stroke="#EF4444" strokeDasharray="3 3" strokeWidth={2} />
            <Bar dataKey="level" fill="#14B8A6" />
          </BarChart>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-gray-900 dark:text-white">Geçmiş Veriler</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">Silo seviyesi geçmiş kayıtları ve analizler</p>
        </div>
        <button className="flex items-center gap-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800">
          <Download className="h-4 w-4" />
          Rapor İndir
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-4">
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <Activity className="h-4 w-4" />
            <span className="text-sm">Güncel</span>
          </div>
          <div className="mt-2 text-2xl text-gray-900 dark:text-white tabular-nums">{stats.current.toFixed(1)}%</div>
        </div>
        
        <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-4">
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <TrendingDown className="h-4 w-4" />
            <span className="text-sm">Minimum</span>
          </div>
          <div className="mt-2 text-2xl text-red-600 dark:text-red-400 tabular-nums">{stats.min.toFixed(1)}%</div>
        </div>
        
        <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-4">
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <TrendingUp className="h-4 w-4" />
            <span className="text-sm">Maksimum</span>
          </div>
          <div className="mt-2 text-2xl text-green-600 dark:text-green-400 tabular-nums">{stats.max.toFixed(1)}%</div>
        </div>
        
        <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-4">
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <BarChart3 className="h-4 w-4" />
            <span className="text-sm">Ortalama</span>
          </div>
          <div className="mt-2 text-2xl text-blue-600 dark:text-blue-400 tabular-nums">{stats.avg.toFixed(1)}%</div>
        </div>
        
        <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-4">
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <Calendar className="h-4 w-4" />
            <span className="text-sm">Trend</span>
          </div>
          <div className={`mt-2 text-2xl tabular-nums ${stats.trend > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            {stats.trend > 0 ? '+' : ''}{stats.trend.toFixed(1)}%
          </div>
        </div>
      </div>

      {/* Chart Controls */}
      <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Zaman Aralığı:</span>
            {(['1h', '6h', '12h', '24h'] as const).map(range => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`rounded-lg px-3 py-1 text-sm transition-colors ${
                  timeRange === range
                    ? 'bg-teal-500/20 text-teal-600 dark:text-teal-400 border border-teal-500/50'
                    : 'border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900'
                }`}
              >
                {range === '1h' && 'Son 1 Saat'}
                {range === '6h' && 'Son 6 Saat'}
                {range === '12h' && 'Son 12 Saat'}
                {range === '24h' && 'Son 24 Saat'}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Grafik Tipi:</span>
            <button
              onClick={() => setChartType('line')}
              className={`rounded-lg p-2 transition-colors ${
                chartType === 'line'
                  ? 'bg-teal-500/20 text-teal-600 dark:text-teal-400'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-900'
              }`}
            >
              <Activity className="h-4 w-4" />
            </button>
            <button
              onClick={() => setChartType('area')}
              className={`rounded-lg p-2 transition-colors ${
                chartType === 'area'
                  ? 'bg-teal-500/20 text-teal-600 dark:text-teal-400'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-900'
              }`}
            >
              <TrendingUp className="h-4 w-4" />
            </button>
            <button
              onClick={() => setChartType('bar')}
              className={`rounded-lg p-2 transition-colors ${
                chartType === 'bar'
                  ? 'bg-teal-500/20 text-teal-600 dark:text-teal-400'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-900'
              }`}
            >
              <BarChart3 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-6">
        <h2 className="mb-4 text-gray-900 dark:text-white">Silo Seviyesi Grafiği</h2>
        <div className="h-96">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              {renderChart()}
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-gray-500">
              <div className="text-center">
                <Calendar className="mx-auto h-12 w-12 mb-2" />
                <p>Seçilen zaman aralığında veri yok</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Data Table */}
      <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-gray-900 dark:text-white">Detaylı Veri Tablosu</h2>
        </div>
        <div className="overflow-x-auto max-h-96">
          <table className="w-full">
            <thead className="sticky top-0 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs text-gray-600 dark:text-gray-400">Tarih/Saat</th>
                <th className="px-6 py-3 text-left text-xs text-gray-600 dark:text-gray-400">Seviye (%)</th>
                <th className="px-6 py-3 text-left text-xs text-gray-600 dark:text-gray-400">Hacim (kg)</th>
                <th className="px-6 py-3 text-left text-xs text-gray-600 dark:text-gray-400">Durum</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {filteredHistory.reverse().map((sample, idx) => {
                const status = sample.level < 20 ? 'critical' : sample.level < 40 ? 'warning' : 'normal';
                return (
                  <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                    <td className="px-6 py-3 text-sm text-gray-600 dark:text-gray-400 tabular-nums">
                      {sample.timestamp.toLocaleString('tr-TR')}
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-900 dark:text-white tabular-nums">
                      {sample.level.toFixed(1)}%
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-600 dark:text-gray-400 tabular-nums">
                      {sample.volumeKg?.toFixed(0)} kg
                    </td>
                    <td className="px-6 py-3">
                      {status === 'critical' && (
                        <span className="inline-flex items-center rounded-full bg-red-500/10 px-2 py-1 text-xs text-red-600 dark:text-red-400">
                          Kritik
                        </span>
                      )}
                      {status === 'warning' && (
                        <span className="inline-flex items-center rounded-full bg-yellow-500/10 px-2 py-1 text-xs text-yellow-600 dark:text-yellow-400">
                          Düşük
                        </span>
                      )}
                      {status === 'normal' && (
                        <span className="inline-flex items-center rounded-full bg-green-500/10 px-2 py-1 text-xs text-green-600 dark:text-green-400">
                          Normal
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
