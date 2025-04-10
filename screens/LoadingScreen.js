import React from "react";
import { StyleSheet, View, ActivityIndicator, Text, Image } from "react-native";
import { StatusBar } from "expo-status-bar";
import { theme } from "../theme";

/**
 * LoadingScreen component displays a loading indicator
 * Used during app initialization, authentication, and data loading
 */
const LoadingScreen = ({ message = "Yükleniyor..." }) => {
  return (
    <View style={styles.container}>
      <StatusBar style="auto" />

      {/* App Logo */}
      <Image
        source={require("../assets/favicon.png")}
        style={styles.logo}
        resizeMode="contain"
      />

      {/* Loading Indicator */}
      <ActivityIndicator
        size="large"
        color={theme.colors.primary}
        style={styles.loader}
      />

      {/* Loading Message */}
      <Text style={styles.message}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 40,
  },
  loader: {
    marginBottom: 20,
  },
  message: {
    fontSize: 16,
    color: theme.colors.primary,
    textAlign: "center",
  },
});

export default LoadingScreen;
