import { apiRequest } from "./apiService";

/**
 * Get all classification questions
 */
export const getClassificationQuestions = async () => {
  return await apiRequest("/api/questions/question_tag/classification");
};

/**
 * Get a specific question by its number
 */
export const getQuestionByNumber = async (number) => {
  return await apiRequest(`/api/questions/question_number/${number}`);
};

/**
 * Start a classification test session
 */
export const startClassificationTest = async (patientId) => {
  return await apiRequest("/api/classification/start", {
    method: "POST",
    body: JSON.stringify({ patientId }),
  });
};

/**
 * Submit a response to a classification question
 */
export const submitResponse = async (
  sessionId,
  patientId,
  questionId,
  answer
) => {
  return await apiRequest("/api/classification/submit-response", {
    method: "POST",
    body: JSON.stringify({
      sessionId,
      patientId,
      questionId,
      answer,
    }),
  });
};

/**
 * Complete a classification test and get results
 */
export const completeClassificationTest = async (sessionId, patientId) => {
  return await apiRequest("/api/classification/complete", {
    method: "POST",
    body: JSON.stringify({
      sessionId,
      patientId,
    }),
  });
};

/**
 * Complete a classification test and update user profile with assigned question tag
 */
export const completeClassificationAndUpdateProfile = async (
  sessionId,
  patientId
) => {
  return await apiRequest("/api/classification/complete-and-update", {
    method: "POST",
    body: JSON.stringify({
      sessionId,
      patientId,
    }),
  });
};
