import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  createConnection,
  startConnection,
  stopConnection,
} from "@/services/signalrService";
import { Thermometer, Activity } from "lucide-react";
import { AnimatedThermometer } from "../components/ui/animated-thermometer";

interface TemperatureUpdate {
  temperatureC: number;
  status: "Cool" | "Normal" | "High";
  timestamp: string;
}

interface HistoricalData {
  timestamp: string;
  temperature: number;
}

const BACKEND_URL = import.meta.env.VITE_API_URL;

export default function TemperaturePage() {
  const [currentTemperature, setCurrentTemperature] = useState<number | null>(
    null
  );
  const [status, setStatus] = useState<"Cool" | "Normal" | "High">("Normal");
  const [history, setHistory] = useState<HistoricalData[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  useEffect(() => {
    const connection = createConnection(`${BACKEND_URL}/hubs/silo`);

    const handleUpdate = (data: TemperatureUpdate) => {
      console.log("Temperature update:", data);
      setCurrentTemperature(data.temperatureC);
      setStatus(data.status);
      setIsLoading(false);
      setIsConnected(true);
      setLastUpdate(new Date(data.timestamp));

      setHistory((prev) => {
        const newHistory = [
          ...prev,
          {
            timestamp: new Date(data.timestamp).toLocaleTimeString(),
            temperature: data.temperatureC,
          },
        ];
        return newHistory.slice(-100);
      });
    };

    // Subscribe to temperature updates
    connection.on("TemperatureUpdated", handleUpdate);

    connection.onreconnecting(() => {
      console.log("SignalR reconnecting...");
      setIsConnected(false);
    });

    connection.onreconnected(() => {
      console.log("SignalR reconnected");
      setIsConnected(true);
    });

    connection.onclose(() => {
      console.log("SignalR connection closed");
      setIsConnected(false);
    });

    connection
      .start()
      .then(() => {
        console.log("SignalR connected for temperature");
        setIsConnected(true);
      })
      .catch((err) => {
        console.error("Error connecting to SignalR:", err);
        setIsLoading(false);
      });

    return () => {
      connection.off("TemperatureUpdated", handleUpdate);
      stopConnection(connection);
    };
  }, []);

  const getStatusColor = () => {
    switch (status) {
      case "Cool":
        return "bg-cyan-500";
      case "Normal":
        return "bg-green-500";
      case "High":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case "Cool":
        return "❄️";
      case "Normal":
        return "✅";
      case "High":
        return "🔥";
      default:
        return "";
    }
  };

  const getChartColor = () => {
    switch (status) {
      case "Cool":
        return "#06b6d4";
      case "Normal":
        return "#10b981";
      case "High":
        return "#ef4444";
      default:
        return "#3b82f6";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-96">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              <p className="text-muted-foreground">
                Sıcaklık monitörüne bağlanılıyor...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Thermometer className="h-8 w-8" />
            Makine Sıcaklık İzleme
          </h1>
          <p className="text-muted-foreground">
            OPC UA ile gerçek zamanlı sıcaklık izleme
          </p>
        </div>
        <Badge variant={isConnected ? "default" : "destructive"}>
          {isConnected ? "Bağlı" : "Bağlantı Kesildi"}
        </Badge>
      </div>

      {/* Beautiful Animated Thermometer */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-2 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
          <CardHeader>
            <CardTitle className="text-2xl">Canlı Sıcaklık İzleme</CardTitle>
            <CardDescription>ns=1;s=Temperature</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center py-8">
            <AnimatedThermometer
              temperature={currentTemperature}
              minTemp={0}
              maxTemp={120}
            />
          </CardContent>
        </Card>

        {/* Current Temperature Stats Card */}
        <Card className="border-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">Anlık Ölçüm</CardTitle>
                <CardDescription>
                  OPC UA'dan gerçek zamanlı veri
                </CardDescription>
              </div>
              <Activity className="h-6 w-6 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="text-7xl font-bold tracking-tight">
                  {currentTemperature !== null
                    ? currentTemperature.toFixed(2)
                    : "--"}
                  <span className="text-4xl text-muted-foreground ml-2">
                    °C
                  </span>
                </div>
                <Badge
                  className={`${getStatusColor()} text-white text-lg px-4 py-2`}
                >
                  <span className="flex items-center gap-2">
                    {getStatusIcon()}
                    {status}
                  </span>
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div className="space-y-1">
                  <div className="text-sm font-medium text-muted-foreground">
                    Son Güncelleme
                  </div>
                  <div className="text-2xl font-semibold">
                    {lastUpdate ? lastUpdate.toLocaleTimeString("tr-TR") : "--"}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm font-medium text-muted-foreground">
                    Örnek Sayısı
                  </div>
                  <div className="text-2xl font-semibold">{history.length}</div>
                </div>
              </div>

              <div className="pt-4 border-t space-y-3">
                <div className="text-sm font-medium">Sıcaklık Durumu</div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 rounded-lg bg-cyan-50 dark:bg-cyan-950/20">
                    <span className="text-sm flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-cyan-500"></div>
                      Soğuk
                    </span>
                    <span className="text-sm font-medium">&lt; 40°C</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-green-50 dark:bg-green-950/20">
                    <span className="text-sm flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      Normal
                    </span>
                    <span className="text-sm font-medium">40°C - 80°C</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-red-50 dark:bg-red-950/20">
                    <span className="text-sm flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      Yüksek
                    </span>
                    <span className="text-sm font-medium">&gt; 80°C</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Temperature Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Sıcaklık Trendi (Son 100 Örnek)</CardTitle>
          <CardDescription>
            Sıcaklık değişimlerinin gerçek zamanlı görselleştirmesi
          </CardDescription>
        </CardHeader>
        <CardContent>
          {history.length === 0 ? (
            <div className="flex items-center justify-center h-[300px] text-muted-foreground">
              <p>Veri bekleniyor...</p>
            </div>
          ) : (
            <div className="w-full h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={history}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="timestamp"
                    tick={{ fontSize: 11, fill: "#6b7280" }}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "#6b7280" }}
                    label={{
                      value: "Sıcaklık (°C)",
                      angle: -90,
                      position: "insideLeft",
                      style: { fill: "#6b7280" },
                    }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#ffffff",
                      border: "1px solid #e5e7eb",
                      borderRadius: "6px",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="temperature"
                    stroke={getChartColor()}
                    strokeWidth={3}
                    dot={false}
                    name="Sıcaklık (°C)"
                    isAnimationActive={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sıcaklık Eşikleri */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Sıcaklık Eşikleri</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-cyan-500"></div>
              <div>
                <div className="font-medium">Soğuk</div>
                <div className="text-sm text-muted-foreground">&lt; 40°C</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-green-500"></div>
              <div>
                <div className="font-medium">Normal</div>
                <div className="text-sm text-muted-foreground">40°C - 80°C</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-red-500"></div>
              <div>
                <div className="font-medium">Yüksek</div>
                <div className="text-sm text-muted-foreground">&gt; 80°C</div>
              </div>
            </div>
          </div>
          <div className="mt-4 p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
            <p className="text-sm text-green-700 dark:text-green-300 text-center">
              ✨ Güvenli çalışma aralığı: 40°C - 80°C
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
