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
 * JWT token'dan profil bilgilerini çıkarır
 * @param {string} token - JWT token
 * @returns {Object|null} - Profil bilgileri veya null
 */
export const getProfileFromToken = (token) => {
  const decoded = decodeToken(token);
  if (!decoded) return null;

  console.log(
    "Creating profile from token payload:",
    JSON.stringify(decoded).substring(0, 100)
  );

  // Spring backend'den gelen token içeriğine uygun olarak
  // sadece JWT token'da bulunan alanları çıkar
  return {
    name: decoded.name || "",
    email: decoded.email || "",
    role: decoded.role || "",
    age: decoded.age || null,
    gender: decoded.gender || "",
    userId: decoded.userId || decoded.sub || "",
    // Roles dizisi tekli role alan için oluştur
    roles: decoded.roles || (decoded.role ? [decoded.role] : []),
  };
};

/**
 * Token'ın geçerlilik süresinin dolup dolmadığını kontrol eder
 * @param {string} token - JWT token
 * @returns {boolean} - Token geçerli mi?
 */
export const isTokenExpired = (token) => {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) {
    console.log("Token expired: No expiration found");
    return true;
  }

  const currentTime = Date.now() / 1000;
  const expired = decoded.exp < currentTime;
  if (expired) {
    console.log(
      `Token expired: ${new Date(decoded.exp * 1000)} < ${new Date()}`
    );
  }
  return expired;
};
