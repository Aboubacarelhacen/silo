import { Droplet, ArrowUp } from "lucide-react";
import type { SiloStatus } from "../../types";

interface SiloGaugeProps {
  level: number;
  status: SiloStatus;
  isRefilling?: boolean;
}

export function SiloGauge({
  level,
  status,
  isRefilling = false,
}: SiloGaugeProps) {
  const getColor = () => {
    if (isRefilling) {
      return {
        fill: "from-green-500 to-emerald-500",
        glow: "shadow-green-500/50",
        text: "text-green-600 dark:text-green-500",
      };
    }
    switch (status) {
      case "critical":
        return {
          fill: "from-red-500 to-red-600",
          glow: "shadow-red-500/50",
          text: "text-red-600 dark:text-red-500",
        };
      case "low":
        return {
          fill: "from-yellow-500 to-yellow-600",
          glow: "shadow-yellow-500/50",
          text: "text-yellow-600 dark:text-yellow-500",
        };
      case "normal":
        return {
          fill: "from-teal-500 to-blue-500",
          glow: "shadow-teal-500/50",
          text: "text-teal-600 dark:text-teal-500",
        };
    }
  };

  const color = getColor();

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Vertical Tank Visualization */}
      <div className="relative flex flex-col items-center">
        {/* Tank Container */}
        <div className="relative h-80 w-40 rounded-lg border-4 border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-900">
          {/* Grid lines for reference */}
          <div className="absolute inset-0 flex flex-col justify-between p-2">
            {[100, 75, 50, 25].map((mark) => (
              <div key={mark} className="flex items-center justify-between">
                <div className="h-px w-2 bg-gray-400 dark:bg-gray-700" />
                <span className="text-xs text-gray-500 dark:text-gray-600">
                  {mark}%
                </span>
                <div className="h-px w-2 bg-gray-400 dark:bg-gray-700" />
              </div>
            ))}
          </div>

          {/* Fill Level */}
          <div
            className="absolute bottom-0 left-0 right-0 rounded-b-md bg-gradient-to-t transition-all duration-700 ease-out"
            style={{ height: `${level}%` }}
          >
            <div className={`h-full bg-gradient-to-t ${color.fill} opacity-90`}>
              {/* Animated waves effect */}
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute inset-x-0 top-0 h-2 bg-white/20 animate-pulse" />
                {isRefilling && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <ArrowUp className="h-8 w-8 text-white animate-bounce" />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Refilling indicator */}
          {isRefilling && (
            <div className="absolute top-2 left-0 right-0 flex justify-center">
              <div className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold animate-pulse shadow-lg">
                🔄 Doldurma Devam Ediyor...
              </div>
            </div>
          )}

          {/* Threshold markers */}
          <div className="absolute right-0 w-full" style={{ bottom: "40%" }}>
            <div className="h-0.5 bg-yellow-500/50" />
          </div>
          <div className="absolute right-0 w-full" style={{ bottom: "20%" }}>
            <div className="h-0.5 bg-red-500/50" />
          </div>
        </div>

        {/* Tank base */}
        <div className="mt-2 h-4 w-44 rounded-b-lg border-4 border-t-0 border-gray-300 dark:border-gray-700 bg-gray-200 dark:bg-gray-800" />
      </div>

      {/* Percentage Display */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-3">
          <Droplet className={`h-8 w-8 ${color.text}`} />
          <div>
            <div className="text-5xl text-gray-900 dark:text-white tabular-nums">
              {level.toFixed(1)}
            </div>
            <div className="text-gray-600 dark:text-gray-400">
              Doluluk Seviyesi
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
