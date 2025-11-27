import { AlertTriangle, AlertCircle, Info, CheckCircle, Filter, Download, Trash2 } from 'lucide-react';
import { useState } from 'react';
import type { AlarmEvent } from '../types';

interface AlarmsPageProps {
  events: AlarmEvent[];
  onAcknowledge: (eventId: string) => void;
}

export function AlarmsPage({ events, onAcknowledge }: AlarmsPageProps) {
  const [filter, setFilter] = useState<'all' | 'info' | 'warning' | 'critical' | 'unacknowledged'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'severity'>('newest');

  const getSeverityConfig = (severity: AlarmEvent['severity']) => {
    switch (severity) {
      case 'critical':
        return {
          icon: AlertCircle,
          label: 'Kritik',
          color: 'text-red-400',
          bgColor: 'bg-red-500/10',
          borderColor: 'border-red-500/30',
        };
      case 'warning':
        return {
          icon: AlertTriangle,
          label: 'Uyarı',
          color: 'text-yellow-400',
          bgColor: 'bg-yellow-500/10',
          borderColor: 'border-yellow-500/30',
        };
      case 'info':
        return {
          icon: Info,
          label: 'Bilgi',
          color: 'text-blue-400',
          bgColor: 'bg-blue-500/10',
          borderColor: 'border-blue-500/30',
        };
    }
  };

  const filteredEvents = events
    .filter(event => {
      if (filter === 'all') return true;
      if (filter === 'unacknowledged') return !event.acknowledged;
      return event.severity === filter;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') return b.timestamp.getTime() - a.timestamp.getTime();
      if (sortBy === 'oldest') return a.timestamp.getTime() - b.timestamp.getTime();
      
      const severityOrder = { critical: 0, warning: 1, info: 2 };
      return severityOrder[a.severity] - severityOrder[b.severity];
    });

  const stats = {
    total: events.length,
    critical: events.filter(e => e.severity === 'critical').length,
    warning: events.filter(e => e.severity === 'warning').length,
    unacknowledged: events.filter(e => !e.acknowledged && e.severity !== 'info').length,
  };

  const formatDateTime = (date: Date) => {
    return date.toLocaleString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const acknowledgeAll = () => {
    filteredEvents
      .filter(e => !e.acknowledged && e.severity !== 'info')
      .forEach(e => onAcknowledge(e.id));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-gray-900 dark:text-white">Alarm Yönetimi</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">Tüm sistem alarmlarını görüntüleyin ve yönetin</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800">
            <Download className="h-4 w-4" />
            Dışa Aktar
          </button>
          <button 
            onClick={acknowledgeAll}
            disabled={stats.unacknowledged === 0}
            className="flex items-center gap-2 rounded-lg bg-teal-500 px-4 py-2 text-sm text-white transition-colors hover:bg-teal-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <CheckCircle className="h-4 w-4" />
            Tümünü Onayla
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-4">
          <div className="text-sm text-gray-600 dark:text-gray-400">Toplam Alarm</div>
          <div className="text-3xl text-gray-900 dark:text-white tabular-nums">{stats.total}</div>
        </div>
        <div className="rounded-lg border border-red-500/30 bg-red-500/5 p-4">
          <div className="text-sm text-red-600 dark:text-red-400">Kritik Alarmlar</div>
          <div className="text-3xl text-red-600 dark:text-red-400 tabular-nums">{stats.critical}</div>
        </div>
        <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/5 p-4">
          <div className="text-sm text-yellow-600 dark:text-yellow-400">Uyarılar</div>
          <div className="text-3xl text-yellow-600 dark:text-yellow-400 tabular-nums">{stats.warning}</div>
        </div>
        <div className="rounded-lg border border-orange-500/30 bg-orange-500/5 p-4">
          <div className="text-sm text-orange-600 dark:text-orange-400">Onay Bekleyen</div>
          <div className="text-3xl text-orange-600 dark:text-orange-400 tabular-nums">{stats.unacknowledged}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`rounded-lg px-4 py-2 text-sm transition-colors ${
                filter === 'all'
                  ? 'bg-teal-500/20 text-teal-600 dark:text-teal-400 border border-teal-500/50'
                  : 'border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900'
              }`}
            >
              Tümü ({events.length})
            </button>
            <button
              onClick={() => setFilter('unacknowledged')}
              className={`rounded-lg px-4 py-2 text-sm transition-colors ${
                filter === 'unacknowledged'
                  ? 'bg-orange-500/20 text-orange-600 dark:text-orange-400 border border-orange-500/50'
                  : 'border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900'
              }`}
            >
              Onay Bekleyen ({stats.unacknowledged})
            </button>
            <button
              onClick={() => setFilter('critical')}
              className={`rounded-lg px-4 py-2 text-sm transition-colors ${
                filter === 'critical'
                  ? 'bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/50'
                  : 'border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900'
              }`}
            >
              Kritik ({stats.critical})
            </button>
            <button
              onClick={() => setFilter('warning')}
              className={`rounded-lg px-4 py-2 text-sm transition-colors ${
                filter === 'warning'
                  ? 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 border border-yellow-500/50'
                  : 'border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900'
              }`}
            >
              Uyarı ({stats.warning})
            </button>
            <button
              onClick={() => setFilter('info')}
              className={`rounded-lg px-4 py-2 text-sm transition-colors ${
                filter === 'info'
                  ? 'bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/50'
                  : 'border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900'
              }`}
            >
              Bilgi
            </button>
          </div>

          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-700 dark:text-gray-300"
            >
              <option value="newest">En Yeni</option>
              <option value="oldest">En Eski</option>
              <option value="severity">Önem Sırasına Göre</option>
            </select>
          </div>
        </div>
      </div>

      {/* Alarms List */}
      <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs text-gray-600 dark:text-gray-400">Önem</th>
                <th className="px-6 py-3 text-left text-xs text-gray-600 dark:text-gray-400">Mesaj</th>
                <th className="px-6 py-3 text-left text-xs text-gray-600 dark:text-gray-400">Tarih/Saat</th>
                <th className="px-6 py-3 text-left text-xs text-gray-600 dark:text-gray-400">Durum</th>
                <th className="px-6 py-3 text-left text-xs text-gray-600 dark:text-gray-400">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {filteredEvents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <Info className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2 text-gray-600 dark:text-gray-400">Gösterilecek alarm yok</p>
                  </td>
                </tr>
              ) : (
                filteredEvents.map((event) => {
                  const config = getSeverityConfig(event.severity);
                  const Icon = config.icon;

                  return (
                    <tr key={event.id} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                      <td className="px-6 py-4">
                        <div className={`flex items-center gap-2 ${config.color}`}>
                          <Icon className="h-5 w-5" />
                          <span className="text-sm">{config.label}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-900 dark:text-gray-300">{event.message}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-600 dark:text-gray-400 tabular-nums">
                          {formatDateTime(event.timestamp)}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        {event.acknowledged ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-green-500/10 px-2 py-1 text-xs text-green-600 dark:text-green-400">
                            <CheckCircle className="h-3 w-3" />
                            Onaylandı
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-orange-500/10 px-2 py-1 text-xs text-orange-600 dark:text-orange-400">
                            <AlertCircle className="h-3 w-3" />
                            Bekliyor
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {!event.acknowledged && event.severity !== 'info' && (
                          <button
                            onClick={() => onAcknowledge(event.id)}
                            className="text-sm text-teal-600 dark:text-teal-400 hover:underline"
                          >
                            Onayla
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
