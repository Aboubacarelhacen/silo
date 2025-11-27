import { useEffect, useState } from "react";
import { cn } from "./utils";

interface AnimatedThermometerProps {
  temperature: number | null;
  minTemp?: number;
  maxTemp?: number;
  className?: string;
}

export function AnimatedThermometer({
  temperature,
  minTemp = 0,
  maxTemp = 120,
  className,
}: AnimatedThermometerProps) {
  const [animatedTemp, setAnimatedTemp] = useState(minTemp);

  useEffect(() => {
    if (temperature !== null) {
      // Smooth animation to new temperature
      const timer = setTimeout(() => {
        setAnimatedTemp(temperature);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [temperature]);

  // Calculate percentage (0-100) based on temperature range
  const percentage =
    temperature !== null
      ? Math.min(
          Math.max(((temperature - minTemp) / (maxTemp - minTemp)) * 100, 0),
          100
        )
      : 0;

  // Dynamic color based on temperature
  const getColor = () => {
    if (temperature === null) return "from-gray-400 to-gray-500";
    if (temperature < 40) return "from-cyan-400 via-cyan-500 to-cyan-600";
    if (temperature < 80) return "from-green-400 via-green-500 to-green-600";
    return "from-orange-400 via-red-500 to-red-600";
  };

  const getGlowColor = () => {
    if (temperature === null) return "shadow-gray-500/50";
    if (temperature < 40) return "shadow-cyan-500/50";
    if (temperature < 80) return "shadow-green-500/50";
    return "shadow-red-500/50";
  };

  // Generate tick marks
  const ticks = Array.from({ length: 7 }, (_, i) => {
    const temp = minTemp + (i * (maxTemp - minTemp)) / 6;
    return Math.round(temp);
  });

  return (
    <div className={cn("flex items-center justify-center", className)}>
      <div className="relative flex flex-col items-center">
        {/* Thermometer body */}
        <div className="relative flex items-end">
          {/* Temperature scale */}
          <div className="flex flex-col justify-between h-[400px] mr-4 text-sm font-medium text-muted-foreground">
            {ticks.reverse().map((temp, i) => (
              <div key={i} className="flex items-center gap-2">
                <span
                  className={cn(
                    "transition-colors duration-300",
                    temperature !== null &&
                      temperature >= temp &&
                      "text-foreground font-bold"
                  )}
                >
                  {temp}°
                </span>
                <div
                  className={cn(
                    "w-3 h-0.5 transition-all duration-300",
                    temperature !== null && temperature >= temp
                      ? "bg-foreground w-4"
                      : "bg-muted-foreground/30"
                  )}
                ></div>
              </div>
            ))}
          </div>

          {/* Thermometer tube */}
          <div className="relative">
            {/* Outer glass tube */}
            <div className="relative w-16 h-[400px] bg-gradient-to-b from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 rounded-t-full border-4 border-gray-300 dark:border-gray-700 shadow-lg overflow-hidden">
              {/* Inner tube background */}
              <div className="absolute inset-2 bg-white dark:bg-gray-950 rounded-t-full">
                {/* Mercury/liquid fill */}
                <div
                  className={cn(
                    "absolute bottom-0 left-0 right-0 rounded-t-full transition-all duration-1000 ease-out bg-gradient-to-t",
                    getColor(),
                    "animate-pulse"
                  )}
                  style={{
                    height: `${percentage}%`,
                    boxShadow: `0 0 20px ${
                      temperature !== null && temperature < 40
                        ? "rgba(6, 182, 212, 0.6)"
                        : temperature !== null && temperature < 80
                        ? "rgba(16, 185, 129, 0.6)"
                        : "rgba(239, 68, 68, 0.6)"
                    }`,
                  }}
                >
                  {/* Shimmer effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>

                  {/* Bubbles animation */}
                  {temperature !== null && temperature > 60 && (
                    <>
                      <div className="absolute bottom-[20%] left-[25%] w-2 h-2 bg-white/40 rounded-full animate-bubble"></div>
                      <div className="absolute bottom-[40%] left-[60%] w-1.5 h-1.5 bg-white/30 rounded-full animate-bubble-delayed"></div>
                      <div className="absolute bottom-[10%] left-[70%] w-1 h-1 bg-white/50 rounded-full animate-bubble"></div>
                    </>
                  )}
                </div>

                {/* Tick marks on glass */}
                <div className="absolute inset-0 flex flex-col justify-between p-1">
                  {Array.from({ length: 20 }).map((_, i) => (
                    <div
                      key={i}
                      className="w-full h-px bg-gray-300 dark:bg-gray-700 opacity-30"
                    ></div>
                  ))}
                </div>
              </div>

              {/* Glass reflection effect */}
              <div className="absolute left-2 top-4 w-1 h-32 bg-gradient-to-b from-white/60 to-transparent rounded-full blur-sm"></div>
            </div>

            {/* Bulb at bottom */}
            <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 flex items-center justify-center">
              <div
                className={cn(
                  "w-20 h-20 rounded-full border-4 border-gray-300 dark:border-gray-700 bg-gradient-to-br shadow-2xl transition-all duration-1000",
                  getColor(),
                  getGlowColor()
                )}
              >
                {/* Bulb highlight */}
                <div className="absolute top-2 left-2 w-6 h-6 bg-white/40 rounded-full blur-md"></div>

                {/* Temperature display in bulb */}
                <div className="flex items-center justify-center w-full h-full">
                  <span className="text-white font-bold text-lg drop-shadow-lg">
                    {temperature !== null ? Math.round(temperature) : "--"}°
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Temperature reading below */}
        <div className="mt-16 text-center">
          <div className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {temperature !== null ? temperature.toFixed(1) : "--.-"}°C
          </div>
          <div className="text-sm text-muted-foreground mt-2">
            {temperature === null && "Veri bekleniyor..."}
            {temperature !== null && temperature < 40 && "🧊 Soğuk Sıcaklık"}
            {temperature !== null &&
              temperature >= 40 &&
              temperature < 80 &&
              "✅ Normal Aralık"}
            {temperature !== null && temperature >= 80 && "🔥 Yüksek Sıcaklık"}
          </div>
        </div>
      </div>

      {/* Custom animations */}
      <style>{`
        @keyframes shimmer {
          0% {
            transform: translateY(100%);
          }
          100% {
            transform: translateY(-100%);
          }
        }
        
        @keyframes bubble {
          0% {
            transform: translateY(0) scale(1);
            opacity: 0.6;
          }
          50% {
            transform: translateY(-100px) scale(1.2);
            opacity: 0.3;
          }
          100% {
            transform: translateY(-200px) scale(0.8);
            opacity: 0;
          }
        }
        
        @keyframes bubble-delayed {
          0% {
            transform: translateY(0) scale(1);
            opacity: 0.5;
          }
          50% {
            transform: translateY(-120px) scale(1.3);
            opacity: 0.2;
          }
          100% {
            transform: translateY(-240px) scale(0.6);
            opacity: 0;
          }
        }
        
        .animate-shimmer {
          animation: shimmer 3s infinite;
        }
        
        .animate-bubble {
          animation: bubble 3s infinite;
        }
        
        .animate-bubble-delayed {
          animation: bubble-delayed 4s infinite;
          animation-delay: 1s;
        }
      `}</style>
    </div>
  );
}
