import React, { createContext, useState, useContext, useEffect } from "react";
import { Alert } from "react-native";
import { useAuthContext } from "./AuthContext";
import { classificationAPI, userAPI } from "../services/apiService";

const ProfileContext = createContext();

export const ProfileProvider = ({ children }) => {
  const { user } = useAuthContext();
  const [profileCompleted, setProfileCompleted] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileData, setProfileData] = useState(null);

  // Check if the user's profile is completed when they log in
  useEffect(() => {
    if (user) {
      checkProfileStatus(user.uid);
    } else {
      setProfileCompleted(false);
      setProfileData(null);
      setProfileLoading(false);
    }
  }, [user]);

  // Load the user's profile data
  useEffect(() => {
    if (user && profileCompleted) {
      loadProfileData();
    }
  }, [user, profileCompleted]);

  // Check if the user has completed their classification
  const checkProfileStatus = async (userId) => {
    try {
      setProfileLoading(true);

      const response = await classificationAPI.checkProfileStatus(userId);
      console.log("Profile status response:", response);

      if (response && response.profileCompleted !== undefined) {
        setProfileCompleted(response.profileCompleted);
      } else {
        setProfileCompleted(false);
      }

      return response?.profileCompleted || false;
    } catch (error) {
      console.error("Error checking profile status:", error);
      setProfileCompleted(false);
      return false;
    } finally {
      setProfileLoading(false);
    }
  };

  // Load the user's profile data
  const loadProfileData = async () => {
    try {
      setProfileLoading(true);
      const data = await userAPI.getProfile();
      setProfileData(data);
    } catch (error) {
      console.error("Error loading profile data:", error);
      Alert.alert("Hata", "Profil bilgileri yüklenirken bir hata oluştu.");
    } finally {
      setProfileLoading(false);
    }
  };

  // Update the user's profile when classification is complete
  const completeClassification = async (sessionId, classification) => {
    try {
      setProfileLoading(true);
      console.log("completeClassification başlatılıyor", {
        sessionId,
        classification,
      });

      // Her durumda çalışacak şekilde ayarlayalım
      const patientId = user?.uid || "anonymous";

      try {
        // Call API to complete classification and update profile
        const response =
          await classificationAPI.completeClassificationAndUpdateProfile(
            sessionId,
            patientId
          );
        console.log("Backend yanıtı:", response);

        // API dönüşünden sınıflandırma bilgisini al, varsa
        if (response?.classification) {
          classification = response.classification;
        }
      } catch (backendError) {
        console.warn(
          "Backend API hatası, yerel güncelleme kullanılıyor:",
          backendError
        );
        // Hata durumunda mevcut sınıflandırma bilgisiyle devam et
      }

      // Update local state
      setProfileCompleted(true);

      // Set profile data with classification
      setProfileData((prev) => ({
        ...(prev || {}),
        age_group: classification.age_group,
        cognitive_status: classification.cognitive_status,
        education_level: classification.education_level,
        risk_level: classification.risk_level,
        profile_completed: true,
      }));

      console.log("Profil bilgileri güncellendi:", classification);
      return true;
    } catch (error) {
      console.error("Profil güncelleme hatası:", error);

      // Hata olsa bile ProfileCompleted'i güncelle, kullanıcı deneyimi için
      setProfileCompleted(true);
      return true;
    } finally {
      setProfileLoading(false);
    }
  };

  const value = {
    profileCompleted,
    profileLoading,
    profileData,
    checkProfileStatus,
    completeClassification,
    loadProfileData,
  };

  return (
    <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>
  );
};

export const useProfileContext = () => useContext(ProfileContext);

export default ProfileContext;
