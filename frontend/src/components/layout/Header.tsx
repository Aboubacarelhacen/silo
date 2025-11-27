import {
  Clock,
  Wifi,
  WifiOff,
  User,
  Activity,
  Menu,
  Sun,
  Moon,
  LogOut,
  ChevronDown,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useTheme } from "../../contexts/ThemeContext";
import { useAuth } from "../../contexts/AuthContext";
import type { ConnectionStatus } from "../../types";
import logoSvg from "../../assets/logo.svg";

interface HeaderProps {
  connectionStatus: ConnectionStatus;
  onMenuClick?: () => void;
}

export function Header({ connectionStatus, onMenuClick }: HeaderProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("tr-TR", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("tr-TR", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getConnectionStatusConfig = () => {
    switch (connectionStatus) {
      case "connected":
        return {
          icon: Wifi,
          text: "PLC Bağlı",
          color: "text-teal-600 dark:text-teal-400",
        };
      case "reconnecting":
        return {
          icon: Activity,
          text: "Yeniden Bağlanıyor...",
          color: "text-yellow-600 dark:text-yellow-400",
        };
      case "offline":
        return {
          icon: WifiOff,
          text: "Bağlantı Yok",
          color: "text-red-600 dark:text-red-400",
        };
    }
  };

  const statusConfig = getConnectionStatusConfig();
  const StatusIcon = statusConfig.icon;

  return (
    <header className="fixed top-0 z-50 w-full border-b border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-gray-950/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 dark:supports-[backdrop-filter]:bg-gray-950/80">
      <div className="flex h-16 items-center justify-between px-6">
        {/* Left: Logo and Title */}
        <div className="flex items-center gap-4">
          {/* Mobile menu button */}
          <button
            onClick={onMenuClick}
            className="lg:hidden rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-2 text-gray-700 dark:text-gray-300 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <Menu className="h-5 w-5" />
          </button>

          <img src={logoSvg} alt="SiloGuard Logo" className="h-10 w-auto" />
        </div>

        {/* Right: Status indicators */}
        <div className="flex items-center gap-3 lg:gap-6">
          {/* Time */}
          <div className="hidden md:flex items-center gap-2 text-gray-700 dark:text-gray-300">
            <Clock className="h-4 w-4 text-gray-500" />
            <div className="text-right">
              <div className="text-sm">{formatTime(currentTime)}</div>
              <div className="text-xs text-gray-500">
                {formatDate(currentTime)}
              </div>
            </div>
          </div>

          {/* Connection Status */}
          <div
            className={`hidden sm:flex items-center gap-2 ${statusConfig.color}`}
          >
            <StatusIcon className="h-4 w-4" />
            <span className="text-sm">{statusConfig.text}</span>
          </div>

          {/* Connection Status Icon Only (mobile) */}
          <div className={`sm:hidden ${statusConfig.color}`}>
            <StatusIcon className="h-5 w-5" />
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-2 text-gray-700 dark:text-gray-300 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
            title={theme === "dark" ? "Açık tema" : "Koyu tema"}
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </button>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 px-3 py-2 text-gray-700 dark:text-gray-300 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-blue-600 text-white text-xs font-semibold">
                {user?.fullName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()}
              </div>
              <span className="text-sm hidden sm:inline">{user?.fullName}</span>
              <ChevronDown className="h-4 w-4 hidden sm:block" />
            </button>

            {/* Dropdown Menu */}
            {showUserMenu && (
              <>
                {/* Backdrop */}
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowUserMenu(false)}
                />

                {/* Menu */}
                <div className="absolute right-0 mt-2 w-64 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xl z-50">
                  {/* User Info */}
                  <div className="border-b border-gray-200 dark:border-gray-800 p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-blue-600 text-white font-semibold">
                        {user?.fullName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {user?.fullName}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {user?.email || user?.username}
                        </p>
                      </div>
                    </div>
                    {/* Role Badge */}
                    <div className="mt-3">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user?.role === "admin"
                            ? "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300"
                            : "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                        }`}
                      >
                        {user?.role === "admin" ? "Yönetici" : "Operatör"}
                      </span>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="p-2">
                    <button
                      onClick={() => {
                        logout();
                        setShowUserMenu(false);
                      }}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Çıkış Yap</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
