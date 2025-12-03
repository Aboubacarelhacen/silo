import { AlertTriangle, Droplet, Flame } from "lucide-react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { Button } from "../ui/button";

interface CriticalWarningDialogProps {
  open: boolean;
  onFill: () => void;
  currentLevel: number;
}

export function CriticalWarningDialog({
  open,
  onFill,
  currentLevel,
}: CriticalWarningDialogProps) {
  return (
    <AlertDialog open={open}>
      <AlertDialogContent className="max-w-md border-4 border-red-600 bg-gradient-to-br from-red-100 via-red-50 to-orange-100 dark:from-red-950 dark:via-red-900 dark:to-orange-950 shadow-2xl shadow-red-500/50">
        <AlertDialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="relative">
              {/* Outer pulsing ring */}
              <div className="absolute inset-0 animate-ping">
                <div className="h-24 w-24 rounded-full bg-red-600/30" />
              </div>
              {/* Middle pulsing ring */}
              <div className="absolute inset-2 animate-ping animation-delay-150">
                <div className="h-20 w-20 rounded-full bg-red-600/40" />
              </div>
              {/* Inner icon */}
              <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-red-600 to-red-700 shadow-2xl shadow-red-600/50 border-4 border-white dark:border-gray-900">
                <Flame className="h-12 w-12 text-white animate-pulse" />
              </div>
              {/* Corner warning icons */}
              <div className="absolute -top-2 -right-2">
                <AlertTriangle className="h-8 w-8 text-yellow-500 animate-bounce" />
              </div>
            </div>
          </div>

          <AlertDialogTitle className="text-center text-3xl font-black text-red-700 dark:text-red-300 uppercase tracking-wide animate-pulse">
            🚨 ÇOKK KRİTİK! 🚨
          </AlertDialogTitle>

          <AlertDialogDescription className="text-center space-y-4">
            <div className="text-xl font-bold text-red-700 dark:text-red-200 animate-pulse">
              ACİL DURUM - HEMEN MÜDAHALE EDİN!
            </div>

            <div className="flex items-center justify-center gap-4 py-6 bg-white/70 dark:bg-black/30 rounded-xl border-4 border-red-500 shadow-lg">
              <Droplet className="h-10 w-10 text-red-600 animate-bounce" />
              <div className="text-5xl font-black text-red-700 dark:text-red-300">
                {currentLevel.toFixed(1)}%
              </div>
              <AlertTriangle className="h-10 w-10 text-red-600 animate-bounce animation-delay-150" />
            </div>

            <div className="bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-lg p-4 space-y-2 shadow-xl">
              <p className="text-sm font-bold flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                <strong>DURUM:</strong> Silo %20 altına düştü - KRİTİK!
              </p>
              <p className="text-sm font-bold flex items-center gap-2">
                <Flame className="h-4 w-4" />
                <strong>RİSK:</strong> Üretim duracak - Acil eylem şart!
              </p>
              <p className="text-sm font-bold flex items-center gap-2">
                <Droplet className="h-4 w-4" />
                <strong>ÇÖZÜM:</strong> Hemen doldurun (2 dk → 97%)
              </p>
            </div>

            <div className="bg-yellow-100 dark:bg-yellow-900/30 border-2 border-yellow-500 rounded-lg p-3">
              <p className="text-sm text-gray-900 dark:text-gray-100 font-bold text-center">
                ⏰ ZAMAN KAYBI YOK! HEMEN DOLDUR BUTONUNA BASIN! ⏰
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="sm:justify-center">
          <Button
            onClick={onFill}
            size="lg"
            className="w-full bg-gradient-to-r from-red-600 via-red-500 to-orange-600 hover:from-red-700 hover:via-red-600 hover:to-orange-700 text-white font-black text-lg shadow-2xl shadow-red-500/50 animate-pulse border-4 border-white"
          >
            <Flame className="mr-2 h-6 w-6 animate-bounce" />
            ACİL DOLDUR - HEMEN!
            <Flame className="ml-2 h-6 w-6 animate-bounce animation-delay-150" />
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
