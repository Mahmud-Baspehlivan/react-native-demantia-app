import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTestContext } from "../../context/TestContext";
import { useAuthContext } from "../../context/AuthContext";
import { useProfileContext } from "../../context/ProfileContext";
import { theme, getStyles } from "../../theme";
import { CommonActions } from "@react-navigation/native";

const baseStyles = getStyles();

const TestResultScreen = ({ navigation }) => {
  const { testResult, sessionId, resetTest } = useTestContext();
  const { user } = useAuthContext();
  const { completeClassification } = useProfileContext();
  const [saving, setSaving] = useState(false);

  const getRiskLevelColor = (riskLevel) => {
    if (!riskLevel) return "#9E9E9E";
    switch (riskLevel.toLowerCase()) {
      case "düşük":
        return theme.colors.success;
      case "orta":
        return theme.colors.warning;
      case "yüksek":
        return theme.colors.error;
      default:
        return theme.colors.primary;
    }
  };

  const getRecommendations = (riskLevel) => {
    if (!riskLevel) return [];

    switch (riskLevel.toLowerCase()) {
      case "düşük":
        return [
          "Düzenli bilişsel aktivitelere katılın",
          "Sağlıklı beslenme alışkanlıklarınızı sürdürün",
          "Yılda bir kez kontrol muayenesi yaptırın",
        ];
      case "orta":
        return [
          "Haftalık bilişsel egzersizler yapın",
          "Sosyal aktivitelere daha fazla katılın",
          "6 ayda bir nöroloji uzmanına danışın",
          "Düzenli uyku ve egzersiz rutini oluşturun",
        ];
      case "yüksek":
        return [
          "En kısa sürede uzman bir nörologa başvurun",
          "Günlük bilişsel egzersizlere başlayın",
          "Aile üyelerinizi durumunuz hakkında bilgilendirin",
          "İlaç tedavisi için doktorunuza danışın",
          "Düzenli takip için bir sağlık programı oluşturun",
        ];
      default:
        return [
          "Düzenli sağlık kontrollerinizi yaptırın",
          "Bilişsel aktivitelerle zihninizi aktif tutun",
          "Sağlıklı beslenmeye özen gösterin",
        ];
    }
  };

  const handleFinishTest = async () => {
    try {
      setSaving(true);

      console.log("Testi tamamlama işlemi başlatılıyor...");
      console.log("Session ID:", sessionId);
      console.log("User:", user?.uid);
      console.log("Test result:", testResult);

      // Complete classification and update user profile
      if (sessionId && testResult) {
        try {
          const patientId = user?.uid || "anonymous";
          await completeClassification(sessionId, testResult);
          console.log("Classification tamamlandı");
        } catch (error) {
          console.error("Classification tamamlama hatası:", error);
          // Hata olsa bile devam et
        }
      }

      // Reset the test state
      resetTest();

      try {
        // Navigation problemi yaratmayacak şekilde basit bir yaklaşımla yönlendir
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: "Main" }],
          })
        );
      } catch (navError) {
        console.error("Navigation reset hatası:", navError);

        // Alternatif olarak goBack denemesi yap
        try {
          navigation.popToTop();
        } catch (popError) {
          console.error("Navigation popToTop hatası:", popError);
        }
      }
    } catch (error) {
      console.error("Testi tamamlama hatası:", error);
      Alert.alert(
        "Hata",
        "Test sonuçları kaydedilirken bir hata oluştu. Lütfen tekrar deneyin."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Test Sonuçları</Text>
        <TouchableOpacity onPress={handleFinishTest} style={styles.closeButton}>
          <Ionicons name="close" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.resultCard}>
          <View style={styles.resultHeader}>
            <Ionicons name="analytics" size={28} color={theme.colors.primary} />
            <Text style={styles.resultTitle}>Değerlendirme Sonucu</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.resultItem}>
            <Text style={styles.resultLabel}>Yaş Grubu</Text>
            <Text style={styles.resultValue}>
              {testResult?.age_group || "Belirsiz"}
            </Text>
          </View>

          <View style={styles.resultItem}>
            <Text style={styles.resultLabel}>Bilişsel Durum</Text>
            <Text style={styles.resultValue}>
              {testResult?.cognitive_status || "Belirsiz"}
            </Text>
          </View>

          <View style={styles.resultItem}>
            <Text style={styles.resultLabel}>Eğitim Düzeyi</Text>
            <Text style={styles.resultValue}>
              {testResult?.education_level || "Belirsiz"}
            </Text>
          </View>

          <View style={styles.resultItemLarge}>
            <Text style={styles.resultLabel}>Risk Seviyesi</Text>
            <View
              style={[
                styles.riskLevelBadge,
                {
                  backgroundColor: getRiskLevelColor(testResult?.risk_level),
                },
              ]}
            >
              <Text style={styles.riskLevelText}>
                {testResult?.risk_level || "Belirsiz"}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.recommendationsCard}>
          <View style={styles.recommendationsHeader}>
            <Ionicons name="medical" size={28} color={theme.colors.primary} />
            <Text style={styles.recommendationsTitle}>Öneriler</Text>
          </View>

          <View style={styles.divider} />

          {getRecommendations(testResult?.risk_level).map(
            (recommendation, index) => (
              <View key={index} style={styles.recommendationItem}>
                <Ionicons
                  name="checkmark-circle"
                  size={20}
                  color={theme.colors.primary}
                />
                <Text style={styles.recommendationText}>{recommendation}</Text>
              </View>
            )
          )}

          <View style={styles.noteContainer}>
            <Ionicons
              name="information-circle"
              size={20}
              color={theme.colors.primary}
            />
            <Text style={styles.noteText}>
              Bu sonuçlar sadece bir ön değerlendirme niteliğindedir. Kesin tanı
              için mutlaka bir sağlık uzmanına başvurunuz.
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.finishButton}
          onPress={handleFinishTest}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.finishButtonText}>Profilimi Tamamla</Text>
          )}
        </TouchableOpacity>
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
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: theme.colors.primary,
  },
  closeButton: {
    padding: 8,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  resultCard: {
    ...baseStyles.card,
    marginBottom: 20,
  },
  resultHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  resultTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: theme.colors.primary,
    marginLeft: 10,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: 15,
  },
  resultItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  resultItemLarge: {
    marginTop: 10,
  },
  resultLabel: {
    fontSize: 16,
    color: "#666666",
  },
  resultValue: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.primary,
  },
  riskLevelBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 5,
  },
  riskLevelText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  recommendationsCard: {
    ...baseStyles.card,
    marginBottom: 20,
  },
  recommendationsHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  recommendationsTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: theme.colors.primary,
    marginLeft: 10,
  },
  recommendationItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 15,
  },
  recommendationText: {
    fontSize: 16,
    color: theme.colors.text,
    marginLeft: 10,
    flex: 1,
  },
  noteContainer: {
    flexDirection: "row",
    backgroundColor: theme.colors.accent,
    padding: 15,
    borderRadius: 8,
    marginTop: 10,
  },
  noteText: {
    fontSize: 14,
    color: theme.colors.primary,
    marginLeft: 10,
    flex: 1,
  },
  finishButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  finishButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default TestResultScreen;
