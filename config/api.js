export const config = {
  // API base URL - Spring backend URL'iniz
  apiUrl: "http://10.0.2.2:8080", // Android emülatörü için localhost
  // veya "http://localhost:8080" // Cihaz test için
  // veya "http://192.168.1.x:8080" // Yerel ağda test için (IP'nizi kullanın)

  // Dev mode flag for using mock data
  devMode: true,

  // API timeouts
  timeout: 10000, // 10 seconds

  // API endpoints - Backend endpoint'lerle eşleştir
  endpoints: {
    auth: {
      login: "/api/auth/login", // Firebase token'ı JWT'ye değiştirir
      verify: "/api/auth/verify", // JWT doğrulama endpoint'i
    },
    user: {
      profile: "/api/user/profile",
      updateProfile: "/api/user/profile",
    },
    data: {
      list: "/api/data",
      details: "/api/data/{id}",
    },
  },

  // Request retry configuration
  retry: {
    maxRetries: 3,
    baseDelay: 1000, // 1 second
  },
};
