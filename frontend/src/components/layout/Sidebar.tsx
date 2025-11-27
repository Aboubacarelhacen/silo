import {
  LayoutDashboard,
  AlertTriangle,
  History,
  Settings,
  Activity,
  Thermometer,
  Users,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

type NavItem = {
  id: string;
  label: string;
  icon: typeof LayoutDashboard;
};

type Page =
  | "dashboard"
  | "alarms"
  | "history"
  | "settings"
  | "realtime"
  | "temperature"
  | "users";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  currentPage: Page;
  onPageChange: (page: Page) => void;
}

export function Sidebar({
  isOpen = true,
  onClose,
  currentPage,
  onPageChange,
}: SidebarProps) {
  const { user } = useAuth();
  const isAdmin = user?.role === "Admin";

  const navItems: NavItem[] = [
    { id: "dashboard", label: "Kontrol Paneli", icon: LayoutDashboard },
    { id: "realtime", label: "Real-time OPC UA", icon: Activity },
    { id: "temperature", label: "Sıcaklık İzleme", icon: Thermometer },
    { id: "alarms", label: "Alarmlar", icon: AlertTriangle },
    { id: "history", label: "Geçmiş", icon: History },
    ...(isAdmin
      ? [{ id: "users" as const, label: "Kullanıcı Yönetimi", icon: Users }]
      : []),
    { id: "settings", label: "Ayarlar", icon: Settings },
  ];

  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] w-64 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <nav className="flex flex-col gap-1 p-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onPageChange(item.id as Page)}
                className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm transition-colors ${
                  isActive
                    ? "bg-teal-500/10 text-teal-600 dark:text-teal-400"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-900 hover:text-gray-900 dark:hover:text-gray-300"
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
                {isActive && (
                  <div className="ml-auto h-2 w-2 rounded-full bg-teal-600 dark:bg-teal-400" />
                )}
              </button>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
