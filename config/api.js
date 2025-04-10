export const config = {
  // API base URL - Spring backend URL'iniz
  apiUrl: "http://10.0.2.2:8080", // Android emülatörü için localhost

  // Dev mode flag for using mock data when backend is not available
  devMode: true, // Development modunda her zaman true kalsın

  // Dev modda sınıflandırma testini zorunlu olarak göster
  forceClassification: true,

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
