import { useState } from "react";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { Header } from "./components/layout/Header";
import { Sidebar } from "./components/layout/Sidebar";
import { DashboardPage } from "./pages/DashboardPage";
import { AlarmsPage } from "./pages/AlarmsPage";
import { HistoryPage } from "./pages/HistoryPage";
import { SettingsPage } from "./pages/SettingsPage";
import { SignInPage } from "./pages/SignInPage";
import SiloDashboard from "./pages/SiloDashboard";
import TemperaturePage from "./pages/TemperaturePage";
import { UserManagementPage } from "./pages/UserManagementPage";
import { useSiloData } from "./hooks/useSiloData";
import { Loader2 } from "lucide-react";

type Page =
  | "dashboard"
  | "alarms"
  | "history"
  | "settings"
  | "realtime"
  | "temperature"
  | "users";

function AppContent() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const {
    siloData,
    history,
    events,
    connectionStatus,
    productionData,
    acknowledgeEvent,
  } = useSiloData();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState<Page>("dashboard");

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto" />
          <p className="text-gray-600 dark:text-gray-400">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  // Show sign-in page if not authenticated
  if (!isAuthenticated) {
    return <SignInPage />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":
        return (
          <DashboardPage
            siloData={siloData}
            history={history}
            events={events}
            productionData={productionData}
            onAcknowledgeEvent={acknowledgeEvent}
          />
        );
      case "realtime":
        return <SiloDashboard />;
      case "temperature":
        return <TemperaturePage />;
      case "users":
        return user?.role === "Admin" ? (
          <UserManagementPage />
        ) : (
          <DashboardPage
            siloData={siloData}
            history={history}
            events={events}
            productionData={productionData}
            onAcknowledgeEvent={acknowledgeEvent}
          />
        );
      case "alarms":
        return <AlarmsPage events={events} onAcknowledge={acknowledgeEvent} />;
      case "history":
        return <HistoryPage history={history} />;
      case "settings":
        return <SettingsPage />;
      default:
        return null;
    }
  };

  // Authenticated - Show main application
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Header
        connectionStatus={connectionStatus}
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
      />

      <div className="flex pt-16">
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          currentPage={currentPage}
          onPageChange={(page) => {
            setCurrentPage(page);
            setSidebarOpen(false);
          }}
        />

        {/* Main Content */}
        <main className="lg:ml-64 flex-1 p-4 sm:p-6 pt-4 sm:pt-6">
          <div className="mx-auto max-w-[1800px]">{renderPage()}</div>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}
