import React, { useContext, useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
} from "react-native";
import { logoutUser } from "../../services/authService";
import { useAuthContext } from "../../context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { dataAPI } from "../../services/apiService";
import { theme, getStyles } from "../../theme";

const baseStyles = getStyles();

const HomeScreen = ({ navigation }) => {
  const { user, jwtToken, backendAvailable } = useAuthContext();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!jwtToken) {
        setLoading(false);
        return;
      }

      try {
        const result = await dataAPI.getData();
        setData(result);
      } catch (err) {
        console.error("Veri çekme hatası:", err);
        setError("Verileri yüklerken bir hata oluştu.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [jwtToken]);

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (error) {
      console.error("Çıkış yapılırken hata oluştu:", error);
    }
  };

  const handleRetry = () => {
    setLoading(true);
    setError(null);
    fetchData();
  };

  return (
    <View style={styles.container}>
      <View style={baseStyles.header}>
        <Text style={baseStyles.headerTitle}>Ana Sayfa</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => navigation.navigate("ProfileTab")}
          >
            <Ionicons name="person" size={24} color={theme.colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={handleLogout}>
            <Ionicons name="log-out" size={24} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {!backendAvailable && (
        <View style={styles.offlineWarning}>
          <Ionicons
            name="cloud-offline"
            size={16}
            color={theme.colors.warning}
          />
          <Text style={styles.offlineText}>
            Çevrimdışı mod - Sunucu bağlantısı yok
          </Text>
        </View>
      )}

      <View style={styles.content}>
        <Text style={styles.welcomeText}>Hoş geldiniz, {user?.email}</Text>

        {loading ? (
          <ActivityIndicator size="large" color={theme.colors.primary} />
        ) : error ? (
          <View style={styles.messageContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
              <Text style={styles.retryButtonText}>Tekrar Dene</Text>
            </TouchableOpacity>
          </View>
        ) : data.length === 0 ? (
          <View style={styles.messageContainer}>
            <Text style={styles.noDataText}>Gösterilecek veri bulunamadı.</Text>
          </View>
        ) : (
          <FlatList
            data={data}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <View style={styles.dataItem}>
                <Text style={styles.dataTitle}>{item.title}</Text>
                <Text style={styles.dataDescription}>{item.description}</Text>
              </View>
            )}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...baseStyles.container,
  },
  headerButtons: {
    flexDirection: "row",
  },
  iconButton: {
    padding: 8,
    marginLeft: 10,
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
    padding: theme.spacing.l,
  },
  welcomeText: {
    fontSize: 16,
    marginBottom: 20,
  },
  messageContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    color: theme.colors.error,
    marginBottom: 10,
  },
  noDataText: {
    color: theme.colors.placeholder,
  },
  retryButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: theme.roundness.s,
  },
  retryButtonText: {
    color: "white",
  },
  dataItem: {
    ...baseStyles.card,
    marginVertical: theme.spacing.s,
  },
  dataTitle: {
    ...theme.typography.subheader,
    marginBottom: 5,
  },
  dataDescription: {
    color: theme.colors.text,
  },
});

export default HomeScreen;
