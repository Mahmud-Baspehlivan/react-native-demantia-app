import React, { createContext, useState, useEffect, useContext } from "react";
import { signOut } from "firebase/auth";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../config/firebase";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { exchangeFirebaseTokenForJWT } from "../services/apiService";
import { Alert } from "react-native";
import { getProfileFromToken, isTokenExpired } from "../services/tokenService";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [jwtToken, setJwtToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [backendAvailable, setBackendAvailable] = useState(true);
  const [userProfile, setUserProfile] = useState(null);

  // JWT token ile işlemler yap
  const processToken = (token) => {
    if (!token) {
      setJwtToken(null);
      setUserProfile(null);
      return;
    }

    try {
      // Token geçerli mi kontrol et
      if (isTokenExpired(token)) {
        console.log("Token süresi dolmuş.");
        AsyncStorage.removeItem("jwtToken");
        setJwtToken(null);
        setUserProfile(null);
        return;
      }

      // Token'ı sakla
      setJwtToken(token);

      // Token'dan profil bilgilerini çıkar
      try {
        const profileFromToken = getProfileFromToken(token);
        console.log("Token'dan çıkarılan profil:", profileFromToken);
        setUserProfile(profileFromToken);
      } catch (profileError) {
        console.error("Token'dan profil çıkarma hatası:", profileError);
        // Profil çıkarılamasa bile token'ı kullanabiliriz
      }
    } catch (error) {
      console.error("Token işleme hatası:", error);
      AsyncStorage.removeItem("jwtToken");
      setJwtToken(null);
      setUserProfile(null);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          // User is signed in
          setUser(firebaseUser);
          console.log("Firebase ile giriş yapıldı, ID token alınıyor...");

          try {
            // Try to get the JWT from the backend
            const idToken = await firebaseUser.getIdToken(true); // force-refresh eklendi
            console.log(
              "Firebase ID token alındı, JWT için backend'e gönderiliyor..."
            );

            const jwt = await exchangeFirebaseTokenForJWT(idToken);
            console.log("Backend'den JWT alındı, token işleniyor...");

            // JWT token ile işlemleri yap
            processToken(jwt);
            setBackendAvailable(true);
          } catch (tokenError) {
            // If token exchange fails, check if it's a network error
            console.error("Token değişimi hatası:", tokenError);

            if (
              tokenError.message.includes("Network request failed") ||
              tokenError.name === "AbortError"
            ) {
              // Backend is not available
              setBackendAvailable(false);

              // In development mode, we can use the Firebase token as a fallback
              if (__DEV__) {
                console.warn(
                  "Backend erişilemez durumda, Firebase token kullanılıyor:",
                  tokenError
                );
                const fallbackToken = await firebaseUser.getIdToken();
                setJwtToken(fallbackToken);
                setUserProfile(null); // Firebase token içinde profil bilgileri yok
                await AsyncStorage.setItem("jwtToken", fallbackToken);
              } else {
                // In production, show an error
                Alert.alert(
                  "Sunucu Bağlantı Hatası",
                  "Sunucuya erişilemiyor. Lütfen internet bağlantınızı kontrol edin."
                );
                await signOut(auth);
              }
            } else {
              // Another type of error
              console.error("Token değişimi hatası detayları:", tokenError);
              Alert.alert(
                "Kimlik Doğrulama Hatası",
                "Oturum açma sırasında bir sorun oluştu: " + tokenError.message
              );
              await signOut(auth);
            }
          }
        } else {
          // User is signed out
          setUser(null);
          setJwtToken(null);
          setUserProfile(null);
          await AsyncStorage.removeItem("jwtToken");
        }
      } catch (error) {
        console.error("Auth context error:", error);
      } finally {
        setLoading(false);
      }
    });

    // Uygulama başlatıldığında AsyncStorage'den token'ı al
    const checkStoredToken = async () => {
      try {
        const token = await AsyncStorage.getItem("jwtToken");
        if (token) {
          processToken(token);
        }
      } catch (e) {
        console.error("Token kontrol hatası:", e);
      }
    };

    checkStoredToken();
    return unsubscribe;
  }, []);

  const value = {
    user,
    jwtToken,
    loading,
    backendAvailable,
    userProfile,
    // Eğer token'daki profil bilgilerini güncellemek gerekirse
    updateUserProfile: (newProfileData) => {
      if (userProfile) {
        setUserProfile({ ...userProfile, ...newProfileData });
      }
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthContext = () => useContext(AuthContext);
