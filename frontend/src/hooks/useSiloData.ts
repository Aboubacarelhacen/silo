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
  const [isRefilling, setIsRefilling] = useState(false);
  const [showRefillWarning, setShowRefillWarning] = useState(false);
  const [showCriticalWarning, setShowCriticalWarning] = useState(false);

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
        
        if (isRefilling) {
          // Fill from current level to 97% over 2 minutes (120 seconds)
          // Increase rate: calculate based on remaining percentage
          const targetLevel = 97;
          const remainingPercentage = targetLevel - prev;
          const increase = remainingPercentage / 120; // Spread over 120 seconds
          
          newLevel = Math.min(targetLevel, prev + increase);
          
          // Stop refilling when we reach 97%
          if (newLevel >= targetLevel) {
            newLevel = targetLevel;
            setIsRefilling(false);
            setLastRefillTime(new Date());
            addEvent('info', `✅ Silo başarıyla ${newLevel.toFixed(1)}% seviyesine dolduruldu`);
          }
        } else {
          // Drain from 100% to 20% then to 0% (critical)
          // From 100% to 40%: 5 minutes, From 40% to 20%: continue draining, below 20%: critical
          if (prev > 20) {
            const decrease = 0.2; // Fixed rate
            newLevel = Math.max(20, prev - decrease);
            
            // Show warning when reaching 40%
            if (prev > 40 && newLevel <= 40) {
              setShowRefillWarning(true);
              addEvent('warning', `⚠️ DÜŞÜK SEVIYE: Silo %40'a düştü - Doldurma önerilir`);
            }
            
            // Show critical warning when reaching 20%
            if (prev > 20 && newLevel <= 20) {
              setShowCriticalWarning(true);
              addEvent('critical', `🚨 KRİTİK UYARI: Silo %20'ye düştü - ACİL DOLDURMA GEREKLİ!`);
            }
          } else {
            // Stay at 20% and keep showing critical warning
            newLevel = 20;
          }
        }

        // Generate events based on threshold crossings (only when draining)
        if (!isRefilling) {
          const prevStatus = getStatus(prev);
          const newStatus = getStatus(newLevel);

          if (prevStatus !== newStatus && prevStatus !== 'critical') {
            if (newStatus === 'critical') {
              addEvent('critical', `🔴 KRİTİK: Silo seviyesi ${newLevel.toFixed(1)}%'e düştü`);
            } else if (newStatus === 'low') {
              addEvent('warning', `🟡 UYARI: Silo seviyesi ${newLevel.toFixed(1)}% - Doldurmaya hazırlanın`);
            }
          }
        }

        return newLevel;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [addEvent, isRefilling]);

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

  const startRefilling = useCallback(() => {
    setIsRefilling(true);
    setShowRefillWarning(false);
    setShowCriticalWarning(false);
    addEvent('info', `🔵 Silo doldurma işlemi başlatıldı...`);
  }, [addEvent]);

  return {
    siloData,
    history,
    events,
    connectionStatus,
    productionData,
    acknowledgeEvent,
    showRefillWarning,
    showCriticalWarning,
    startRefilling,
    isRefilling,
  };
}