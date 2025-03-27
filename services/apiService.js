import AsyncStorage from "@react-native-async-storage/async-storage";
import { config } from "../config/api";
import { isTokenExpired } from "./tokenService";

// Base API URL with a fallback for development without a backend
const API_URL = config.apiUrl || "http://localhost:8080";

// Flag to check if the API is available
let isBackendAvailable = true;
let backendCheckTimeout = null;

// Function to handle API requests with authorization token
export const apiRequest = async (endpoint, options = {}) => {
  if (!isBackendAvailable && config.devMode) {
    // Return mock data if the backend is not available and in dev mode
    console.warn("API isteği atlanıyor - backend erişilemez durumda");
    return getMockData(endpoint);
  }

  try {
    const token = await AsyncStorage.getItem("jwtToken");

    if (!token) {
      throw new Error("Token bulunamadı");
    }

    // Token süresinin dolup dolmadığını kontrol et
    if (isTokenExpired(token)) {
      await AsyncStorage.removeItem("jwtToken");
      throw new Error("Token süresi dolmuş");
    }

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    };

    const timeout = options.timeout || config.timeout;

    // Create an AbortController to handle timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // Handle token expiration
    if (response.status === 401) {
      await AsyncStorage.removeItem("jwtToken");
      throw new Error("Token süresi dolmuş veya geçersiz");
    }

    if (!response.ok) {
      throw new Error(`API isteği başarısız oldu: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("API isteği sırasında hata:", error);

    // If there's a network error, mark the backend as unavailable
    if (
      error.message === "Network request failed" ||
      error.name === "AbortError"
    ) {
      handleBackendUnavailable();
      return config.devMode ? getMockData(endpoint) : null;
    }

    throw error;
  }
};

// Function to exchange Firebase token for JWT
export const exchangeFirebaseTokenForJWT = async (firebaseToken) => {
  try {
    // Check if the backend is available before making the request
    if (!isBackendAvailable && config.devMode) {
      console.warn("Backend erişilemez durumda, Firebase token kullanılıyor");
      return firebaseToken;
    }

    console.log(
      "Firebase token'ı backend'e gönderiliyor:",
      firebaseToken.substring(0, 20) + "..."
    );

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000); // Short timeout

    const response = await fetch(`${API_URL}${config.endpoints.auth.login}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ firebase_token: firebaseToken }), // Backend'in beklediği parametre adı
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Backend yanıtı:", response.status, errorText);
      throw new Error(
        `Token değişimi başarısız oldu: ${response.status} ${errorText}`
      );
    }

    const data = await response.json();
    console.log(
      "Backend'den alınan yanıt:",
      JSON.stringify(data).substring(0, 100) + "..."
    );

    // JwtResponse nesnesinde token özelliğini al
    if (!data.token) {
      console.error("Backend yanıtında token bulunamadı:", data);
      throw new Error("Geçersiz token yanıtı");
    }

    await AsyncStorage.setItem("jwtToken", data.token);
    return data.token;
  } catch (error) {
    console.error("Token değişimi sırasında hata:", error);

    // If it's a network error, mark the backend as unavailable
    if (
      error.message === "Network request failed" ||
      error.name === "AbortError"
    ) {
      handleBackendUnavailable();
      // Just use the Firebase token as fallback
      if (config.devMode) {
        await AsyncStorage.setItem("jwtToken", firebaseToken);
        return firebaseToken;
      }
    }

    throw error;
  }
};

// Function to handle backend unavailability
const handleBackendUnavailable = () => {
  isBackendAvailable = false;

  // Clear any existing timeout
  if (backendCheckTimeout) {
    clearTimeout(backendCheckTimeout);
  }

  // Try to reconnect after some time
  backendCheckTimeout = setTimeout(() => {
    checkBackendAvailability();
  }, 30000); // 30 seconds
};

// Function to check if backend is available
const checkBackendAvailability = async () => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    // Use the verify endpoint to check backend availability
    const response = await fetch(`${API_URL}${config.endpoints.auth.verify}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer test`, // Sadece bağlantı kontrolü için
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // Even 401 Unauthorized means server is available
    if (response.status !== 404 && response.status !== 0) {
      isBackendAvailable = true;
      console.log("Backend tekrar erişilebilir durumda");
    } else {
      handleBackendUnavailable();
    }
  } catch (error) {
    handleBackendUnavailable();
  }
};

// Mock data for development without backend
const getMockData = (endpoint) => {
  console.log("Mock veri kullanılıyor:", endpoint);

  // Mock user profile
  if (endpoint === config.endpoints.user.profile) {
    return {
      name: "Test Kullanıcı",
      email: "test@example.com",
      phone: "555-123-4567",
      address: "Test Adres",
    };
  }

  // Mock data list
  if (endpoint === config.endpoints.data.list) {
    return [
      {
        id: 1,
        title: "Test Başlık 1",
        description: "Test Açıklama 1",
      },
      {
        id: 2,
        title: "Test Başlık 2",
        description: "Test Açıklama 2",
      },
      {
        id: 3,
        title: "Test Başlık 3",
        description: "Test Açıklama 3",
      },
    ];
  }

  // Mock data details
  if (endpoint.startsWith("/api/data/")) {
    const id = endpoint.split("/").pop();
    return {
      id: parseInt(id),
      title: `Test Detay Başlık ${id}`,
      description: `Test Detay Açıklama ${id}`,
      createdAt: new Date().toISOString(),
    };
  }

  return {};
};

// Check backend availability when module loads
checkBackendAvailability();

// User-related API endpoints
export const userAPI = {
  getProfile: async () => {
    return await apiRequest(config.endpoints.user.profile);
  },

  updateProfile: async (profileData) => {
    return await apiRequest(config.endpoints.user.updateProfile, {
      method: "PUT",
      body: JSON.stringify(profileData),
    });
  },
};

// Data-related API endpoints
export const dataAPI = {
  getData: async () => {
    return await apiRequest(config.endpoints.data.list);
  },

  getDataById: async (id) => {
    const endpoint = config.endpoints.data.details.replace("{id}", id);
    return await apiRequest(endpoint);
  },
};
