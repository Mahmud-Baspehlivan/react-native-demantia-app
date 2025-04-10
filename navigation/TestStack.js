import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import TestStartScreen from "../screens/test/TestStartScreen";
import TestQuestionScreen from "../screens/test/TestQuestionScreen";
import TestResultScreen from "../screens/test/TestResultScreen";
import { TestProvider } from "../context/TestContext";

const Stack = createStackNavigator();

const TestStack = () => {
  return (
    <TestProvider>
      <Stack.Navigator
        initialRouteName="TestStart"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="TestStart" component={TestStartScreen} />
        <Stack.Screen name="TestQuestion" component={TestQuestionScreen} />
        <Stack.Screen name="TestResult" component={TestResultScreen} />
      </Stack.Navigator>
    </TestProvider>
  );
};

export default TestStack;
