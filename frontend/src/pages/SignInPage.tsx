import { useState } from "react";
import { Eye, EyeOff, Loader2, User, Lock, LogIn } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import logoSvg from "../assets/logo.svg";
import backgroundImage from "../assets/background.jpg";

export function SignInPage() {
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const result = await login(username, password);
      if (!result.success) {
        setError(result.error || "Kullanıcı adı veya şifre hatalı");
      }
    } catch (err) {
      setError("Giriş yapılırken bir hata oluştu");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Background Image with Overlay */}
      <div className="hidden lg:flex lg:w-3/5 relative">
        <div
          className="absolute inset-0 bg-cover bg-center rounded-r-3xl"
          style={{
            backgroundImage: `url(${backgroundImage})`,
          }}
        />
        {/* Subtle dark overlay for text readability */}
        <div className="absolute inset-0 bg-black/30 rounded-r-3xl" />

        {/* Content Overlay */}
        <div className="relative z-10 flex flex-col justify-end p-12 text-white">
          {/* Main Content */}
          <div className="space-y-6 mb-12">
            <h1 className="text-5xl font-bold leading-tight">
              Silo <span className="text-red-600">İzleme</span>
              <br />
              Kontrol Sistemi
            </h1>
            <p className="text-xl text-blue-100 max-w-md">
              Üretim süreçlerinizi gerçek zamanlı olarak izleyin ve yönetin
            </p>
            <div className="grid grid-cols-2 gap-4 pt-6">
              <div className="space-y-2">
                <div className="text-3xl font-bold">7/24</div>
                <div className="text-sm text-blue-200">Kesintisiz İzleme</div>
              </div>
              <div className="space-y-2">
                <div className="text-3xl font-bold">%99.9</div>
                <div className="text-sm text-blue-200">
                  Sistem Güvenilirliği
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-sm text-blue-200">
            © 2024 Borsan. Tüm hakları saklıdır.
          </div>
        </div>
      </div>

      {/* Right Side - Sign In Form */}
      <div className="flex-1 flex flex-col bg-white dark:bg-gray-950">
        {/* Logo at top left */}
        <div className="p-8">
          <img src={logoSvg} alt="Logo" className="h-12 w-auto" />
        </div>

        {/* Form container centered */}
        <div className="flex-1 flex items-center justify-center px-8 pb-8">
          <div className="w-full max-w-md space-y-8">
            {/* Header */}
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                Hoş Geldiniz
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Devam etmek için giriş yapın
              </p>
            </div>

            {/* Sign In Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Username Field */}
              <div className="space-y-2">
                <label
                  htmlFor="username"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Kullanıcı Adı
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    autoComplete="username"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="Kullanıcı adınızı girin"
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Şifre
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-12 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="••••••••"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="rounded-lg bg-red-50 dark:bg-red-900/20 p-4 border border-red-200 dark:border-red-800">
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {error}
                  </p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Giriş Yapılıyor...
                  </>
                ) : (
                  <>
                    <LogIn className="h-5 w-5" />
                    Giriş Yap
                  </>
                )}
              </button>
            </form>

            {/* Demo Credentials */}
            <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-800">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Demo Hesaplar:
              </p>
              <div className="space-y-2 text-xs text-gray-600 dark:text-gray-400">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Operatör:</span>
                  <code className="bg-gray-200 dark:bg-gray-800 px-2 py-1 rounded">
                    operator / operator123
                  </code>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">Yönetici:</span>
                  <code className="bg-gray-200 dark:bg-gray-800 px-2 py-1 rounded">
                    admin / admin123
                  </code>
                </div>
              </div>
            </div>

            {/* Help Text */}
            <p className="text-center text-xs text-gray-500 dark:text-gray-500">
              Giriş yapmakta sorun mu yaşıyorsunuz?{" "}
              <a
                href="#"
                className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
              >
                Destek ekibiyle iletişime geçin
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
