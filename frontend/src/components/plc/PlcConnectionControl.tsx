import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plug, PlugZap, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface PlcConnectionStatus {
  connected: boolean;
  message: string;
  lastError?: string;
  endpoint: string;
}

export function PlcConnectionControl() {
  const [status, setStatus] = useState<PlcConnectionStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/plc/status`
      );

      if (response.ok) {
        const data = await response.json();
        setStatus(data);
        setError(null);
      } else if (response.status === 401) {
        setError("Oturum süresi dolmuş - Lütfen tekrar giriş yapın");
      } else {
        setError("Durum kontrolü başarısız");
      }
    } catch (err) {
      console.error("Status fetch error:", err);
      setError("Backend sunucusuna bağlanılamıyor");
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 5000); // Check every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const handleConnect = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/plc/connect`,
        {
          method: "POST",
        }
      );

      const data = await response.json();

      if (response.ok) {
        await fetchStatus();
      } else {
        setError(data.message || "Bağlantı başarısız");
      }
    } catch (err) {
      console.error("Connect error:", err);
      setError("Bağlantı hatası");
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/plc/disconnect`,
        {
          method: "POST",
        }
      );

      const data = await response.json();

      if (response.ok) {
        await fetchStatus();
      } else {
        setError(data.message || "Bağlantı kesme başarısız");
      }
    } catch (err) {
      console.error("Disconnect error:", err);
      setError("Bağlantı hatası");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <PlugZap className="h-5 w-5" />
              PLC Bağlantısı
            </CardTitle>
            <CardDescription className="text-sm mt-1">
              {status?.endpoint || "opc.tcp://192.168.1.49:26543"}
            </CardDescription>
          </div>
          <Badge
            variant={status?.connected ? "default" : "destructive"}
            className="text-xs"
          >
            {status?.connected ? (
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                Bağlı
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-red-400" />
                Bağlı Değil
              </span>
            )}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {status?.lastError && !status.connected && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-xs">
              Son Hata: {status.lastError}
            </AlertDescription>
          </Alert>
        )}

        <div className="flex gap-2">
          {!status?.connected ? (
            <Button
              onClick={handleConnect}
              disabled={loading}
              className="flex-1"
              size="sm"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Bağlanıyor...
                </>
              ) : (
                <>
                  <Plug className="mr-2 h-4 w-4" />
                  PLC'ye Bağlan
                </>
              )}
            </Button>
          ) : (
            <Button
              onClick={handleDisconnect}
              disabled={loading}
              variant="outline"
              className="flex-1"
              size="sm"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Kesiliyor...
                </>
              ) : (
                <>
                  <Plug className="mr-2 h-4 w-4" />
                  Bağlantıyı Kes
                </>
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
