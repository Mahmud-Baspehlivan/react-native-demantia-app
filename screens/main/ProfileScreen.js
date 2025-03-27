import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useAuthContext } from "../../context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { getUserProfile } from "../../services/userService";
import { theme, getStyles } from "../../theme";

const baseStyles = getStyles();

const ProfileScreen = ({ navigation }) => {
  const {
    user,
    backendAvailable,
    userProfile: tokenProfile,
  } = useAuthContext();
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Log the token profile to debug
    console.log("Token profile from context:", tokenProfile);

    // Token'dan gelen profil bilgilerini kullan veya API'den al
    const fetchUserProfile = async () => {
      try {
        // Log token profile for debugging
        console.log("JWT token profile data:", tokenProfile);

        if (tokenProfile && backendAvailable === false) {
          // Eğer backend erişilemiyorsa ve token'dan profil bilgileri varsa kullan
          setUserProfile(tokenProfile);
          setLoading(false);
          return;
        }

        // Backend erişilebilir durumdaysa API'den al
        const profileData = await getUserProfile();

        // Show API response for debugging
        console.log("API profile data:", profileData);

        // Merge token profile data with API data
        if (tokenProfile) {
          const mergedProfile = {
            ...profileData,
            // JWT token'dan gelen alanların önceliği daha yüksek
            name: tokenProfile.name || profileData.name,
            age: tokenProfile.age || profileData.age,
            gender: tokenProfile.gender || profileData.gender,
            role: tokenProfile.role || profileData.role,
            roles: tokenProfile.roles || profileData.roles,
          };
          setUserProfile(mergedProfile);
        } else {
          setUserProfile(profileData);
        }
      } catch (error) {
        console.error("Profil bilgileri alınırken hata oluştu:", error);

        // API'den alamazsak token'daki bilgileri kullan
        if (tokenProfile) {
          setUserProfile(tokenProfile);
        } else if (backendAvailable) {
          Alert.alert("Hata", "Profil bilgileri yüklenemedi.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [backendAvailable, tokenProfile]);

  // Age and gender formatting functions
  const formatAge = (age) => {
    if (age === null || age === undefined) return "Belirtilmemiş";
    return `${age} yaş`;
  };

  const formatGender = (gender) => {
    if (!gender) return "Belirtilmemiş";

    // Translate gender if needed
    switch (gender.toLowerCase()) {
      case "male":
        return "Erkek";
      case "female":
        return "Kadın";
      default:
        return gender;
    }
  };

  const handleUpdateProfile = () => {
    navigation.navigate("EditProfile", { profileData: userProfile });
  };

  // Debug output
  console.log("Current user profile state:", userProfile);

  return (
    <View style={styles.container}>
      <View style={baseStyles.header}>
        <TouchableOpacity onPress={() => navigation.navigate("HomeTab")}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
        <Text style={baseStyles.headerTitle}>Profil</Text>
        <View style={{ width: 24 }} />
      </View>

      {!backendAvailable && (
        <View style={styles.offlineWarning}>
          <Ionicons
            name="cloud-offline"
            size={16}
            color={theme.colors.warning}
          />
          <Text style={styles.offlineText}>
            Çevrimdışı mod - Token'dan gelen profil bilgileri görüntüleniyor
          </Text>
        </View>
      )}

      <ScrollView style={styles.content}>
        {loading ? (
          <ActivityIndicator
            size="large"
            color={theme.colors.primary}
            style={styles.loader}
          />
        ) : (
          <>
            <View style={styles.profileHeader}>
              <View style={styles.avatarContainer}>
                <Text style={styles.avatarText}>
                  {userProfile?.name?.charAt(0).toUpperCase() ||
                    user?.email?.charAt(0).toUpperCase() ||
                    "?"}
                </Text>
              </View>
              <Text style={styles.userName}>
                {userProfile?.name || user?.email}
              </Text>
              <Text style={styles.userEmail}>
                {userProfile?.email || user?.email}
              </Text>

              {userProfile?.roles && userProfile.roles.length > 0 && (
                <View style={styles.roleContainer}>
                  {userProfile.roles.map((role, index) => (
                    <Text key={index} style={styles.roleText}>
                      {role}
                    </Text>
                  ))}
                </View>
              )}
            </View>

            <View style={styles.infoSection}>
              <Text style={styles.sectionTitle}>Kişisel Bilgiler</Text>

              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Kullanıcı ID</Text>
                <Text
                  style={styles.infoValue}
                  numberOfLines={1}
                  ellipsizeMode="middle"
                >
                  {userProfile?.userId || "Belirtilmemiş"}
                </Text>
              </View>

              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Ad Soyad</Text>
                <Text style={styles.infoValue}>
                  {userProfile?.name || "Belirtilmemiş"}
                </Text>
              </View>

              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Yaş</Text>
                <Text style={styles.infoValue}>
                  {userProfile?.age
                    ? `${userProfile.age} yaş`
                    : "Belirtilmemiş"}
                </Text>
              </View>

              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Cinsiyet</Text>
                <Text style={styles.infoValue}>
                  {userProfile?.gender
                    ? formatGender(userProfile.gender)
                    : "Belirtilmemiş"}
                </Text>
              </View>

              {userProfile?.role && (
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Rol</Text>
                  <Text style={styles.infoValue}>{userProfile.role}</Text>
                </View>
              )}
            </View>

            <TouchableOpacity
              style={styles.updateButton}
              onPress={handleUpdateProfile}
            >
              <Text style={styles.updateButtonText}>Profili Güncelle</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...baseStyles.container,
  },
  offlineWarning: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF9C4",
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#FFEB3B",
  },
  offlineText: {
    color: theme.colors.warning,
    fontSize: 12,
    marginLeft: 6,
  },
  content: {
    flex: 1,
  },
  loader: {
    marginTop: 50,
  },
  profileHeader: {
    alignItems: "center",
    paddingVertical: 30,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: theme.colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },
  avatarText: {
    fontSize: 40,
    fontWeight: "bold",
    color: "white",
  },
  userName: {
    ...theme.typography.headerLarge,
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 16,
    color: theme.colors.placeholder,
  },
  infoSection: {
    ...baseStyles.card,
    marginHorizontal: theme.spacing.l,
  },
  sectionTitle: {
    ...theme.typography.subheader,
    marginBottom: theme.spacing.m,
  },
  infoItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  infoLabel: {
    color: theme.colors.placeholder,
    fontSize: 16,
  },
  infoValue: {
    fontWeight: "500",
    fontSize: 16,
  },
  updateButton: {
    ...baseStyles.button,
    marginHorizontal: theme.spacing.l,
    marginTop: theme.spacing.l,
    marginBottom: theme.spacing.xl,
  },
  updateButtonText: {
    ...baseStyles.buttonText,
  },
  roleContainer: {
    flexDirection: "row",
    marginTop: 5,
  },
  roleText: {
    color: "white",
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 3,
    marginHorizontal: 3,
    borderRadius: 12,
    fontSize: 12,
    overflow: "hidden",
  },
});

export default ProfileScreen;
