import { useState, useEffect, useCallback } from 'react';
import type { SiloLevelSample, AlarmEvent, SiloData, SiloStatus, ProductionData, ConnectionStatus } from '../types';

const MAX_HISTORY_POINTS = 50;
const SILO_CAPACITY_KG = 140;

export function useSiloData() {
  const [currentLevel, setCurrentLevel] = useState(100);
  const [history, setHistory] = useState<SiloLevelSample[]>([]);
  const [events, setEvents] = useState<AlarmEvent[]>([]);
  const [lastRefillTime, setLastRefillTime] = useState(new Date(Date.now() - 2 * 60 * 60 * 1000));
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('connected');
  const [productionData] = useState<ProductionData>({
    machineState: 'running',
    productionRate: 450,
  });

  const getStatus = (level: number): SiloStatus => {
    if (level < 20) return 'critical';
    if (level < 40) return 'low';
    return 'normal';
  };

  const addEvent = useCallback((severity: AlarmEvent['severity'], message: string) => {
    const newEvent: AlarmEvent = {
      id: `${Date.now()}-${Math.random()}`,
      timestamp: new Date(),
      severity,
      message,
      acknowledged: false,
    };
    setEvents(prev => [newEvent, ...prev].slice(0, 100));
  }, []);

  // Simulate real-time level changes
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentLevel(prev => {
        let newLevel = prev;
        
        // Drain from 100% to 60% over 2 minutes (120 seconds)
        // Decrease rate: 40% / 120 seconds = 0.333% per second
        if (prev > 60) {
          const decrease = 0.333; // Fixed rate to reach 60% in 2 minutes
          newLevel = Math.max(60, prev - decrease);
        }

        // Refill to 100% when reaching 60%
        if (prev <= 60 && newLevel <= 60) {
          newLevel = 100;
          setLastRefillTime(new Date());
          addEvent('info', `Silo ${newLevel.toFixed(1)}% seviyesine dolduruldu`);
        }

        // Generate events based on threshold crossings
        const prevStatus = getStatus(prev);
        const newStatus = getStatus(newLevel);

        if (prevStatus !== newStatus) {
          if (newStatus === 'critical') {
            addEvent('critical', `KRİTİK: Silo seviyesi ${newLevel.toFixed(1)}%'e düştü - Hemen doldurun!`);
          } else if (newStatus === 'low') {
            addEvent('warning', `UYARI: Silo seviyesi ${newLevel.toFixed(1)}% - Doldurmaya hazırlanın`);
          } else if (newStatus === 'normal' && prevStatus !== 'normal') {
            addEvent('info', `Silo seviyesi güvenli aralığa yükseldi (${newLevel.toFixed(1)}%)`);
          }
        }

        return newLevel;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [addEvent]);

  // Update history
  useEffect(() => {
    const sample: SiloLevelSample = {
      timestamp: new Date(),
      level: currentLevel,
      volumeKg: (currentLevel / 100) * SILO_CAPACITY_KG,
    };

    setHistory(prev => {
      const newHistory = [...prev, sample];
      return newHistory.slice(-MAX_HISTORY_POINTS);
    });
  }, [currentLevel]);

  // Add initial event
  useEffect(() => {
    addEvent('info', 'Kontrol paneli başlatıldı - Sistem izleme başladı');
  }, [addEvent]);

  const siloData: SiloData = {
    currentLevel,
    status: getStatus(currentLevel),
    volumeKg: (currentLevel / 100) * SILO_CAPACITY_KG,
    lastRefillTime,
    lastUpdateTime: new Date(),
  };

  const acknowledgeEvent = useCallback((eventId: string) => {
    setEvents(prev => 
      prev.map(event => 
        event.id === eventId ? { ...event, acknowledged: true } : event
      )
    );
  }, []);

  return {
    siloData,
    history,
    events,
    connectionStatus,
    productionData,
    acknowledgeEvent,
  };
}