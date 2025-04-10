import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { useAuthContext } from "../context/AuthContext";
import { useProfileContext } from "../context/ProfileContext";
import AuthStack from "./AuthStack";
import AppStack from "./AppStack";
import TestStack from "./TestStack";
import LoadingScreen from "../screens/LoadingScreen";

const Stack = createStackNavigator();

export default function Navigation() {
  const { user, loading: authLoading } = useAuthContext();
  const { profileCompleted, profileLoading } = useProfileContext();

  const isLoading = authLoading || profileLoading;

  // Debug log
  if (!isLoading) {
    console.log("Navigation rendering:", {
      user: !!user,
      profileCompleted,
      profileLoading,
    });
  }

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return (
      <NavigationContainer>
        <AuthStack />
      </NavigationContainer>
    );
  }

  // Giriş yapan fakat profil tamamlamayan kullanıcılar için TestStack
  if (!profileCompleted) {
    console.log("Test stack gösteriliyor - profil tamamlanmamış");
    return (
      <NavigationContainer>
        <TestStack />
      </NavigationContainer>
    );
  }

  // Normal app flow
  return (
    <NavigationContainer>
      <AppStack />
    </NavigationContainer>
  );
}
