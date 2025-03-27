import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../../config/firebase";
import { theme, getStyles } from "../../theme";
import { Ionicons } from "@expo/vector-icons";

const baseStyles = getStyles();

const ForgotPasswordScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async () => {
    if (!email) {
      Alert.alert("Hata", "Lütfen e-posta adresinizi girin.");
      return;
    }

    setLoading(true);

    try {
      await sendPasswordResetEmail(auth, email);
      Alert.alert(
        "Şifre Sıfırlama",
        "Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.",
        [{ text: "Tamam", onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      let errorMessage = "Şifre sıfırlama işlemi sırasında bir hata oluştu.";

      if (error.code === "auth/invalid-email") {
        errorMessage = "Geçersiz e-posta adresi.";
      } else if (error.code === "auth/user-not-found") {
        errorMessage = "Bu e-posta adresi ile ilişkili bir hesap bulunamadı.";
      }

      Alert.alert("Hata", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Şifremi Unuttum</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        <Text style={styles.description}>
          Şifrenizi sıfırlamak için e-posta adresinizi girin. Size şifre
          sıfırlama bağlantısı göndereceğiz.
        </Text>

        <TextInput
          style={baseStyles.input}
          placeholder="E-posta"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />

        <TouchableOpacity
          style={baseStyles.button}
          onPress={handleResetPassword}
          disabled={loading}
        >
          <Text style={baseStyles.buttonText}>
            {loading ? "İşleniyor..." : "Şifre Sıfırlama Bağlantısı Gönder"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...baseStyles.container,
  },
  header: {
    ...baseStyles.header,
  },
  headerTitle: {
    ...baseStyles.headerTitle,
  },
  content: {
    flex: 1,
    padding: theme.spacing.l,
  },
  description: {
    fontSize: 16,
    marginBottom: theme.spacing.l,
    color: theme.colors.text,
  },
});

export default ForgotPasswordScreen;
