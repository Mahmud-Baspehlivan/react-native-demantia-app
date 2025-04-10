import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTestContext } from "../../context/TestContext";
import { theme, getStyles } from "../../theme";

const baseStyles = getStyles();

const TestStartScreen = ({ navigation }) => {
  const { startClassificationTest, loading, error } = useTestContext();
  const [retryCount, setRetryCount] = useState(0);

  const handleStartTest = async () => {
    try {
      const questions = await startClassificationTest();
      if (questions && questions.length > 0) {
        console.log(`Starting test with ${questions.length} questions`);
        navigation.navigate("TestQuestion");
      } else {
        console.error("No questions returned from startClassificationTest");
        Alert.alert(
          "Hata",
          "Test soruları yüklenemedi. Lütfen daha sonra tekrar deneyin."
        );
      }
    } catch (err) {
      console.error("Error in handleStartTest:", err);
      Alert.alert(
        "Hata",
        "Test başlatılırken bir hata oluştu. Lütfen tekrar deneyin."
      );
    }
  };

  const handleRetry = () => {
    setRetryCount(retryCount + 1);
    handleStartTest();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={theme.colors.background}
      />
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sınıflandırma Testi</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {error ? (
          <View style={styles.errorContainer}>
            <Ionicons
              name="alert-circle"
              size={50}
              color={theme.colors.error}
            />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={handleRetry}
              disabled={loading}
            >
              <Text style={styles.retryButtonText}>Tekrar Dene</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Teste Hoş Geldiniz</Text>
              <Text style={styles.description}>
                Bu test, durumunuzu değerlendirmek için tasarlanmış 7 temel
                sorudan oluşmaktadır. Soruları cevapladığınızda, size uygun bir
                sınıflandırma ve öneri sunulacaktır.
              </Text>

              <View style={styles.infoBox}>
                <Ionicons
                  name="information-circle"
                  size={24}
                  color={theme.colors.primary}
                />
                <Text style={styles.infoText}>
                  Test yaklaşık 5 dakika sürecektir. Lütfen her soruyu
                  dikkatlice okuyun ve size en uygun cevabı seçin.
                </Text>
              </View>

              <Text style={styles.subHeader}>Test İçeriği:</Text>
              <View style={styles.testInfoItem}>
                <Ionicons
                  name="checkmark-circle"
                  size={20}
                  color={theme.colors.success}
                />
                <Text style={styles.testInfoText}>
                  7 kişisel ve bilişsel soru
                </Text>
              </View>
              <View style={styles.testInfoItem}>
                <Ionicons
                  name="checkmark-circle"
                  size={20}
                  color={theme.colors.success}
                />
                <Text style={styles.testInfoText}>
                  Çoktan seçmeli basit format
                </Text>
              </View>
              <View style={styles.testInfoItem}>
                <Ionicons
                  name="checkmark-circle"
                  size={20}
                  color={theme.colors.success}
                />
                <Text style={styles.testInfoText}>
                  Sonuçlar anında değerlendirilir
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.startButton}
              onPress={handleStartTest}
              disabled={loading}
            >
              {loading ? (
                <>
                  <ActivityIndicator size="small" color="#fff" />
                  <Text style={styles.buttonText}>Yükleniyor...</Text>
                </>
              ) : (
                <>
                  <Ionicons name="play" size={20} color="#fff" />
                  <Text style={styles.buttonText}>Teste Başla</Text>
                </>
              )}
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 10,
    paddingBottom: 15,
    paddingHorizontal: 20,
    backgroundColor: theme.colors.card,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: theme.colors.primary,
  },
  content: {
    padding: 20,
  },
  card: {
    ...baseStyles.card,
    marginVertical: 10,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: theme.colors.primary,
    marginBottom: 15,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: theme.colors.text,
    marginBottom: 20,
  },
  infoBox: {
    backgroundColor: theme.colors.accent,
    borderRadius: 8,
    padding: 15,
    flexDirection: "row",
    marginBottom: 20,
    alignItems: "center",
  },
  infoText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    color: theme.colors.primary,
  },
  subHeader: {
    fontSize: 18,
    fontWeight: "bold",
    color: theme.colors.primary,
    marginBottom: 15,
  },
  testInfoItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  testInfoText: {
    marginLeft: 10,
    fontSize: 16,
    color: theme.colors.text,
  },
  startButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 10,
    paddingVertical: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    marginBottom: 30,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 10,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: theme.colors.error,
    textAlign: "center",
    marginTop: 10,
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 30,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default TestStartScreen;
