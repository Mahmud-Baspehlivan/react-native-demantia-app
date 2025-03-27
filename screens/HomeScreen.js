import React, { useContext, useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { getAuth, signOut } from "firebase/auth";
import { AuthContext } from "../App";
import { Ionicons } from "@expo/vector-icons";

const HomeScreen = ({ navigation }) => {
  const { user, jwtToken } = useContext(AuthContext);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const auth = getAuth();

  useEffect(() => {
    const fetchData = async () => {
      if (!jwtToken) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch("YOUR_SPRING_BACKEND_URL/api/data", {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
        });

        if (!response.ok) {
          throw new Error("API isteği başarısız oldu");
        }

        const result = await response.json();
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
      await signOut(auth);
    } catch (error) {
      console.error("Çıkış yapılırken hata oluştu:", error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Ana Sayfa</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => navigation.navigate("Profile")}
          >
            <Ionicons name="person" size={24} color="#4285F4" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={handleLogout}>
            <Ionicons name="log-out" size={24} color="#4285F4" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.welcomeText}>Hoş geldiniz, {user?.email}</Text>

        {loading ? (
          <ActivityIndicator size="large" color="#4285F4" />
        ) : error ? (
          <View style={styles.messageContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => setLoading(true)}
            >
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
  headerButtons: {
    flexDirection: "row",
  },
  iconButton: {
    padding: 8,
    marginLeft: 10,
  },
  content: {
    flex: 1,
    padding: 20,
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
    color: "red",
    marginBottom: 10,
  },
  noDataText: {
    color: "#666",
  },
  retryButton: {
    backgroundColor: "#4285F4",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 5,
  },
  retryButtonText: {
    color: "white",
  },
  dataItem: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  dataTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  dataDescription: {
    color: "#666",
  },
});

export default HomeScreen;
