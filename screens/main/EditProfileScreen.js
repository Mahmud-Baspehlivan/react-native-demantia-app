import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuthContext } from "../../context/AuthContext";
import { updateUserProfile } from "../../services/userService";
import { theme, getStyles } from "../../theme";

const baseStyles = getStyles();

const EditProfileScreen = ({ navigation, route }) => {
  const { user, backendAvailable } = useAuthContext();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch current profile data if available
  useEffect(() => {
    if (route.params?.profileData) {
      const { name, phone, address } = route.params.profileData;
      setName(name || "");
      setPhone(phone || "");
      setAddress(address || "");
    }
  }, [route.params]);

  const handleSave = async () => {
    if (!backendAvailable) {
      Alert.alert(
        "Çevrimdışı Mod",
        "Sunucu bağlantısı olmadığı için profil güncellenemiyor. İnternet bağlantınızı kontrol edin."
      );
      return;
    }

    setLoading(true);
    try {
      const profileData = {
        name,
        phone,
        address,
        email: user.email, // Include email for reference
      };

      await updateUserProfile(profileData);
      Alert.alert("Başarılı", "Profil bilgileriniz güncellendi.", [
        { text: "Tamam", onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      console.error("Profil güncelleme hatası:", error);
      Alert.alert("Hata", "Profil güncellenirken bir sorun oluştu.");
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
        <Text style={styles.headerTitle}>Profil Düzenle</Text>
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
            Çevrimdışı mod - Değişiklikler kaydedilemeyecek
          </Text>
        </View>
      )}

      <ScrollView style={styles.content}>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Ad Soyad</Text>
          <TextInput
            style={baseStyles.input}
            value={name}
            onChangeText={setName}
            placeholder="Adınız Soyadınız"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>E-posta</Text>
          <TextInput
            style={[baseStyles.input, styles.disabledInput]}
            value={user?.email}
            editable={false}
          />
          <Text style={styles.helperText}>E-posta adresi değiştirilemez</Text>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Telefon</Text>
          <TextInput
            style={baseStyles.input}
            value={phone}
            onChangeText={setPhone}
            placeholder="Telefon numarası"
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Adres</Text>
          <TextInput
            style={[baseStyles.input, styles.textArea]}
            value={address}
            onChangeText={setAddress}
            placeholder="Açık adres"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        <TouchableOpacity
          style={[
            baseStyles.button,
            (loading || !backendAvailable) && styles.disabledButton,
          ]}
          onPress={handleSave}
          disabled={loading || !backendAvailable}
        >
          <Text style={baseStyles.buttonText}>
            {loading ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
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
  formGroup: {
    marginBottom: theme.spacing.l,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: theme.spacing.xs,
    color: theme.colors.text,
  },
  textArea: {
    height: 100,
    paddingTop: theme.spacing.m,
  },
  disabledInput: {
    backgroundColor: "#f0f0f0",
    color: theme.colors.placeholder,
  },
  helperText: {
    fontSize: 12,
    color: theme.colors.placeholder,
    marginTop: -theme.spacing.s,
    marginLeft: theme.spacing.xs,
  },
  disabledButton: {
    backgroundColor: theme.colors.placeholder,
  },
});

export default EditProfileScreen;
