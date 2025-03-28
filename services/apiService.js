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

  // Mock classification questions
  if (endpoint === "/api/questions/question_tag/classification") {
    return [
      {
        id: "class_q1",
        question_text: "Kaç yaşındasınız?",
        question_type: "multiple_choice",
        options: ["50-59", "60-69", "70-79", "80+"],
        question_number: "1",
        category: "demographic",
      },
      {
        id: "class_q2",
        question_text: "Cinsiyetinizi belirtiniz.",
        question_type: "multiple_choice",
        options: ["Kadın", "Erkek"],
        question_number: "2",
        category: "demographic",
      },
      {
        id: "class_q3",
        question_text: "Eğitim seviyeniz nedir?",
        question_type: "multiple_choice",
        options: ["İlkokul veya daha az", "Lise", "Üniversite ve üstü"],
        question_number: "3",
        category: "education",
      },
      {
        id: "class_q4",
        question_text: "Son 6 ay içinde unutkanlık yaşadınız mı?",
        question_type: "multiple_choice",
        options: ["Evet", "Hayır"],
        question_number: "4",
        category: "cognitive_status",
      },
      {
        id: "class_q5",
        question_text:
          "Son 6 ayda günlük işlerinizi yapmakta zorlanıyor musunuz?",
        question_type: "multiple_choice",
        options: ["Evet", "Bazen", "Hayır"],
        question_number: "5",
        category: "cognitive_status",
      },
      {
        id: "class_q6",
        question_text: "Ailenizde demans/Alzheimer hastalığı öyküsü var mı?",
        question_type: "multiple_choice",
        options: ["Evet", "Hayır", "Bilmiyorum"],
        question_number: "6",
        category: "medical",
      },
      {
        id: "class_q7",
        question_text:
          "Günlük yaşamınızda ne sıklıkla sosyal aktiviteler yaparsınız?",
        question_type: "multiple_choice",
        options: ["Hiç", "Nadiren", "Bazen", "Sıklıkla"],
        question_number: "7",
        category: "social_activity",
      },
    ];
  }

  // Mock specific question by number
  if (endpoint.startsWith("/api/questions/question_number/")) {
    const number = endpoint.split("/").pop();
    const mockQuestions = getMockData(
      "/api/questions/question_tag/classification"
    );
    return mockQuestions.find((q) => q.question_number === number) || null;
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

  // Mock classification test start
  if (endpoint === "/api/classification/start") {
    return {
      sessionId: "mock_session_" + Date.now(),
      message: "Classification test started successfully",
    };
  }

  // Mock classification test response submission
  if (endpoint === "/api/classification/submit-response") {
    return {
      responseId: "mock_response_" + Date.now(),
      message: "Response recorded successfully",
    };
  }

  // Mock classification test completion
  if (endpoint === "/api/classification/complete") {
    return {
      sessionId: "mock_session_123",
      classification: {
        age_group: "60-69",
        cognitive_status: "MCI",
        education_level: "Lise",
        risk_level: "Orta",
      },
      message: "Classification test completed successfully",
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

// Classification test related API endpoints
export const classificationAPI = {
  // Fetch classification questions
  getClassificationQuestions: async () => {
    return await apiRequest("/api/questions/question_tag/classification");
  },

  // Fetch questions in order
  getOrderedClassificationQuestions: async () => {
    return await apiRequest("/api/questions/ordered/classification");
  },

  // Get specific question by number
  getQuestionByNumber: async (number) => {
    return await apiRequest(`/api/questions/question_number/${number}`);
  },

  // Start a classification test
  startClassificationTest: async (patientId) => {
    return await apiRequest("/api/classification/start", {
      method: "POST",
      body: JSON.stringify({ patientId }),
    });
  },

  // Submit a response to a classification question
  submitResponse: async (sessionId, patientId, questionId, answer) => {
    return await apiRequest("/api/classification/submit-response", {
      method: "POST",
      body: JSON.stringify({
        sessionId,
        patientId,
        questionId,
        answer,
      }),
    });
  },

  // Complete classification test
  completeClassificationTest: async (sessionId, patientId) => {
    return await apiRequest("/api/classification/complete", {
      method: "POST",
      body: JSON.stringify({
        sessionId,
        patientId,
      }),
    });
  },
};
