import { apiRequest } from "./apiService";
import { config } from "../config/api";

/**
 * Get user profile information
 */
export const getUserProfile = async () => {
  return await apiRequest(config.endpoints.user.profile);
};

/**
 * Update user profile information
 */
export const updateUserProfile = async (profileData) => {
  return await apiRequest(config.endpoints.user.updateProfile, {
    method: "PUT",
    body: JSON.stringify(profileData),
  });
};

/**
 * Get user specific data
 */
export const getUserData = async () => {
  return await apiRequest("/api/user/data");
};
