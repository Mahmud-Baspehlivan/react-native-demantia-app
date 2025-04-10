import React from "react";
import { StatusBar } from "expo-status-bar";
import { AuthProvider } from "./context/AuthContext";
import Navigation from "./navigation";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { theme } from "./theme";
import { TestProvider } from "./context/TestContext";
import { ProfileProvider } from "./context/ProfileContext";

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <ProfileProvider>
          <TestProvider>
            <Navigation />
            <StatusBar style="auto" />
          </TestProvider>
        </ProfileProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
