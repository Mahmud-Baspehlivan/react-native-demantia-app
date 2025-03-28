import React, { useEffect, useState, useCallback } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Dimensions,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Platform,
} from "react-native";
import { useAuthContext } from "../../context/AuthContext";
import { getUserProfile } from "../../services/userService";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect } from "@react-navigation/native";

const { width } = Dimensions.get("window");
const AVATAR_SIZE = 120;
const IS_IOS = Platform.OS === "ios";
const STATUS_BAR_HEIGHT = IS_IOS ? 44 : StatusBar.currentHeight || 0;

const ProfileScreen = ({ navigation }) => {
  const {
    user,
    userProfile: tokenProfile,
    backendAvailable,
  } = useAuthContext();
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Veri yükleme
  useFocusEffect(
    useCallback(() => {
      const fetchProfile = async () => {
        try {
          if (tokenProfile && !backendAvailable) {
            setUserProfile(tokenProfile);
          } else {
            const profile = await getUserProfile();
            setUserProfile({
              ...tokenProfile,
              ...profile,
            });
          }
        } catch (error) {
          console.error("Profil yüklenemedi:", error);
          if (tokenProfile) {
            setUserProfile(tokenProfile);
          }
        } finally {
          setLoading(false);
        }
      };

      fetchProfile();
    }, [backendAvailable, tokenProfile])
  );

  const formatGender = (gender) => {
    if (!gender) return "Belirtilmemiş";
    return gender.toLowerCase() === "female" ? "Kadın" : "Erkek";
  };

  const getInitials = () => {
    if (!userProfile?.name) return "?";
    return userProfile.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  // Bilgi Kartı Bileşeni
  const InfoCard = ({ icon, title, value }) => (
    <View style={styles.infoCard}>
      <View style={styles.infoIconContainer}>
        <Ionicons name={icon} size={24} color="#0f3c4c" />
      </View>
      <View style={styles.infoContent}>
        <Text style={styles.infoTitle}>{title}</Text>
        <Text style={styles.infoValue}>{value || "Belirtilmemiş"}</Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0f3c4c" />
        <Text style={styles.loadingText}>Profiliniz yükleniyor...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0f3c4c" />

      {/* Üst Kısım */}
      <LinearGradient
        colors={["#0f3c4c", "#164863"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          {/* Geri Düğmesi */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>

          {/* Çevrimdışı Banner */}
          {!backendAvailable && (
            <View style={styles.offlineBanner}>
              <Ionicons name="cloud-offline" size={16} color="#fff" />
              <Text style={styles.offlineText}>Çevrimdışı Mod</Text>
            </View>
          )}
        </View>
      </LinearGradient>

      {/* Profil Kartı */}
      <View style={styles.profileCardContainer}>
        <View style={styles.profileCard}>
          <View style={styles.avatarSection}>
            <View
              style={
                Platform.OS === "ios"
                  ? styles.avatarContainerIOS
                  : styles.avatarContainerAndroid
              }
            >
              {userProfile?.image ? (
                <Image
                  source={{ uri: userProfile.image }}
                  style={styles.avatar}
                />
              ) : (
                <View style={styles.initialsAvatar}>
                  <Text style={styles.initialsText}>{getInitials()}</Text>
                </View>
              )}
            </View>

            <View style={styles.nameSection}>
              <Text style={styles.userName}>
                {userProfile?.name || user?.email || "Kullanıcı"}
              </Text>
              <Text style={styles.userRole}>
                {userProfile?.role || "Hasta"}
              </Text>
            </View>
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{userProfile?.age || "-"}</Text>
              <Text style={styles.statLabel}>Yaş</Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {formatGender(userProfile?.gender)}
              </Text>
              <Text style={styles.statLabel}>Cinsiyet</Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {userProfile?.education || "-"}
              </Text>
              <Text style={styles.statLabel}>Eğitim</Text>
            </View>
          </View>
        </View>
      </View>

      {/* İçerik Kısmı */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Kişisel Bilgiler</Text>

          <InfoCard
            icon="person"
            title="Doktor"
            value={`Dr. ${userProfile?.doctor || "Mehmet"}`}
          />

          <InfoCard
            icon="mail"
            title="E-posta"
            value={userProfile?.email || user?.email}
          />

          <InfoCard icon="call" title="Telefon" value={userProfile?.phone} />

          <InfoCard
            icon="location"
            title="Adres"
            value={userProfile?.address}
          />
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Sağlık Bilgileri</Text>

          <View
            style={
              Platform.OS === "ios"
                ? styles.appointmentCardIOS
                : styles.appointmentCardAndroid
            }
          >
            <View style={styles.appointmentHeader}>
              <Ionicons name="calendar" size={22} color="#0f3c4c" />
              <Text style={styles.appointmentTitle}>Sonraki Randevu</Text>
            </View>

            <View style={styles.appointmentContent}>
              <Text style={styles.appointmentDate}>15 Ekim 2023</Text>
              <Text style={styles.appointmentTime}>14:30</Text>
            </View>
          </View>
        </View>

        {/* Butonlar */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={
              Platform.OS === "ios"
                ? styles.editButtonIOS
                : styles.editButtonAndroid
            }
            onPress={() =>
              navigation.navigate("EditProfile", { profileData: userProfile })
            }
          >
            <Ionicons name="create-outline" size={20} color="#fff" />
            <Text style={styles.buttonText}>Profil Düzenle</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={
              Platform.OS === "ios"
                ? styles.testButtonIOS
                : styles.testButtonAndroid
            }
            onPress={() => navigation.navigate("TestStartScreen")}
          >
            <Ionicons name="play" size={20} color="#fff" />
            <Text style={styles.buttonText}>Teste Başla</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f1ded0",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f1ded0",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#0f3c4c",
  },
  header: {
    height: 120 + STATUS_BAR_HEIGHT,
    paddingTop: STATUS_BAR_HEIGHT,
  },
  headerContent: {
    flex: 1,
    paddingHorizontal: 16,
    justifyContent: "flex-start",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  offlineBanner: {
    position: "absolute",
    top: STATUS_BAR_HEIGHT + 10,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 15,
  },
  offlineText: {
    color: "#fff",
    fontSize: 12,
    marginLeft: 5,
    fontWeight: "500",
  },
  profileCardContainer: {
    marginTop: -40,
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  profileCard: {
    backgroundColor: "#fff",
    borderRadius: 15,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  avatarSection: {
    flexDirection: "row",
    padding: 16,
    alignItems: "center",
  },
  avatarContainerIOS: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    backgroundColor: "#e1e1e1",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  avatarContainerAndroid: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    backgroundColor: "#e1e1e1",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#fff",
    elevation: 3,
  },
  avatar: {
    width: "100%",
    height: "100%",
    borderRadius: AVATAR_SIZE / 2,
  },
  initialsAvatar: {
    width: "100%",
    height: "100%",
    borderRadius: AVATAR_SIZE / 2,
    backgroundColor: "#26657F",
    justifyContent: "center",
    alignItems: "center",
  },
  initialsText: {
    fontSize: 40,
    fontWeight: "bold",
    color: "#fff",
  },
  nameSection: {
    marginLeft: 16,
    flex: 1,
  },
  userName: {
    fontSize: 22,
    fontWeight: "700",
    color: "#26657F",
    marginBottom: 4,
  },
  userRole: {
    fontSize: 14,
    color: "#666",
  },
  statsContainer: {
    flexDirection: "row",
    backgroundColor: "#f9f9f9",
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingVertical: 12,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0f3c4c",
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
  },
  statDivider: {
    width: 1,
    height: "70%",
    backgroundColor: "#ddd",
    alignSelf: "center",
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  sectionContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0f3c4c",
    marginBottom: 12,
    marginLeft: 4,
  },
  infoCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  infoIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f1ded0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
    justifyContent: "center",
  },
  infoTitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#26657F",
  },
  appointmentCardIOS: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  appointmentCardAndroid: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    elevation: 2,
  },
  appointmentHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  appointmentTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0f3c4c",
    marginLeft: 8,
  },
  appointmentContent: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  appointmentDate: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  appointmentTime: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0f3c4c",
  },
  buttonContainer: {
    marginVertical: 20,
  },
  editButtonIOS: {
    backgroundColor: "#26657F",
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  editButtonAndroid: {
    backgroundColor: "#26657F",
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    elevation: 2,
  },
  testButtonIOS: {
    backgroundColor: "#0f3c4c",
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  testButtonAndroid: {
    backgroundColor: "#0f3c4c",
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
});

export default ProfileScreen;
