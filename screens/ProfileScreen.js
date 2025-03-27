import React, { useContext, useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { AuthContext } from "../App";
import { Ionicons } from "@expo/vector-icons";
import {
  getAuth,
  updateEmail,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from "firebase/auth";

const ProfileScreen = ({ navigation }) => {
  const { user, jwtToken } = useContext(AuthContext);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const auth = getAuth();

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!jwtToken) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          "YOUR_SPRING_BACKEND_URL/api/user/profile",
          {
            headers: {
              Authorization: `Bearer ${jwtToken}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Profil bilgileri alınamadı");
        }

        const profileData = await response.json();
        setUserProfile(profileData);
      } catch (error) {
        console.error("Profil bilgileri alınırken hata oluştu:", error);
        Alert.alert("Hata", "Profil bilgileri yüklenemedi.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [jwtToken]);

  const handleUpdateProfile = () => {
    // Bu fonksiyon profil güncelleme sayfasına yönlendirmek için kullanılabilir
    // Şimdilik bir alert gösteriyoruz
    Alert.alert("Bilgi", "Profil güncelleme özelliği henüz eklenmedi.");
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#4285F4" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profil</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        {loading ? (
          <ActivityIndicator
            size="large"
            color="#4285F4"
            style={styles.loader}
          />
        ) : (
          <>
            <View style={styles.profileHeader}>
              <View style={styles.avatarContainer}>
                <Text style={styles.avatarText}>
                  {user?.email?.charAt(0).toUpperCase() || "?"}
                </Text>
              </View>
              <Text style={styles.userName}>
                {userProfile?.name || user?.email}
              </Text>
              <Text style={styles.userEmail}>{user?.email}</Text>
            </View>

            <View style={styles.infoSection}>
              <Text style={styles.sectionTitle}>Kişisel Bilgiler</Text>

              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Ad Soyad</Text>
                <Text style={styles.infoValue}>
                  {userProfile?.name || "Belirtilmemiş"}
                </Text>
              </View>

              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Yaş</Text>
                <Text style={styles.infoValue}>
                  {userProfile?.age || "Belirtilmemiş"}
                </Text>
              </View>

              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Cinsiyet</Text>
                <Text style={styles.infoValue}>
                  {userProfile?.gender || "Belirtilmemiş"}
                </Text>
              </View>
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
    flex: 1,
    backgroundColor: "#f9f9f9",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 60,
    paddingBottom: 15,
    paddingHorizontal: 20,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
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
    backgroundColor: "#4285F4",
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
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 16,
    color: "#666",
  },
  infoSection: {
    backgroundColor: "white",
    marginHorizontal: 15,
    marginVertical: 10,
    borderRadius: 10,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
  },
  infoItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  infoLabel: {
    color: "#666",
    fontSize: 16,
  },
  infoValue: {
    fontWeight: "500",
    fontSize: 16,
  },
  updateButton: {
    backgroundColor: "#4285F4",
    marginHorizontal: 15,
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
    marginBottom: 30,
  },
  updateButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default ProfileScreen;
