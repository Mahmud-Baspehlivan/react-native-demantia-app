import React from "react";
import { View, ActivityIndicator, StyleSheet, Text } from "react-native";
import { theme } from "../theme";

const LoadingScreen = ({ message = "Yükleniyor..." }) => {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={theme.colors.primary} />
      <Text style={styles.message}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.background,
  },
  message: {
    marginTop: 16,
    fontSize: 16,
    color: theme.colors.text,
  },
});

export default LoadingScreen;
