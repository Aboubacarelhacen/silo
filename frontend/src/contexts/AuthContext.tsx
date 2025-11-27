import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

const API_URL = `${import.meta.env.VITE_API_URL}/api`;

export type UserRole = "Operator" | "Admin";

export interface User {
  id: string;
  username: string;
  role: UserRole;
  fullName: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (
    username: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  token: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const storedToken = localStorage.getItem("siloguard_token");
    const storedUser = localStorage.getItem("siloguard_user");

    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setToken(storedToken);
        setUser(parsedUser);
        // Validate token
        validateToken(storedToken).catch(() => {
          localStorage.removeItem("siloguard_token");
          localStorage.removeItem("siloguard_user");
          setToken(null);
          setUser(null);
        });
      } catch (error) {
        console.error("Failed to parse stored user:", error);
        localStorage.removeItem("siloguard_token");
        localStorage.removeItem("siloguard_user");
      }
    }
    setIsLoading(false);
  }, []);

  const validateToken = async (token: string) => {
    const response = await fetch(`${API_URL}/auth/validate`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error("Token validation failed");
    }
  };

  const login = async (
    username: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        return { success: false, error: error.message || "Giriş başarısız" };
      }

      const data = await response.json();

      const user: User = {
        id: data.username, // We'll use username as id for now
        username: data.username,
        fullName: data.fullName,
        role: data.role as UserRole,
      };

      setUser(user);
      setToken(data.token);
      localStorage.setItem("siloguard_token", data.token);
      localStorage.setItem("siloguard_user", JSON.stringify(user));

      return { success: true };
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, error: "Bağlantı hatası" };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("siloguard_token");
    localStorage.removeItem("siloguard_user");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
