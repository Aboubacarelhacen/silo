import { AlertTriangle, Droplet } from "lucide-react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { Button } from "../ui/button";

interface RefillWarningDialogProps {
  open: boolean;
  onFill: () => void;
  onDismiss?: () => void;
  currentLevel: number;
}

export function RefillWarningDialog({
  open,
  onFill,
  onDismiss,
  currentLevel,
}: RefillWarningDialogProps) {
  return (
    <AlertDialog open={open}>
      <AlertDialogContent className="max-w-md border-red-500/50 bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/50 dark:to-orange-950/50">
        <AlertDialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="relative">
              <div className="absolute inset-0 animate-ping">
                <div className="h-20 w-20 rounded-full bg-red-500/20" />
              </div>
              <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-red-500 shadow-lg shadow-red-500/50">
                <AlertTriangle className="h-10 w-10 text-white animate-pulse" />
              </div>
            </div>
          </div>

          <AlertDialogTitle className="text-center text-2xl font-bold text-red-700 dark:text-red-400">
            ⚠️ KRİTİK SEVİYE UYARISI
          </AlertDialogTitle>

          <AlertDialogDescription className="text-center space-y-4">
            <div className="text-lg font-semibold text-red-600 dark:text-red-300">
              Silo seviyesi kritik düzeye ulaştı!
            </div>

            <div className="flex items-center justify-center gap-3 py-4">
              <Droplet className="h-8 w-8 text-red-500" />
              <div className="text-4xl font-bold text-red-600 dark:text-red-400">
                {currentLevel.toFixed(1)}%
              </div>
            </div>

            <div className="bg-white/50 dark:bg-black/20 rounded-lg p-4 space-y-2">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                <strong>Durum:</strong> Silo %40 seviyesine düştü
              </p>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                <strong>Eylem:</strong> Acil doldurma gerekiyor
              </p>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                <strong>Tahmini Süre:</strong> ~2 dakika (97% doluluk)
              </p>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-400 italic">
              Üretimin kesintisiz devam etmesi için lütfen şimdi doldurun
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="sm:justify-center gap-2">
          {onDismiss && (
            <Button
              onClick={onDismiss}
              size="lg"
              variant="outline"
              className="border-gray-300 dark:border-gray-700"
            >
              Görmezden Gel
            </Button>
          )}
          <Button
            onClick={onFill}
            size="lg"
            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold shadow-lg shadow-green-500/50 animate-pulse"
          >
            <Droplet className="mr-2 h-5 w-5" />
            Siloyu Doldur
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
