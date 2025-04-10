/**
 * Simple JWT decoder function that doesn't rely on external libraries
 * @param {string} token - JWT token
 * @returns {Object|null} - Decoded token payload or null
 */
const decodeJwt = (token) => {
  try {
    console.log("Decoding token using custom decoder...");

    // Split the token into parts
    const parts = token.split(".");
    if (parts.length !== 3) {
      console.error("Invalid JWT format, parts:", parts.length);
      return null;
    }

    // Get the payload part (second part)
    const payload = parts[1];

    // Base64Url decode
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");

    // Create padding
    const padding = "=".repeat((4 - (base64.length % 4)) % 4);
    const jsonPayload = atob(base64 + padding);

    // Parse and return the payload
    const parsed = JSON.parse(jsonPayload);
    console.log(
      "Successfully decoded token:",
      JSON.stringify(parsed).substring(0, 100) + "..."
    );
    return parsed;
  } catch (error) {
    console.error("JWT decode error:", error);
    return null;
  }
};

/**
 * JWT token'dan profil bilgilerini çıkarır
 * @param {string} token - JWT token
 * @returns {Object|null} - Decode edilmiş profil bilgileri veya null
 */
export const decodeToken = (token) => {
  if (!token) {
    console.log("No token provided for decoding");
    return null;
  }

  try {
    // Use our custom decoder instead of the library
    return decodeJwt(token);
  } catch (error) {
    console.error("Token decode hatası:", error);
    return null;
  }
};

/**
 * JWT token'dan kullanıcı ID'sini çıkarır
 * @param {string} token - JWT token
 * @returns {string|null} - Kullanıcı ID'si veya null
 */
export const getUserIdFromToken = (token) => {
  const decoded = decodeToken(token);
  return decoded?.userId || decoded?.sub || null;
};

/**
 * Token'dan kullanıcı profil bilgilerini çıkarır
 * @param {string} token - JWT token
 * @returns {Object|null} - Profil bilgileri veya null
 */
export const getProfileFromToken = (token) => {
  try {
    // Bazı durumlarda token olmayabilir
    if (!token) return null;

    // Mock token için sahte veri döndür
    if (token.startsWith("mock_") || __DEV__) {
      return {
        role: "patient",
        email: "test@example.com",
        name: "Test User",
      };
    }

    // Token'ı parçalara ayır
    const base64Url = token.split(".")[1];
    if (!base64Url) return null;

    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map(function (c) {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join("")
    );

    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Token profil çıkarma hatası:", error);
    return null;
  }
};

/**
 * Token'ın geçerlilik süresinin dolup dolmadığını kontrol eder
 * @param {string} token - JWT token
 * @returns {boolean} - Token geçerli mi?
 */
export const isTokenExpired = (token) => {
  try {
    // Bazı durumlarda token olmayabilir
    if (!token) return true;

    // Dev modda token kontrolünü atlayalım
    if (__DEV__) {
      console.log("Dev modda token kontrolü atlanıyor");
      return false;
    }

    // Mock token için kontrolü atlayalım
    if (token.startsWith("mock_") || token.startsWith("firebase_")) {
      return false;
    }

    // Token formatını kontrol et
    const parts = token.split(".");
    if (parts.length !== 3) {
      console.warn("Geçersiz token formatı:", token.substring(0, 20));
      return true;
    }

    try {
      // Token'ı parçala ve payload kısmını al
      const base64Url = parts[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map(function (c) {
            return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
          })
          .join("")
      );

      // Süre kontrolü yap
      const { exp } = JSON.parse(jsonPayload);
      if (!exp) {
        console.warn("Token'da exp alanı bulunamadı");
        return false; // exp yoksa geçerli kabul et
      }

      const currentTime = Math.floor(Date.now() / 1000);
      const isExpired = exp < currentTime;

      if (isExpired) {
        console.warn(
          `Token süresi dolmuş: ${new Date(exp * 1000).toLocaleString()}`
        );
      }

      return isExpired;
    } catch (decodeError) {
      console.warn("Token decode hatası:", decodeError);
      return false; // Parse hatası olursa geçerli kabul et
    }
  } catch (error) {
    console.error("Token kontrol hatası:", error);
    return false; // Herhangi bir hata durumunda geçerli kabul et
  }
};
