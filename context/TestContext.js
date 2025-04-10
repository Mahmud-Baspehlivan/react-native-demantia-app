import React, { createContext, useState, useContext } from "react";
import { Alert } from "react-native";
import { classificationAPI } from "../services/apiService";
import { useAuthContext } from "./AuthContext";

const TestContext = createContext();

export const TestProvider = ({ children, initialMode = "standard" }) => {
  const { user, completeUserClassification } = useAuthContext();
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [sessionId, setSessionId] = useState(null);
  const [testCompleted, setTestCompleted] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [error, setError] = useState(null);
  const [mode, setMode] = useState(initialMode); // "classification" or "standard"

  // Fetch all classification questions
  const fetchClassificationQuestions = async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedQuestions =
        await classificationAPI.getClassificationQuestions();

      if (!fetchedQuestions || fetchedQuestions.length === 0) {
        throw new Error("Sunucudan soru alınamadı");
      }

      // Sort questions by question_number - özel olarak bu sıralamayı vurguluyoruz
      const sortedQuestions = [...fetchedQuestions].sort((a, b) => {
        // Önce question_number alanını sayısal değere dönüştürüyoruz
        const numA = parseInt(a.question_number || "0");
        const numB = parseInt(b.question_number || "0");
        return numA - numB;
      });

      console.log(
        `${sortedQuestions.length} soru yüklendi ve şu sırayla gösterilecek:`,
        sortedQuestions.map((q) => q.question_number).join(", ")
      );

      setQuestions(sortedQuestions);
      return sortedQuestions;
    } catch (error) {
      console.error("Failed to fetch classification questions:", error);
      setError("Sorular yüklenemedi");

      // Try to use mock data if available
      const mockQuestions = [
        {
          id: "class_q1",
          question_text: "Kaç yaşındasınız?",
          question_type: "multiple_choice",
          options: ["50-59", "60-69", "70-79", "80+"],
          question_number: "1",
          category: "demographic",
        },
        {
          id: "class_q2",
          question_text: "Cinsiyetinizi belirtiniz.",
          question_type: "multiple_choice",
          options: ["Kadın", "Erkek"],
          question_number: "2",
          category: "demographic",
        },
        {
          id: "class_q3",
          question_text: "Eğitim seviyeniz nedir?",
          question_type: "multiple_choice",
          options: ["İlkokul veya daha az", "Lise", "Üniversite ve üstü"],
          question_number: "3",
          category: "education",
        },
        {
          id: "class_q4",
          question_text: "Son 6 ay içinde unutkanlık yaşadınız mı?",
          question_type: "multiple_choice",
          options: ["Evet", "Hayır"],
          question_number: "4",
          category: "cognitive_status",
        },
        {
          id: "class_q5",
          question_text:
            "Son 6 ayda günlük işlerinizi yapmakta zorlanıyor musunuz?",
          question_type: "multiple_choice",
          options: ["Evet", "Bazen", "Hayır"],
          question_number: "5",
          category: "cognitive_status",
        },
        {
          id: "class_q6",
          question_text: "Ailenizde demans/Alzheimer hastalığı öyküsü var mı?",
          question_type: "multiple_choice",
          options: ["Evet", "Hayır", "Bilmiyorum"],
          question_number: "6",
          category: "medical",
        },
        {
          id: "class_q7",
          question_text:
            "Günlük yaşamınızda ne sıklıkla sosyal aktiviteler yaparsınız?",
          question_type: "multiple_choice",
          options: ["Hiç", "Nadiren", "Bazen", "Sıklıkla"],
          question_number: "7",
          category: "social_activity",
        },
      ];

      setQuestions(mockQuestions);
      console.log("Using mock questions instead");
      return mockQuestions;
    } finally {
      setLoading(false);
    }
  };

  // Start a new classification test
  const startClassificationTest = async () => {
    setLoading(true);
    setError(null);
    try {
      // Reset the test state
      setAnswers({});
      setCurrentQuestionIndex(0);
      setTestCompleted(false);
      setTestResult(null);

      // Fetch questions if not already loaded
      let testQuestions = questions;
      if (!testQuestions || testQuestions.length === 0) {
        console.log("No questions loaded, fetching questions...");
        testQuestions = await fetchClassificationQuestions();

        if (!testQuestions || testQuestions.length === 0) {
          throw new Error("Sorular yüklenemedi");
        }
      }

      // Start a new test session
      const patientId = user?.uid || "anonymous";
      console.log(`Starting test session for patient: ${patientId}`);

      try {
        const response = await classificationAPI.startClassificationTest(
          patientId
        );
        console.log("Test session started:", response);
        setSessionId(response.sessionId);
      } catch (sessionError) {
        console.error("Error starting test session:", sessionError);
        // Generate a mock session ID as fallback
        const mockSessionId = `mock_session_${Date.now()}`;
        console.log("Using mock session ID:", mockSessionId);
        setSessionId(mockSessionId);
      }

      return testQuestions;
    } catch (error) {
      console.error("Failed to start classification test:", error);
      setError("Test başlatılamadı: " + error.message);
      Alert.alert(
        "Hata",
        "Test başlatılırken bir hata oluştu. Lütfen daha sonra tekrar deneyin."
      );
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Submit an answer for the current question
  const submitAnswer = async (questionId, answer) => {
    setLoading(true);
    try {
      if (!questionId || answer === null || answer === undefined) {
        console.warn("Invalid answer submission:", { questionId, answer });
        return false;
      }

      // Save the answer locally
      const updatedAnswers = { ...answers, [questionId]: answer };
      setAnswers(updatedAnswers);
      console.log(
        `Answer submitted: Q${
          currentQuestionIndex + 1
        } (${questionId}) = ${answer}`
      );

      // Submit the answer to the backend if available
      try {
        const patientId = user?.uid || "anonymous";
        if (sessionId) {
          const response = await classificationAPI.submitResponse(
            sessionId,
            patientId,
            questionId,
            answer
          );
          console.log("Response submitted to backend:", response);
        }
      } catch (submitError) {
        console.error("Error submitting response to backend:", submitError);
        // Continue anyway since we saved the answer locally
      }

      // Move to the next question if not at the end
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        return true;
      } else {
        // If this was the last question, complete the test
        await completeTest();
        return false;
      }
    } catch (error) {
      console.error("Failed to submit answer:", error);
      Alert.alert(
        "Hata",
        "Cevap gönderilirken bir hata oluştu. Lütfen tekrar deneyin."
      );
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Complete the test and get results
  const completeTest = async () => {
    setLoading(true);
    try {
      console.log("Completing test...");
      let result = null;
      const patientId = user?.uid || "anonymous";

      // Submit completion to the backend if available
      try {
        if (sessionId) {
          result = await classificationAPI.completeClassificationTest(
            sessionId,
            patientId
          );
          console.log("Test completed with result:", result);
        }
      } catch (completeError) {
        console.error("Error completing test with backend:", completeError);
      }

      // If backend didn't provide results, generate them locally
      if (!result || !result.classification) {
        result = {
          classification: determineClassificationFromAnswers(),
        };
        console.log("Generated local classification:", result.classification);
      }

      setTestResult(result.classification);
      setTestCompleted(true);

      // If this is a classification test, update user's profile with the results
      if (mode === "classification" && user) {
        await completeUserClassification(user.uid, result.classification);
        console.log("User profile updated with classification results");
      }

      return result.classification;
    } catch (error) {
      console.error("Failed to complete test:", error);
      Alert.alert(
        "Hata",
        "Test tamamlanırken bir hata oluştu. Sonuçlar kaydedilmemiş olabilir."
      );

      // Generate a backup result
      const backupResult = {
        age_group: "60-69",
        cognitive_status: "Hafif Bilişsel Bozulma",
        education_level: "Lise",
        risk_level: "Orta",
      };

      setTestResult(backupResult);
      setTestCompleted(true);
      return backupResult;
    } finally {
      setLoading(false);
    }
  };

  // Determine classification based on answers when backend is not available
  const determineClassificationFromAnswers = () => {
    let ageGroup = "60-69";
    let cognitiveStatus = "Normal";
    let educationLevel = "Lise";
    let riskLevel = "Orta";

    // Process each question and answer
    for (const q of questions) {
      const answer = answers[q.id];
      if (!answer) continue;

      if (
        q.category === "demographic" &&
        q.question_text.toLowerCase().includes("yaş")
      ) {
        ageGroup = answer;
      }

      if (q.category === "education") {
        if (answer.includes("İlkokul")) {
          educationLevel = "İlkokul ve altı";
        } else if (answer.includes("Lise")) {
          educationLevel = "Lise";
        } else if (answer.includes("Üniversite")) {
          educationLevel = "Üniversite";
        }
      }

      if (
        q.category === "cognitive_status" &&
        (q.question_text.includes("unutkanlık") ||
          q.question_text.includes("zorlan"))
      ) {
        if (answer === "Evet" || answer === "Bazen") {
          cognitiveStatus = "Hafif Bilişsel Bozulma";
        }
      }

      if (q.category === "medical" && q.question_text.includes("demans")) {
        if (answer === "Evet") {
          riskLevel = "Yüksek";
        }
      }
    }

    // Final risk level calculation
    if (cognitiveStatus === "Hafif Bilişsel Bozulma") {
      const age = parseInt(ageGroup.split("-")[0]);
      if (age >= 70) {
        riskLevel = "Yüksek";
      } else {
        riskLevel = "Orta";
      }
    } else if (parseInt(ageGroup.split("-")[0]) < 60) {
      riskLevel = "Düşük";
    }

    return {
      age_group: ageGroup,
      cognitive_status: cognitiveStatus,
      education_level: educationLevel,
      risk_level: riskLevel,
    };
  };

  // Reset the test
  const resetTest = () => {
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setAnswers({});
    setSessionId(null);
    setTestCompleted(false);
    setTestResult(null);
    setError(null);
  };

  // Get a specific question by number
  const getQuestionByNumber = async (number) => {
    try {
      return await classificationAPI.getQuestionByNumber(number);
    } catch (error) {
      console.error(`Failed to fetch question number ${number}:`, error);
      return null;
    }
  };

  const value = {
    loading,
    questions,
    currentQuestionIndex,
    currentQuestion: questions[currentQuestionIndex],
    answers,
    sessionId,
    testCompleted,
    testResult,
    error,
    mode,
    fetchClassificationQuestions,
    startClassificationTest,
    submitAnswer,
    completeTest,
    resetTest,
    getQuestionByNumber,
    setMode,
  };

  return <TestContext.Provider value={value}>{children}</TestContext.Provider>;
};

export const useTestContext = () => useContext(TestContext);

export default TestContext;
