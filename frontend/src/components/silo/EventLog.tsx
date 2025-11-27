import { AlertCircle, AlertTriangle, Info, CheckCircle } from 'lucide-react';
import { useState } from 'react';
import type { AlarmEvent } from '../../types';

interface EventLogProps {
  events: AlarmEvent[];
  onAcknowledge?: (eventId: string) => void;
}

export function EventLog({ events, onAcknowledge }: EventLogProps) {
  const [filter, setFilter] = useState<'all' | 'info' | 'warning' | 'critical'>('all');

  const filteredEvents = events.filter(event => {
    if (filter === 'all') return true;
    return event.severity === filter;
  });

  const getSeverityConfig = (severity: AlarmEvent['severity']) => {
    switch (severity) {
      case 'critical':
        return {
          icon: AlertCircle,
          color: 'text-red-600 dark:text-red-400',
          bgColor: 'bg-red-500/10',
          borderColor: 'border-red-500/30',
        };
      case 'warning':
        return {
          icon: AlertTriangle,
          color: 'text-yellow-600 dark:text-yellow-400',
          bgColor: 'bg-yellow-500/10',
          borderColor: 'border-yellow-500/30',
        };
      case 'info':
        return {
          icon: Info,
          color: 'text-blue-600 dark:text-blue-400',
          bgColor: 'bg-blue-500/10',
          borderColor: 'border-blue-500/30',
        };
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('tr-TR', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit',
      hour12: false 
    });
  };

  const severityCounts = {
    critical: events.filter(e => e.severity === 'critical').length,
    warning: events.filter(e => e.severity === 'warning').length,
    info: events.filter(e => e.severity === 'info').length,
  };

  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-gray-900 dark:text-white">Olay Günlüğü</h2>
        <span className="text-sm text-gray-600 dark:text-gray-400">{filteredEvents.length} olay</span>
      </div>

      {/* Filter Tabs */}
      <div className="mb-4 flex gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`rounded-lg px-4 py-2 text-sm transition-colors ${
            filter === 'all'
              ? 'bg-teal-500/20 text-teal-600 dark:text-teal-400 border border-teal-500/50'
              : 'border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-900'
          }`}
        >
          Tümü ({events.length})
        </button>
        <button
          onClick={() => setFilter('critical')}
          className={`rounded-lg px-4 py-2 text-sm transition-colors ${
            filter === 'critical'
              ? 'bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/50'
              : 'border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-900'
          }`}
        >
          Kritik ({severityCounts.critical})
        </button>
        <button
          onClick={() => setFilter('warning')}
          className={`rounded-lg px-4 py-2 text-sm transition-colors ${
            filter === 'warning'
              ? 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 border border-yellow-500/50'
              : 'border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-900'
          }`}
        >
          Uyarılar ({severityCounts.warning})
        </button>
        <button
          onClick={() => setFilter('info')}
          className={`rounded-lg px-4 py-2 text-sm transition-colors ${
            filter === 'info'
              ? 'bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/50'
              : 'border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-900'
          }`}
        >
          Bilgi ({severityCounts.info})
        </button>
      </div>

      {/* Event List */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {filteredEvents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <Info className="h-12 w-12 mb-2" />
            <p>Görüntülenecek olay yok</p>
          </div>
        ) : (
          filteredEvents.map((event) => {
            const config = getSeverityConfig(event.severity);
            const Icon = config.icon;

            return (
              <div
                key={event.id}
                className={`flex items-start gap-3 rounded-lg border ${config.borderColor} ${config.bgColor} p-3 transition-opacity ${
                  event.acknowledged ? 'opacity-50' : ''
                }`}
              >
                <Icon className={`h-5 w-5 flex-shrink-0 ${config.color} mt-0.5`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm text-gray-700 dark:text-gray-300">{event.message}</p>
                    {event.acknowledged && (
                      <CheckCircle className="h-4 w-4 flex-shrink-0 text-gray-500" />
                    )}
                  </div>
                  <div className="mt-1 flex items-center gap-3 text-xs text-gray-500">
                    <span>{formatTime(event.timestamp)}</span>
                    <span className="capitalize">{event.severity === 'critical' ? 'Kritik' : event.severity === 'warning' ? 'Uyarı' : 'Bilgi'}</span>
                  </div>
                </div>
                {!event.acknowledged && event.severity !== 'info' && onAcknowledge && (
                  <button
                    onClick={() => onAcknowledge(event.id)}
                    className="text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300 transition-colors px-2 py-1 rounded border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-900"
                  >
                    Onayla
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
