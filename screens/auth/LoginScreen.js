import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import { loginUser, registerUser } from "../../services/authService";
import { theme, getStyles } from "../../theme";

const baseStyles = getStyles();

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert("Hata", "E-posta ve şifre gerekli.");
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        await loginUser(email, password);
      } else {
        await registerUser(email, password);
      }
    } catch (error) {
      let errorMessage = "İşlem sırasında bir hata oluştu.";

      if (error.code === "auth/invalid-email") {
        errorMessage = "Geçersiz e-posta adresi.";
      } else if (error.code === "auth/user-disabled") {
        errorMessage = "Bu kullanıcı devre dışı bırakılmış.";
      } else if (error.code === "auth/user-not-found") {
        errorMessage = "Bu e-posta adresine sahip bir kullanıcı bulunamadı.";
      } else if (error.code === "auth/wrong-password") {
        errorMessage = "Hatalı şifre.";
      } else if (error.code === "auth/email-already-in-use") {
        errorMessage = "Bu e-posta adresi zaten kullanılıyor.";
      } else if (error.code === "auth/weak-password") {
        errorMessage = "Şifre en az 6 karakter olmalıdır.";
      }

      Alert.alert("Hata", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.formContainer}>
        <Text style={styles.title}>{isLogin ? "Giriş Yap" : "Kayıt Ol"}</Text>

        <TextInput
          style={styles.input}
          placeholder="E-posta"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />

        <TextInput
          style={styles.input}
          placeholder="Şifre"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity
          style={styles.button}
          onPress={handleAuth}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? "İşleniyor..." : isLogin ? "Giriş Yap" : "Kayıt Ol"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
          <Text style={styles.switchText}>
            {isLogin
              ? "Hesabınız yok mu? Kayıt olun"
              : "Zaten hesabınız var mı? Giriş yapın"}
          </Text>
        </TouchableOpacity>

        {isLogin && (
          <TouchableOpacity
            onPress={() => navigation.navigate("ForgotPassword")}
          >
            <Text style={styles.forgotPasswordText}>Şifremi Unuttum</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  formContainer: {
    width: "100%",
    backgroundColor: theme.colors.card,
    borderRadius: theme.roundness.m,
    padding: theme.spacing.l,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    ...theme.typography.headerLarge,
    marginBottom: theme.spacing.l,
    textAlign: "center",
  },
  input: {
    ...baseStyles.input,
  },
  button: {
    ...baseStyles.button,
    marginTop: theme.spacing.m,
  },
  buttonText: {
    ...baseStyles.buttonText,
  },
  switchText: {
    marginTop: theme.spacing.m,
    textAlign: "center",
    color: theme.colors.primary,
  },
  forgotPasswordText: {
    marginTop: theme.spacing.m,
    textAlign: "center",
    color: theme.colors.primary,
    textDecorationLine: "underline",
  },
});

export default LoginScreen;
