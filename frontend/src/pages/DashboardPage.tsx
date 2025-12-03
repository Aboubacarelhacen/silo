import { useState, useEffect } from "react";
import { AlarmBanner } from "../components/silo/AlarmBanner";
import { SiloGauge } from "../components/silo/SiloGauge";
import { SiloDetailsCard } from "../components/silo/SiloDetailsCard";
import { SiloTrendChart } from "../components/silo/SiloTrendChart";
import { EventLog } from "../components/silo/EventLog";
import { ProductionStatusCard } from "../components/dashboard/ProductionStatusCard";
import { AnimatedThermometer } from "../components/ui/animated-thermometer";
import { PlcConnectionControl } from "../components/plc/PlcConnectionControl";
import { RefillWarningDialog } from "../components/silo/RefillWarningDialog";
import { CriticalWarningDialog } from "../components/silo/CriticalWarningDialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createConnection, stopConnection } from "@/services/signalrService";
import type {
  SiloData,
  SiloLevelSample,
  AlarmEvent,
  ProductionData,
} from "../types";

interface DashboardPageProps {
  siloData: SiloData;
  history: SiloLevelSample[];
  events: AlarmEvent[];
  productionData: ProductionData;
  onAcknowledgeEvent: (eventId: string) => void;
  showRefillWarning?: boolean;
  showCriticalWarning?: boolean;
  onStartRefilling?: () => void;
  isRefilling?: boolean;
}

export function DashboardPage({
  siloData,
  history,
  events,
  productionData,
  onAcknowledgeEvent,
  showRefillWarning = false,
  showCriticalWarning = false,
  onStartRefilling = () => {},
  isRefilling = false,
}: DashboardPageProps) {
  const [currentTemperature, setCurrentTemperature] = useState<number | null>(
    null
  );

  useEffect(() => {
    const connection = createConnection(
      `${import.meta.env.VITE_API_URL}/hubs/silo`
    );

    connection.on("TemperatureUpdated", (data: any) => {
      setCurrentTemperature(data.temperatureC);
    });

    connection.start().catch((err) => console.error("SignalR error:", err));

    return () => {
      connection.off("TemperatureUpdated");
      stopConnection(connection);
    };
  }, []);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Critical Warning Dialog (20% - highest priority) */}
      <CriticalWarningDialog
        open={showCriticalWarning}
        onFill={onStartRefilling}
        currentLevel={siloData.currentLevel}
      />
      {/* Refill Warning Dialog (40% - lower priority) */}
      <RefillWarningDialog
        open={showRefillWarning && !showCriticalWarning}
        onFill={onStartRefilling}
        currentLevel={siloData.currentLevel}
      />
      {/* PLC Connection Control */}
      <PlcConnectionControl /> {/* Alarm Banner */}
      <AlarmBanner
        status={siloData.status}
        level={siloData.currentLevel}
        onAcknowledge={() => {
          const latestUnacknowledged = events.find(
            (e) => !e.acknowledged && e.severity !== "info"
          );
          if (latestUnacknowledged) {
            onAcknowledgeEvent(latestUnacknowledged.id);
          }
        }}
      />
      {/* Top Row: Silo Gauge, Temperature, and Details */}
      <div className="grid grid-cols-1 gap-4 sm:gap-6 xl:grid-cols-4">
        <div className="flex items-center justify-center rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-6">
          <SiloGauge
            level={siloData.currentLevel}
            status={siloData.status}
            isRefilling={isRefilling}
          />
        </div>

        <Card className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Sıcaklık</CardTitle>
            <CardDescription className="text-xs">Anlık Ölçüm</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center pb-4">
            <div className="scale-75 origin-center">
              <AnimatedThermometer
                temperature={currentTemperature}
                minTemp={0}
                maxTemp={120}
              />
            </div>
          </CardContent>
        </Card>

        <div className="xl:col-span-2">
          <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
            <SiloDetailsCard siloData={siloData} />
            <ProductionStatusCard productionData={productionData} />
          </div>
        </div>
      </div>
      {/* Trend Chart */}
      <SiloTrendChart history={history} />
      {/* Event Log */}
      <EventLog events={events} onAcknowledge={onAcknowledgeEvent} />
    </div>
  );
}
