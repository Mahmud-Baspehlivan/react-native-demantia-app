import React from "react";
import { StatusBar } from "expo-status-bar";
import { View, Text } from "react-native";
import { AuthProvider } from "./context/AuthContext";
import Navigation from "./navigation";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { theme } from "./theme";

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <Navigation />
        <StatusBar style="auto" />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
