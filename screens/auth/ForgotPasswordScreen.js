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
import { Ionicons } from "@expo/vector-icons";

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
          <Ionicons name="arrow-back" size={24} color="#0f3c4c" />
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
          style={styles.input}
          placeholder="E-posta"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />

        <TouchableOpacity
          style={styles.button}
          onPress={handleResetPassword}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? "İşleniyor..." : "Şifre Sıfırlama Bağlantısı Gönder"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f1ded0",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 60,
    paddingBottom: 15,
    paddingHorizontal: 20,
    backgroundColor: "#fff",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#26657F",
  },
  content: {
    flex: 1,
    padding: 20,
  },
  description: {
    fontSize: 16,
    marginBottom: 20,
    color: "#26657F",
  },
  input: {
    width: "100%",
    height: 50,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 15,
    backgroundColor: "#f9f9f9",
    marginBottom: 15,
  },
  button: {
    backgroundColor: "#0f3c4c",
    borderRadius: 8,
    paddingVertical: 15,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default ForgotPasswordScreen;
