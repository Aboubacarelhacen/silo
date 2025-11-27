import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  SiloUpdate,
} from "@/services/signalrService";
import { AlertCircle, CheckCircle, TrendingUp, RefreshCw } from "lucide-react";

interface HistoricalData {
  timestamp: string;
  level: number;
}

const BACKEND_URL = import.meta.env.VITE_API_URL;

export default function SiloDashboard() {
  const [currentLevel, setCurrentLevel] = useState<number | null>(null);
  const [status, setStatus] = useState<"Normal" | "Low" | "Critical">("Normal");
  const [history, setHistory] = useState<HistoricalData[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [autoScale, setAutoScale] = useState(true);

  useEffect(() => {
    const connection = createConnection(`${BACKEND_URL}/hubs/silo`);

    const handleUpdate = (data: SiloUpdate) => {
      console.log("Received update:", data);
      setCurrentLevel(data.levelPercent);
      setStatus(data.status);
      setIsLoading(false);
      setIsConnected(true);

      // Add to history
      setHistory((prev) => {
        const newHistory = [
          ...prev,
          {
            timestamp: new Date(data.timestamp).toLocaleTimeString(),
            level: data.levelPercent,
          },
        ];
        // Keep last 100 points
        const trimmed = newHistory.slice(-100);
        console.log(
          "History length:",
          trimmed.length,
          "Latest:",
          trimmed[trimmed.length - 1]
        );
        return trimmed;
      });
    };

    startConnection(connection, handleUpdate);

    return () => {
      stopConnection(connection);
    };
  }, []);

  const handleRefresh = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/silo/current`);
      const data = await response.json();
      setCurrentLevel(data.levelPercent);
      setStatus(data.status);
    } catch (error) {
      console.error("Error fetching current value:", error);
    }
  };

  // Calculate Y-axis domain for auto-scaling
  const getYAxisDomain = () => {
    if (!autoScale || history.length === 0) {
      return [0, 100];
    }

    const levels = history.map((h) => h.level);
    const minLevel = Math.min(...levels);
    const maxLevel = Math.max(...levels);
    const range = maxLevel - minLevel;

    // Add 10% padding above and below for better visibility
    const padding = range * 0.1 || 5; // Use 5 as minimum padding
    const yMin = Math.max(0, minLevel - padding);
    const yMax = Math.min(100, maxLevel + padding);

    return [Math.floor(yMin), Math.ceil(yMax)];
  };

  const getStatusColor = () => {
    switch (status) {
      case "Normal":
        return "bg-green-500";
      case "Low":
        return "bg-orange-500";
      case "Critical":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case "Normal":
        return <CheckCircle className="h-5 w-5" />;
      case "Low":
      case "Critical":
        return <AlertCircle className="h-5 w-5" />;
      default:
        return null;
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
                Silo izleme sistemine bağlanılıyor...
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
          <h1 className="text-3xl font-bold">Silo İzleme Paneli</h1>
          <p className="text-muted-foreground">
            OPC UA ile gerçek zamanlı seviye izleme
          </p>
        </div>
        <Badge variant={isConnected ? "default" : "destructive"}>
          {isConnected ? "Bağlı" : "Bağlantı Kesildi"}
        </Badge>
      </div>

      {/* Current Level Card */}
      <Card className="border-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Anlık Silo Seviyesi</CardTitle>
              <CardDescription>
                ns=1;b=1020ffab (Kullanılan Bellek Yüzdesi)
              </CardDescription>
            </div>
            <Button onClick={handleRefresh} variant="outline" size="icon">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="text-6xl font-bold tracking-tight">
                {currentLevel !== null ? currentLevel.toFixed(1) : "--"}
                <span className="text-3xl text-muted-foreground ml-2">%</span>
              </div>
              <Badge className={`${getStatusColor()} text-white`}>
                <span className="flex items-center gap-2">
                  {getStatusIcon()}
                  {status}
                </span>
              </Badge>
            </div>
            <div className="text-right space-y-1 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                <span>Canlı Güncellemeler</span>
              </div>
              <div>Her 1 saniyede</div>
              <div className="text-xs">{history.length} örnek</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Trend Chart */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Seviye Trendi (Son 100 Örnek)</CardTitle>
              <CardDescription>
                Silo seviye değişimlerinin gerçek zamanlı görselleştirmesi
              </CardDescription>
            </div>
            <Button
              onClick={() => setAutoScale(!autoScale)}
              variant="outline"
              size="sm"
            >
              {autoScale ? "Sabit Ölçek (0-100)" : "Otomatik Yakınlaştırma"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {history.length === 0 ? (
            <div className="flex items-center justify-center h-[300px] text-muted-foreground">
              <div className="text-center">
                <p>Veri bekleniyor...</p>
                <p className="text-xs mt-2">
                  SignalR'a bağlı, yakında güncellemeler alınacak
                </p>
              </div>
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
                    domain={getYAxisDomain()}
                    tick={{ fontSize: 11, fill: "#6b7280" }}
                    label={{
                      value: autoScale
                        ? "Seviye (%) - Otomatik Yakınlaştırma"
                        : "Seviye (%)",
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
                    dataKey="level"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={false}
                    name="Seviye (%)"
                    isAnimationActive={false}
                  />
                </LineChart>
              </ResponsiveContainer>
              {autoScale && history.length > 0 && (
                <div className="mt-2 text-xs text-muted-foreground text-center">
                  Mevcut aralık: {getYAxisDomain()[0].toFixed(1)}% -{" "}
                  {getYAxisDomain()[1].toFixed(1)}%
                  <span className="ml-2">
                    (Min: {Math.min(...history.map((h) => h.level)).toFixed(2)}
                    %, Maks:{" "}
                    {Math.max(...history.map((h) => h.level)).toFixed(2)}%)
                  </span>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Status Legend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Durum Eşikleri</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-green-500"></div>
              <div>
                <div className="font-medium">Normal</div>
                <div className="text-sm text-muted-foreground">&gt; 40%</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-orange-500"></div>
              <div>
                <div className="font-medium">Düşük</div>
                <div className="text-sm text-muted-foreground">20% - 40%</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-red-500"></div>
              <div>
                <div className="font-medium">Kritik</div>
                <div className="text-sm text-muted-foreground">&lt; 20%</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
